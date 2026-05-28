# Hank Specification
**Version:** 1.3.0-alpha3

## 1. Philosophy & Purpose
Hank is a purely symbolic, instruction-oriented language designed for automation and orchestration. It is not a general-purpose programming language. It serves as a strict, unambiguous, and highly readable alternative to configuration formats like YAML or TOML. 

Hank bridges declarative configuration with imperative execution by treating data types as primitive memory containers and deferring all environmental mutations to host-provided "Native Tasks".

### Core Tenets
1. **"Everything is an Identifier":** There are no reserved keywords for values (no `true`, `false`, `null`). 
2. **Existence-is-Truth:** A variable evaluating to a concrete value (including `0`, `""`, or `[]`) is Truthy. An unassigned/empty identifier evaluates to `Void`, which is strictly Falsy.
3. **No Inline Arithmetic or Concatenation:** Hank lacks binary operators (`+`, `-`, `*`, `/`). There is no built-in syntax for String or Array concatenation. All data manipulation is handled via explicit task calls (e.g., `math.add()`, `str.concat()`).


## 2. Type System
An implementation MUST internally support the following seven absolute value types:
1. **Void**: Represents the absence of a value. The ONLY Falsy state.
2. **Number**: 64-bit floating point.
3. **String**: UTF-8 character sequence.
4. **Array**: Ordered list of Values.
5. **Object**: Unordered key-value map (`String` -> `Value`).
6. **Opaque**: Represents a black-box handle to volatile Host State (e.g., a compiled Regex engine, a File handle, or a Network Socket).
    - **Generation**: Hank scripts cannot instantiate `Opaque` values directly. They are created and returned exclusively by Host-provided Native Tasks.
    - **Semantics**: `Opaque` values are strictly Truthy. They are inert and impenetrable to the Hank Interpreter; they can only be passed as arguments back to Native Tasks.
    - **Labeling**: When a Host creates an `Opaque` value, it SHOULD provide a short string label (e.g., `"RegExp"`) for debugging and string coercion purposes.
    - **Serialization**: `Opaque` values represent volatile runtime state and are NOT serializable across the Air Gap.
7. **Task**: A callable unit of execution (Native or User-defined).

## 3. Lexical Grammar (EBNF)

```ebnf
Script         ::= { MacroInclude } TaskDef
TaskDef        ::= FuncDef | Block

Statement      ::= MacroInclude | AssignStmt | FlowControl | Expr
MacroInclude   ::= "@" ( String | Identifier )
AssignStmt     ::= Identifier "=" Expr
FlowControl    ::= "?" "(" Expr ")" Block [ ":" Block ] [ "~" "(" Identifier ")" Block ]
Block          ::= "{" { Statement } "}"

Expr           ::= PrimaryExpr { "." Identifier [ "(" ArgList ")" ] }
PrimaryExpr    ::= Literal | IdentExpr | FuncDef | FuncCall | UnaryExpr | "(" Expr ")"

IdentExpr      ::= [ "#" ] Identifier
FuncDef        ::= "(" ParamList ")" Block
FuncCall       ::= PrimaryExpr "(" ArgList ")"
UnaryExpr      ::= "!" Expr | "^" [ Expr ]

Literal        ::= Number | String | Array | Object
Number         ::= [ "-" ] Digit { Digit } [ "." Digit { Digit } ]
String         ::= '"' { Char } '"' | "'" { Char } "'"
Array          ::= "[" [ Expr { "," Expr } ] "]"
Object         ::= "{" [ Identifier ":" Expr { "," Identifier ":" Expr } ] "}"

ParamList      ::= [ Param { "," Param } ]
Param          ::= [ "?" ] Identifier [ "=" Expr ]
ArgList        ::= [ Expr { "," Expr } ]

Identifier     ::= ( Alpha | "_" ) { Alpha | Digit | "_" }
Alpha          ::= "A".."Z" | "a".."z"
Digit          ::= "0".."9"

Comment        ::= "//" { AnyCharExceptNewline }

Char                 ::= ? Any valid UTF-8 character ?
AnyCharExceptNewline ::= Char - "\n"
```

### Grammar Disambiguation & Notes
*   **The Entry Point**: Every valid Hank script is a `TaskDef` (a single task). It may be preceded by zero or more `@` Macro headers. There is no concept of "loose" code outside of the main task.
*   **Identifiers**: As defined in the EBNF, identifiers MUST begin with a letter (`a-z`, `A-Z`) or an underscore (`_`). They cannot begin with a digit. Leading digits are strictly reserved for `Number` literals.
*   **Comments**: `//` comments are ignored by the Lexer and have no AST representation.
*   **String Quotes**: Both double (`"`) and single (`'`) quotes are permitted. The string must terminate with the matching quote character.
*   **Number Literals**: The Lexer **MUST** greedily consume a leading `-` followed immediately by a `Digit` as part of a `Number` literal, regardless of triggering context.
*   **FuncDef vs Grouped Expr**: A `PrimaryExpr` starting with `(` is parsed as a `FuncDef` ONLY IF the closing `)` is followed immediately by a `{` (ignoring whitespace and newlines). Otherwise, it is parsed as a grouped expression `"(" Expr ")"`.
*   **Brace Usage**: The `{` character is used for both structural `Blocks` and `Object` literals.
    - **Structural `Block`**: Valid **only** as a direct component of `FlowControl` (`? () {}`) or `FuncDef` (`() {}`). A `Block` is **not** a `Statement` and cannot appear standalone.
    - **`Object` Literal**: In all other contexts (e.g., assignments or standalone expressions), `{` initiates an `Object` literal. It **must** follow the `key: value` grammar. Standalone object literals are valid as statements but have no side effects.
