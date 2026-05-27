# Hank

Hank is a purely symbolic, instruction-oriented, embeddable language designed for high-performance automation and orchestration. 

It serves as a strict, unambiguous, and highly readable alternative to configuration formats like YAML or TOML, while maintaining an air-gapped, host-agnostic design.

## Core Pillars
1. **Air Gapped**: Zero built-in I/O; all environmental interactions are mapped to Host Native Tasks.
2. **Purely Symbolic**: Zero reserved keywords for values. Everything is an identifier.
3. **Dumb Variables**: Inert data containers without methods or prototypes.
4. **Explicit Instructions**: No binary operators; every transformation is a Task call.
5. **Universal Parity**: Bit-perfect execution parity across all target languages.

## Officially Supported Implementations

Hank is designed to be embedded in any host environment. The following implementations are maintained as Tier-1 libraries:

- **Go**: [github.com/Igazine/hank-go](https://github.com/Igazine/hank-go)
- **Rust**: [github.com/Igazine/hank-rust](https://github.com/Igazine/hank-rust) (Includes **WebAssembly** support)
- **TypeScript**: [github.com/Igazine/hank-ts](https://github.com/Igazine/hank-ts)
- **Dart**: [github.com/Igazine/hank-dart](https://github.com/Igazine/hank-dart)
- **Haxe**: [github.com/Igazine/hank-haxe](https://github.com/Igazine/hank-haxe)

## Project Structure
- `/specs`: The formal language and library specifications.
- `/docs`: Documentation and integration guides.
- `/test/conformance`: The universal Hank test suite used to verify engine compliance.

## Documentation

- **Philosophy & Vision**: [The Hank API Multiverse](https://igazine.github.io/hank/guide/philosophy)
- **Technical Docs**: [https://igazine.github.io/hank/](https://igazine.github.io/hank/)

## License
This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.
