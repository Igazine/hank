import { Lexer, Parser, Interpreter, Value, ValueType, HankScope, Scope, ExecutionContext, IHankExtension } from './index.js';

/**
 * Options for the BrowserRunner, allowing hooks into host-environment behaviors.
 */
export interface BrowserRunnerOptions {
    /** Called when log.print, log.warn, or log.error is invoked. */
    onOutput?: (msg: string, type: 'stdout' | 'stderr' | 'warn') => void;
    /** Called when host.exit is invoked. */
    onExit?: (code: number) => void;
    /** Key-value map for env.get. */
    env?: Record<string, string>;
    /** Virtual File System map for @macro resolution. Key is macro name, value is source code. */
    vfs?: Record<string, string>;
}

/**
 * A browser-compatible Hank runner that executes scripts in memory.
 * Redirects execution-time effects to callbacks for UI integration.
 */
export class BrowserRunner {
    private coreScope: Scope = new HankScope();
    private options: BrowserRunnerOptions;
    private astCache: Map<string, any> = new Map();

    constructor(options: BrowserRunnerOptions = {}) {
        this.options = options;
        this.registerStd();
    }

    /**
     * Registers a Hank Extension.
     */
    registerExtension(ext: IHankExtension) {
        const mods = ext.getModules();
        for (const [name, tasks] of Object.entries(mods)) {
            this.registerModule(name, tasks);
        }
    }

    /**
     * Pre-parses and caches a script.
     * @param source The Hank source code.
     * @param id A unique identifier for the script (e.g. filename).
     */
    load(source: string, id: string = 'dynamic.hank'): string {
        if (this.astCache.has(id)) return id;

        const lexer = new Lexer(source);
        const tokens = lexer.tokenize();

        const macroMap = new Map<string, string>();
        if (this.options.vfs) {
            for (const [k, v] of Object.entries(this.options.vfs)) {
                macroMap.set(k, v);
            }
        }

        const parser = new Parser(tokens, id, macroMap);
        const ast = parser.parse();
        this.astCache.set(id, ast);
        return id;
    }

    /**
     * Removes a script from the cache.
     * @param id The unique identifier for the script.
     */
    unload(id: string) {
        this.astCache.delete(id);
    }

    /**
     * Executes a Hank script from source string.
     * @param source The Hank source code.
     * @param args Arguments to pass to the script's main task.
     * @returns The final result of the script.
     */
    async run(source: string, args: Value[] = []): Promise<Value> {
        const id = this.load(source);
        const ast = this.astCache.get(id);

        const interpreter = new Interpreter(undefined, this.coreScope);
        return interpreter.call(interpreter.run(ast), args);
    }

    private valToString(v: Value): string {
        switch (v.type) {
            case ValueType.String: return v.value;
            case ValueType.Number: return v.value.toString();
            case ValueType.Void: return 'Void';
            case ValueType.Array: return '[Array]';
            case ValueType.Object: return '{Object}';
            case ValueType.Opaque: return `[Opaque:${v.label || 'Unknown'}]`;
            case ValueType.Task: return '[Task]';
            default: return 'Void';
        }
    }

    private registerModule(name: string, tasks: Record<string, (args: Value[], ctx: ExecutionContext) => Value>) {
        const moduleObj = new Map<string, Value>();
        for (const [tName, func] of Object.entries(tasks)) {
            moduleObj.set(tName, {
                type: ValueType.Task,
                task: { isNative: true, name: `${name}.${tName}`, native: func }
            });
        }
        this.coreScope.set(name, { type: ValueType.Object, value: moduleObj });
    }

    private hankEquals(a: Value, b: Value): boolean {
        if (a.type !== b.type) return false;
        switch (a.type) {
            case ValueType.Void: return true;
            case ValueType.Number: return a.value === b.value;
            case ValueType.String: return a.value === b.value;
            case ValueType.Array:
                if (a.value.length !== b.value.length) return false;
                for (let i = 0; i < a.value.length; i++) if (!this.hankEquals(a.value[i], b.value[i])) return false;
                return true;
            case ValueType.Object:
                if (a.value.size !== b.value.size) return false;
                for (const [k, v1] of a.value) {
                    const v2 = b.value.get(k);
                    if (!v2 || !this.hankEquals(v1, v2)) return false;
                }
                return true;
            case ValueType.Opaque: return a.label === b.label && a.value === b.value;
            default: return false;
        }
    }

