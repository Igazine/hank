# Logic & Pattern Matching

## `math` Module

### `math.add(...nums)`
Returns the sum of all arguments.

### `math.sub(a, b)`
Returns the difference of `a - b`.

### `math.mul(...nums)`
Returns the product of all arguments.

### `math.div(a, b)`
Returns the quotient of `a / b`.

### `math.gt(a, b)`
Returns `Number(1)` if `a > b`, otherwise `Void`.

### `math.lt(a, b)`
Returns `Number(1)` if `a < b`, otherwise `Void`.

### `math.eq(a, b)`
Returns `Number(1)` if `a == b` (value equality), otherwise `Void`.

---

## `regex` Module

### `regex.parse(pattern, ?flags = "")`
Compiles a String pattern into an **`Opaque`** RegExp handle.

```hal
() {
  // re is now an Opaque handle
  re = regex.parse("hello", "i")
  ? (regex.match("HELLO world", re)) { log.print("Matched!") }
}
```

### `regex.match(string, pattern)`
Returns `Number(1)` if the string matches the pattern, otherwise `Void`. The `pattern` can be a String or an `Opaque` handle returned by `regex.parse`.

### `regex.replace(string, pattern, replacement)`
Returns a new string with all occurrences of the pattern replaced.

---

## `logic` Module
Provides functional logical composition. 

> **Important**: These tasks are standard Hank functions and do **not** support short-circuiting. All arguments are evaluated before the task is called.

### `logic.and(...args)`
Returns the last argument if all provided arguments are truthy (not `Void`). If any argument is `Void`, returns `Void`.

### `logic.or(...args)`
Returns the first truthy argument (not `Void`) encountered. If all arguments are `Void`, returns `Void`.
