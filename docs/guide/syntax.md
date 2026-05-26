# Syntax & Types

HAL uses a strict EBNF grammar to ensure unambiguous parsing across all certified engine implementations.

## The Entry Point

Every valid HAL script follows the "Universal Task" structure. A script may contain zero or more macro headers followed by exactly one task definition.

```hal
// Example: deploy.hal
@ "utils"

(target, ?verbose = 0) {
  log.print(str.format("Deploying to %1", target))
}
```

## Primitive Types

HAL internally supports seven absolute value types:

| Type | Description | Example |
| --- | --- | --- |
| **Void** | Represents the absence of a value. | `v = missing_id` |
| **Number** | 64-bit floating point. | `n = 123.45` |
| **String** | UTF-8 character sequence. | `s = "hello"` |
| **Array** | Ordered list of HAL values. | `a = [1, 2, 3]` |
| **Object** | Unordered key-value map. | `o = { x: 1, y: 2 }` |
| **Regex** | Pattern and options. | `r = /test/im` |
| **Task** | A callable unit of execution. | `t = (x) { ^ x }` |

## Assignments

Assignment binds the evaluated result of an expression to an identifier in the current local scope.

```hal
// Simple assignment
name = "tamas"

// Calculation assignment
sum = math.add(10, 20)

// Inline Task definition and assignment
greet = (msg) {
  log.print(msg)
}
```

Assignments always evaluate to `Void`, ensuring they do not leak values into block results.

## No Binary Operators

To maintain procedural purity and absolute predictability, HAL lacks binary operators for arithmetic or string manipulation.

- **No Arithmetic**: `1 + 2` is a syntax error. Use `math.add(1, 2)`.
- **No Concatenation**: `"a" + "b"` is a syntax error. Use `str.concat("a", "b")`.
- **No Logic Operators**: There are no `&&` or `||` operators. Logic is handled via the `? () {}` unified gate and truthiness evaluation.

This constraint forces every data transformation to be explicit, making the script's intent immediately visible to the reader and the Runner.

## Whitespace & Semicolons

HAL is a **symbol-delimited** language. It does not use semicolons to terminate statements, and it is largely whitespace-insensitive.

- **No Semicolons**: Statement boundaries are determined by token transitions (e.g., an assignment followed by a new task call).
- **Whitespace**: Newlines and spaces are ignored by the parser (except as token separators). A script can be written on a single line or spread across many for clarity.

```hal
// Both are identical to the engine:
() { name = "tamas" log.print(name) }

() {
  name = "tamas"
  log.print(name)
}
```


## Variables & Identifiers

Identifiers consist of alphanumeric characters and underscores `[a-zA-Z0-9_]`. They are case-sensitive.

### Existence-is-Truth
HAL uses a simple truthiness rule:
- A variable evaluating to a concrete value (including `0`, `""`, or `[]`) is **Truthy**.
- An unassigned or empty identifier evaluates to `Void`, which is strictly **Falsy**.

### Core Protection (#)
Identifiers can be prefixed with the `#` sigil to force the interpreter to resolve the name directly against the `coreScope`, bypassing all local lexical shadowing.

```hal
log = "local string"
#log.print(log) // Uses the core log module to print the local variable
```

## Immutability

Objects and Arrays are strictly immutable via dot-syntax. While property retrieval is permitted using `obj.field`, mutation must be performed via explicit native tasks (e.g., `obj.set(o, k, v)`) which usually return a new object reference.
