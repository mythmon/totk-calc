import { useCallback, useState } from "react";

export interface UseSetReturn<T> {
  /** The Current contents of the set. */
  value: Set<T>;
  /** Ensure the passed item is in the set. */
  add: (item: T) => void;
  /** Ensure the passed item is not in the set. */
  remove: (item: T) => void;
  /** Remove all items from the set. */
  removeAll: () => void;
  /** Ensure that the items presence  in the set matches the boolean. */
  set: (item: T, present: boolean) => void;
  /** If the item is in the set, remove it. Otherwise, add it. */
  toggle: (item: T) => void;
}

/** Manage a `Set` of objects, providing hooks to add, remove, and set the
 * presence of values in that set.
 *
 * # Example
 * ```typescript
 * const ColorSelector: Component = () => {
 *   const {value: colors, toggle: toggleColor} = useSet<string>();
 *   return <>
 *     <p>Selected {JSON.stringify([...colors])}</p>
 *     <button onClick={() => toggleColor("red")}>Red</button>
 *     <button onClick={() => toggleColor("green")}>Green</button>
 *     <button onClick={() => toggleColor("blue")}>Blue</button>
 *   </>;
 * }
 * ```
 */
export function useSet<T>(initial: Iterable<T> = []): UseSetReturn<T> {
  const [value, setValue] = useState(new Set<T>(initial));

  const add = useCallback(
    (item: T) =>
      setValue((localValue) => {
        if (!localValue.has(item)) {
          return new Set([...localValue, item]);
        }
        return localValue;
      }),
    [setValue]
  );

  const remove = useCallback(
    (item: T) =>
      setValue((localValue) => {
        if (localValue.has(item)) {
          return new Set([...localValue].filter((d) => d !== item));
        }
        return localValue;
      }),
    [setValue]
  );

  const set = useCallback(
    (item: T, present: boolean) => {
      (present ? add : remove)(item);
    },
    [add, remove]
  );

  const toggle = useCallback(
    (item: T) =>
      setValue((localValue) => {
        if (localValue.has(item)) {
          return new Set([...localValue].filter((d) => d !== item));
        }
        return new Set([...localValue, item]);
      }),
    [setValue]
  );

  const removeAll = useCallback(() => setValue(new Set()), [setValue]);

  return { value, add, remove, set, toggle, removeAll };
}
