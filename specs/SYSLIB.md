# HAL System Library (SYSLIB) Specification
**Version:** 1.2.0-alpha3

## 1. Overview
The HAL System Library provides system-level primitives for high-performance automation. Unlike the Standard Library (STDLIB), these modules are closely tied to the Host Operating System and may not be available in restricted or browser-based environments.

Implementations are encouraged to use these signatures to maintain ecosystem predictability for automation scripts.

---

## 2. Foundation Modules
### 2.1 `host` Module (The Current Process)
Provides metadata and control over the HAL Runner's own process.
*   **`cwd()`**: Returns the absolute path String of the current working directory.
*   **`isRoot()`**: Returns `1` if the process has administrative/root privileges, otherwise `Void`.
*   **`pid()`**: Returns the Process ID (Number) of the host process.
*   **`signal(value)`**: Emits an event signal to the Host Runner with the provided HAL value. Returns `Void`.

### 2.2 `proc` Module (External Processes)
Provides capabilities to manage and execute other processes.
*   **`run(cmd, ?args = [])`**: Synchronously executes an external command.
    *   **Returns**: An Object `{ code: Number, stdout: String, stderr: String }`.
*   **`list()`**: Returns an Array of Objects representing all running processes: `{ pid: Number, ppid: Number, name: String, memoryRss: Number, memoryVirtual: Number }`.
*   **`tree(?rootPid)`**: Returns a hierarchical Array of process Objects. If `rootPid` is provided, the tree starts from that process.
*   **`spawn(cmd, ?args = [])`**: (Target-Specific) Asynchronously starts a process. Returns an identifier.

### 2.3 `os` Module (System Metadata)
Provides static information about the underlying hardware and kernel.
*   **`type()`**: Returns a String identifier: `"windows"`, `"linux"`, `"darwin"`, `"bsd"`, or `"unknown"`.
*   **`name()`**: Returns the full operating system name (e.g., `"Ubuntu 22.04"`).
*   **`arch()`**: Returns the CPU architecture (e.g., `"arm64"`, `"x86_64"`).
*   **`memory()`**: Returns an Object `{ total: Number, free: Number, used: Number }` representing RAM stats in bytes.
*   **`cpu()`**: Returns a Number (0.0 to 100.0) representing current CPU usage.
*   **`user(?id)`**: Returns an Object representing user information: `{ username: String, uid: Number, gid: Number, realname: String, homeDir: String, shell: String }`.
*   **`groups()`**: Returns an Array of Objects representing system groups: `{ gid: Number, name: String }`.
*   **`disk(?path = "/")`**: Returns an Object `{ total: Number, free: Number, available: Number }` representing disk space in bytes for the specified path.


---

## 3. File System

### 3.1 `fs` Module
All paths are relative to `host.cwd()` unless absolute.
*   **`exists(path)`**: Returns `1` if the path exists, otherwise `Void`.
*   **`isDir(path)`**: Returns `1` if the path is a directory, otherwise `Void`.
*   **`absPath(path)`**: Returns the absolute path String of the target.
*   **`read(path)`**: Returns the full content of a file as a String.
*   **`write(path, content)`**: Overwrites a file with String content. Returns `1` on success, `Void` on failure.
*   **`append(path, content)`**: Appends String content to an existing file. Returns `1` on success, `Void` on failure.
*   **`copy(src, dest)`**: Copies a file from source to destination. Returns `1` on success, `Void` on failure.
*   **`move(src, dest)`**: Moves or renames a file/directory. Returns `1` on success, `Void` on failure.
*   **`deleteFile(path)`**: Removes a file. Returns `1` on success, `Void` on failure.
*   **`deleteDir(path)`**: Removes an empty directory. Returns `1` on success, `Void` on failure.
*   **`mkdir(path)`**: Creates a directory. Returns `1` on success, `Void` on failure.
*   **`list(?path = ".")`**: Returns an Array of Strings (filenames).
*   **`stat(path)`**: Returns an Object `{ size: Number, isDir: Number/Void, mtime: Number }`.

---
*Status: v1.2.0-alpha2 (System-Bound)*
