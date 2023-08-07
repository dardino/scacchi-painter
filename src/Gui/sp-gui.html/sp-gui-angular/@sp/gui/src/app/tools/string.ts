/**
 * function that wraps string "includes" but not as extension method
 * @param text string containing whole row
 * @param search string to search
 * @returns true if text includes search
 */
export const includes = (text: string, search: string): boolean => text.includes(search);
