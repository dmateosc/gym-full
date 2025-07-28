import type { Config } from 'jest';

const config: Config = {
  // Entorno de test
  testEnvironment: 'jsdom',
  
  // Archivos de setup
  setupFilesAfterEnv: ['<rootDir>/src/test/setup.ts'],
  
  // Extensiones de archivos soportadas
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  
  // Transformaciones
  transform: {
    '^.+\\.(ts|tsx|js|jsx)$': ['babel-jest', {
      presets: [
        ['@babel/preset-env', { targets: { node: 'current' } }],
        ['@babel/preset-react', { runtime: 'automatic' }],
        ['@babel/preset-typescript', { isTSX: true, allExtensions: true }],
      ],
    }],
  },
  
  // Mapeo de módulos
  moduleNameMapper: {
    // Assets estáticos
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(gif|ttf|eot|svg|png|jpg|jpeg|webp)$': 'identity-obj-proxy',
    
    // Path aliases
    '^@/(.*)$': '<rootDir>/src/$1',
    '^components/(.*)$': '<rootDir>/src/components/$1',
    '^services/(.*)$': '<rootDir>/src/services/$1',
    '^types/(.*)$': '<rootDir>/src/types/$1',
    '^data/(.*)$': '<rootDir>/src/data/$1',
    '^assets/(.*)$': '<rootDir>/src/assets/$1',
  },
  
  // Directorios donde buscar módulos
  moduleDirectories: ['node_modules', '<rootDir>/src'],
  
  // Patrones de archivos de test
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.(ts|tsx|js|jsx)',
    '<rootDir>/src/**/?(*.)(test|spec).(ts|tsx|js|jsx)',
  ],
  
  // Archivos a incluir en coverage
  collectCoverageFrom: [
    'src/**/*.(ts|tsx)',
    '!src/**/*.d.ts',
    '!src/main.tsx',
    '!src/vite-env.d.ts',
    '!src/test/**/*',
    '!src/**/__tests__/**/*',
  ],
  
  // Configuración de coverage
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
  
  // Patrones de archivos que no deben ser transformados
  transformIgnorePatterns: [
    'node_modules/(?!(.*\\.mjs$|@testing-library))',
  ],
  
  // Timeout para tests
  testTimeout: 10000,
  
  // Verbose output
  verbose: true,
  
  // Clear mocks entre tests
  clearMocks: true,
  
  // Restore mocks entre tests
  restoreMocks: true,

  // Automaticamente mockear módulos en __mocks__
  automock: false,
};

export default config;
