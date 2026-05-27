# Runner Architecture

The Runner is the environment-specific host that encapsulates the Hank Interpreter and manages its interaction with the outside world.

## The Air Gap Principle

A compliant Runner must enforce a strict separation of concerns to preserve the security and predictability of the engine.

1.  **The Interpreter**: It is mathematically pure and has zero built-in I/O. It can only manipulate data in memory.
2.  **The Runner**: It owns the filesystem, network, and operating system. It provides these capabilities to the Interpreter via the `coreScope`.

## Execution Lifecycle

The Runner manages the lifecycle of a script through four distinct phases:

### 1. Pre-Processing
The Runner resolves `@` macro dependencies recursively, performing I/O to load the string content of every required resource and detecting circular dependencies.

### 2. Parsing
The Runner feeds the raw string content (and the macro map) into the Parser. This yields an AST that evaluates to a single Task value.

### 3. Injection
The Runner initializes the `coreScope` with Native Tasks (modules like `log`, `host`, `str`) and ensures the `#` sigil protection is operational.

### 4. Invocation
The Runner executes the script task, passing Host Arguments as an array of Hank values. The final return value of the script task is returned to the Runner for post-processing.
