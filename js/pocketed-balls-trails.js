var MiniBillar;
(function (MiniBillar) {
  class PocketedBallsTrail extends Phaser.Group {
    constructor(game) {
      super(game, null, "pocketed-balls-trail");
      this.x =
        MiniBillar.GameVars.gameData.powerBarSide ===
        MiniBillar.GameConstants.LEFT
          ? 485
          : -485;
      this.y = -PocketedBallsTrail.RAILS_LENGTH / 2;
      this.railTweens = [];
      const railBottomImageName =
        MiniBillar.GameVars.gameData.equippedTable + "_rail_bottom.png";
      this.rails = new Phaser.Image(
        this.game,
        0,
        0,
        "texture_atlas_4",
        railBottomImageName
      );
      this.rails.anchor.x = 0.5;
      this.add(this.rails);
      const railTopImageName =
        MiniBillar.GameVars.gameData.equippedTable + "_rail_top.png";
      this.cover = new Phaser.Image(
        this.game,
        0,
        0,
        "texture_atlas_4",
        railTopImageName
      );
      this.cover.anchor.x = 0.5;
      this.add(this.cover);
      this.rails.scale.x =
        MiniBillar.GameVars.gameData.powerBarSide ===
        MiniBillar.GameConstants.LEFT
          ? 1
          : -1;
      this.cover.scale.x = this.rails.scale.x;
    }
    pauseGame() {
      for (let i = 0; i < this.railTweens.length; i++) {
        this.railTweens[i].pause();
      }
    }
    resumeGame() {
      for (let i = 0; i < this.railTweens.length; i++) {
        this.railTweens[i].resume();
      }
    }
    addBall(ball) {
      let numBallsWaiting = 0;
      for (let i = 1; i < MiniBillar.GameVars.ballArray.length; i++) {
        if (MiniBillar.GameVars.ballArray[i].waitingToTheRail) {
          numBallsWaiting++;
        }
      }
      ball.mc.shade.frameName = "shade_potted_ball.png";
      ball.waitingToTheRail = true;
      const delay =
        1500 + 500 * numBallsWaiting + Math.round(150 * Math.random());
      const numPocketedBalls = this.children.length - 2 + numBallsWaiting;
      this.game.time.events.add(
        delay,
        function () {
          ball.waitingToTheRail = false;
          ball.mc.pocketTween = true;
          ball.mc.scale.set(PocketedBallsTrail.SCALE_FACTOR);
          ball.mc.position.set(0, 20);
          ball.shadow.destroy();
          this.addAt(ball.mc, 1);
          const vy = 2.5 + 0.65 * Math.random();
          const dy =
            PocketedBallsTrail.RAILS_LENGTH -
            numPocketedBalls *
              MiniBillar.GameConstants.BALL_RADIUS *
              2 *
              MiniBillar.GameConstants.PHYS_SCALE -
            8;
          const t =
            (((dy / vy) * 1000) / 60) * (1 / PocketedBallsTrail.SCALE_FACTOR);
          ball.velocity = new Billiard.Vector2D(0, vy);
          const railTween = this.game.add.tween(ball.mc).to(
            {
              y: dy,
            },
            t,
            Phaser.Easing.Linear.None,
            true
          );
          railTween.onComplete.add(function () {
            ball.mc.pocketTween = false;
            ball.velocity = new Billiard.Vector2D(0, 0);
            if (numPocketedBalls !== 0) {
              MiniBillar.AudioManager.playEffect(
                MiniBillar.AudioManager.BALL_HIT,
                0.015
              );
            }
            const i = this.railTweens.indexOf(railTween);
            this.railTweens.splice(i, 1);
          }, this);
          this.railTweens.push(railTween);
        },
        this
      );
    }
    changeSide() {
      this.x =
        MiniBillar.GameVars.gameData.powerBarSide ===
        MiniBillar.GameConstants.LEFT
          ? 485
          : -485;
      this.rails.scale.x =
        MiniBillar.GameVars.gameData.powerBarSide ===
        MiniBillar.GameConstants.LEFT
          ? 1
          : -1;
      this.cover.scale.x = this.rails.scale.x;
    }
    setPocketedBalls() {
      for (let i = 0; i < MiniBillar.GameVars.pocketedBalls.length; i++) {
        let ballId = MiniBillar.GameVars.pocketedBalls[i];
        for (let j = 1; j < MiniBillar.GameVars.ballArray.length; j++) {
          let ball = MiniBillar.GameVars.ballArray[j];
          if (ballId === MiniBillar.GameVars.ballArray[j].id) {
            ball.mc.shade.frameName = "shade_potted_ball.png";
            ball.mc.position.set(
              0,
              PocketedBallsTrail.RAILS_LENGTH -
                i *
                  MiniBillar.GameConstants.BALL_RADIUS *
                  2 *
                  MiniBillar.GameConstants.PHYS_SCALE -
                8
            );
            ball.mc.scale.set(PocketedBallsTrail.SCALE_FACTOR);
            this.add(ball.mc);
          }
        }
      }
    }
  }
  PocketedBallsTrail.RAILS_LENGTH = 448;
  PocketedBallsTrail.SCALE_FACTOR = 0.9;
  MiniBillar.PocketedBallsTrail = PocketedBallsTrail;
})(MiniBillar || (MiniBillar = {}));
