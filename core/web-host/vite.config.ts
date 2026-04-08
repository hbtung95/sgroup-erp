import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import reactNativeWeb from 'vite-plugin-react-native-web'

import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    reactNativeWeb(),
    react()
  ],
  resolve: {
    alias: [
      { find: 'react-native', replacement: 'react-native-web' },
      { find: 'expo-linear-gradient', replacement: path.resolve(__dirname, '../../packages/ui/src/mocks/expo-linear-gradient.tsx') },
      { find: 'expo-clipboard', replacement: path.resolve(__dirname, '../../packages/ui/src/mocks/expo-clipboard.ts') },
      { find: 'expo-blur', replacement: path.resolve(__dirname, '../../packages/ui/src/mocks/expo-blur.tsx') },
      { find: /^(?:.*\/)?shared\/(.*)$/, replacement: path.resolve(__dirname, '../../packages/ui/src/$1') }
    ],
    extensions: [
      '.web.tsx',
      '.web.ts',
      '.web.jsx',
      '.web.js',
      '.tsx',
      '.ts',
      '.jsx',
      '.js',
      '.json'
    ],
  },
  optimizeDeps: {
    include: [
      'react-native',
      'lucide-react-native',
      'expo-linear-gradient',
      'react-native-svg',
      'react-native-reanimated',
      'expo-blur',
      'expo-clipboard',
      'expo-font'
    ],
    esbuildOptions: {
      loader: {
        '.js': 'jsx',
      },
      resolveExtensions: [
        '.web.js',
        '.web.jsx',
        '.web.ts',
        '.web.tsx',
        '.native.js',
        '.js',
        '.jsx',
        '.ts',
        '.tsx',
      ],
    },
  },
})
