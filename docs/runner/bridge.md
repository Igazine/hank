# Complex Object Bridge

The Complex Object Bridge is the secure protocol for bringing native host state (like UI components, open sockets, or database connections) into the HAL environment without violating the language's core principles.

## Purity vs Utility

Direct memory pointers or class instances are forbidden in HAL memory because they break serializability and the engine's air gap. To solve this, HAL mandates a strict **Flattening Rule**.

## The IHALSerializable Contract

Host applications should provide a standard interface for their complex objects to declare their HAL-compatible state.

```typescript
// Example Interface
interface IHALSerializable {
  serializeHAL(): string;
}

// Example Implementation
class User implements IHALSerializable {
  constructor(public id: number, public username: string) {}

  serializeHAL(): string {
    // Flatten the live object into a safe string (usually JSON)
    return JSON.stringify({
      id: this.id,
      username: this.username,
      role: "admin"
    });
  }
}
```

## Bridging Protocol

1.  **Selection**: The Host developer chooses which complex objects to pass as arguments to a script.
2.  **Flattening**: The Runner invokes `serializeHAL()` on each object, producing a HAL String.
3.  **Injection**: The script receives the String as a "dumb" value.
4.  **Reconstruction**: The script uses `json.parse()` if it needs to inspect the object's properties in an ergonomic way.

## Why it works

By enforcing serialization at the boundary, HAL ensures that a script's state can always be saved, reloaded, or audited, regardless of the complexity of the Host environment. It maintains the "Dumb Variable" philosophy while allowing scripts to orchestrate sophisticated systems.
