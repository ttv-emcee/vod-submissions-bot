export function notNull<T>(x: T | null | undefined): x is T {
  return x !== null && x !== undefined;
}

export function sortBy<T>(fn: (a: T) => number): (a: T, b: T) => number {
  return (a, b) => fn(a) - fn(b);
}
