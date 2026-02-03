/**
 * Safely reads the immediate properties of an object.
 * Handles circular references, symbols, and functions.
 * Returns a sorted array of property descriptors.
 */
export function readProperties(obj) {
  if (obj === null || obj === undefined) {
    return [];
  }

  const props = [];
  
  // Safe property extraction
  let keys;
  try {
    keys = Reflect.ownKeys(obj);
  } catch (e) {
    console.warn('SeasExplorer: Could not read keys', e);
    return [];
  }

  for (const key of keys) {
    let value;
    let type = 'unknown';
    let isExpandable = false;

    // Guard: Accessing properties can sometimes throw (e.g., restricted objects)
    try {
      value = obj[key];
      type = typeof value;

      if (value === null) {
        type = 'null';
      } else if (Array.isArray(value)) {
        type = 'array';
        isExpandable = value.length > 0;
      } else if (type === 'object') {
        isExpandable = Reflect.ownKeys(value).length > 0; // Check if it has own keys
      } else if (type === 'function') {
        // Functions are generally terminal in this view unless we want to inspect prototypes later
        isExpandable = false; 
      }
    } catch (err) {
      value = '<restricted>';
      type = 'error';
    }

    props.push({
      key,
      value,
      type,
      isExpandable
    });
  }

  // Natural, localized sort
  // We separate Symbols from strings for cleaner sorting
  return props.sort((a, b) => {
    const aKey = a.key.toString();
    const bKey = b.key.toString();
    return aKey.localeCompare(bKey, undefined, { numeric: true, sensitivity: 'base' });
  });
}
