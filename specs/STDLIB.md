# Hank Standard Library Specification
**Version:** 1.5.0

## 1. Overview
This document defines the official Hank Standard Library (The StdLib). Compliant Hank implementations (Haxe, TS, Go, Rust, Dart) provide these tasks as part of the core runtime experience. While Hank maintains a strict **Air Gap** (no built-in I/O), the StdLib provides the essential computational logic and data manipulation tasks required for orchestration.

**The Flat Namespace Rule**: In accordance with the Hank v1.5.0 architecture, the Standard Library does not use dot-notation or hierarchical modules. All tasks are registered as root-level identifiers using underscores to denote categories (e.g., `math_add`, `str_length`).

**Strict Procedural Purity**: Variables in Hank are purely inert memory containers. They do not have methods. All operations on data types MUST be performed by passing the variable to the appropriate task (e.g., `regex_match(my_string, pattern_handle)`, **not** `my_string.match(pattern_handle)`).

---

## 2. Environment & VM Control

### 2.1 `env` (State Bridge)
Provides a manual key-value state bridge between the Hank script and the Host Runner
*   **`env_get(key)`**: Returns the value associated with `key`, or `Void`.
*   **`env_set(key, value)`**: Updates the value associated with `key` in the Host's environment. Returns `Void`.
*   **`env_keys()`**: Returns an Array of all available keys (Strings).

### 2.2 `runtime` (Execution Control)
Provides interaction with the Hank virtual machine.
*   **`runtime_halt(?code = 0)`**: Immediately terminates script execution. The `code` (Number) is returned to the Host as an exit signal.
*   **`runtime_elapsedTime()`**: Returns a high-precision monotonic timestamp (Number) in **milliseconds** relative to the start of the engine.
*   **`runtime_signal(value)`**: Emits an event signal to the Host Runner with the provided value. Returns `Void`.

### 2.3 `loop` (Iteration)
Provides safe, purely symbolic loop control.
*   **`loop_while(condition_task, execution_task)`**: Repeatedly invokes `execution_task()` as long as `condition_task()` returns a Truthy value (not `Void`). Returns the result of the last successful execution of `execution_task()`, or `Void` if it never ran.
*   **`loop_break()`**: Immediately halts the execution of the innermost loop. Returns an Opaque control signal.

### 2.4 `log` (Output)
Provides unified output capabilities, typically piped to the Host's console or debug log.
*   **`log_print(...args)`**: Serializes arguments and outputs to the standard stream.
*   **`log_error(...args)`**: Outputs to the error stream.
*   **`log_warn(...args)`**: Outputs with a "warning" decoration.

---

## 3. Data Manipulation

### 3.1 `str` (String)
*   **`str_length(string)`**: Returns the character count of the string.
*   **`str_concat(...args)`**: Joins all arguments into a single String.
*   **`str_format(template, ...args)`**: Replaces `%1`, `%2`, etc. in the `template` with the corresponding serialized argument.
*   **`str_trim(string)`**: Returns a new string with leading/trailing whitespace removed.

### 3.2 `arr` (Array)
*   **`arr_length(array)`**: Returns the item count of the array.
*   **`arr_get(array, index)`**: Returns the item at the specified index, or `Void` if out of bounds.
*   **`arr_push(array, item)`**: Appends `item` to the end of the `array` (In-place mutation). Returns `Void`.
*   **`arr_pop(array)`**: Removes and returns the last item of the `array`.
*   **`arr_shift(array)`**: Removes and returns the first item of the `array`, shifting all other elements down.
*   **`arr_unshift(array, item)`**: Inserts `item` at the beginning of the `array`. Returns `Void`.
*   **`arr_join(array, ?delimiter = "")`**: Joins all elements into a String.
*   **`arr_empty(array)`**: Returns `1` if the array length is 0, otherwise `Void`.
*   **`arr_reverse(array)`**: Returns a new Array with elements reversed.
*   **`arr_slice(array, start, ?end)`**: Returns a new Array containing a shallow copy of a portion of the array.
*   **`arr_sort(array, ?comparator_task)`**: Sorts the array in place. If `comparator_task` is provided, it is invoked as `task(a, b)` and expects a Number result (<0, 0, >0). If omitted, elements are sorted alphanumerically.
*   **`arr_indexof(array, item)`**: Returns the numeric index of the first occurrence of `item` (using deep-equality rules), or `Void` if not found.
*   **`arr_each(array, task)`**: Iterates over a **shallow snapshot** of the `array`. Invokes `task(item, ?index)` for each element. Returns `Void`.
*   **`arr_map(array, task)`**: Returns a new Array populated with the results of calling `task(item, ?index)` on every element.
*   **`arr_filter(array, task)`**: Returns a new Array containing all elements for which `task(item, ?index)` returns a Truthy value.

