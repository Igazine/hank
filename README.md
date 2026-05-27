# HAL: Hybrid Automation Language

HAL is a purely symbolic, instruction-oriented, embeddable language designed for high-performance automation and orchestration. 

It serves as a strict, unambiguous, and highly readable alternative to configuration formats like YAML or TOML, while maintaining an air-gapped, host-agnostic design.

## Core Pillars
1. **Air Gapped**: Zero built-in I/O; all environmental interactions are mapped to Host Native Tasks.
2. **Purely Symbolic**: Zero reserved keywords for values. Everything is an identifier.
3. **Dumb Variables**: Inert data containers without methods or prototypes.
4. **Explicit Instructions**: No binary operators; every transformation is a Task call.
5. **Universal Parity**: Bit-perfect execution parity across all target languages.

## Officially Supported Implementations

HAL is designed to be embedded in any host environment. The following implementations are maintained as Tier-1 libraries:

- **Go**: [github.com/Igazine/hal-go](https://github.com/Igazine/hal-go)
- **Rust**: [github.com/Igazine/hal-rust](https://github.com/Igazine/hal-rust) (Includes **WebAssembly** support)
- **TypeScript**: [github.com/Igazine/hal-ts](https://github.com/Igazine/hal-ts)
- **Dart**: [github.com/Igazine/hal-dart](https://github.com/Igazine/hal-dart)
- **Haxe**: [github.com/Igazine/hal-haxe](https://github.com/Igazine/hal-haxe)

## Project Structure
- `/specs`: The formal language and library specifications.
- `/docs`: Documentation and integration guides.
- `/test/conformance`: The universal HAL test suite used to verify engine compliance.

## Documentation

HAL documentation: [https://igazine.github.io/hal/](https://igazine.github.io/hal/)

## License
This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.
