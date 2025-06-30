// If value - null,undefined,{},[] return true

export const useIsEmpty = (value: unknown): boolean => {
    if (value == null) return true;

    if (Array.isArray(value)) return value.length === 0;

    // Специальная обработка для Date - никогда не считается пустым
    if (value instanceof Date) return false;
    
    // Специальная обработка для Map и Set - проверяем размер
    if (value instanceof Map || value instanceof Set) return value.size === 0;

    if (typeof value === 'object') return Object.keys(value).length === 0;

    return false;
};
