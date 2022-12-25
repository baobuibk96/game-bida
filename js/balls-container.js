var MiniBillar;
(function (MiniBillar) {
  class BallsContainer extends Phaser.Group {
    constructor(game) {
      super(game, null, "balls-container");
      BallsContainer.currentInstance = this;
      this.shadowsContainer = new Phaser.Group(this.game);
      this.add(this.shadowsContainer);
    }
    destroy(destroyChildren, soft) {
      BallsContainer.currentInstance = null;
      super.destroy(destroyChildren, soft);
    }
    update() {
      if (!MiniBillar.GameVars.startMatch || !MiniBillar.GameVars.ballArray) {
        return;
      }
      super.update();
      let cueBall = MiniBillar.GameVars.ballArray[0];
      if (MiniBillar.GameVars.draggingCueBall) {
        cueBall.update();
      }
      if (MiniBillar.GameConstants.DEBUG) {
        MiniBillar.StageContainer.currentInstance.debugObjectContainer.drawCueBallTrajectoryPoint(
          cueBall.position,
          MiniBillar.DebugObjectsContainer.RED
        );
      }
    }
    startGame() {
      for (let i = 0; i < MiniBillar.GameVars.ballArray.length; i++) {
        if (MiniBillar.GameVars.ballArray[i].active) {
          this.add(MiniBillar.GameVars.ballArray[i].mc);
          this.shadowsContainer.add(MiniBillar.GameVars.ballArray[i].shadow);
        }
      }
      if (MiniBillar.GameVars.gameMode === MiniBillar.GameConstants.SOLO_MODE) {
        this.alpha = 0;
        this.game.add.tween(this).to(
          {
            alpha: 1,
          },
          500,
          Phaser.Easing.Cubic.Out,
          true
        );
      }
    }
    newTurn() {
      const cueBall = MiniBillar.GameVars.ballArray[0];
      cueBall.firstContact = false;
    }
    ballHasBeenShot() {
      if (MiniBillar.GameConstants.DEBUG) {
        MiniBillar.StageContainer.currentInstance.debugObjectContainer.clearCueBallGraphics();
      }
    }
    removeBalls() {
      for (let i = 0; i < MiniBillar.GameVars.ballArray.length; i++) {
        this.remove(MiniBillar.GameVars.ballArray[i].mc);
        this.shadowsContainer.remove(MiniBillar.GameVars.ballArray[i].shadow);
      }
    }
    resetBalls() {
      for (let i = 0; i < MiniBillar.GameVars.ballArray.length; i++) {
        this.add(MiniBillar.GameVars.ballArray[i].mc);
        this.shadowsContainer.add(MiniBillar.GameVars.ballArray[i].shadow);
      }
    }
    setCueBall() {
      let cueBall = MiniBillar.GameVars.ballArray[0];
      if (!cueBall.active) {
        cueBall.active = true;
        cueBall.mc.pocketTween = false;
        cueBall.velocity = new Billiard.Vector2D(0, 0);
        cueBall.grip = 1;
        cueBall.ySpin = 0;
        cueBall.screw = 0;
        cueBall.english = 0;
        cueBall.deltaScrew = new Billiard.Vector2D(0, 0);
        let x = MiniBillar.GameConstants.BALLS_INITIAL_POSITIONS[0][0];
        let y = MiniBillar.GameConstants.BALLS_INITIAL_POSITIONS[0][1];
        let exceptionalPosition = false;
        if (
          MiniBillar.GameVars.gameMode !== MiniBillar.GameConstants.SOLO_MODE
        ) {
          if (
            MiniBillar.GameVars.currentTurn !==
            MiniBillar.GameConstants.ADVERSARY
          ) {
            while (!MiniBillar.CueBallObject.isValidPosition(x, y)) {
              x = this.game.rnd.realInRange(-38000, 38000);
              y = this.game.rnd.realInRange(-19000, 19000);
              exceptionalPosition = true;
            }
          }
        }
        cueBall.position = new Billiard.Vector2D(x, y);
        cueBall.mc.scale.set(1);
        cueBall.mc.x = cueBall.position.x * MiniBillar.GameConstants.PHYS_SCALE;
        cueBall.mc.y = cueBall.position.y * MiniBillar.GameConstants.PHYS_SCALE;
        if (
          MiniBillar.GameVars.gameMode !== MiniBillar.GameConstants.SOLO_MODE
        ) {
          if (exceptionalPosition) {
            if (
              MiniBillar.GameVars.gameMode === MiniBillar.GameConstants.PVP_MODE
            ) {
              MiniBillar.MatchManagerPVP.sendCueBallPosition(
                cueBall.mc.x,
                cueBall.mc.y
              );
            }
          }
        }
        cueBall.shadow.visible = true;
        cueBall.shadow.x =
          cueBall.mc.x +
          0.35 *
            MiniBillar.GameConstants.BALL_RADIUS *
            MiniBillar.GameConstants.PHYS_SCALE *
            (cueBall.mc.x / 300);
        cueBall.shadow.y =
          cueBall.mc.y +
          0.35 *
            MiniBillar.GameConstants.BALL_RADIUS *
            MiniBillar.GameConstants.PHYS_SCALE *
            (cueBall.mc.y / 150);
        this.add(cueBall.mc);
        cueBall.mc.alpha = 0;
        this.game.add.tween(cueBall.mc).to(
          {
            alpha: 1,
          },
          300,
          Phaser.Easing.Cubic.Out,
          true
        );
      }
      if (MiniBillar.GameVars.gameMode !== MiniBillar.GameConstants.SOLO_MODE) {
        if (
          MiniBillar.GameVars.currentTurn !== MiniBillar.GameConstants.ADVERSARY
        ) {
          MiniBillar.GameVars.draggingCueBall = true;
          cueBall.addHandIcon();
        }
      }
    }
  }
  MiniBillar.BallsContainer = BallsContainer;
})(MiniBillar || (MiniBillar = {}));
