// Grid representing moisture.
class Moisture extends Grid {
  constructor(width, height, defaultMoisture=0.0) {
    super(width, height);
    this.fill(defaultMoisture);
  }
}