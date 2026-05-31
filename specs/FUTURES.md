# Hank 2: Future Roadmap & Architectural Concepts

*Status: Tabled for long-term evolution (Target ~2028)*

This document archives advanced architectural concepts that were explored during the `v1.5.0-alpha` development cycle but intentionally deferred to preserve Hank's ultra-minimal, air-gapped purity.

## 1. Disposable Opaques (Deterministic Memory Management)
**The Problem**: Currently, `Opaque` handles (e.g., File Handles, DB Connections, GUI elements) rely entirely on host-side garbage collection or manual scripts calling `native_destroy(handle)`. For hot-reloading GUI apps (like Haxe UIs), orphaned Native Tasks leak memory if the script halts unexpectedly.
**The Proposed Solution**:
- Attach an optional `dispose()` callback and an `isDisposed` flag directly to the `Opaque` Type 6 value.
- Introduce an `ExecutionContext.track(opaque)` method for Native Tasks to register living handles.
- The Runner loops through all tracked, undisposed Opaques and safely destroys them when a script terminates (naturally or via a fatal Error).

## 2. Core Environment Variables (`%var`)
**The Problem**: Scripts currently retrieve custom host state via the standard library: `env_get("file_mode")`.
**The Proposed Solution**:
- Decouple environment state from the `StdLib` and elevate it to a core language construct.
- Introduce a new prefix sigil (e.g., `%`) to pull constants directly from the Runner's environment map.
- Example: `log_print(%version)` instead of `log_print(env_get("version"))`.

## 3. The Bytecode VM (Shuttle)
**The Problem**: Hank currently parses scripts dynamically into an AST and evaluates the tree nodes recursively.
**The Proposed Solution**:
- Compile Hank source code into a binary format (Shuttle Bytecode).
- Replace the AST-walking Interpreter with a register-based or stack-based Virtual Machine.
- Benefits: Massive performance gains, script obfuscation, and pre-compiled orchestration assets.