    private registerStd() {
        this.registerModule('log', {
            print: (args) => {
                const msg = args.map(a => this.valToString(a)).join(' ');
                this.options.onOutput?.(msg, 'stdout');
                return { type: ValueType.Void };
            },
            error: (args) => {
                const msg = args.map(a => this.valToString(a)).join(' ');
                this.options.onOutput?.(msg, 'stderr');
                return { type: ValueType.Void };
            },
            warn: (args) => {
                const msg = args.map(a => this.valToString(a)).join(' ');
                this.options.onOutput?.(msg, 'warn');
                return { type: ValueType.Void };
            }
        });

        this.registerModule('runtime', {
            halt: (args) => {
                let code = 0;
                if (args.length > 0 && args[0].type === ValueType.Number) code = args[0].value;
                this.options.onExit?.(code);
                return { type: ValueType.Void };
            },
            elapsedTime: () => ({ type: ValueType.Number, value: typeof performance !== 'undefined' ? performance.now() : 0 }),
            signal: (args) => {
                if (args.length > 0) {
                    const msg = this.valToString(args[0]);
                    this.options.onOutput?.(`[SIGNAL] ${msg}`, 'stdout');
                }
                return { type: ValueType.Void };
            }
        });

        this.registerModule('env', {
            get: (args) => {
                if (args.length === 0) return { type: ValueType.Void };
                const key = this.valToString(args[0]);
                const val = this.options.env?.[key];
                return val !== undefined ? { type: ValueType.String, value: val } : { type: ValueType.Void };
            },
            set: (args) => {
                if (args.length >= 2) {
                    const key = this.valToString(args[0]);
                    const val = this.valToString(args[1]);
                    if (!this.options.env) this.options.env = {};
                    this.options.env[key] = val;
                }
                return { type: ValueType.Void };
            },
            keys: () => ({
                type: ValueType.Array,
                value: Object.keys(this.options.env || {}).map(k => ({ type: ValueType.String, value: k }))
            })
        });

        this.registerModule('str', {
            length: (args) => args.length === 0 ? { type: ValueType.Void } : { type: ValueType.Number, value: this.valToString(args[0]).length },
            format: (args) => {
                if (args.length === 0) return { type: ValueType.Void };
                let res = this.valToString(args[0]);
                for (let i = 1; i < args.length; i++) {
                    res = res.replace(`%${i}`, this.valToString(args[i]));
                }
                return { type: ValueType.String, value: res };
            },
            concat: (args) => ({ type: ValueType.String, value: args.map(a => this.valToString(a)).join('') }),
            trim: (args) => args.length === 0 ? { type: ValueType.Void } : { type: ValueType.String, value: this.valToString(args[0]).trim() },
            split: (args) => {
                if (args.length < 2) return { type: ValueType.Void };
                const s = this.valToString(args[0]);
                const d = this.valToString(args[1]);
                return { type: ValueType.Array, value: s.split(d).map(part => ({ type: ValueType.String, value: part })) };
            },
            replace: (args) => {
                if (args.length < 3) return { type: ValueType.Void };
                const s = this.valToString(args[0]);
                const search = this.valToString(args[1]);
                const repl = this.valToString(args[2]);
                return { type: ValueType.String, value: s.split(search).join(repl) };
            }
        });

        this.registerModule('num', {
            parse: (args) => {
                if (args.length === 0) return { type: ValueType.Void };
                const s = this.valToString(args[0]);
                let base = 0;
                if (args.length > 1 && args[1].type === ValueType.Number) base = args[1].value;
                if (base === 0) {
                    if (s.startsWith("0x")) base = 16;
                    else if (s.startsWith("0b")) base = 2;
                    else if (s.startsWith("0o")) base = 8;
                    else base = 10;
                }
                const n = parseInt(s, base);
                if (isNaN(n)) return { type: ValueType.Void };
                return { type: ValueType.Number, value: n };
            },
            format: (args) => {
                if (args.length === 0 || args[0].type !== ValueType.Number) return { type: ValueType.Void };
                const n = args[0].value;
                let base = 10;
                if (args.length > 1 && args[1].type === ValueType.Number) base = args[1].value;
                if (base < 2 || base > 36) return { type: ValueType.Void };
                return { type: ValueType.String, value: n.toString(base) };
            }
        });

        this.registerModule('regex', {
            parse: (args) => {
                if (args.length === 0) return { type: ValueType.Void };
                const pattern = this.valToString(args[0]);
                const flags = args.length > 1 ? this.valToString(args[1]) : "";
                let jsFlags = "";
                if (flags.includes('i')) jsFlags += "i";
                if (flags.includes('m')) jsFlags += "m";
                try {
                    return { type: ValueType.Opaque, label: 'RegExp', value: new RegExp(pattern, jsFlags) };
                } catch (e) { return { type: ValueType.Void }; }
            },
            match: (args) => {
                if (args.length < 2) return { type: ValueType.Void };
                const s = this.valToString(args[0]);
                const pattern = args[1];
                if (pattern.type === ValueType.Opaque && pattern.label === 'RegExp') {
                    return pattern.value.test(s) ? { type: ValueType.Number, value: 1 } : { type: ValueType.Void };
                }
                return s.includes(this.valToString(pattern)) ? { type: ValueType.Number, value: 1 } : { type: ValueType.Void };
            },
            replace: (args) => {
                if (args.length < 3) return { type: ValueType.Void };
                const s = this.valToString(args[0]);
                const pattern = args[1];
                const repl = this.valToString(args[2]);
                if (pattern.type === ValueType.Opaque && pattern.label === 'RegExp') {
                    return { type: ValueType.String, value: s.replace(pattern.value, repl) };
                }
                return { type: ValueType.String, value: s.split(this.valToString(pattern)).join(repl) };
            }
        });

        this.registerModule('math', {
            add: (args) => {
                let sum = 0;
                for (const a of args) { if (a.type === ValueType.Number) sum += a.value; }
                return { type: ValueType.Number, value: sum };
            },
            sub: (args) => {
                if (args.length < 2 || args[0].type !== ValueType.Number || args[1].type !== ValueType.Number) return { type: ValueType.Void };
                return { type: ValueType.Number, value: args[0].value - args[1].value };
            },
            mul: (args) => {
                if (args.length === 0) return { type: ValueType.Number, value: 0 };
                let res = 1;
                for (const a of args) { if (a.type === ValueType.Number) res *= a.value; }
                return { type: ValueType.Number, value: res };
            },
            div: (args) => {
                if (args.length < 2 || args[0].type !== ValueType.Number || args[1].type !== ValueType.Number || args[1].value === 0) return { type: ValueType.Void };
                return { type: ValueType.Number, value: args[0].value / args[1].value };
            },
            gt: (args) => {
                if (args.length < 2) return { type: ValueType.Void };
                const a = args[0], b = args[1];
                if (a.type === ValueType.Number && b.type === ValueType.Number) { return a.value > b.value ? { type: ValueType.Number, value: 1 } : { type: ValueType.Void }; }
                return { type: ValueType.Void };
            },
            lt: (args) => {
                if (args.length < 2) return { type: ValueType.Void };
                const a = args[0], b = args[1];
                if (a.type === ValueType.Number && b.type === ValueType.Number) { return a.value < b.value ? { type: ValueType.Number, value: 1 } : { type: ValueType.Void }; }
                return { type: ValueType.Void };
            },
            eq: (args) => {
                if (args.length < 2) return { type: ValueType.Void };
                return this.hankEquals(args[0], args[1]) ? { type: ValueType.Number, value: 1 } : { type: ValueType.Void };
            }
        });

        this.registerModule('logic', {
            and: (args) => {
                if (args.length === 0) return { type: ValueType.Void };
                let last: Value = { type: ValueType.Void };
                for (const a of args) {
                    if (a.type === ValueType.Void) return { type: ValueType.Void };
                    last = a;
                }
                return last;
            },
            or: (args) => {
                for (const a of args) {
                    if (a.type !== ValueType.Void) return a;
                }
                return { type: ValueType.Void };
            },
            eq: (args) => {
                if (args.length < 2) return { type: ValueType.Void };
                return this.hankEquals(args[0], args[1]) ? { type: ValueType.Number, value: 1 } : { type: ValueType.Void };
            }
        });

        this.registerModule('arr', {
            length: (args) => (args.length > 0 && args[0].type === ValueType.Array) ? { type: ValueType.Number, value: args[0].value.length } : { type: ValueType.Void },
            get: (args) => {
                if (args.length < 2 || args[0].type !== ValueType.Array || args[1].type !== ValueType.Number) return { type: ValueType.Void };
                return args[0].value[args[1].value] || { type: ValueType.Void };
            },
            concat: (args) => {
                let res: Value[] = [];
                for (const a of args) { if (a.type === ValueType.Array) res = res.concat(a.value); }
                return { type: ValueType.Array, value: res };
            },
            push: (args) => {
                if (args.length < 2 || args[0].type !== ValueType.Array) return { type: ValueType.Void };
                args[0].value.push(args[1]);
                return { type: ValueType.Void };
            },
            pop: (args) => (args.length > 0 && args[0].type === ValueType.Array) ? (args[0].value.pop() || { type: ValueType.Void }) : { type: ValueType.Void },
            join: (args) => {
                if (args.length === 0 || args[0].type !== ValueType.Array) return { type: ValueType.Void };
                const d = args.length > 1 ? this.valToString(args[1]) : "";
                return { type: ValueType.String, value: args[0].value.map(v => this.valToString(v)).join(d) };
            },
            empty: (args) => (args.length > 0 && args[0].type === ValueType.Array && args[0].value.length === 0) ? { type: ValueType.Number, value: 1 } : { type: ValueType.Void },
            reverse: (args) => (args.length > 0 && args[0].type === ValueType.Array) ? { type: ValueType.Array, value: [...args[0].value].reverse() } : { type: ValueType.Void },
            each: (args, ctx) => {
                if (args.length < 2 || args[0].type !== ValueType.Array || args[1].type !== ValueType.Task) return { type: ValueType.Void };
                const items = [...args[0].value];
                items.forEach((item, idx) => {
                    ctx.call(args[1], [item, { type: ValueType.Number, value: idx }]);
                });
                return { type: ValueType.Void };
            }
        });

        this.registerModule('obj', {
            get: (args) => {
                if (args.length < 2 || args[0].type !== ValueType.Object) return { type: ValueType.Void };
                const key = this.valToString(args[1]);
                return args[0].value.get(key) || { type: ValueType.Void };
            },
            keys: (args) => (args.length > 0 && args[0].type === ValueType.Object) ? { type: ValueType.Array, value: Array.from(args[0].value.keys()).map(k => ({ type: ValueType.String, value: k })) } : { type: ValueType.Void }
        });

        this.registerModule('json', {
            parse: (args) => {
                if (args.length === 0) return { type: ValueType.Void };
                try {
                    const data = JSON.parse(this.valToString(args[0]));
                    return this.mapAnyToHank(data);
                } catch (e) { return { type: ValueType.Void }; }
            },
            stringify: (args) => {
                if (args.length === 0) return { type: ValueType.Void };
                const checkOpaque = (val: Value): boolean => {
                    if (val.type === ValueType.Opaque) return true;
                    if (val.type === ValueType.Array) return val.value.some((i: any) => checkOpaque(i));
                    if (val.type === ValueType.Object) return Array.from(val.value.values()).some((v: any) => checkOpaque(v));
                    return false;
                };
                if (checkOpaque(args[0])) return { type: ValueType.Void };
                return { type: ValueType.String, value: JSON.stringify(this.mapHankToAny(args[0])) };
            }
        });

        this.registerModule('browser', {
            log: (args) => {
                if (args.length > 0) {
                    console.log("[Hank]", ...args.map(a => this.mapHankToAny(a)));
                }
                return { type: ValueType.Void };
            },
            alert: (args) => {
                if (args.length > 0) {
                    alert(this.valToString(args[0]));
                }
                return { type: ValueType.Void };
            }
        });
    }

    private mapAnyToHank(v: any): Value {
        if (v === null || v === undefined) return { type: ValueType.Void };
        if (typeof v === 'number') return { type: ValueType.Number, value: v };
        if (typeof v === 'string') return { type: ValueType.String, value: v };
        if (typeof v === 'boolean') return v ? { type: ValueType.Number, value: 1 } : { type: ValueType.Void };
        if (Array.isArray(v)) return { type: ValueType.Array, value: v.map(i => this.mapAnyToHank(i)) };
        if (typeof v === 'object') {
            const map = new Map<string, Value>();
            for (const [k, val] of Object.entries(v)) map.set(k, this.mapAnyToHank(val));
            return { type: ValueType.Object, value: map };
        }
        return { type: ValueType.Void };
    }

    private mapHankToAny(v: Value): any {
        switch (v.type) {
            case ValueType.Number: return v.value;
            case ValueType.String: return v.value;
            case ValueType.Array: return v.value.map(i => this.mapHankToAny(i));
            case ValueType.Object:
                const obj: any = {};
                v.value.forEach((val, k) => { obj[k] = this.mapHankToAny(val); });
                return obj;
            default: return null;
        }
    }
}
