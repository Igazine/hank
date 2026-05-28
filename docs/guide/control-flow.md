# Control Flow

Hank provides a clean, unified syntax for conditional branching and error management.

## Unified Gates

The `?` (If), `:` (Fallback), and `~` (Rescue) sigils form a continuous control chain.

### Branching (`?` and `:`)
The `?` operator evaluates the truthiness of an expression. If truthy, the associated block is executed. An optional `:` block serves as the fallback if the condition is falsy.

```hank
? (math.gt(count, 10)) {
  log.print("Large batch")
} : {
  log.print("Small batch")
}
```

### Error Rescue (~)
The `~` operator can be appended to any control chain. It intercepts host-level errors thrown within the preceding blocks. The rescue block receives a mandatory string parameter containing the serialized error message.

```hank
? (1) {
  proc.run("dangerous-command")
} ~ (err) {
  log.error(str.format("Command failed: %1", err))
}
```

## Logical Negation (!)

The `!` operator evaluates the falsiness of an expression.

- If the expression is **Truthy**, `!expr` returns `Void`.
- If the expression is **Falsy** (`Void`), `!expr` returns `Number(1)`.

```hank
? (!env.get("API_KEY")) {
  log.warn("Missing API key, running in guest mode")
}
```

## Evaluation Results

Control flow structures are expressions in Hank. They evaluate to the result of whichever branch was executed. If no branch matches and no fallback exists, the structure evaluates to `Void`.
