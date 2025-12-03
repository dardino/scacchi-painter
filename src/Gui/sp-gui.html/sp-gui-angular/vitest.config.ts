/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';
import angular from '@analogjs/vite-plugin-angular';
import path from 'path';

export default defineConfig({
  plugins: [
    angular({
      tsconfig: './tsconfig.json',
    }),
  ],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['@sp/gui/src/test-setup.ts'],
    include: ['**/*.spec.ts'],
    exclude: ['node_modules', 'dist', '.angular'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        '@sp/**/test.ts',
        '**/*.spec.ts',
        '**/testing/**',
        '**/environments/**',
      ],
    },
  },
  resolve: {
    alias: [
      // Specific file mappings first
      { find: /^@sp\/dbmanager\/src\/lib\/models\/twin$/, replacement: path.resolve(__dirname, './@sp/dbmanager/src/lib/models/twin.ts') },
      { find: /^@sp\/dbmanager\/src\/lib\/models\/fairesDB$/, replacement: path.resolve(__dirname, './@sp/dbmanager/src/lib/models/fairesDB.ts') },
      { find: /^@sp\/dbmanager\/src\/lib\/models$/, replacement: path.resolve(__dirname, './@sp/dbmanager/src/lib/models/index.ts') },
      { find: /^@sp\/dbmanager\/src\/lib\/providers\/AbortError$/, replacement: path.resolve(__dirname, './@sp/dbmanager/src/lib/providers/AbortError.ts') },
      { find: /^@sp\/dbmanager\/src\/lib\/providers$/, replacement: path.resolve(__dirname, './@sp/dbmanager/src/lib/providers/index.ts') },
      { find: /^@sp\/dbmanager\/src\/lib\/twinTypes$/, replacement: path.resolve(__dirname, './@sp/dbmanager/src/lib/twinTypes.ts') },
      { find: /^@sp\/chessboard\/src\/lib\/chessboard-animation\.service$/, replacement: path.resolve(__dirname, './@sp/chessboard/src/lib/chessboard-animation.service.ts') },
      { find: /^@sp\/chessboard\/src\/lib\/piece-selector\/piece-selector\.component$/, replacement: path.resolve(__dirname, './@sp/chessboard/src/lib/piece-selector/piece-selector.component.ts') },
      { find: /^@sp\/ui-elements\/src\/lib\/registerIcons$/, replacement: path.resolve(__dirname, './@sp/ui-elements/src/lib/registerIcons.ts') },
      { find: /^@sp\/ui-elements\/src\/lib\/markdown\.pipe$/, replacement: path.resolve(__dirname, './@sp/ui-elements/src/lib/markdown.pipe.ts') },
      { find: /^@sp\/ui-elements\/src\/lib\/dbsource\/dbsource\.component$/, replacement: path.resolve(__dirname, './@sp/ui-elements/src/lib/dbsource/dbsource.component.ts') },

      // Public API mappings
      { find: '@sp/chessboard/src/public-api', replacement: path.resolve(__dirname, './@sp/chessboard/src/public-api.ts') },
      { find: '@sp/dbmanager/src/public-api', replacement: path.resolve(__dirname, './@sp/dbmanager/src/public-api.ts') },
      { find: '@sp/ui-elements/src/public-api', replacement: path.resolve(__dirname, './@sp/ui-elements/src/public-api.ts') },
      { find: '@sp/host-bridge/src/public-api', replacement: path.resolve(__dirname, './@sp/host-bridge/src/public-api.ts') },

      // General path mappings
      { find: '@sp/chessboard/src', replacement: path.resolve(__dirname, './@sp/chessboard/src') },
      { find: '@sp/chessboard', replacement: path.resolve(__dirname, './@sp/chessboard/src') },
      { find: '@sp/dbmanager/src', replacement: path.resolve(__dirname, './@sp/dbmanager/src') },
      { find: '@sp/dbmanager', replacement: path.resolve(__dirname, './@sp/dbmanager/src') },
      { find: '@sp/ui-elements/src', replacement: path.resolve(__dirname, './@sp/ui-elements/src') },
      { find: '@sp/ui-elements', replacement: path.resolve(__dirname, './@sp/ui-elements/src') },
      { find: '@sp/host-bridge/src', replacement: path.resolve(__dirname, './@sp/host-bridge/src') },
      { find: '@sp/host-bridge', replacement: path.resolve(__dirname, './@sp/host-bridge/src') },
      { find: '@sp/gui', replacement: path.resolve(__dirname, './@sp/gui') },

      // Library dist aliases
      { find: 'chessboard', replacement: path.resolve(__dirname, './dist/chessboard') },
      { find: 'dbmanager', replacement: path.resolve(__dirname, './dist/dbmanager') },
      { find: 'ui-elements', replacement: path.resolve(__dirname, './dist/ui-elements') },
      { find: 'host-bridge', replacement: path.resolve(__dirname, './dist/host-bridge') },
      { find: 'rft-parser', replacement: path.resolve(__dirname, './dist/rft-parser') },

      // External paths
      { find: '@dtos', replacement: path.resolve(__dirname, './api/src/dtos') },
      { find: '@dardino-chess/core', replacement: path.resolve(__dirname, '../../../CoreJS/src/main.ts') },
      { find: '@ph', replacement: path.resolve(__dirname, './popeye') },
    ],
  },
});
