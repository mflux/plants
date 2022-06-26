const testPlantEarthGrid = new Earth(3, 3);
testPlantEarthGrid.cells = [
  SoilType.None, SoilType.None, SoilType.None,
  SoilType.None, SoilType.None, SoilType.None,
  SoilType.Soft, SoilType.Soft, SoilType.Soft,
];

createTest("Find appropriate spawn on nearest soil underneath.", function plantSpawnLocationTest() {
  const testX = 1;
  return searchForAppropriatePlantY(testX, testPlantEarthGrid);
}, 2);