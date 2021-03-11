module.exports = {
  "moduleFileExtensions": [
    "js",
    "ts"
  ],
  "rootDir": ".",
  "testRegex": ".*\\.spec\\.ts$",
  "transform": {
    "^.+\\.(ts)$": "ts-jest"
  },
  "collectCoverageFrom": [
    "Common/**/*",
    "Domain/**/*",
    "Presentation/**/*",
    "Services/**/*",
    "!Release/**/*",
    "!node_modules/**/*"
  ],
  "testPathIgnorePatterns": [
    "node_modules",
    "Release"
  ],
  "coverageDirectory": "./coverage",
  "testEnvironment": "node"
}