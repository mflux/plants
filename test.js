const tests = [];

function createTest(testName, testFunc, assertValue) {
  tests.push({ testName, testFunc, assertValue });
}

// Call in console to run tests.
function runTests() {
  tests.forEach(({ testName, testFunc, assertValue }) => {
    const testValue = testFunc();
    const pass = typeof assertValue === 'function' ? assertValue(testValue) : testValue === assertValue;
    if (pass) {
      console.log(`Running test: ${testName}... Passed`);
    }
    else {
      console.warn(`Running test: ${testName}... Failed`);
    }
  });
}

function assertVectorEquals(assertValue) {
  return (testValue) => {
    return testValue.x === assertValue.x && testValue.y === assertValue.y;
  };
}