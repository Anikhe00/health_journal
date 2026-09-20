import { useSyncExternalStore } from "react";

const subscribeToNothing = () => () => {};

// false while the page is still loading in the browser, true once its scripts are running.
// Used to keep submit buttons disabled until then: a form submitted before that would be sent by the
// browser itself, and a login form would put the password in the web address.
export function useHydrated(): boolean {
  return useSyncExternalStore(subscribeToNothing, () => true, () => false);
}
