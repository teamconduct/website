export function removeNullValues<T>(array: (T | null)[]): T[] {
    return array.filter((item): item is T => item !== null);
}
