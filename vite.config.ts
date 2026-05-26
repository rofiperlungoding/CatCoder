/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import wasm from 'vite-plugin-wasm';
import topLevelAwait from 'vite-plugin-top-level-await';

// https://vite.dev/config/
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import { playwright } from '@vitest/browser-playwright';
const dirname = typeof __dirname !== 'undefined' ? __dirname : path.dirname(fileURLToPath(import.meta.url));

// More info at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon
export default defineConfig({
  build: {
    target: 'esnext',
    chunkSizeWarningLimit: 1024,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined;
          if (id.includes('monaco-editor')) return 'monaco';
          if (id.includes('@supabase')) return 'supabase';
          if (id.includes('@noble')) return 'crypto-noble';
          if (id.includes('crypto-js')) return 'crypto-cryptojs';
          if (id.includes('@hugeicons')) return 'hugeicons';
          if (id.includes('react-router')) return 'router';
          if (id.includes('zustand')) return 'zustand';
          if (id.includes('focus-trap') || id.includes('tabbable')) return 'a11y';
          if (
            id.includes('react-markdown') ||
            id.includes('rehype-') ||
            id.includes('remark-') ||
            id.includes('unified') ||
            id.includes('mdast-') ||
            id.includes('hast-') ||
            id.includes('micromark') ||
            id.includes('vfile') ||
            id.includes('unist-')
          ) {
            return 'markdown';
          }
          return 'vendor';
        }
      }
    }
  },
  plugins: [
    react(),
    wasm(),
    topLevelAwait(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['logo.png', 'robots.txt', '*.svg', '*.png', '*.ico'],
      manifest: {
        name: 'CatCoder',
        short_name: 'CatCoder',
        description: 'Professional Coding Platform with AI Assistance',
        theme_color: '#000000',
        background_color: '#000000',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        scope: '/',
        icons: [{
          src: '/logo.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'any'
        }, {
          src: '/logo.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'maskable'
        }]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // <== 365 days
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'gstatic-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // <== 365 days
              },
              cacheableResponse: {
                statuses: [0, 200]
              },
            }
          },
          {
            urlPattern: /^https:\/\/cdn\.jsdelivr\.net\/pyodide\/.*/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'pyodide-cache',
              expiration: {
                maxEntries: 20,
                maxAgeSeconds: 60 * 60 * 24 * 7 // <== 7 days
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      }
    })],
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['src/**/*.{test,spec}.{js,ts,tsx}'],
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/lib/**/*.ts', 'src/hooks/**/*.ts', 'src/services/**/*.ts']
    },
    projects: [
      {
        extends: true,
        test: {
          name: 'unit',
          globals: true,
          environment: 'jsdom',
          // Property-based fast-check tests share jsdom global state
          // (document.head, window.crypto stubs); running each test file
          // in its own forked process is unnecessary and re-running the
          // suite in-process keeps mocks deterministic.
          fileParallelism: false,
          include: [
            'src/lib/**/*.{test,spec}.ts',
            'src/hooks/**/*.{test,spec}.ts',
            'src/services/**/*.{test,spec}.ts',
            'src/components/**/*.{test,spec}.{ts,tsx}',
            'src/stores/**/*.{test,spec}.ts'
          ],
          setupFiles: ['./src/test/setup.ts'],
        }
      },
      {
        extends: true,
        plugins: [
          // The plugin will run tests for the stories defined in your Storybook config
          // See options at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon#storybooktest
          storybookTest({
            configDir: path.join(dirname, '.storybook')
          })],
        test: {
          name: 'storybook',
          browser: {
            enabled: true,
            headless: true,
            provider: playwright({}),
            instances: [{
              browser: 'chromium'
            }]
          },
          setupFiles: ['.storybook/vitest.setup.ts']
        }
      }]
  }
});