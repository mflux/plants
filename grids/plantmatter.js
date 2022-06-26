class PlantMatter extends Grid {
  constructor(width, height) {
    super(width, height);
    this.fill(null);
  }
}

// Returns true if plant matter grid is occupied at the index.
function doesPlantExistAtIndex(index) {
  return grids.plantMatter.getByIndex(index) != null;
}