### 3.3 `map` (Map)
*   **`map_get(map, key)`**: Returns the value associated with the specified key, or `Void`.
*   **`map_set(map, key, value)`**: Updates the value associated with the specified `key` in the `map`. Returns `Void`.
    - **Security Rule**: This task MUST ONLY operate on Type 5 `Map` values. It cannot be used to mutate the internal properties of `Opaque` handles.
*   **`map_remove(map, key)`**: Removes the specified key from the map. Returns `1` if the key was present, otherwise `Void`.
*   **`map_keys(map)`**: Returns an Array of the map's keys (Strings).

### 3.4 `num` (Number)
*   **`num_parse(string, ?base = 0)`**: Parses a string into a Number. If `base` is `0`, implementation auto-detects prefixes (`0x`, `0b`, `0o`).
*   **`num_format(number, ?base = 10)`**: Converts a Number into its string representation in the specified base (2-36).

---

## 4. Logic & Reflection

### 4.1 `math`
*   **`math_add(...nums)`**: Returns the sum of all arguments.
*   **`math_sub(a, b)`**: Returns `a - b`.
*   **`math_mul(...nums)`**: Returns the product of all arguments.
*   **`math_div(a, b)`**: Returns `a / b`.
*   **`math_mod(a, b)`**: Returns the remainder of `a / b` (modulo).
*   **`math_gt(a, b)`**: Returns `1` if `a > b`, otherwise `Void`.
*   **`math_lt(a, b)`**: Returns `1` if `a < b`, otherwise `Void`.

### 4.2 `logic`
*   **`logic_and(...args)`**: Returns the last argument if all are truthy, otherwise returns `Void`.
*   **`logic_or(...args)`**: Returns the first truthy argument, otherwise returns `Void`.
*   **`logic_eq(a, b)`**: Returns `1` if `a == b` (deep value equality), otherwise `Void`.

### 4.3 `type` (Reflection)
Provides explicit type-checking corresponding to Hank's 8 internal Value Types. Returns `1` if the value matches the type, otherwise `Void`.
*   **`type_isVoid(val)`**
*   **`type_isNumber(val)`**
*   **`type_isString(val)`**
*   **`type_isArray(val)`**
*   **`type_isMap(val)`**
*   **`type_isOpaque(val)`**
*   **`type_isTask(val)`**
*   **`type_isError(val)`**

---

## 5. Serialization & Error Inspection

### 5.1 `json`
*   **`json_parse(string)`**: Parses a JSON string into Hank primitives.
*   **`json_stringify(value)`**: Serializes a Hank value into a JSON string. **Note**: encounter of an `Opaque` value SHOULD return `Void`.

### 5.2 `err`
Provides tasks to inspect the native `Error` type (Type 8).
*   **`err_code(error)`**: Returns the numeric error code.
*   **`err_message(error)`**: Returns the localized human-readable error message.
*   **`err_args(error)`**: Returns the Array of context values associated with the error.

---

## 6. Official Extensions
To maintain architectural purity, features that depend on the Host OS (Filesystem, Processes, Networking) are decoupled from the core StdLib. Compliant engines provide these as **Extensions** which must be registered manually.
- **`sys`**: OS interaction (Filesystem, Processes, Hardware).
- **`platform`**: Execution environment constraints (e.g. Bitwise operations).

---
*Status: v1.5.0 (The Testament)*
