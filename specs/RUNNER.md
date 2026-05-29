# Hank Runner Specification
**Version:** 1.3.0-alpha5

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
*   **`getModules() -> Map<String, Map<String, NativeFunc>>`**: Returns a nested map where the top-level keys are Module names, and the values are maps of Task names to `NativeFunc` implementations.

### 3.2 Native Task Interface
A Native Task is a function defined in the host language with the following signature:
`function(Arguments: Array<Value>, Context: ExecutionContext) -> Value`

*   **Arguments**: An array of Hank values provided by the caller.
*   **ExecutionContext**: A bridge object providing:
    *   **`parse(Source: String) -> Expr`**: Lexes and parses a Hank source string. If the source is invalid Hank, it **MUST** throw a host exception (serialized and catchable by a `~` rescue block).
    *   **`eval(Node: Expr) -> Value`**: Evaluates a pre-parsed Hank AST node using the **current state** of the scope.
    *   **`call(Task: Value, Arguments: Array<Value>) -> Value`**: Invokes a Hank Task value. If the invoked task throws a runtime error, this method **MUST** throw a host exception (serialized and catchable by a `~` rescue block at the site of the Native Task's invocation).
    *   **`scope`**: Provides access to the lexical Scope.
        *   **Read**: Native tasks may retrieve values from the scope.
        *   **Write**: Native tasks may bind values to the scope. All writes are **strictly local** to the current scope.
        *   **Interaction**: Evaluations performed via `eval()` will see any modifications previously made to the `scope` by the Native Task during the same invocation.

### 3.3 Registration Pattern
A Runner implementation SHOULD provide a method (e.g., `registerExtension(ext: HankExtension)`) that:
1.  Iterates through the modules provided by `getModules()`.
2.  Wraps each module into a Hank **Object** (ensuring all nested values are Hank **Task** values).
3.  Injects these Objects into the `coreScope`.

## 4. Execution Lifecycle

### 4.1 Working Directory (CWD)
The Runner MUST establish a clear root for script execution. By convention, the Runner SHOULD set the process working directory to the location of the main `.hank` script before starting Pass 1 (Hoisting).

### 4.2 Script Invocation
1.  **Parse**: The Runner parses the main `.hank` file, which yields a single `Task` value (evaluating any `@` macro assignments in the process).
2.  **Args**: The Host environment (e.g., an Orchestrator or Host event loop) provides an array of Hank `Value`s as arguments.
3.  **Call**: The Runner executes the script by invoking `call(parsedTask, hostArguments)`.

### 4.3 Exit Results
When the script Task completes, the Runner receives the final `Value`.
*   **Standard Exit Protocol**:
    *   `Number`: Return the value to the Host environment (e.g., as an OS exit code).
    *   `Void` / `Other`: Return a success signal (e.g., code `0`).

## 5. Error Serialization
When a Host-level failure occurs during a Native Task, the Runner MUST NOT allow the host language to crash.
1.  **Catch**: Intercept the host exception.
2.  **Serialize**: Transform the error into a single UTF-8 **String**.
3.  **Rescue**: Pass that string to the Interpreter's `rescueBlock` if one is active. If not, report and terminate with a non-zero exit code.

**Note on Portability**: The format of the serialized error string is Runner-defined. Scripts that perform pattern-matching on `err` content (e.g., using `match()`) are not guaranteed to be portable across different Runner implementations.

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
*Status: v1.3.0-alpha5 (The Hank Era)*
