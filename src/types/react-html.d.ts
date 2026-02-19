import "react";

// Restore legacy ReactHTML type removed in @types/react 18.3+
// Framer Motion v10 relies on ReactHTML for DOM prop inference.
declare module "react" {
  interface ReactHTML {
    [key: string]: DetailedHTMLFactory<HTMLAttributes<HTMLElement>, HTMLElement>;
  }
}
