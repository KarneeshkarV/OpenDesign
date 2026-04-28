import { setup } from "rivetkit";
import { sandboxSession } from "./sandbox-session.actor";

export const registry = setup({
  use: {
    sandboxSession
  }
});

export type Registry = typeof registry;
