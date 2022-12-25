var MiniBillar;
(function (MiniBillar) {
  class CueBallObject extends MiniBillar.BallObject {
    constructor(game, n, x, y) {
      super(game, n, x, y, true);
      this.cueBallBig = null;
      this.handIcon = null;
    }
    static changePosition(x, y) {
      let newX = x;
      let newY = y;
      let upperLeftCushionPoint = MiniBillar.StageContainer.CUSHION_VERTEXES[0];
      let lowerRightCushionPoint =
        MiniBillar.StageContainer.CUSHION_VERTEXES[2];
      if (x < upperLeftCushionPoint.x) {
        newX = upperLeftCushionPoint.x * 0.999;
      } else if (x > lowerRightCushionPoint.x) {
        newX = lowerRightCushionPoint.x * 0.999;
      }
      if (y < upperLeftCushionPoint.y) {
        newY = upperLeftCushionPoint.y * 0.999;
      } else if (y > lowerRightCushionPoint.y) {
        newY = lowerRightCushionPoint.y * 0.999;
      }
      if (MiniBillar.GameVars.firstShot && x > -21000) {
        newX = -21000;
      }
      for (let i = 1, ln = MiniBillar.GameVars.ballArray.length; i < ln; i++) {
        if (MiniBillar.GameVars.ballArray[i].active) {
          let dx = MiniBillar.GameVars.ballArray[i].position.x - newX;
          let dy = MiniBillar.GameVars.ballArray[i].position.y - newY;
          let d = Math.sqrt(dx * dx + dy * dy);
          if (d < MiniBillar.GameConstants.BALL_RADIUS * 2) {
            return null;
          }
        }
      }
      return {
        x: newX * MiniBillar.GameConstants.PHYS_SCALE,
        y: newY * MiniBillar.GameConstants.PHYS_SCALE,
      };
    }
    static isValidPosition(x, y, id) {
      let isValid = true;
      let upperLeftCushionPoint = MiniBillar.StageContainer.CUSHION_VERTEXES[0];
      let lowerRightCushionPoint =
        MiniBillar.StageContainer.CUSHION_VERTEXES[2];
      if (MiniBillar.GameVars.firstShot) {
        if (
          x < upperLeftCushionPoint.x ||
          y < upperLeftCushionPoint.y ||
          x > -21000 ||
          y > lowerRightCushionPoint.y
        ) {
          isValid = false;
        }
      } else {
        if (
          x < upperLeftCushionPoint.x ||
          y < upperLeftCushionPoint.y ||
          x > lowerRightCushionPoint.x ||
          y > lowerRightCushionPoint.y
        ) {
          isValid = false;
        }
      }
      if (isValid) {
        for (
          let i = 1, ln = MiniBillar.GameVars.ballArray.length;
          i < ln;
          i++
        ) {
          if (MiniBillar.GameVars.ballArray[i].active) {
            if (id && id === MiniBillar.GameVars.ballArray[i].id) {
              continue;
            }
            let dx = MiniBillar.GameVars.ballArray[i].position.x - x;
            let dy = MiniBillar.GameVars.ballArray[i].position.y - y;
            let d = Math.sqrt(dx * dx + dy * dy);
            if (d < MiniBillar.GameConstants.BALL_RADIUS * 2) {
              isValid = false;
              break;
            }
          }
        }
      }
      return isValid;
    }
    update() {
      if (
        MiniBillar.GameVars.draggingCueBall &&
        this.cueBallBig &&
        this.cueBallBig.alpha > 0
      ) {
        let x =
          (this.game.input.activePointer.x -
            MiniBillar.StageContainer.currentInstance.x) *
          MiniBillar.GameVars.scaleXMultInverse;
        let y =
          (this.game.input.activePointer.y -
            MiniBillar.StageContainer.currentInstance.y) *
          MiniBillar.GameVars.scaleYMultInverse;
        let point = {
          x: x,
          y: y,
        };
        point = CueBallObject.changePosition(
          x / MiniBillar.GameConstants.PHYS_SCALE,
          y / MiniBillar.GameConstants.PHYS_SCALE
        );
        if (point) {
          this.cueBallBig.x = point.x;
          this.cueBallBig.y = point.y;
          this.mc.x = point.x;
          this.mc.y = point.y;
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
      if (this.handIcon) {
        this.handIcon.x = this.mc.x + 30;
        this.handIcon.y = this.mc.y;
      }
    }
    setPositionReceived(x, y) {
      this.game.add.tween(this.mc).to(
        {
          x: x,
          y: y,
        },
        200,
        Phaser.Easing.Linear.None,
        true
      );
      this.game.add
        .tween(this.shadow)
        .to(
          {
            x:
              x +
              0.35 *
                MiniBillar.GameConstants.BALL_RADIUS *
                MiniBillar.GameConstants.PHYS_SCALE *
                (x / 300),
            y:
              y +
              0.35 *
                MiniBillar.GameConstants.BALL_RADIUS *
                MiniBillar.GameConstants.PHYS_SCALE *
                (y / 150),
          },
          200,
          Phaser.Easing.Linear.None,
          true
        )
        .onComplete.add(function () {
          MiniBillar.CueContainer.currentInstance.showCueAndUpdatePos();
          MiniBillar.MatchManager.cueBallSet(x, y);
        }, this);
      this.position.x = x / MiniBillar.GameConstants.PHYS_SCALE;
      this.position.y = y / MiniBillar.GameConstants.PHYS_SCALE;
    }
    setPositioOnShoot(x, y) {
      this.mc.x = x;
      this.mc.y = y;
      this.shadow.x =
        x +
        0.35 *
          MiniBillar.GameConstants.BALL_RADIUS *
          MiniBillar.GameConstants.PHYS_SCALE *
          (x / 300);
      this.shadow.y =
        y +
        0.35 *
          MiniBillar.GameConstants.BALL_RADIUS *
          MiniBillar.GameConstants.PHYS_SCALE *
          (y / 150);
      this.position.x = x / MiniBillar.GameConstants.PHYS_SCALE;
      this.position.y = y / MiniBillar.GameConstants.PHYS_SCALE;
    }
    addHandIcon() {
      if (this.handIcon) {
        this.handIcon.destroy();
        this.handIcon = null;
      }
      this.handIcon = new Phaser.Image(
        this.game,
        this.mc.x,
        this.mc.y,
        "texture_atlas_1",
        "hand-icon.png"
      );
      this.handIcon.anchor.set(0.5);
      this.handIcon.scale.set(0.8);
      MiniBillar.StageContainer.currentInstance.add(this.handIcon);
      if (this.cueBallBig) {
        this.cueBallBig.destroy();
        this.cueBallBig = null;
      }
      this.cueBallBig = new Phaser.Image(
        this.game,
        this.mc.x,
        this.mc.y,
        "texture_atlas_1",
        "cue_ball.png"
      );
      this.cueBallBig.anchor.set(0.5);
      this.cueBallBig.scale.set(0.5);
      this.cueBallBig.alpha = 0;
      if (this.game.device.desktop) {
        const scaleDiff =
          ((this.mc.width * this.mc.scale.x) / this.cueBallBig.width) *
          this.cueBallBig.scale.x;
        this.cueBallBig.scale.set(scaleDiff);
      }
      this.cueBallBig.inputEnabled = true;
      this.cueBallBig.events.onInputDown.add(this.onDown, this);
      this.cueBallBig.events.onInputUp.add(this.onUp, this);
      MiniBillar.StageContainer.currentInstance.add(this.cueBallBig);
      this.handIcon.alpha = 0;
      this.game.add.tween(this.handIcon).to(
        {
          alpha: 1,
        },
        300,
        Phaser.Easing.Cubic.Out,
        true
      );
      this.game.add.tween(this.handIcon.scale).to(
        {
          x: 0.9,
          y: 0.9,
        },
        500,
        Phaser.Easing.Cubic.InOut,
        true,
        0,
        -1,
        true
      );
    }
    hideHandIcon() {
      if (!MiniBillar.GameVars.draggingCueBall) {
        return;
      }
      MiniBillar.GameVars.draggingCueBall = false;
      this.handIcon.destroy();
      this.handIcon = null;
      this.cueBallBig.destroy();
      this.cueBallBig = null;
    }
    onDown() {
      if (this.game.device.desktop) {
        const scaleDiff =
          ((this.mc.width * this.mc.scale.x) / this.cueBallBig.width) *
          this.cueBallBig.scale.x;
        this.cueBallBig.scale.set(scaleDiff);
        this.mc.alpha = 0;
      }
      MiniBillar.BallsContainer.currentInstance.bringToTop(this.mc);
      MiniBillar.StageContainer.currentInstance.hideCue("Moving cue ball");
      MiniBillar.StageContainer.currentInstance.hideGuide("Moving cue ball");
      this.handIcon.destroy();
      this.handIcon = null;
      this.cueBallBig.alpha = 0.65;
    }
    onUp() {
      if (!MiniBillar.GameVars.draggingCueBall) {
        return;
      }
      MiniBillar.StageContainer.currentInstance.showCue(
        "Just placed white ball"
      );
      this.cueBallBig.destroy();
      this.cueBallBig = null;
      this.addHandIcon();
      this.position.x = this.mc.x / MiniBillar.GameConstants.PHYS_SCALE;
      this.position.y = this.mc.y / MiniBillar.GameConstants.PHYS_SCALE;
      this.mc.alpha = 1;
      MiniBillar.MatchManager.cueBallSet(this.mc.x, this.mc.y);
    }
    onUpTimeOut() {
      if (!MiniBillar.GameVars.draggingCueBall) {
        return;
      }
      MiniBillar.GameVars.draggingCueBall = false;
      this.cueBallBig.destroy();
      this.cueBallBig = null;
      if (this.handIcon) {
        this.handIcon.destroy();
        this.handIcon = null;
      }
      this.mc.x = this.position.x * MiniBillar.GameConstants.PHYS_SCALE;
      this.mc.y = this.position.y * MiniBillar.GameConstants.PHYS_SCALE;
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
      this.mc.alpha = 1;
      MiniBillar.MatchManager.cueBallSet(this.mc.x, this.mc.y);
    }
  }
  MiniBillar.CueBallObject = CueBallObject;
})(MiniBillar || (MiniBillar = {}));
