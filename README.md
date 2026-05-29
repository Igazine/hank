# Hank

> ⚠️ **Note on Stability:** Although Hank's execution model and syntax grammar are highly stable and rigorously tested, the project is currently in the **Alpha** phase. We may introduce breaking changes to the core specifications (such as standard library behavior or Runner APIs) and engine implementations as we refine the ecosystem. Please use Hank with care and check the repository frequently for updates.

Hank is a purely symbolic, instruction-oriented embeddable language designed to bring secure, dynamic automation to any host application. Built on a strict air-gapped execution model, Hank has zero built-in I/O, guaranteeing that scripts cannot access the filesystem, network, or OS without explicit delegation. This makes it the perfect predictable environment for game scripting, microservice orchestration, and user-facing plugin systems. With a highly readable, keyword-less syntax and universal cross-platform parity, Hank seamlessly bridges the gap between static configuration files and complex general-purpose programming.

## Core Pillars
1. **Air Gapped**: Zero built-in I/O; all environmental interactions are mapped to Host Native Tasks.
2. **Purely Symbolic**: Zero reserved keywords for values. Everything is an identifier.
3. **Dumb Variables**: Inert data containers without methods or prototypes.
4. **Explicit Instructions**: No binary operators; every transformation is a Task call.
5. **Universal Parity**: Bit-perfect execution parity across all target languages.

## Officially Supported Implementations

Hank is designed to be embedded in any host environment. The following implementations are maintained as Tier-1 libraries:

- **Go**: [![Go CI](https://github.com/Igazine/hank-go/actions/workflows/ci.yml/badge.svg)](https://github.com/Igazine/hank-go/actions/workflows/ci.yml)
- **Rust**: [![Rust CI](https://github.com/Igazine/hank-rust/actions/workflows/ci.yml/badge.svg)](https://github.com/Igazine/hank-rust/actions/workflows/ci.yml)
- **TypeScript**: [![TS CI](https://github.com/Igazine/hank-ts/actions/workflows/ci.yml/badge.svg)](https://github.com/Igazine/hank-ts/actions/workflows/ci.yml)
- **Dart**: [![Dart CI](https://github.com/Igazine/hank-dart/actions/workflows/ci.yml/badge.svg)](https://github.com/Igazine/hank-dart/actions/workflows/ci.yml)
- **Haxe**: [![Haxe CI](https://github.com/Igazine/hank-haxe/actions/workflows/ci.yml/badge.svg)](https://github.com/Igazine/hank-haxe/actions/workflows/ci.yml)

| Engine | Language | Repository | Build Status |
| --- | --- | --- | --- |
| **Go** | Go | [Igazine/hank-go](https://github.com/Igazine/hank-go) | ![Go CI](https://github.com/Igazine/hank-go/actions/workflows/ci.yml/badge.svg) |
| **Rust** | Rust | [Igazine/hank-rust](https://github.com/Igazine/hank-rust) | ![Rust CI](https://github.com/Igazine/hank-rust/actions/workflows/ci.yml/badge.svg) |
| **TS** | TypeScript | [Igazine/hank-ts](https://github.com/Igazine/hank-ts) | ![TS CI](https://github.com/Igazine/hank-ts/actions/workflows/ci.yml/badge.svg) |
| **Dart** | Dart | [Igazine/hank-dart](https://github.com/Igazine/hank-dart) | ![Dart CI](https://github.com/Igazine/hank-dart/actions/workflows/ci.yml/badge.svg) |
| **Haxe** | Haxe | [Igazine/hank-haxe](https://github.com/Igazine/hank-haxe) | ![Haxe CI](https://github.com/Igazine/hank-haxe/actions/workflows/ci.yml/badge.svg) |

## Project Structure
- `/specs`: The formal language and library specifications (The Testament).
- `/extensions`: Blueprints for optional, platform-dependent modular power-ups.
- `/test/conformance`: The universal Hank test suite used to verify engine compliance.

## Documentation

- **Philosophy & Vision**: [The Hank API Multiverse](https://igazine.github.io/hank-docs/guide/philosophy)
- **Technical Docs**: [https://igazine.github.io/hank-docs/](https://igazine.github.io/hank-docs/)

## License
This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.
