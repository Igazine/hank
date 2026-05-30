# Hank Standard Library Specification
**Version:** 1.4.0-alpha1

## 1. Overview
This document defines the official Hank Standard Library. Official language implementations (Go, Rust, TS, Haxe, Dart) provide these modules as an optional, injectable package. Host applications are encouraged to use this standard library to maintain ecosystem parity, but they are entirely free to modify, extend, or ignore it in favor of their own custom module definitions.

**Strict Procedural Purity**: Variables in Hank are purely inert memory containers. They do not have methods. All operations on data types MUST be performed by passing the variable to the appropriate module task (e.g., `str.match(my_string, pattern_handle)`, **not** `my_string.match(pattern_handle)`).

---

## 2. Environment & Runtime

### 2.1 `env` Module (State Bridge)
Provides a key-value state bridge between the Hank script and the Host Runner. This is the primary mechanism for Inter-Script Communication and signaling.
*   **`get(key)`**: Returns the value associated with `key`, or `Void`.
*   **`set(key, value)`**: Updates the value associated with `key` in the Host's environment. Triggers a Host-defined side effect (callback). Returns `Void`.
*   **`keys()`**: Returns an Array of all available keys (Strings).

### 2.2 `runtime` Module (Engine Control)
Provides interaction with the Hank virtual machine itself.
*   **`halt(?code = 0)`**: Immediately terminates script execution. The `code` (Number) is returned to the Host.
*   **`elapsedTime()`**: Returns a high-precision monotonic timestamp (Hank Number) in **milliseconds** relative to the start of the engine.
*   **`signal(value)`**: Emits an event signal to the Host Runner with the provided Hank value. Returns `Void`.

### 2.3 `loop` Module (Iteration)
Provides safe, purely symbolic loop control.
*   **`while(condition_task, execution_task)`**: Repeatedly invokes `execution_task()` as long as `condition_task()` returns a truthy value. Returns the result of the last successful execution of `execution_task()`, or `Void` if it never ran.
*   **`break()`**: Immediately halts the execution of the innermost loop.

### 2.4 `log` Module
Provides unified output capabilities.
*   **`print(...args)`**: Serializes arguments and outputs to the standard stream.
    - **Recommended Serialization**: Implementations SHOULD represent `Void` as the string `"Void"` and remove trailing `.0` from Numbers to maintain ecosystem consistency. Arrays and Objects MAY be represented by type labels (e.g., `"[Array]"`) or full JSON serialization depending on Host complexity.
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
*   **`set(object, key, value)`**: Updates the value associated with the specified `key` in the `object`. Returns `Void`.
    - **Security Rule**: This task MUST ONLY operate on Type 5 `Object` values (primitive key-value maps). If the first argument is a Type 6 `Opaque` handle, the engine MUST throw a **TypeMismatch (Code 4007)** to prevent script-driven mutation of Host memory.
*   **`keys(object)`**: Returns an Array of the object's keys (Strings).

### 3.4 `num` Module (Number Conversion)
Provides utilities for numeric parsing and formatting.
*   **`parse(string, ?base = 0)`**: Parses a string into a Number. If `base` is `0`, the implementation SHOULD auto-detect prefixes (`0x`, `0b`, `0o`). Supports bases 2 through 36.
*   **`format(number, ?base = 10)`**: Converts a Number into its string representation in the specified base (2-36).

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
*   **`void()`**: Alias for `runtime.void()`.

---

## 5. Serialization

### 5.1 `json` Module
*   **`parse(string)`**: Parses a JSON-formatted string and returns the corresponding Hank `Object`, `Array`, `Number`, `String`, or `Void`.
*   **`stringify(value)`**: Serializes a Hank `Value` into a JSON-formatted String. **Note**: If an `Opaque` value is encountered, the task MUST either return `Void` or trigger a Host Error, as Opaque state is not serializable.

---

## 6. Error Inspection

### 6.1 `err` Module
Provides tasks to inspect and format the native `Error` type (Type 8).
*   **`code(error)`**: Returns the numeric error code associated with the error. Throws a Type Mismatch if the argument is not an `Error`.
*   **`message(error)`**: Returns the human-readable error message. Note: The message is formatted by the Host using current localization rules.
*   **`args(error)`**: Returns the Array of raw context values associated with the error.
*   **`isError(value)`**: Returns `1` if the value is of type `Error`, otherwise `Void`.

---

## 7. Official Extensions
To maintain architectural purity and the "Air Gap Principle", features that depend on the Host Platform or Operating System (such as FileSystem I/O, Networking, or Bitwise operations with platform-specific precision limits) are decoupled from the core Standard Library.

Official language implementations provide these as **Extensions** which must be registered manually by the Host application.
- **`platform`**: Tasks constrained by execution environment (e.g., bitwise operations in the `bin` module).
- **`sys`**: Tasks for OS interaction (filesystem, processes, hardware metadata).

Refer to `hank/extensions/` for detailed documentation.

---
*Status: v1.4.0-alpha2 (The Hank Era)*
cumentation.

---
*Status: v1.4.0-alpha2 (The Hank Era)*
