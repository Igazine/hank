# Environment & Runtime

These modules provide the core communication and control channels between the Hank script and the execution engine.

## `env` Module (State Bridge)
The `env` module is a shared key-value map between the Host and the Hank script. It serves as a "State Bridge" for configuration, session data, and Inter-Script Communication.

### `env.get(key)`
Returns the value associated with the specified key, or `Void` if it doesn't exist.

### `env.set(key, value)`
Updates a value in the shared environment. This typically triggers a callback in the Host Runner, allowing it to react to script signals.

### `env.keys()`
Returns an Array of Strings representing all available keys in the environment map.

---

## `runtime` Module (Engine Control)
Handles the internal state and lifecycle of the Hank machine.

### `runtime.halt(?code = 0)`
Immediately stops script execution. The provided `code` is returned to the Host Runner.

### `runtime.elapsedTime()`
Returns the number of milliseconds (Number) elapsed since the Hank engine was initialized.

### `runtime.signal(value)`
Emits an event signal to the Host Runner with the provided Hank value. Returns `Void`.

---

## `log` Module
Provides standard output capabilities for the script.

### `log.print(...args)`
Serializes all arguments to strings and outputs them to the standard output stream.

### `log.error(...args)`
Outputs arguments to the error stream.

### `log.warn(...args)`
Outputs arguments with a "warning" decoration.
