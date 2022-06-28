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

const testPotentialEarthGrid = new Earth(3, 3);
testPotentialEarthGrid.cells = [
  SoilType.None, SoilType.None, SoilType.None,
  SoilType.Soft, SoilType.Soft, SoilType.Soft,
  SoilType.Soft, SoilType.Soft, SoilType.Hard,
];
const testPotentialPlantMatterGrid = new PlantMatter(3, 3);
testPotentialPlantMatterGrid.cells = [
  null, null, null,
  {}, null, {},
  null, null, null,
];

createTest("Computed correct normalized growth potential", () => {
  return computeNormalizedGrowthPotential(4, testPotentialEarthGrid, testPotentialPlantMatterGrid);
}, 0.625)