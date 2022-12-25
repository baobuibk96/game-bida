var MiniBillar;
(function (MiniBillar) {
  class DebugObjectsContainer extends Phaser.Group {
    constructor(game) {
      super(game, null, "debug-objects-container");
      this.graphics = new Phaser.Graphics(this.game);
      this.add(this.graphics);
      this.cueBallGraphics = new Phaser.Graphics(this.game);
      this.add(this.cueBallGraphics);
    }
    drawCircle(p, radius, color) {
      this.graphics.lineStyle(1, color);
      this.graphics.drawCircle(
        p.x * MiniBillar.GameConstants.PHYS_SCALE,
        p.y * MiniBillar.GameConstants.PHYS_SCALE,
        2 * radius * MiniBillar.GameConstants.PHYS_SCALE
      );
    }
    clearCueBallGraphics() {
      this.cueBallGraphics.clear();
    }
    drawCueBallTrajectoryPoint(p, color) {
      this.cueBallGraphics.lineStyle(1, color, 1);
      this.cueBallGraphics.beginFill(color, 1);
      this.cueBallGraphics.drawCircle(
        p.x * MiniBillar.GameConstants.PHYS_SCALE,
        p.y * MiniBillar.GameConstants.PHYS_SCALE,
        5
      );
      this.cueBallGraphics.endFill();
    }
    drawPoint(p, color) {
      this.graphics.lineStyle(1, color, 1);
      this.graphics.beginFill(color, 1);
      this.graphics.drawCircle(
        p.x * MiniBillar.GameConstants.PHYS_SCALE,
        p.y * MiniBillar.GameConstants.PHYS_SCALE,
        5
      );
      this.graphics.endFill();
    }
    drawLine(p1, p2, color) {
      this.graphics.lineStyle(1, color, 1);
      this.graphics.moveTo(
        p1.x * MiniBillar.GameConstants.PHYS_SCALE,
        p1.y * MiniBillar.GameConstants.PHYS_SCALE
      );
      this.graphics.lineTo(
        p2.x * MiniBillar.GameConstants.PHYS_SCALE,
        p2.y * MiniBillar.GameConstants.PHYS_SCALE
      );
    }
  }
  DebugObjectsContainer.WHITE = 0xffffff;
  DebugObjectsContainer.RED = 0xff0000;
  DebugObjectsContainer.GREEN = 0x00ff00;
  DebugObjectsContainer.BLUE = 0x0000ff;
  DebugObjectsContainer.YELLOW = 0xffff00;
  MiniBillar.DebugObjectsContainer = DebugObjectsContainer;
})(MiniBillar || (MiniBillar = {}));
