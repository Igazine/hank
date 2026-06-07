# Hank

> [!IMPORTANT]
> **Version 1.5.0**: This is the first official release of the Hank ecosystem. While the language is production-ready, we recommend following the [Standard Library Specification](specs/STDLIB.md) closely as we continue to expand the native task namespaces.

Hank is a purely symbolic, instruction-oriented embeddable language designed to bring secure, dynamic automation to any host application. Built on a strict air-gapped execution model, Hank has zero built-in I/O, guaranteeing that scripts cannot access the filesystem, network, or OS without explicit delegation. This makes it the perfect predictable environment for game scripting, microservice orchestration, and user-facing plugin systems. With a highly readable, keyword-less syntax and universal cross-platform parity, Hank seamlessly bridges the gap between static configuration files and complex general-purpose programming.

## Core Pillars
1. **Air Gapped**: Zero built-in I/O; all environmental interactions are mapped to Host Native Tasks.
2. **Purely Symbolic**: Zero reserved keywords for values. Everything is an identifier.
3. **Dumb Variables**: Inert data containers without methods or prototypes.
4. **Explicit Instructions**: No binary operators; every transformation is a Task call.
5. **Universal Parity**: Bit-perfect execution parity across all target languages.

## Official Tooling

### Hank for VSCode
The recommended way to develop Hank scripts is using the official **[Hank VSCode Extension](https://github.com/Igazine/hank-vscode)**.

*   **Intelligent Autocomplete**: Context-aware suggestions for all native and custom tasks.
*   **Rich Hover Documentation**: Instant tooltips with signatures and usage examples.
*   **Cross-File Navigation**: Go to Definition (Ctrl+Click) support, even across macro includes.
*   **Semantic Insights**: Real-time explanations for Shadowing and Evaluate-Then-Bind behaviors.
*   **Embedded Execution**: Run scripts instantly via the "Play" button with live log streaming.

## Officially Supported Implementations

Hank is designed to be embedded in any host environment, therefore it does not have a default implementation or a runner. The following implementations are maintained as Tier-1 libraries:


| Engine | Language | Repository | Build Status |
| --- | --- | --- | --- |
| **Go** | Go | [Igazine/hank-go](https://github.com/Igazine/hank-go) | ![Go CI](https://github.com/Igazine/hank-go/actions/workflows/ci.yml/badge.svg?branch=main) |
| **Rust** | Rust | [Igazine/hank-rust](https://github.com/Igazine/hank-rust) | ![Rust CI](https://github.com/Igazine/hank-rust/actions/workflows/ci.yml/badge.svg?branch=main) |
| **TS** | TypeScript | [Igazine/hank-ts](https://github.com/Igazine/hank-ts) | ![TS CI](https://github.com/Igazine/hank-ts/actions/workflows/ci.yml/badge.svg?branch=main) |
| **Dart** | Dart | [Igazine/hank-dart](https://github.com/Igazine/hank-dart) | ![Dart CI](https://github.com/Igazine/hank-dart/actions/workflows/ci.yml/badge.svg?branch=main) |
| **Haxe** | Haxe | [Igazine/hank-haxe](https://github.com/Igazine/hank-haxe) | ![Haxe CI](https://github.com/Igazine/hank-haxe/actions/workflows/ci.yml/badge.svg?branch=main) |

## Project Structure
- `/specs`: The formal language and library specifications (The Testament).
- `/extensions`: Blueprints for optional, platform-dependent modular power-ups.
- `/test/conformance`: The universal Hank test suite used to verify engine compliance.

## Documentation

- **Philosophy & Vision**: [The Hank API Multiverse](https://igazine.github.io/hank-docs/guide/philosophy)
- **Technical Docs**: [https://igazine.github.io/hank-docs/](https://igazine.github.io/hank-docs/)

## License
This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.
