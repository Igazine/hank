<script setup>
import { ref, onMounted } from 'vue'
import { BrowserRunner } from '../../../vendor/hank-ts/index.ts'

const activeTab = ref('script')

const code = ref(`() {
  log.print("Hello from the Hank Playground!")
  
  sum = math.add(10, 25)
  log.print(str.format("10 + 25 = %1", sum))
  
  // Uncomment below to test Macro inclusion from the 'Virtual Files' tab
  // @"utils"
  // u = utils()
  // log.print(str.format("5 + 10 = %1", u.add_ten(5)))
}`)

const vfsCode = ref(`{
  "utils": "() { ^ { add_ten: (n) { ^ math.add(n, 10) } } }"
}`)

const output = ref([])
const isRunning = ref(false)

const runCode = async () => {
  output.value = []
  isRunning.value = true
  
  let vfs = {}
  try {
    vfs = JSON.parse(vfsCode.value)
  } catch (e) {
    output.value.push({ msg: "VFS Error: Virtual Files must be a valid JSON object map.", type: 'error' })
    isRunning.value = false
    return
  }
  
  const runner = new BrowserRunner({
    onOutput: (msg, type) => {
      output.value.push({ msg, type })
    },
    onExit: (code) => {
      output.value.push({ msg: `Process exited with code ${code}`, type: 'system' })
    },
    vfs: vfs
  })
  
  try {
    await runner.run(code.value)
  } catch (e) {
    output.value.push({ msg: e.toString(), type: 'error' })
  } finally {
    isRunning.value = false
  }
}

const clearOutput = () => {
  output.value = []
}
</script>

<template>
  <div class="playground-container">
    <div class="editor-section">
      <div class="header">
        <div class="tabs">
          <button 
            :class="['tab-btn', { active: activeTab === 'script' }]" 
            @click="activeTab = 'script'"
          >Main Task</button>
          <button 
            :class="['tab-btn', { active: activeTab === 'vfs' }]" 
            @click="activeTab = 'vfs'"
          >Virtual Files (@)</button>
        </div>
        <div class="actions">
          <button @click="runCode" :disabled="isRunning" class="run-btn">
            {{ isRunning ? 'Running...' : 'Run Task' }}
          </button>
          <button @click="clearOutput" class="clear-btn">Clear</button>
        </div>
      </div>
      
      <div v-show="activeTab === 'script'">
        <textarea v-model="code" class="code-editor" spellcheck="false" placeholder="Enter Hank Task here..."></textarea>
      </div>
      
      <div v-show="activeTab === 'vfs'">
        <div class="vfs-hint">Define a JSON map of filename -> Hank source code. These can be included via <code>@</code>.</div>
        <textarea v-model="vfsCode" class="code-editor vfs-editor" spellcheck="false"></textarea>
      </div>
    </div>
    
    <div class="output-section">
      <div class="header">
        <span class="title">Output</span>
      </div>
      <div class="output-log" ref="logContainer">
        <div v-if="output.length === 0" class="empty-msg">No output yet. Click 'Run Task' to execute.</div>
        <div v-for="(line, i) in output" :key="i" :class="['log-line', line.type]">
          <span class="line-prefix">[{{ line.type }}]</span>
          <span class="line-content">{{ line.msg }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.playground-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin: 2rem 0;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  overflow: hidden;
  background-color: var(--vp-c-bg-soft);
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 1rem;
  background-color: var(--vp-c-bg-mute);
  border-bottom: 1px solid var(--vp-c-divider);
  height: 40px;
}

.tabs {
  display: flex;
  height: 100%;
}

.tab-btn {
  padding: 0 1rem;
  font-size: 0.8rem;
  font-weight: bold;
  cursor: pointer;
  border: none;
  background: transparent;
  color: var(--vp-c-text-2);
  border-bottom: 2px solid transparent;
  transition: all 0.2s;
  height: 100%;
}

.tab-btn:hover {
  color: var(--vp-c-text-1);
}

.tab-btn.active {
  color: var(--vp-c-brand);
  border-bottom-color: var(--vp-c-brand);
}

.title {
  font-weight: bold;
  font-size: 0.9rem;
  text-transform: uppercase;
  color: var(--vp-c-text-2);
}

.actions {
  display: flex;
  gap: 0.5rem;
}

.run-btn, .clear-btn {
  padding: 2px 10px;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s;
}

.run-btn {
  background-color: var(--vp-c-brand);
  color: white;
  border: none;
}

.run-btn:hover:not(:disabled) {
  background-color: var(--vp-c-brand-next);
}

.run-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.clear-btn {
  background-color: transparent;
  border: 1px solid var(--vp-c-divider);
  color: var(--vp-c-text-1);
}

.clear-btn:hover {
  border-color: var(--vp-c-brand);
}

.code-editor {
  width: 100%;
  height: 300px;
  padding: 1rem;
  font-family: var(--vp-font-family-mono);
  font-size: 0.9rem;
  background-color: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  border: none;
  resize: vertical;
  outline: none;
}

.vfs-hint {
  padding: 0.5rem 1rem;
  font-size: 0.75rem;
  background-color: var(--vp-c-bg-soft);
  color: var(--vp-c-text-2);
  border-bottom: 1px solid var(--vp-c-divider);
}

.vfs-editor {
  color: var(--vp-c-brand);
}

.output-section {
  border-top: 1px solid var(--vp-c-divider);
}

.output-log {
  height: 180px;
  padding: 0.5rem 1rem;
  overflow-y: auto;
  font-family: var(--vp-font-family-mono);
  font-size: 0.85rem;
  background-color: #000;
  color: #fff;
}

.log-line {
  margin-bottom: 2px;
  white-space: pre-wrap;
}

.line-prefix {
  color: #666;
  margin-right: 8px;
  font-size: 0.75rem;
}

.stdout .line-content { color: #fff; }
.stderr .line-content { color: #ff5555; }
.warn .line-content { color: #ffb86c; }
.error .line-content { color: #ff5555; font-weight: bold; }
.system .line-content { color: #8be9fd; font-style: italic; }

.empty-msg {
  color: #666;
  font-style: italic;
  padding-top: 0.5rem;
}
</style>
