module.exports = {
  setupFiles: ["./setupTests.js"],
  testMatch: [
    "**/__tests/**/*.[jt]s?(x)",
    "**/?(*.)+(spec|test|steps).[jt]s?(x)",
  ],
  preset: "ts-jest",
  transform: {
    "^.+\\.(js|jsx)$": "babel-jest",
  },
};
