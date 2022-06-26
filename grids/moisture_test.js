const testMoistureGrid = new Moisture(3, 3);
testMoistureGrid.cells = [
  0, 0, 0,
  1, 1, 1,
  2, 0, 0,
];

createTest("Total moisture value for indices is calculated.", function totalMoistureTest() {
  const computeIndices = [3, 4, 5];
  return testMoistureGrid.computeTotalMoistureForIndices(computeIndices);
}, 3);

createTest("Local total moisture value is calculated.", function localTotalMoistureTest(){
  return testMoistureGrid.computeLocalMoisture(1, 1).totalLocalMoisture;
}, 4);

createTest("Highest local moisture value is calculated.", function highestLocalMoistureValueTest(){
  return testMoistureGrid.computeLocalMoisture(1, 1).highestLocalMoistureValue;
}, 2);

createTest("Highest local moisture direction is calculated.", function highestLocalMoistureDirectionTest(){
  return testMoistureGrid.computeLocalMoisture(1, 1).highestLocalMoistureDirection;
}, assertVectorEquals({ x: -1, y: 1 }));