# Building a Runner

Building a compliant Hank Runner requires implementing the formal **Hybrid Automation Language Specifications**. These documents provide the ironclad behavioral contracts necessary for cross-engine parity.

- **`Hank.md`**: Grammar, Lexical Rules, and AST Contract.
- **`RUNNER.md`**: The Host Handshake, Macro Pre-processing, and Execution Lifecycle.
- **`STDLIB.md`**: The Functional Specification for foundational modules.

## Native Task Interface

Every native task in Hank follows a strict function signature.

```typescript
// Example in TypeScript
function myNativeTask(args: Value[], ctx: ExecutionContext): Value {
  // 1. Validate arguments
  if (args.length < 1) return VVoid;

  // 2. Perform host operation
  const path = valToString(args[0]);
  const content = fs.readFileSync(path, 'utf8');

  // 3. Return a Hank value
  return VString(content);
}
```

## The Execution Context

The `ExecutionContext` provided to every native task allows the host to interact safely with the engine during execution.

- **`parse(source)`**: Dynamically parse new Hank code.
- **`eval(node)`**: Evaluate a pre-parsed node in the current scope.
- **`call(task, args)`**: Invoke a Hank task (native or user-defined).
- **`scope`**: Read or write to the local lexical scope.

## Registering Extensions

The recommended way to provide native capabilities is via the **Extension** architecture. Host implementations provide pre-built extensions that can be registered with a single call.

```haxe
// Example in Haxe
var runner = new Runner();

// Register the Pure Standard Library
runner.registerExtension(new StdLib());

// Register Optional Extensions (e.g. Sys/OS interaction)
runner.registerExtension(new SysExtension());
```

A compliant Runner implementation should provide a `registerExtension` method that iterates through the provided modules and injects them into the `coreScope`.

## Manual Module Registration

If you are not using a formal Extension object, you can group tasks into objects manually to keep the global namespace clean.

## Handling Host Arguments

The Host environment is responsible for capturing inputs and mapping them to Hank primitives before invoking the main script task.

```typescript
const cliArgs = process.argv.slice(2);
const halArgs = cliArgs.map(s => VString(s));

// The runner executes the script task with these arguments
const result = runner.run("deploy.hank", halArgs);
```
