# Data Manipulation

## `str` Module (String)

### `str.length(string)`
Returns the character count.

### `str.concat(...args)`
Joins all arguments into a single string.

### `str.format(template, ...args)`
Replaces placeholders (`%1`, `%2`, etc.) in the template with the provided arguments.

### `str.split(string, delimiter)`
Returns an Array of substrings.

### `str.replace(string, search, replacement)`
Returns a new string with all occurrences replaced.

### `str.trim(string)`
Returns a new string with leading/trailing whitespace removed.

---

## `arr` Module (Array)

### `arr.length(array)`
Returns the item count.

### `arr.get(array, index)`
Returns the item at the specified index, or `Void` if out of bounds.

### `arr.concat(...arrays)`
Returns a new Array containing the elements of all arguments.

### `arr.push(array, item)`
Appends the item (in-place mutation).

### `arr.pop(array)`
Removes and returns the last item.

### `arr.join(array, ?delimiter = "")`
Joins all elements into a string.

### `arr.empty(array)`
Returns `Number(1)` if the array length is 0, otherwise `Void`.

### `arr.reverse(array)`
Returns a new Array with elements reversed.

### `arr.each(array, task)`
Iterates over a **shallow snapshot** of the array. Invokes `task(item, ?index)` for each element. This ensures that modifications to the array during iteration (e.g. `push` or `pop`) do not affect the loop's execution.

---

## `obj` Module (Object)

### `obj.get(object, key)`
Returns the value associated with the specified key, or `Void` if it does not exist.

### `obj.keys(object)`
Returns an Array of the object's keys (Strings).

---

## `num` Module (Number Conversion)

Provides utilities for numeric parsing and formatting.

### `num.parse(string, ?base = 0)`
Parses a string into a Number. If `base` is `0`, it auto-detects prefixes (`0x`, `0b`, `0o`). Supports bases 2 through 36.

### `num.format(number, ?base = 10)`
Converts a Number into its string representation in the specified base (2-36).

---

## Extension Modules

For platform-dependent or system-level tasks (such as bitwise operations or filesystem access), refer to the **Official Extensions**:

- **`bin` module**: Found in the `platform` extension (for bitwise math).
- **`fs` module**: Found in the `sys` extension (for file I/O).
