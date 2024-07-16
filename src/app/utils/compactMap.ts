export function compactMap<T, U>(list: T[], callbackFn: (value: T, index: number, array: T[]) => U | null): U[] {
    return list.flatMap((value, index, array) => {
        const result = callbackFn(value, index, array);
        return result === null ? [] : [result];
    });
}
