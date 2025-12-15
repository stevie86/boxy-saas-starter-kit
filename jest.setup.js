// Optional: configure or set up a testing framework before each test.
// If you delete this file, remove `setupFilesAfterEnv` from `jest.config.js`
// Used for __tests__/testing-library.js
// Learn more: https://github.com/testing-library/jest-dom
// import '@testing-library/jest-dom/extend-expect'; // Commented out to fix module resolution

// Mock the global File class for Node.js environment in Jest
global.File = class MockFile extends Blob {
    constructor(content, name, options) {
      super(content, options);
      this.name = name;
    }
  
    // Add the text() method for mocking
    async text() {
      return this.arrayBuffer().then(buffer => Buffer.from(buffer).toString());
    }
  
    // You might need to mock other methods like arrayBuffer() or stream() if used
  };