*   **Property Mutation**: Objects and Arrays are strictly immutable via dot-syntax; `Field` access is for retrieval only.

## 4. Abstract Syntax Tree (AST) Contract
A compliant Parser MUST emit an AST constructable from the following logical nodes:

*   **`Block(statements)`**: A sequential list of statements. Evaluates to the result of its final statement, or `Void` if empty.
*   **`Assign(name, expr)`**: Binds the evaluated result of `expr` to `name` in the current scope. **Evaluates to the assigned value.**
*   **`Literal(value)`**: A concrete `String`, `Number`, `Array`, or `Object`.
*   **`Ident(name, isCore)`**: A variable lookup. If `isCore` is true (triggered by `#`), lookup MUST happen exclusively in the `coreScope`.
*   **`Field(object, fieldName)`**: Property retrieval from an Object, Array, or String.
*   **`FuncDef(params, body)`**: Defines a User Task.
*   **`FuncCall(target, args)`**: Executes a Task.
*   **`UnOp(operator, target)`**: Prefix operators (`!`, `^`).
*   **`FlowControl(condition, successBlock, fallbackBlock, rescueBlock, catchVar)`**: The unified flow-control structure.

## 5. Execution Semantics

### 5.1 Scoping & Core Protection
Hank enforces strict lexical scoping.
*   A `Scope` maps identifiers to values. Every `Scope` (except the root) has a `parentScope`.
*   When resolving an identifier, the Interpreter searches the current scope, then the parent, recursively. If not found, it returns `Void`.
*   **Lexical Scopes**: New lexical scopes are created **only** by `FuncDef` bodies and `FlowControl` branches.
*   **The Core Scope**: A special protected scope initialized by the Host Runner, containing Native Tasks. 
*   **Write Protection**: `Assign` nodes ONLY write to the current local scope. A user script can locally shadow a core task (e.g., `echo = 1`), but the `#` sigil (`#echo`) forces the Interpreter to bypass all local scopes and resolve directly against the `coreScope`.

### 5.2 Two-Pass Execution
Execution within any `Block` MUST occur in two passes:
1.  **Pass 1 (Hoisting)**: The Interpreter scans the immediate statements of the Block. Any `Assign` node where the right-hand expression is a `FuncDef` is immediately bound to the scope.
2.  **Pass 2 (Evaluation)**: The Interpreter executes all statements sequentially.

### 5.3 Unified Gates (Flow Control)
The `?` (If), `:` (Fallback), and `~` (Rescue) sigils form a unified control chain. A `FlowControl` structure evaluates to the result of the branch that was executed, or `Void` if no branch was taken.

### 5.4 The Return Operator (`^`)
The `^` sigil immediately halts execution of the current Task. `^ value` returns the evaluated value. `^` (empty) returns `Void`.

### 5.5 Task Parameters & Invocation
Tasks accept arguments mapped to parameters. Parameter definitions control omission behavior:
*   **Standard (`name`)**: Argument is required. If omitted by caller, the Host MUST throw a runtime error.
*   **Optional (`?name`)**: Argument is optional. If omitted by caller, the parameter receives `Void`.
*   **Default (`name = Expr`)**: Argument is optional. If omitted by caller, the `Expr` is evaluated at call-time within the Task's local scope.
*   **Invalid Call**: If a script attempts to invoke a non-Task value as a function, the Interpreter **MUST** throw a runtime error.
*   **Evaluation Order**: Parameters are processed and bound to the local scope sequentially from **left to right**.
*   **Extra Arguments**: If a caller provides more arguments than parameters defined in the Task's signature, the Host **MUST** throw a runtime error.
*   **Smart Callbacks**: Native Tasks that invoke User-defined callbacks (e.g., standard library higher-order tasks like `arr.each`) **SHOULD** dynamically adapt to the callback's defined arity. The Host `ExecutionContext` MUST ensure that Native Tasks do not trigger "Extra Arguments" errors when they attempt to provide optional callback data (such as an index) to a User Task that did not explicitly define a parameter to receive it.

### 5.6 Logical Negation (`!`)
*   `!expr` evaluates the truthiness of `expr`.
*   If `expr` is Truthy, returns `Void`.
*   If `expr` is Falsy, returns `1` (Truthy).

## 6. The `@` Macro (Parse-Time Dependency)
The `@` sigil is strict Parse-Time Macro Expansion.
*   **Syntax**: `@ "path/to/script"` or `@scriptName`
*   **Mechanism**: When the Parser encounters this sigil, it MUST request the raw string content of the resource from the Runner.
*   **Identifier Shorthand**: If an `Identifier` is provided instead of a `String` (e.g., `@mytask`), it is treated strictly as a shorthand for a literal string path (e.g., `@ "mytask"`).
*   **Task Name Derivation**: The identifier assigned to the task is the final segment of the path, strictly stripped of any **`.hank`** extension (e.g., `@ "a/b/c.hank"` -> `c`, `@mytask` -> `mytask`).
*   **Structure**: Every imported **`.hank`** file MUST follow the `Script` grammar (zero-or-more macro headers followed by exactly one task).
*   **Injection**: The Parser parses the resource and injects an `Assign` node into the lexical block where the `@` directive appeared.
*   **Hoisting Compatibility**: Assignments produced by `@` macro expansion participate in Pass 1 (Hoisting) on equal terms with user-written assignments.
*   **Scoping**: Any tasks imported via macro headers in a **`.hank`** file are injected into the **same lexical block** as the parent task.

*   **Recursion**: Macro headers MUST be expanded recursively by the Parser during the initial transformation.
*   **Circular Dependencies**: A compliant Parser **MUST** detect circular macro dependencies and throw a fatal parse-time error.
