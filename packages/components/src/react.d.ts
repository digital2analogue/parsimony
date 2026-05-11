/**
 * JSX IntrinsicElements declarations for React consumers.
 *
 * React 19 passes unknown props to custom elements natively, but
 * TypeScript still needs these declarations for autocomplete and
 * type checking in TSX files.
 *
 * Usage in a React project:
 *   /// <reference types="@riverromney/components/react" />
 *   // or add to tsconfig: "types": ["@riverromney/components/react"]
 */

import type { RrBadge } from './badge/badge.js';
import type { RrButton } from './button/button.js';
import type { RrInput } from './input/input.js';

type LitProps<T> = Partial<Omit<T, keyof HTMLElement>> & React.HTMLAttributes<HTMLElement>;

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface IntrinsicElements {
      'rr-badge': LitProps<RrBadge> & {
        variant?: RrBadge['variant'];
        children?: React.ReactNode;
      };
      'rr-button': LitProps<RrButton> & {
        variant?: RrButton['variant'];
        size?: RrButton['size'];
        disabled?: boolean;
        loading?: boolean;
        type?: 'button' | 'submit' | 'reset';
        'aria-label'?: string;
        children?: React.ReactNode;
      };
      'rr-input': LitProps<RrInput> & {
        type?: string;
        name?: string;
        value?: string;
        placeholder?: string;
        label?: string;
        'helper-text'?: string;
        'error-text'?: string;
        required?: boolean;
        disabled?: boolean;
        autocomplete?: string;
        onInput?: (e: Event) => void;
        onChange?: (e: Event) => void;
      };
    }
  }
}

export {};
