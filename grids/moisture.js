// Grid representing moisture.
class Moisture extends Grid {
  constructor(width, height, defaultMoisture=0.0) {
    super(width, height);
    this.fill(defaultMoisture);
  }

  // Computes the local moisture data for x y.
  // Returns total moisture for all 9 cells in and around x y.
  // Returns the highest moisture value in its neighborhood.
  // Returns a vector pointing to where the highest moisture is found.
  computeLocalMoisture(x, y) {
    let totalLocalMoisture = 0;
    let highestLocalMoistureValue = 0;
    let highestLocalMoistureDirection = createVector(0, 0);
    this.forEachXYNeighborValue(x, y, (neighborX, neighborY, value) => {
      totalLocalMoisture += value;
      if (value > highestLocalMoistureValue) {
        highestLocalMoistureValue = value;
        highestLocalMoistureDirection.x = neighborX - x;
        highestLocalMoistureDirection.y = neighborY - y;
      }
    });

    return {
      totalLocalMoisture,
      highestLocalMoistureValue,
      highestLocalMoistureDirection,
    };
  }

  // Computes the total moisture for the given indices.
  computeTotalMoistureForIndices(indices){
    return indices.reduce((totalMoisture, rootIndex) => {
      return totalMoisture + grids.moisture.getByIndex(rootIndex);
    });
  }
}

