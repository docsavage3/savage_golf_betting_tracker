// Mock localStorage for testing
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

// Apply the mock to global
Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
  writable: true
});

// Reset localStorage mock before each test
beforeEach(() => {
  localStorageMock.getItem.mockClear();
  localStorageMock.setItem.mockClear();
  localStorageMock.removeItem.mockClear();
  localStorageMock.clear.mockClear();
});

// Mock document methods for DOM manipulation
global.document = {
  ...global.document,
  createElement: jest.fn().mockReturnValue({
    href: '',
    download: '',
    click: jest.fn()
  }),
  body: {
    appendChild: jest.fn(),
    removeChild: jest.fn()
  }
};

// Also mock URL.createObjectURL for file operations
global.URL = {
  createObjectURL: jest.fn(() => 'mock-url'),
  revokeObjectURL: jest.fn()
};

// Mock FileReader for import functionality
global.FileReader = class {
  constructor() {
    this.result = null;
    this.onload = null;
  }
  
  readAsText(file) {
    // Simulate async reading
    setTimeout(() => {
      if (this.onload) {
        this.onload({ target: { result: file.content || '[]' } });
      }
    }, 0);
  }
};

// Mock DOM elements that might not exist in jsdom
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  // Uncomment to suppress console.log in tests
  // log: jest.fn(),
  // warn: jest.fn(),
  // error: jest.fn(),
};
