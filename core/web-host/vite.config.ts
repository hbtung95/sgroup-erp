import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import reactNativeWeb from 'vite-plugin-react-native-web'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    reactNativeWeb(),
    react()
  ],
  resolve: {
    alias: {
      'react-native': 'react-native-web',
      'expo-linear-gradient': '../../packages/ui/src/mocks/expo-linear-gradient.tsx',
      'expo-clipboard': '../../packages/ui/src/mocks/expo-clipboard.ts'
    },
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
