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