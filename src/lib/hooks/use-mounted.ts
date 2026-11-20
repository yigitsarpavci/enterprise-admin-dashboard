import { useSyncExternalStore } from 'react';

const subscribe = () => () => {};

/** True after hydration on the client, false during SSR and the first hydration pass. */
export function useMounted(): boolean {
  return useSyncExternalStore(subscribe, () => true, () => false);
}
