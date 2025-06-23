// If value - null,undefined,{},[] return true

export const useIsEmpty = (value: unknown): boolean => {
    if (value == null) return true;

    if (Array.isArray(value)) return value.length === 0;

    if (typeof value === 'object') return Object.keys(value).length === 0;

    return false;
};
