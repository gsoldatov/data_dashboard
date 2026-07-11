import { useState, useEffect } from "react";

/** Return *value* delayed by *delay* ms since the last change. */
export function useDebouncedValue<T>(value: T, delay: number): T {
    const [debounced, setDebounced] = useState<T>(value);

    useEffect(() => {
        const id = setTimeout(() => setDebounced(value), delay);
        return () => clearTimeout(id);
    }, [value, delay]);

    return debounced;
}
