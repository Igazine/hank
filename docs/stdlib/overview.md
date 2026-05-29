# Standard Library & Extensions

The Hank ecosystem provides native capabilities through an injectable **Extension** architecture. This ensures the core engine remains air-gapped and pure, while allowing host environments to provide powerful modular features.

## Pure Standard Library (StdLib)

The Standard Library consists of foundational modules designed for 100% cross-platform portability and zero mental overhead. These modules deal strictly with in-memory data manipulation and mathematical logic.

- **`log`**: Output stream control.
- **`runtime`**: Monotonic time and engine halt.
- **`str` / `arr` / `obj`**: Data structure manipulation.
- **`math` / `logic`**: Arithmetic and functional logic.
- **`num`**: String-to-number parsing and formatting.

## Official Extensions

Features that are closely tied to the Host Platform or Operating System (and may carry platform-dependent quirks) are decoupled into **Official Extensions**. These are bundled with the engine implementations but must be registered separately.

- **`sys`**: System-level primitives (FileSystem, Processes, Host metadata).
- **`platform`**: Tasks constrained by the execution environment (e.g., bitwise operations in the `bin` module).

## The Injectable Model

A Hank Runner is **not required** to implement any specific library. Host applications manually register the extensions they need:

```haxe
// Example: Haxe registration
var runner = new Runner();
runner.registerExtension(new StdLib());
runner.registerExtension(new SysExtension());
```

## Strict Procedural Purity

Variables in Hank are purely inert memory containers. They do not have methods. All operations on data types must be performed by passing the variable to the appropriate module task.

- **Incorrect**: `my_string.trim()`
- **Correct**: `str.trim(my_string)`

## Module Namespacing

Each module is an Object in the `coreScope` containing Task values.

```hank
() {
  log.print(math.add(1, 2, 3))
  s = "  hello  "
  log.print(str.trim(s))
}
```
