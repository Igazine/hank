# Syntax & Types

Hank uses a strict EBNF grammar to ensure unambiguous parsing across all certified engine implementations.

## The Entry Point

Every valid Hank script is a single **Main Task**. This outermost block serves as the interface between the script and the host environment.

### Host Arguments
The parameters defined in the Main Task are **Host Arguments**. These are values passed into the script by the engine when it is invoked (e.g., CLI flags, API parameters, or environment data).

```hank
// Example: deploy.hank
@ "utils"

(target, ?verbose = 0) {
  log.print(str.format("Deploying to %1", target))
}
```

### The Container Pattern
The Main Task acts as a structural container for the entire script. It is perfectly language-compliant to define multiple **inline tasks** within the Main Task and assign them to identifiers. 

Architecturally, this functions similarly to a **Class and its Methods**: the Main Task provides the shared context and arguments, while inline tasks provide modular, reusable units of logic within that context.

## Primitive Types

Hank internally supports seven absolute value types:

| Type | Description | Example |
| --- | --- | --- |
| **Void** | Represents the absence of a value. | `v = missing_id` |
| **Number** | 64-bit floating point. | `n = 123.45` |
| **String** | UTF-8 character sequence. | `s = "hello"` |
| **Array** | Ordered list of Hank values. | `a = [1, 2, 3]` |
| **Object** | Unordered key-value map. | `o = { x: 1, y: 2 }` |
| **Opaque** | Non-serializable Host state handle. | *Returns from Native Tasks* |
| **Task** | A callable unit of execution. | `t = (x) { ^ x }` |

## Assignments

Assignment binds the evaluated result of an expression to an identifier in the current local scope.

```hank
// Simple assignment
name = "tamas"

// Calculation assignment
sum = math.add(10, 20)

// Chained assignment
a = b = 6 // both a and b are now 6

// Inline Task definition and assignment
greet = (msg) {
  log.print(msg)
}
```

Assignments evaluate to the assigned value. This enables chained assignments but also means that if an assignment is the final statement of a Task or block, that value will be the implicit return result.

## No Binary Operators

To maintain procedural purity and absolute predictability, Hank lacks binary operators for arithmetic or string manipulation.

- **No Arithmetic**: `1 + 2` is a syntax error. Use `math.add(1, 2)`.
- **No Concatenation**: `"a" + "b"` is a syntax error. Use `str.concat("a", "b")`.
- **No Logic Operators**: There are no `&&` or `||` operators. Logic is handled via the `? () {}` unified gate and truthiness evaluation.

This constraint forces every data transformation to be explicit, making the script's intent immediately visible to the reader and the Runner.

## Whitespace & Semicolons

Hank is a **symbol-delimited** language. It does not use semicolons to terminate statements, and it is largely whitespace-insensitive.

- **No Semicolons**: Statement boundaries are determined by token transitions (e.g., an assignment followed by a new task call).
- **Whitespace**: Newlines and spaces are ignored by the parser (except as token separators). A script can be written on a single line or spread across many for clarity.

```hank
// Both are identical to the engine:
() { name = "tamas" log.print(name) }

() {
  name = "tamas"
  log.print(name)
}
```


## Variables & Identifiers

Identifiers consist of alphanumeric characters and underscores `[a-zA-Z_][a-zA-Z0-9_]*`. They are case-sensitive.

**Rule**: An identifier MUST begin with a letter or an underscore. It cannot begin with a digit (leading digits are reserved for Number literals).

### Existence-is-Truth
Hank uses a simple truthiness rule:
- A variable evaluating to a concrete value (including `0`, `""`, or `[]`) is **Truthy**.
- An unassigned or empty identifier evaluates to `Void`, which is strictly **Falsy**.

### Core Protection (#)
Identifiers can be prefixed with the `#` sigil to force the interpreter to resolve the name directly against the `coreScope`, bypassing all local lexical shadowing.

```hank
log = "local string"
#log.print(log) // Uses the core log module to print the local variable
```

## Immutability

Objects and Arrays are strictly immutable via dot-syntax. While property retrieval is permitted using `obj.field`, mutation must be performed via explicit native tasks (e.g., `obj.set(o, k, v)`) which usually return a new object reference.
