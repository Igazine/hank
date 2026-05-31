# Hank Runner Specification
**Version:** 1.5.0-alpha

## 1. The Runner Role
The Runner is the environment-specific host that encapsulates the Hank Interpreter. It provides the "bridge" between the pure, memory-only Hank instruction set and the host's Operating System, filesystem, and network.

### 1.1 The Air Gap Principle
A compliant Runner MUST enforce a strict separation of concerns:
*   **The Interpreter** is target-agnostic and has zero I/O capabilities.
*   **The Runner** owns all I/O and provides it to the Interpreter via the `coreScope`.

## 2. The Dependency Pre-Processor (@)
The Runner is responsible for fulfilling the requirements of the `@` Macro before final parsing occurs.

### 2.1 Resolution Algorithm
When a Runner is asked to execute a script, it MUST perform a recursive pre-processing pass using two internal data structures:
*   `pathCache`: A map of **resolved absolute paths** to their raw string content.
*   `macroMap`: A map of **exact raw string literals** found in `@` sigils to their raw string content.

**The Algorithm:**
1.  **Scan**: Search the script for the `@` sigil followed by a string literal.
2.  **Resolve Path**:
    *   If the path is absolute, use it directly.
    *   If relative, resolve it against the **directory of the file currently being processed**.
3.  **Cycle Detection**: The Runner MUST track the current resolution stack. If a file attempts to load itself or any of its ancestors, the Runner MUST throw a "Circular Dependency" error and halt pre-processing immediately.
4.  **Load & Cache**:
    *   Check `pathCache` for the resolved absolute path.
    *   If NOT present: Read the raw UTF-8 content, store it in `pathCache`, and **Recurse** (scan the loaded content for further `@` sigils, starting again from step 1).
5.  **Map String Literal**: For every `@` sigil encountered (regardless of whether the file was already in `pathCache`), the Runner **MUST** add an entry to `macroMap` where:
    *   Key = The exact raw string literal from the `@` sigil.
    *   Value = The content associated with the resolved absolute path in `pathCache`.

### 2.2 Handshake
The Runner MUST provide the completed `macroMap` to the Hank Parser. This ensures that when the Parser encounters a token like `@ "utils"`, it can retrieve the pre-loaded content without performing I/O.

## 3. The Core Handshake (Injection)
The Runner MUST initialize the Interpreter with a `coreScope` pre-populated with Native Tasks.

### 3.1 The Extension Contract
To maintain architectural consistency, all native capabilities (including the Standard Library) are delivered as **Extensions**. A compliant Runner SHOULD provide a mechanism to register objects adhering to the following interface:

*   **`name` (Getter/Property)**: A String identifier for the extension (e.g., `"StdLib"`, `"SysExtension"`).
*   **`getTasks() -> Map<String, NativeFunc>`**: Returns a flat map of Task names to `NativeFunc` implementations. Task names SHOULD include prefixes (e.g., `"math_add"`) to avoid collisions.

### 3.2 Native Task Interface
A Native Task is a function defined in the host language with the following signature:
`function(Arguments: Array<Value>, Context: ExecutionContext) -> Value`

*   **Arguments**: An array of Hank values provided by the caller.
*   **ExecutionContext**: A bridge object providing:
    *   **`parse(Source: String) -> Expr`**: Lexes and parses a Hank source string.
    *   **`eval(Node: Expr) -> Value`**: Evaluates a pre-parsed Hank AST node.
    *   **`call(Task: Value, Arguments: Array<Value>) -> Value`**: Invokes a Hank Task value.
    *   **`isError(Value: Value) -> Bool`**: Returns true if the value is a native `Error` type.
    *   **`getLocalization() -> Map<Number, String>`**: Returns the current localization map.
    *   **`scope`**: Provides access to the lexical Scope.

## 4. Error Management & Localization

### 4.1 The Native Error Flow
Hank identifies logic failures as **Runtime Exceptions**. These yield a native `Error` value (Type 8) which bubbles up the stack until caught by a `~` rescue block or returned to the Runner.

### 4.2 Localization Protocol (JSON)
To keep engine implementations language-agnostic, human-readable error messages are NOT stored within the core engine. A Runner is responsible for providing a **Localization Map** (typically loaded from JSON) to the `err` module.

**Localization Map Structure:**
```json
{
  "4001": "Target is not a function: {0}",
  "4007": "Type Mismatch: Expected {0}, got {1} in {2}"
}
```
The `err.message(error)` task uses the `error.code` to look up the template and inject the `error.args` into the placeholders.

### 4.3 Error Code Reservations
To prevent collisions between engine failures and domain-specific task failures, the following numeric ranges are reserved:
*   **`1000 - 4999`**: Reserved for the Hank Core Engine (Lexical, Syntax, and Runtime errors).
*   **`5000+`**: Reserved for Host Applications and custom Native Tasks.

### 4.4 Parse-Time Failures
Violations of the core grammar (Syntax Errors) are treated as **Fatal** and unrecoverable. Because they occur before a script has a chance to define a rescue block, these failures SHOULD be reported immediately by the Runner in English to aid development.

## 5. Execution Lifecycle

### 5.1 Working Directory (CWD)
The Runner MUST establish a clear root for script execution. By convention, the Runner SHOULD set the process working directory to the location of the main `.hank` script before starting Pass 1 (Hoisting).

### 5.2 Script Invocation
1.  **Parse**: The Runner parses the main `.hank` file, which yields a single `Task` value.
2.  **Args**: The Host environment provides an array of Hank `Value`s as arguments.
3.  **Call**: The Runner executes the script by invoking `call(parsedTask, hostArguments)`.

### 5.3 Exit Results
When the script Task completes, the Runner receives the final `Value`.
*   **Standard Exit Protocol**:
    *   `Number`: Return the value to the Host environment (e.g., as an OS exit code).
    *   `Error`: Return the error code or a non-zero exit signal.
    *   `Void` / `Other`: Return a success signal (e.g., code `0`).

## 6. The Complex Object Bridge
Native host objects (Class instances, Structs, Sockets, UI components) are strictly forbidden from entering Hank memory. This preserves the Air Gap and ensures 100% serializability of Data.

### 6.1 Data Flattening (IHANSerializable)
To bridge complex host data into Hank, the Host application MUST flatten the data before it touches the Engine. It is RECOMMENDED that Host SDKs provide an `IHANSerializable` interface (or equivalent) that produces a Hank **String** (e.g., JSON).

### 6.2 State Bridging (Opaque)
While complex data MUST be flattened to maintain serializability, Host environments MAY pass live memory handles using the **`Opaque`** type.
*   **Opaque Definition**: `Opaque` values are tokens representing living Host State. They are strictly Truthy and inert to the Hank Interpreter.
*   **Non-Serializable**: `Opaque` values represent volatile runtime state and MUST NOT be serialized into the data stream (e.g., by `json.stringify`).
*   **Unidirectional**: Hank scripts cannot inspect or mutate `Opaque` handles; they serve strictly as handles to be passed back to Native Tasks for Host-side resolution.

---
*Status: v1.5.0-alpha (The Hank Era)*
