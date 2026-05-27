# Standard Library Overview

The Hank Standard Library consists of foundational modules designed for cross-platform portability.

## The Injectable Standard Library

A Hank Runner is **not required** to implement the standard library. For specialized environments (like embedded systems or logic engines), a Host may choose to provide a minimal or purely domain-specific `coreScope`.

Official Hank implementations provide the standard library as an **optional, injectable package**. Host applications are encouraged to use these modules to maintain ecosystem parity, but they are entirely free to modify, extend, or define their own custom logic (e.g., adding `str.customTask()`) as their domain requires.

## Strict Procedural Purity

Variables in Hank are purely inert memory containers. They do not have methods. All operations on data types must be performed by passing the variable to the appropriate module task.

- **Incorrect**: `my_string.match("pattern")`
- **Correct**: `str.match(my_string, "pattern")`

## Module Namespacing

The standard library is grouped into logical modules. Each module is an Object in the `coreScope` containing Task values.

```hal
() {
  log.print(math.add(1, 2, 3))
  s = "  hello  "
  log.print(str.trim(s))
}
```
