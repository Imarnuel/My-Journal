// Runs a prototype frame's logic class (src/screens/logic) inside React, so a generated view
// (src/screens/views) renders exactly what the prototype rendered. Used as the behaviour
// baseline while each screen is ported to the shared store.
import { useReducer, useRef } from "react";

type Logic = { renderVals: () => Record<string, unknown>; state: Record<string, unknown>; props: Record<string, unknown> };

export function useDC(make: (base: unknown) => new () => Logic, props: Record<string, unknown> = {}) {
  const [, force] = useReducer((x: number) => x + 1, 0);
  const ref = useRef<Logic | null>(null);
  if (!ref.current) {
    class DCLogic {
      state: Record<string, unknown> = {};
      props: Record<string, unknown> = props;
      setState(o: Record<string, unknown> | ((s: Record<string, unknown>) => Record<string, unknown>)) {
        this.state = { ...this.state, ...(typeof o === "function" ? o(this.state) : o) };
        force();
      }
      forceUpdate() {
        force();
      }
    }
    const C = make(DCLogic);
    ref.current = new C();
  }
  ref.current.props = { ...ref.current.props, ...props };
  return ref.current.renderVals();
}
