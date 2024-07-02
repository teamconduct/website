export function keys<T extends Record<string, unknown>>(record: T): (keyof T)[] {
    return Object.keys(record);
}

export function values<T extends Record<string, unknown>>(record: T): T[keyof T][] {
    return Object.values(record) as T[keyof T][];
}

export function entries<T extends Record<string, unknown>>(record: T): { key: keyof T; value: T[keyof T] }[] {
    return (Object.entries(record) as [keyof T, T[keyof T]][]).map(entry => ({
        key: entry[0],
        value: entry[1]
    }));
}

export function mapRecord<T extends Record<string, unknown>, U>(record: T, callbackFn: (value: T[keyof T], key: keyof T) => U): Record<keyof T, U> {
    const newRecord = {} as Record<keyof T, U>;
    for (const entry of entries(record))
        newRecord[entry.key] = callbackFn(entry.value, entry.key);
    return newRecord;
}
