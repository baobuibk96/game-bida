var MiniBillar;
(function (MiniBillar) {
  class BallObject {
    constructor(game, n, x, y, active) {
      this.game = game;
      this.id = n;
      this.active = active;
      if (this.active) {
        this.shadow = new Phaser.Image(
          this.game,
          0,
          0,
          "texture_atlas_1",
          "shadow.png"
        );
        this.shadow.anchor.set(0.5);
      } else {
        this.shadow = null;
      }
      this.mc = new MiniBillar.Ball(
        this.game,
        MiniBillar.GameConstants.BALL_RADIUS *
          MiniBillar.GameConstants.PHYS_SCALE,
        n,
        this
      );
      this.position = new Billiard.Vector2D(x, y);
      this.velocity = new Billiard.Vector2D(0, 0);
      this.lastCollisionObject = null;
      this.firstContact = false;
      this.contactArray = [];
      this.waitingToTheRail = false;
      if (this.id === 0) {
        this.screw = 0;
        this.english = 0;
        this.deltaScrew = new Billiard.Vector2D(0, 0);
      }
      this.grip = 1;
      this.ySpin = 0;
      this.mc.x = this.position.x * MiniBillar.GameConstants.PHYS_SCALE;
      this.mc.y = this.position.y * MiniBillar.GameConstants.PHYS_SCALE;
      if (this.shadow) {
        this.shadow.x =
          this.mc.x +
          0.35 *
            MiniBillar.GameConstants.BALL_RADIUS *
            MiniBillar.GameConstants.PHYS_SCALE *
            (this.mc.x / 300);
        this.shadow.y =
          this.mc.y +
          0.35 *
            MiniBillar.GameConstants.BALL_RADIUS *
            MiniBillar.GameConstants.PHYS_SCALE *
            (this.mc.y / 150);
      }
    }
    setPosition(x, y) {
      this.mc.x = x;
      this.mc.y = y;
      this.shadow.x =
        this.mc.x +
        0.35 *
          MiniBillar.GameConstants.BALL_RADIUS *
          MiniBillar.GameConstants.PHYS_SCALE *
          (this.mc.x / 300);
      this.shadow.y =
        this.mc.y +
        0.35 *
          MiniBillar.GameConstants.BALL_RADIUS *
          MiniBillar.GameConstants.PHYS_SCALE *
          (this.mc.y / 150);
      this.position.x = this.mc.x / MiniBillar.GameConstants.PHYS_SCALE;
      this.position.y = this.mc.y / MiniBillar.GameConstants.PHYS_SCALE;
    }
    destroy() {
      this.mc.destroy();
      this.shadow.destroy();
    }
  }
  MiniBillar.BallObject = BallObject;
})(MiniBillar || (MiniBillar = {}));
