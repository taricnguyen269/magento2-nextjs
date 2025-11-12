/**
 * Utility function to join class names
 * Similar to clsx library but simpler
 */

const clsx = (
    ...arraysString: Array<string | boolean | undefined | null>
): string | undefined => {
    return (
        arraysString
            .filter(item => !!item)
            .join(' ')
            .trim() || undefined
    );
};

export default clsx;

export const joinClassNamesByKey = <T extends Record<string, string>>(
    rootClasses: T,
    addingClasses?: Partial<T>
): T => {
    if (!addingClasses || Object.keys(addingClasses).length === 0) {
        return rootClasses;
    }
    const result = { ...rootClasses } as T;
    // Get all unique keys from both objects
    const keys = new Set([
        ...Object.keys(rootClasses),
        ...Object.keys(addingClasses || {})
    ]);

    // Iterate through each key and merge the values if they exist in both objects
    keys.forEach(key => {
        const typedKey = key as keyof T;
        if (rootClasses[typedKey] && addingClasses?.[typedKey]) {
            // If key exists in both objects, join the values with a space
            result[
                typedKey
            ] = `${rootClasses[typedKey]} ${addingClasses[typedKey]}` as T[keyof T];
        }
    });

    return result;
};

