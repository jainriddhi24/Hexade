const Environment = require('jest-environment-jsdom').default;

/**
 * A custom test environment that extends the default jsdom environment
 * to include additional browser globals required by the tests
 */
module.exports = class CustomTestEnvironment extends Environment {
  async setup() {
    await super.setup();
    
    // Mock matchMedia
    if (typeof this.global.matchMedia !== 'function') {
      this.global.matchMedia = function (query) {
        return {
          matches: false,
          media: query,
          onchange: null,
          addListener: function() {},
          removeListener: function() {},
          addEventListener: function() {},
          removeEventListener: function() {},
          dispatchEvent: function() {},
        };
      };
    }

    // Mock ResizeObserver
    if (typeof this.global.ResizeObserver !== 'function') {
      this.global.ResizeObserver = function() {
        return {
          observe: function() {},
          unobserve: function() {},
          disconnect: function() {},
        };
      };
    }
  }
};