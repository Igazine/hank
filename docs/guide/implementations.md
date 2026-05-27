# Official Implementations

HAL is a language specification. To use HAL in your project, you must embed one of the official language-specific engines. 

All official implementations follow the same bit-perfect execution model and include the spec-compliant [Standard Library](/stdlib/overview).

## Go
The Go implementation is a pure, zero-dependency package suitable for high-performance backend orchestration and cloud-native services.

*   **Repository**: [Igazine/hal-go](https://github.com/Igazine/hal-go)
*   **Best for**: DevOps tooling, Kubernetes operators, and high-concurrency backends.

## Rust
A memory-safe, ultra-lean implementation designed for systems programming and embedded devices. This engine powered the [Eddie Milestone](/index#case-study-the-eddie-embedded-milestone).

*   **Repository**: [Igazine/hal-rust](https://github.com/Igazine/hal-rust)
*   **WebAssembly**: The Rust engine can be compiled directly to **Wasm**, allowing Tier-1 performance in browser and Edge environments.
*   **Best for**: Embedded systems (IoT), high-performance CLI tools, and WebAssembly plugins.

## TypeScript
An environment-agnostic engine designed for the JavaScript ecosystem. It runs perfectly in Node.js, Deno, Bun, and modern browsers.

*   **Repository**: [Igazine/hal-ts](https://github.com/Igazine/hal-ts)
*   **Best for**: Web-based configuration editors, serverless functions (Lambdas), and cross-platform desktop apps (Electron).

## Dart
The Dart engine brings HAL to the mobile and desktop application world. It is designed with Flutter integration in mind.

*   **Repository**: [Igazine/hal-dart](https://github.com/Igazine/hal-dart)
*   **Best for**: Dynamic logic in Flutter apps (iOS/Android/Desktop), allowing you to update app behavior without submitting a new binary to app stores.
