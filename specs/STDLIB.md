# HAL Standard Library Specification
**Version:** 1.2.0-alpha2

## 1. Overview
This document defines the official HAL Standard Library. Official language implementations (Go, Rust, TS, Haxe) provide these modules as an optional, injectable package. Host applications are encouraged to use this standard library to maintain ecosystem parity, but they are entirely free to modify, extend, or ignore it in favor of their own custom module definitions.

**Strict Procedural Purity**: Variables in HAL are purely inert memory containers. They do not have methods. All operations on data types MUST be performed by passing the variable to the appropriate module task (e.g., `str.match(my_string, pattern_handle)`, **not** `my_string.match(pattern_handle)`).

---

## 2. Environment & Runtime

### 2.1 `env` Module (State Bridge)
Provides a key-value state bridge between the HAL script and the Host Runner. This is the primary mechanism for Inter-Script Communication and signaling.
*   **`get(key)`**: Returns the value associated with `key`, or `Void`.
*   **`set(key, value)`**: Updates the value associated with `key` in the Host's environment. Triggers a Host-defined side effect (callback). Returns `Void`.
*   **`keys()`**: Returns an Array of all available keys (Strings).

### 2.2 `runtime` Module (Engine Control)
Provides interaction with the HAL virtual machine itself.
*   **`halt(?code = 0)`**: Immediately terminates script execution. The `code` (Number) is returned to the Host.
*   **`elapsedTime()`**: Returns a high-precision monotonic timestamp (HAL Number) in **milliseconds** relative to the start of the engine.

### 2.3 `log` Module
Provides unified output capabilities.
*   **`print(...args)`**: Serializes arguments and outputs to the standard stream.
*   **`error(...args)`**: Outputs to the error stream.
*   **`warn(...args)`**: Outputs with a "warning" decoration.

---

## 3. Data Manipulation

### 3.1 `str` Module (String)
*   **`length(string)`**: Returns the character count of the string as a Number.
*   **`concat(...args)`**: Joins all arguments into a single String.
*   **`format(template, ...args)`**: Replaces `%1`, `%2`, etc. in the `template` with the corresponding serialized argument.
*   **`split(string, delimiter)`**: Returns an Array of substrings.
*   **`replace(string, search, replacement)`**: Returns a new string with all occurrences replaced.
*   **`trim(string)`**: Returns a new string with leading/trailing whitespace removed.

### 3.2 `arr` Module (Array)
*   **`length(array)`**: Returns the item count of the array as a Number.
*   **`get(array, index)`**: Returns the item at the specified index, or `Void` if out of bounds.
*   **`concat(...arrays)`**: Returns a new Array containing the elements of all arguments.
*   **`push(array, item)`**: Appends `item` to the end of the `array` (In-place mutation). Returns `Void`.
*   **`pop(array)`**: Removes and returns the last item of the `array`.
*   **`join(array, ?delimiter = "")`**: Joins all elements into a String.
*   **`empty(array)`**: Returns `1` if the array length is 0, otherwise `Void`.
*   **`reverse(array)`**: Returns a new Array with elements reversed.
*   **`each(array, task)`**: Iterates over a **shallow snapshot** of the `array`. Invokes `task(item, ?index)` for each element. Returns `Void`.

### 3.3 `obj` Module (Object)
*   **`get(object, key)`**: Returns the value associated with the specified key, or `Void` if it does not exist.
*   **`keys(object)`**: Returns an Array of the object's keys (Strings).
*   **`values(object)`**: Returns an Array of the object's values.

---

## 4. Logic & Pattern Matching

### 4.1 `math` Module
*   **`add(...nums)`**: Returns the sum of all arguments.
*   **`sub(a, b)`**: Returns `a - b`.
*   **`mul(...nums)`**: Returns the product of all arguments.
*   **`div(a, b)`**: Returns `a / b`.
*   **`gt(a, b)`**: Returns `1` if `a > b`, otherwise `Void`.
*   **`lt(a, b)`**: Returns `1` if `a < b`, otherwise `Void`.
*   **`eq(a, b)`**: (Deprecated) Alias for `logic.eq`.

### 4.2 `regex` Module
*   **`parse(pattern, ?flags = "")`**: Compiles a raw String pattern into an **`Opaque`** (RegExp) handle.
*   **`match(string, pattern)`**: Returns `1` if the `string` matches the `pattern` (**Opaque** or String), otherwise `Void`.
*   **`replace(string, pattern, replacement)`**: Returns a new string with occurrences of `pattern` (**Opaque** or String) replaced by `replacement`.

### 4.3 `logic` Module
Provides functional logical composition. Note: These tasks do NOT support short-circuiting.
*   **`and(...args)`**: Returns the last argument if all are truthy (not `Void`), otherwise returns `Void`.
*   **`or(...args)`**: Returns the first truthy argument (not `Void`), otherwise returns `Void`.
*   **`eq(a, b)`**: Returns `1` if `a == b` (value equality), otherwise `Void`. Supports all primitive types.

---

## 5. Serialization

### 5.1 `json` Module
*   **`parse(string)`**: Parses a JSON-formatted string and returns the corresponding HAL `Object`, `Array`, `Number`, `String`, or `Void`.
*   **`stringify(value)`**: Serializes a HAL `Value` into a JSON-formatted String. **Note**: If an `Opaque` value is encountered, the task MUST either return `Void` or trigger a Host Error, as Opaque state is not serializable.

---
*Status: v1.2.0-alpha2 (Strict Procedural Purity)*
