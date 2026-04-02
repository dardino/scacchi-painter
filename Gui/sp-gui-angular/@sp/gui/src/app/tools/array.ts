/**
 * compare 2 arrays and returns a new array with common elements between them
 * @param a1 first array of elements
 * @param a2 2nd array of elements
 * @param matchingFn function that returns true if an element matches anonther
 * @returns filtered array of intersection elements
 */
export const intersect = <T>(a1: T[], a2: T[], matchingFn?: (e1: T, e2: T) => boolean): T[] => a1.filter((el1) => {
  if (matchingFn) {
    return a2.filter(el2 => matchingFn(el1, el2)).length > 0;
  }
  else {
    return a2.includes(el1);
  }
});
