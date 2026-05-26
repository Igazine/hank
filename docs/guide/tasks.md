# Universal Tasks

In HAL, every script and imported resource is a Task. This architectural decision unifies the execution model and provides built-in validation for host inputs.

## Defining Tasks

A task is defined by a parameter list followed by a structural block.

```hal
(a, b) {
  ^ math.add(a, b)
}
```

### Parameters

Tasks support three types of parameters:

1. **Standard (`name`)**: The argument is required. If omitted by the host or caller, a runtime error is thrown.
2. **Optional (`?name`)**: The argument is optional. If omitted, the parameter receives `Void`.
3. **Default (`name = Expr`)**: The argument is optional. If omitted, the `Expr` is evaluated at call-time.

### Sequential Evaluation
Parameters are bound from left to right. A default expression may reference any preceding parameter.

```hal
(a, b = a) {
  // If b is omitted, it defaults to the value of a
}
```

## Arity Enforcement

HAL strictly enforces arity. If a caller provides more arguments than parameters defined in the task's signature, the host will throw a runtime error. This ensures that the interface between the script and its environment remains rigid and documented.

## Returning Values

### Explicit Return (^)
The `^` sigil immediately halts the current task and returns a value to the caller.

```hal
() {
  ? (os.is_mac()) { ^ "Mac OS" }
  ^ "Other"
}
```

### Implicit Return
If execution reaches the end of a task's body without hitting a `^` operator, the task implicitly returns the result of its final statement. An empty block implicitly returns `Void`.

## Local Task Definitions

Because HAL uses a two-pass execution model, local tasks are hoisted. You can call a task before it appears in the script.

```hal
() {
  log.print(get_msg()) // Hoisted call

  get_msg = () {
    ^ "Hello from local task"
  }
}
```
