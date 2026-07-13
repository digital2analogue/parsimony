import { describe, it, expect } from "vitest";
import {
  titleCase,
  cell,
  genRegion,
  authoredRegion,
  patchGenRegion,
  patchDoc,
  scaffoldDoc,
  buildRegions,
} from "../../scripts/generate-component-docs.mjs";

// Synthetic fixture — never the live design-system.json (a test against real data
// inverts the moment someone fixes the data; see the repo's testing guidance).
const fakeComponent = {
  name: "rr-thing",
  status: "beta",
  summary: "A test thing.",
  package: "@riverromney/components",
  props: [
    {
      name: "variant",
      type: "'a' | 'b'",
      default: "a",
      description: "Pick one.",
    },
  ],
  slots: [{ name: "default", description: "Body." }],
  events: [],
  tokensUsed: ["--component-thing-background", "--font-label-small"],
  rules: ["No hex."],
  examples: [{ title: "Basic", html: "<rr-thing></rr-thing>" }],
  accessibility: {
    ariaPattern: "https://example.com/p",
    focusable: false,
    wcag: ["1.4.3 Contrast"],
    rules: ["Be nice."],
  },
  figma: { nodeId: "1:2" },
};

const fakeResolve = (v) =>
  v === "--component-thing-background" ? "#123456" : "400 0.75rem";

const ctx = {
  sourceUrl: "https://example.com/thing.ts",
  resolveCssVar: fakeResolve,
};

describe("generate-component-docs helpers", () => {
  it("titleCase strips rr- and title-cases hyphenated names", () => {
    expect(titleCase("rr-tab-list")).toBe("Tab List");
    expect(titleCase("rr-badge")).toBe("Badge");
  });

  it("cell escapes pipes so union types do not break Markdown tables", () => {
    expect(cell("'a' | 'b'")).toBe("'a' \\| 'b'");
  });

  it("buildRegions renders front-matter + GEN sections from metadata", () => {
    const { frontMatter, gen } = buildRegions(fakeComponent, ctx);
    expect(frontMatter).toContain('title: "Thing"');
    expect(frontMatter).toContain("status: beta");
    expect(frontMatter).toContain("component: rr-thing");
    expect(gen.properties).toContain("`variant`");
    expect(gen.properties).toContain("'a' \\| 'b'"); // pipe escaped
    expect(gen.tokens).toContain("#123456"); // token resolved into design table
    expect(gen.typography).toContain("--font-label-small"); // font token split out
    expect(gen.tokens).not.toContain("--font-label-small"); // ...and not in the design table
    expect(gen.guardrails).toContain("No hex.");
    expect(gen.accessibility).toContain("1.4.3 Contrast");
  });

  it("scaffoldDoc includes authored stubs + every GEN region", () => {
    const doc = scaffoldDoc(fakeComponent, buildRegions(fakeComponent, ctx));
    expect(doc).toContain("AUTHORED:overview");
    expect(doc).toContain("AUTHORED:usage");
    expect(doc).toContain("GEN:properties:start");
    expect(doc).toContain("GEN:implementation:end");
  });

  it("patchGenRegion overwrites only the target region body", () => {
    const existing = `before\n\n${genRegion("props", "OLD")}\n\nafter`;
    const patched = patchGenRegion(
      existing,
      "props",
      genRegion("props", "NEW"),
    );
    expect(patched).toContain("NEW");
    expect(patched).not.toContain("OLD");
    expect(patched).toContain("before");
    expect(patched).toContain("after");
  });

  it("patchDoc refreshes GEN regions but preserves AUTHORED prose", () => {
    const existing =
      [
        '---\ntitle: "Old"\n---',
        authoredRegion("overview", "## Overview\n\nHand-written intent."),
        genRegion("properties", "## Properties\n\nSTALE"),
      ].join("\n\n") + "\n";

    const out = patchDoc(existing, buildRegions(fakeComponent, ctx));

    expect(out).toContain("Hand-written intent."); // authored preserved
    expect(out).not.toContain("STALE"); // GEN refreshed...
    expect(out).toContain("`variant`"); // ...with new content
    expect(out).toContain('title: "Thing"'); // front-matter regenerated
  });

  it("patchDoc reaches a stable fixpoint (idempotent)", () => {
    const regions = buildRegions(fakeComponent, ctx);
    const twice = patchDoc(scaffoldDoc(fakeComponent, regions), regions);
    const thrice = patchDoc(twice, regions);
    expect(thrice).toBe(twice);
  });
});
