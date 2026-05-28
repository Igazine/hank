# Macros (@)

The `@` sigil represents a parse-time dependency. It is not an execution-time "include" statement, but a macro expansion that happens before the script is fully parsed.

## Syntax

```hank
@ "utils"
@ "path/to/script.hank"
```

The `@` macro strictly requires a String literal path. Passing an unquoted identifier is not allowed.

## Expansion Mechanism

When the Parser encounters a `@` macro, it performs the following steps:

1.  **Request**: It requests the raw string content for the path from the Runner.
2.  **Parse**: It parses the content. The resource must follow the same Universal Task structure as a script.
3.  **Inject**: It creates an assignment in the current scope, binding the resulting Task value to an identifier derived from the file name.

## File Resolution

The Runner is responsible for resolving macro paths. By convention:
- Relative paths are resolved against the directory of the file currently being processed.
- If a path has no extension, the Runner should check for `.hank`.

## Recursive Expansion

Macros can include other macros. The Runner's pre-processor resolves these dependencies recursively before parsing.

### Circular Dependencies
Compliant Runners must detect circular dependencies (e.g., Task A requires Task B, which requires Task A) and throw a fatal error during the pre-processing phase.

## Hoisting Compatibility

Because macro expansion results in assignments, the imported tasks are available for hoisting. You can call an imported task before its `@` sigil appears in the file.

```hank
() {
  log.print(math_utils.sum(1, 2)) // Valid due to hoisting
  @ "math_utils"
}
```
