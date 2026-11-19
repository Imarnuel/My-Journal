// Filled 16px icons for the story's Details labels and the trade facts read from MT5 (owner's request:
// filled, grey, 16px). Grey is the tertiary text tone; they sit beside the text, never replace it.
import type { CSSProperties, ReactNode } from "react";

const style: CSSProperties = { flex: "none", color: "var(--text-3)", display: "block" };

function Filled({ children, flip }: { children: ReactNode; flip?: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" style={flip ? { ...style, transform: "scaleY(-1)" } : style}>
      {children}
    </svg>
  );
}

export type DetailIconName = "setup" | "tags" | "plan" | "headspace" | "pair" | "long" | "short" | "status" | "account" | "date";

export function DetailIcon({ name }: { name: DetailIconName }) {
  switch (name) {
    case "setup": // book
      return (
        <Filled>
          <path fillRule="evenodd" d="M6.5 2A3.5 3.5 0 0 0 3 5.5v13A3.5 3.5 0 0 0 6.5 22H20a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1H6.5zm0 15H19v3H6.5a1.5 1.5 0 0 1 0-3z" />
        </Filled>
      );
    case "tags": // tag
      return (
        <Filled>
          <path fillRule="evenodd" d="M2 4a2 2 0 0 1 2-2h7.17a2 2 0 0 1 1.42.59l8.82 8.82a2 2 0 0 1 0 2.83l-7.17 7.17a2 2 0 0 1-2.83 0L2.59 12.59A2 2 0 0 1 2 11.17V4zm5.5 5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z" />
        </Filled>
      );
    case "plan": // clipboard with a check
      return (
        <Filled>
          <path fillRule="evenodd" d="M9 2a2 2 0 0 0-1.73 1H6a2 2 0 0 0-2 2v15a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2h-1.27A2 2 0 0 0 15 2H9zm0 2h6v1.5H9V4zm6.7 7.7a1 1 0 0 0-1.4-1.4L11 13.6l-1.3-1.3a1 1 0 0 0-1.4 1.4l2 2a1 1 0 0 0 1.4 0l4-4z" />
        </Filled>
      );
    case "headspace": // face
      return (
        <Filled>
          <path fillRule="evenodd" d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zM8.5 11a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zm7 0a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zm-7.3 3.3a1 1 0 0 0-1.4 1.4A7.1 7.1 0 0 0 12 18a7.1 7.1 0 0 0 5.2-2.3 1 1 0 1 0-1.4-1.4A5.1 5.1 0 0 1 12 16a5.1 5.1 0 0 1-3.8-1.7z" />
        </Filled>
      );
    case "pair": // two arrows, one each way
      return (
        <Filled>
          <path d="M8 2.5 2 7.5l6 5V9h12V6H8V2.5zM16 11.5V15H4v3h12v3.5l6-5-6-5z" />
        </Filled>
      );
    case "short": // trend down
    case "long": // trend up (the same arrow, mirrored)
      return (
        <Filled flip={name === "long"}>
          <path d="M2 6.1 4.1 4 10 9.9l3-3 6.5 6.5V10h3v8.5H14v-3h3.4L13 11.1l-3 3L2 6.1z" />
        </Filled>
      );
    case "status": // circle with a check
      return (
        <Filled>
          <path fillRule="evenodd" d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm4.7 7.7a1 1 0 0 0-1.4-1.4L11 12.6l-2.3-2.3a1 1 0 0 0-1.4 1.4l3 3a1 1 0 0 0 1.4 0l5-5z" />
        </Filled>
      );
    case "account": // card
      return (
        <Filled>
          <path fillRule="evenodd" d="M2 7a3 3 0 0 1 3-3h14a3 3 0 0 1 3 3v1H2V7zm0 3h20v7a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3v-7zm4 4a1 1 0 1 0 0 2h4a1 1 0 1 0 0-2H6z" />
        </Filled>
      );
    case "date": // calendar
      return (
        <Filled>
          <path fillRule="evenodd" d="M8 2a1 1 0 0 1 1 1v1h6V3a1 1 0 1 1 2 0v1h1a3 3 0 0 1 3 3v2H3V7a3 3 0 0 1 3-3h1V3a1 1 0 0 1 1-1zM3 11h18v8a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3v-8z" />
        </Filled>
      );
  }
}
