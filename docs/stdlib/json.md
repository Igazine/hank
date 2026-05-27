# JSON Module

The `json` module provides the foundational tools for the Complex Object Bridge protocol.

## Purpose

Since complex host objects are bridged into Hank as flattened Strings, the `json` module allows script authors to reconstruct that data into traversable Hank Objects.

## Tasks

### `json.parse(string)`
Parses a JSON-formatted string and returns the corresponding Hank data structure.

```hal
() {
  json_str = '{"user": "tamas", "id": 123}'
  data = json.parse(json_str)
  log.print(data.user) // "tamas"
}
```

### `json.stringify(value)`
Serializes a Hank value into a JSON string.

> **State Protection**: `Opaque` values (handles to Host state) are **not serializable**. If `stringify` encounters an `Opaque` value, it will either return `Void` or trigger a Host-defined error to prevent leaking internal memory state.

```hal
() {
  obj = { x: 10, y: 20 }
  log.print(json.stringify(obj)) // '{"x": 10, "y": 20}'
}
```
