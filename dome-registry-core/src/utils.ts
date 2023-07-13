// Export function for flattening any object
export function flatten(object: Object, separator: string = '/'): Map<string, any> {
    // Initialize output map
    let values = new Map<string, any>();
    // Define nested objects
    let nested = [['', object],];
    // Get first object
    while (nested.length > 0) {
        // Pop first available object
        let [path, object] = nested.pop()!;
        // Get items in object
        for (let [key, value] of Object.entries(object)) {
            // Case value is an array or object
            if (typeof value == 'object' || value instanceof Array) {
                // Add value to nested objects
                nested.push([path + separator + key, value]);
            }
            // Otherwise
            else {
                // Add value directly to output map
                values.set(path + separator + key, value);
            }
        }
    }
    // Return values
    return values;
}
