/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>/src/tests'],
  clearMocks: true,
  collectCoverageFrom: ['src/**/*.js', '!src/server.js', '!src/docs/**']
};
