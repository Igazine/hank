# JSON Module

The `json` module provides the foundational tools for the Complex Object Bridge protocol.

## Purpose

Since complex host objects are bridged into HAL as flattened Strings, the `json` module allows script authors to reconstruct that data into traversable HAL Objects.

## Tasks

### `json.parse(string)`
Parses a JSON-formatted string and returns the corresponding HAL data structure.

```hal
() {
  json_str = '{"user": "tamas", "id": 123}'
  data = json.parse(json_str)
  log.print(data.user) // "tamas"
}
```

### `json.stringify(value)`
Serializes a HAL value into a JSON string.

```hal
() {
  obj = { x: 10, y: 20 }
  log.print(json.stringify(obj)) // '{"x": 10, "y": 20}'
}
```
