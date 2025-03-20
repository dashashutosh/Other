module.exports = {
    moduleDirectories: ['node_modules', 'src'], // ✅ Ensures Jest finds dependencies
    testEnvironment: 'jsdom' // ✅ Required for React testing
  };
  