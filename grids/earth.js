// Different types of soil.
const SoilType = {
  None: Symbol("none"),
  Soft: Symbol("soft"),
  Hard: Symbol("hard")
};

// A grid representing types of earth (soft soil, rock etc).
class Earth extends Grid {
  constructor(width, height, defaultSoilType=SoilType.None) {
    super(width, height);
    this.fill(defaultSoilType);
  }
}

function generateEarth(width, height) {
  const earthGrid = new Earth(width, height);
  const earthNoiseScale1 = 0.001;
  const earthNoiseScale2 = 0.05;
  earthGrid.fill(SoilType.None);
  for (let x = 0; x < earthGrid.width; x++){
    const v = int(noise(x * earthNoiseScale1) * earthGrid.height * 0.5);
    const v2 = int(noise(x * earthNoiseScale2) * 20);
    for (let y = earthGrid.height * 0.3 + v + v2; y < earthGrid.height; y++){
      earthGrid.set(x, y, SoilType.Soft);
    }
  }

  const rockNoiseScale = 0.02;
  earthGrid.replaceEachXYValue((x, y, value) => {
    if (value === SoilType.Soft) {
      const v = noise(x * rockNoiseScale * 10, y * rockNoiseScale * 20);
      if (v > 0.6) {
        return SoilType.Hard;
      }
      return SoilType.Soft;
    }
    else {
      return SoilType.None;
    }
  });

  return earthGrid;
}