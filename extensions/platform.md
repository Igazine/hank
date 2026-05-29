# Hank Platform Extension (`platform`)
**Version:** 1.0.0

## 1. Overview
The Hank Platform Extension provides tasks that are constrained by the underlying execution environment (Host Platform). This library is 100% optional. 

Because Hank Numbers are strictly 64-bit floats, certain operations (like bitwise math) require internal conversion to integers. Depending on the host platform (e.g., JavaScript/Node), these operations may carry specific precision limits.

To use this extension, the host application must manually register it (e.g., `runner.registerModules(PlatformExtension.getModules())`).

---

## 2. Binary Manipulation (`bin` module)

### 2.1 The 53-bit Safe Integer Boundary
**CRITICAL**: All bitwise tasks in this module enforce a **Safe Integer Bound** of `-(2^53 - 1)` to `2^53 - 1`. 
- IEEE 754 64-bit floats can only exactly represent integers within this range. 
- Attempting to perform bitwise operations on numbers outside this range (or operations that result in a number outside this range) will trigger a **Runtime Error (Code 4005)**.

### 2.2 Tasks
*   **`and(a, b)`**: Returns the bitwise AND of `a` and `b`.
*   **`or(a, b)`**: Returns the bitwise OR of `a` and `b`.
*   **`xor(a, b)`**: Returns the bitwise XOR of `a` and `b`.
*   **`not(n)`**: Returns the bitwise NOT of `n`.
*   **`shiftL(n, bits)`**: Returns `n` shifted left by `bits`.
*   **`shiftR(n, bits)`**: Returns `n` shifted right by `bits` (sign-propagating).

---
*Status: Official Extension (v1.0.0)*
