import { defineConfig } from 'vitepress'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  title: "Hank",
  description: "Hybrid Automation/Scripting Language Documentation",
  base: '/hank/',
  cleanUrls: false,
  srcDir: '../',
  srcExclude: ['**/test/**', '**/node_modules/**', '**/README.md', '**/LICENSE.md', '**/package*.json', '**/*.sh'],
  rewrites: {
    'docs/:rest*': ':rest*'
  },
  vite: {
    resolve: {
      alias: [
        {
          find: /^vue(\/.*)?$/,
          replacement: fileURLToPath(new URL('../node_modules/vue$1', import.meta.url))
        }
      ]
    }
  },
  themeConfig: {
    logo: {
      text: 'Hank'
    },
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Guide', link: '/guide/syntax' },
      { text: 'Standard Library', link: '/stdlib/overview' },
      { text: 'Implementations', link: '/guide/implementations' },
      { text: 'Host Integration', link: '/runner/architecture' },
      { text: 'Playground', link: '/playground' }
    ],
    sidebar: {
      '/guide/': [
        {
          text: 'Language Guide',
          items: [
            { text: 'Philosophy & Vision', link: '/guide/philosophy' },
            { text: 'Syntax & Types', link: '/guide/syntax' },
            { text: 'Control Flow', link: '/guide/control-flow' },
            { text: 'Universal Tasks', link: '/guide/tasks' },
            { text: 'Macros (@)', link: '/guide/macros' },
            { text: 'Official Engines', link: '/guide/implementations' }
          ]
        }
      ],
      '/stdlib/': [
        {
          text: 'Standard Library',
          items: [
            { text: 'Overview', link: '/stdlib/overview' },
            { text: 'Execution & Logging', link: '/stdlib/execution' },
            { text: 'Data Manipulation', link: '/stdlib/data' },
            { text: 'Logic & Matching', link: '/stdlib/logic' },
            { text: 'JSON', link: '/stdlib/json' }
          ]
        }
      ],
      '/runner/': [
        {
          text: 'Host Integration',
          items: [
            { text: 'Architecture', link: '/runner/architecture' },
            { text: 'Building a Runner', link: '/runner/integration' },
            { text: 'Complex Object Bridge', link: '/runner/bridge' }
          ]
        }
      ]
    },
    socialLinks: [
      { icon: 'github', link: 'https://github.com/Igazine/hank' }
    ],
    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright 2026-Present Digigun.net|Igazine'
    },
    search: {
      provider: 'local'
    }
  }
})
