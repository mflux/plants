// A grid of plant references. If not occupied, the value is null.
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