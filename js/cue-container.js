var MiniBillar;
(function (MiniBillar) {
  class CueContainer extends Phaser.Group {
    constructor(game) {
      super(game, null, "cue-container");
      CueContainer.currentInstance = this;
      this.settingPower = false;
      this.angle = 180;
      this.lastRotationTransmitted = this.rotation;
      this.timeRotationTransmitted = this.game.time.time;
      this.shooting = false;
      this.down_px = 0;
      this.down_py = 0;
      this.impulseFactor = 0;
      this.aimDirectionVector = new Billiard.Vector2D(1, 0);
      this.startAim = false;
      this.downTimer = -0.1;
      this.doIntermittentCueAnim = false;
      this.doIntermittentCueAnimCounter = 1.0;
      this.createCue();
      if (this.game.device.touch) {
        this.game.input.onUp.add(this.onUp, this);
        this.game.input.onDown.add(this.onDownTouch, this);
      } else {
        this.game.input.onDown.add(this.onDownDesktop, this);
        this.game.input.onUp.add(this.shoot, this);
      }
      this.cue.visible = false;
    }
    update() {
      super.update();
      if (this.downTimer >= 0) {
        this.downTimer -= this.game.time.physicsElapsed;
      }
      if (
        !this.cue.visible ||
        this.shooting ||
        MiniBillar.SpinCircleLayer.currentInstance.visible ||
        MiniBillar.GameVars.paused ||
        MiniBillar.GameVars.GUIButtonDown
      ) {
        return;
      }
      this.animateCue();
      if (MiniBillar.GameVars.gameMode !== MiniBillar.GameConstants.SOLO_MODE) {
        if (
          MiniBillar.StageContainer.currentInstance.selectPockets.canSelect ||
          MiniBillar.GameVars.currentTurn !== MiniBillar.GameConstants.PLAYER
        ) {
          return;
        }
      }
      const cueBall = MiniBillar.GameVars.ballArray[0];
      this.position.x = cueBall.mc.x;
      this.position.y = cueBall.mc.y;
      if (this.game.device.touch) {
        if (this.settingPower) {
          this.cue.x = this.impulseFactor * CueContainer.MAX_DELTA_CUE;
        } else {
          if (this.game.input.activePointer.isDown && !this.settingPower) {
            if (this.startAim) {
              const dx =
                (this.game.input.activePointer.x - this.parent.x) /
                  MiniBillar.GameVars.scaleXMult -
                cueBall.mc.x;
              const dy =
                this.game.input.activePointer.y - this.parent.y - cueBall.mc.y;
              let pointerAngle = (180 / Math.PI) * Math.atan2(dy, dx);
              let deltaAngle = Billiard.Maths.angleDiff(
                pointerAngle,
                this.startAng
              );
              this.angle = this.startCue + deltaAngle;
              this.aimDirectionVector = new Billiard.Vector2D(
                -Math.cos(this.rotation),
                -Math.sin(this.rotation)
              );
              this.transmitCueRotation();
            } else {
              this.startCue = this.angle;
              const dx =
                (this.game.input.activePointer.x - this.parent.x) /
                  MiniBillar.GameVars.scaleXMult -
                cueBall.mc.x;
              const dy =
                this.game.input.activePointer.y - this.parent.y - cueBall.mc.y;
              this.startAng = (180 / Math.PI) * Math.atan2(dy, dx);
              this.startAim = true;
            }
          } else {
            this.startAim = false;
          }
        }
      } else {
        if (this.settingPower) {
          if (cueBall.handIcon) {
            cueBall.handIcon.visible = false;
          }
          const x = this.down_px - this.game.input.activePointer.x;
          const y = this.down_py - this.game.input.activePointer.y;
          const transf_x =
            x * Math.cos(this.rotation) + y * Math.sin(this.rotation);
          this.impulseFactor = Billiard.Maths.fixNumber(
            -Phaser.Math.clamp(transf_x, -CueContainer.MAX_DELTA_CUE, 0) /
              CueContainer.MAX_DELTA_CUE
          );
          this.cue.x = this.impulseFactor * CueContainer.MAX_DELTA_CUE;
        } else if (!MiniBillar.SpinCircleLayer.discardClick) {
          let cueBall = MiniBillar.GameVars.ballArray[0];
          const dx =
            cueBall.mc.x - this.game.input.activePointer.x + this.parent.x;
          const dy =
            cueBall.mc.y - this.game.input.activePointer.y + this.parent.y;
          this.rotation = Math.atan2(dy, dx);
          this.transmitCueRotation();
          this.aimDirectionVector = new Billiard.Vector2D(
            -Math.cos(this.rotation),
            -Math.sin(this.rotation)
          );
        }
      }
    }
    showCueAndUpdatePos() {
      this.cue.visible = true;
      this.cue.x = 0;
      this.cue.alpha = 0;
      this.game.add.tween(this.cue).to(
        {
          alpha: 1,
        },
        300,
        Phaser.Easing.Cubic.Out,
        true
      );
      let cueBall = MiniBillar.GameVars.ballArray[0];
      this.position.x = cueBall.mc.x;
      this.position.y = cueBall.mc.y;
      this.aimDirectionVector = new Billiard.Vector2D(
        -Math.cos(this.rotation),
        -Math.sin(this.rotation)
      );
    }
    moveCue(rotation) {
      let difference = this.rotation - rotation;
      let times = Math.floor((difference - -Math.PI) / (Math.PI * 2));
      let shortAngle = (difference - times * (Math.PI * 2)) * -1;
      let newAngle = this.rotation + shortAngle;
      let cueBall = MiniBillar.GameVars.ballArray[0];
      let randTime = Math.random() * 600 + 300;
      this.position.x = cueBall.mc.x;
      this.position.y = cueBall.mc.y;
      this.game.add
        .tween(this)
        .to(
          {
            rotation: newAngle,
          },
          randTime,
          Phaser.Easing.Cubic.Out,
          true
        )
        .onComplete.add(function () {
          this.aimDirectionVector = new Billiard.Vector2D(
            -Math.cos(this.rotation),
            -Math.sin(this.rotation)
          );
        }, this);
    }
    moveCueTo(x, y) {
      this.game.add.tween(this.position).to(
        {
          x: x,
          y: y,
        },
        200,
        Phaser.Easing.Linear.None,
        true
      );
    }
    hideCue() {
      this.cue.visible = false;
      this.cue.x = 0;
      this.shooting = false;
    }
    shoot(p) {
      if (p && !p.withinGame) {
        return;
      }
      this.settingPower = false;
      if (
        this.shooting ||
        !this.cue.visible ||
        MiniBillar.SpinCircleLayer.currentInstance.visible ||
        MiniBillar.GameVars.shotRunning ||
        MiniBillar.StageContainer.currentInstance.selectPockets.canSelect
      ) {
        return;
      }
      if (this.downTimer > 0) {
        this.cancelShot();
        this.downTimer = -0.1;
        return;
      }
      if (MiniBillar.GameVars.gameMode === MiniBillar.GameConstants.PVP_MODE) {
        MiniBillar.MatchManagerPVP.cueRotated(this.rotation);
      }
      if (this.impulseFactor > 0) {
        this.shooting = true;
        this.game.add
          .tween(this.cue)
          .to(
            {
              x: -5,
            },
            75,
            Phaser.Easing.Cubic.Out,
            true
          )
          .onComplete.add(this.applyImpulse, this);
      } else {
        this.impulseFactor = 0;
        const cueBall = MiniBillar.GameVars.ballArray[0];
        if (cueBall.handIcon) {
          cueBall.handIcon.visible = true;
        }
      }
    }
    shootReceived(vector, deltaScrew, english) {
      this.shooting = true;
      this.game.add.tween(this.cue).to(
        {
          x: 100,
        },
        400,
        Phaser.Easing.Cubic.Out,
        true,
        500
      );
      this.game.add
        .tween(this.cue)
        .to(
          {
            x: -5,
          },
          200,
          Phaser.Easing.Cubic.Out,
          true,
          1000
        )
        .onComplete.add(function () {
          this.applyReceivedImpulse(vector, deltaScrew, english);
        }, this);
    }
    applyReceivedImpulse(velocity, deltaScrew, english, impulseFactor) {
      let cueBall = MiniBillar.GameVars.ballArray[0];
      if (MiniBillar.GameVars.gameMode !== MiniBillar.GameConstants.SOLO_MODE) {
        cueBall.hideHandIcon();
      }
      cueBall.velocity = velocity;
      cueBall.deltaScrew = deltaScrew;
      cueBall.english = english;
      let shotData = {
        cueSpeed: {
          vx: cueBall.velocity.x,
          vy: cueBall.velocity.y,
        },
        deltaScrew: {
          x: cueBall.deltaScrew.x,
          y: cueBall.deltaScrew.y,
        },
        english: cueBall.english,
      };
      MiniBillar.MatchManager.ballHasBeenShot(shotData);
      MiniBillar.AudioManager.playEffect(
        MiniBillar.AudioManager.CUE_HIT,
        cueBall.velocity.magnitude / 1.9e3
      );
    }
    onUpTimeOut() {
      if (!this.settingPower) {
        return;
      }
      this.cancelShot();
    }
    updateCueSprite() {
      if (MiniBillar.GameVars.gameMode === MiniBillar.GameConstants.SOLO_MODE) {
        return;
      } else {
        let playerCue = MiniBillar.GameVars.gameData.playerData.equipedCue;
        let adversaryCue = MiniBillar.GameVars.adversaryData.equipedCue;
        const playerCueHasIntermittentAnim =
          MiniBillar.RewardsManager.getCueSpriteIntermittent(playerCue);
        const adversaryCueHasIntermittentAnim =
          MiniBillar.RewardsManager.getCueSpriteIntermittent(adversaryCue);
        if (
          MiniBillar.GameVars.currentTurn === MiniBillar.GameConstants.PLAYER
        ) {
          if (!playerCueHasIntermittentAnim) {
            this.doIntermittentCueAnim = false;
          } else {
            this.doIntermittentCueAnim = true;
          }
          this.cue.play("playerCueLoop");
        } else {
          if (!adversaryCueHasIntermittentAnim) {
            this.doIntermittentCueAnim = false;
          } else {
            this.doIntermittentCueAnim = true;
          }
          this.cue.play("adversaryCueLoop");
        }
      }
    }
    aimHelper() {
      if (
        this.game.device.desktop ||
        (MiniBillar.GameVars.gameMode !== MiniBillar.GameConstants.SOLO_MODE &&
          MiniBillar.GameVars.currentTurn ===
            MiniBillar.GameConstants.ADVERSARY)
      ) {
        return;
      }
      let cueBall = MiniBillar.GameVars.ballArray[0];
      let viableBalls = [];
      for (let i = 0; i < MiniBillar.GameVars.ballArray.length; i++) {
        const ball = MiniBillar.GameVars.ballArray[i];
        if (ball.id === 0 || !ball.active) {
          continue;
        }
        if (
          MiniBillar.GameVars.gameMode !== MiniBillar.GameConstants.SOLO_MODE
        ) {
          if (
            MiniBillar.GuideContainer.currentInstance.isBallProhibited(ball.id)
          ) {
            continue;
          }
        }
        if (!this.clearLineOfSight(cueBall.position, ball.position)) {
          continue;
        }
        viableBalls.push(ball);
      }
      if (viableBalls.length < 1) {
        return;
      }
      viableBalls = this.sortAndPruneViableBalls(viableBalls);
      const dxFinal = viableBalls[0].position.x - cueBall.position.x;
      const dyFinal = viableBalls[0].position.y - cueBall.position.y;
      let angle = (Math.atan2(dyFinal, dxFinal) * 180) / Math.PI + 180;
      if (Math.abs(this.angle - angle) > 180) {
        angle -= 360;
      }
      this.angle = angle + -0.15 + 0.3 * Math.random();
      this.aimDirectionVector = new Billiard.Vector2D(
        -Math.cos(this.rotation),
        -Math.sin(this.rotation)
      );
    }
    sortAndPruneViableBalls(viableBalls) {
      let list = [];
      for (let i = 0; i < viableBalls.length; i++) {
        let ball = viableBalls[i];
        let b1Closest = Number.MAX_VALUE;
        let pocketIndex = -1;
        for (let j = 0; j < MiniBillar.GameVars.pocketArray.length; j++) {
          const b1XDiff =
            ball.position.x - MiniBillar.GameVars.pocketArray[j].position.x;
          const b1YDiff =
            ball.position.y - MiniBillar.GameVars.pocketArray[j].position.y;
          const b1Dist = b1XDiff * b1XDiff + b1YDiff * b1YDiff;
          if (b1Dist < b1Closest) {
            b1Closest = b1Dist;
            pocketIndex = j;
          }
        }
        list.push({
          index: i,
          distance: b1Closest,
          pocketIndex: pocketIndex,
        });
      }
      list = list.sort((n1, n2) => n1.distance - n2.distance);
      let answer = [];
      let culledBalls = [];
      for (let i = 0; i < list.length; i++) {
        const ballIndex = list[i].index;
        const pocketIndex = list[i].pocketIndex;
        const ball = viableBalls[ballIndex];
        const pocket = MiniBillar.GameVars.pocketArray[pocketIndex];
        if (
          !this.clearLineOfSight(ball.position, pocket.position, ball.position)
        ) {
          culledBalls.push(viableBalls[ballIndex]);
          continue;
        } else {
          answer.push(viableBalls[ballIndex]);
        }
      }
      return answer.length > 0 ? answer : culledBalls;
    }
    clearLineOfSight(start, target, excludeBallPos) {
      if (!excludeBallPos) {
        excludeBallPos = target;
      }
      let c = new Billiard.Point(start.x, start.y);
      let p = new Billiard.Point(target.x, target.y);
      let g = 2 * MiniBillar.GameConstants.BALL_RADIUS;
      for (let i = 0; i < MiniBillar.GameVars.ballArray.length; i++) {
        const ball = MiniBillar.GameVars.ballArray[i];
        if (ball.id === 0 || ball.position === excludeBallPos || !ball.active) {
          continue;
        }
        let u = new Billiard.Point(ball.position.x, ball.position.y);
        var h = Billiard.Maths.lineIntersectCircle(c, p, u, g);
        if (h.intersects) {
          return false;
        }
      }
      return true;
    }
    createCue() {
      this.cue = new Phaser.Sprite(this.game, 0, 0, "texture_atlas_5");
      this.cue.anchor.y = 0.5;
      this.cue.anchor.x = -0.027;
      this.add(this.cue);
      if (MiniBillar.GameVars.gameMode === MiniBillar.GameConstants.SOLO_MODE) {
        let frames = MiniBillar.Utils.createAnimFramesArr(
          MiniBillar.GameVars.gameData.playerData.equipedCue + "_sprite",
          MiniBillar.RewardsManager.getCueSpriteFrames(
            MiniBillar.GameVars.gameData.playerData.equipedCue
          )
        );
        this.cue.frameName = frames[0];
        const intermittentAnim =
          MiniBillar.RewardsManager.getCueSpriteIntermittent(
            MiniBillar.GameVars.gameData.playerData.equipedCue
          );
        let anim = this.cue.animations.add(
          "cueLoop",
          frames,
          12,
          !intermittentAnim
        );
        if (!intermittentAnim) {
          anim.play();
        } else {
          this.doIntermittentCueAnim = true;
        }
      } else if (MiniBillar.GameVars.adversaryData.equipedCue) {
        let playerCue = MiniBillar.GameVars.gameData.playerData.equipedCue;
        let adversaryCue = MiniBillar.GameVars.adversaryData.equipedCue;
        const playerCueHasIntermittentAnim =
          MiniBillar.RewardsManager.getCueSpriteIntermittent(playerCue);
        const playerCueframes = MiniBillar.Utils.createAnimFramesArr(
          playerCue + "_sprite",
          MiniBillar.RewardsManager.getCueSpriteFrames(playerCue)
        );
        this.cue.animations.add(
          "playerCueLoop",
          playerCueframes,
          12,
          !playerCueHasIntermittentAnim
        );
        const adversaryCueHasIntermittentAnim =
          MiniBillar.RewardsManager.getCueSpriteIntermittent(adversaryCue);
        const adversaryCueframes = MiniBillar.Utils.createAnimFramesArr(
          adversaryCue + "_sprite",
          MiniBillar.GameVars.gameMode === MiniBillar.GameConstants.PVBOT_MODE
            ? 1
            : MiniBillar.RewardsManager.getCueSpriteFrames(adversaryCue)
        );
        this.cue.animations.add(
          "adversaryCueLoop",
          adversaryCueframes,
          12,
          !adversaryCueHasIntermittentAnim
        );
        this.updateCueSprite();
      }
    }
    applyImpulse() {
      let cueBall = MiniBillar.GameVars.ballArray[0];
      if (MiniBillar.GameVars.gameMode !== MiniBillar.GameConstants.SOLO_MODE) {
        cueBall.hideHandIcon();
      }
      cueBall.velocity = this.aimDirectionVector.times(
        this.impulseFactor * CueContainer.MAX_IMPULSE
      );
      this.impulseFactor = 0;
      let screw;
      if (MiniBillar.GameVars.verticalSpin > 0) {
        screw = 0.035;
      } else if (MiniBillar.GameVars.verticalSpin < 0) {
        screw = 0.0425;
      } else {
        screw = 0;
      }
      cueBall.deltaScrew = this.aimDirectionVector.times(
        cueBall.velocity.magnitude * screw * MiniBillar.GameVars.verticalSpin
      );
      cueBall.english = MiniBillar.GameVars.english;
      let shotData = {
        cueSpeed: {
          vx: cueBall.velocity.x,
          vy: cueBall.velocity.y,
        },
        deltaScrew: {
          x: cueBall.deltaScrew.x,
          y: cueBall.deltaScrew.y,
        },
        english: cueBall.english,
      };
      MiniBillar.MatchManager.ballHasBeenShot(shotData);
      MiniBillar.AudioManager.playEffect(
        MiniBillar.AudioManager.CUE_HIT,
        cueBall.velocity.magnitude / 1.9e3
      );
    }
    animateCue() {
      if (this.doIntermittentCueAnim) {
        if (this.doIntermittentCueAnimCounter < 0) {
          if (
            MiniBillar.GameVars.gameMode === MiniBillar.GameConstants.SOLO_MODE
          ) {
            this.cue.play("cueLoop", 24, false);
          } else {
            if (
              MiniBillar.GameVars.currentTurn ===
              MiniBillar.GameConstants.PLAYER
            ) {
              this.cue.play("playerCueLoop", 24, false);
            } else {
              this.cue.play("adversaryCueLoop", 24, false);
            }
          }
          this.doIntermittentCueAnimCounter = this.game.rnd.realInRange(2, 8);
        } else {
          this.doIntermittentCueAnimCounter -= this.game.time.physicsElapsed;
        }
      }
    }
    onDownDesktop() {
      if (
        !this.cue.visible ||
        MiniBillar.GameVars.shotRunning ||
        MiniBillar.SpinCircleLayer.currentInstance.visible ||
        MiniBillar.StageContainer.currentInstance.selectPockets.canSelect
      ) {
        return;
      }
      if (MiniBillar.GameVars.gameMode !== MiniBillar.GameConstants.SOLO_MODE) {
        if (
          MiniBillar.GameVars.currentTurn === MiniBillar.GameConstants.PLAYER
        ) {
          if (MiniBillar.SpinCircleLayer.discardClick) {
            MiniBillar.SpinCircleLayer.discardClick = false;
          }
        }
      } else {
        if (MiniBillar.SpinCircleLayer.discardClick) {
          MiniBillar.SpinCircleLayer.discardClick = false;
        }
      }
      if (this.downTimer < 0) {
        this.downTimer = 0.15;
      }
      this.settingPower = true;
      this.down_px = this.game.input.activePointer.x;
      this.down_py = this.game.input.activePointer.y;
    }
    cancelShot() {
      this.cue.x = 0;
      this.impulseFactor = 0;
      this.settingPower = false;
      const cueBall = MiniBillar.GameVars.ballArray[0];
      if (cueBall.handIcon) {
        cueBall.handIcon.visible = true;
      }
    }
    onDownTouch() {
      if (MiniBillar.GameVars.gameMode !== MiniBillar.GameConstants.SOLO_MODE) {
        if (
          MiniBillar.GameVars.currentTurn === MiniBillar.GameConstants.PLAYER
        ) {
          if (MiniBillar.SpinCircleLayer.discardClick) {
            MiniBillar.SpinCircleLayer.discardClick = false;
          }
        }
      } else {
        if (MiniBillar.SpinCircleLayer.discardClick) {
          MiniBillar.SpinCircleLayer.discardClick = false;
        }
      }
    }
    onUp(pointer) {
      if (
        MiniBillar.GameVars.shotRunning ||
        MiniBillar.SpinCircleLayer.currentInstance.visible ||
        MiniBillar.SpinCircleLayer.discardClick ||
        this.settingPower ||
        MiniBillar.GameVars.paused ||
        MiniBillar.StageContainer.currentInstance.selectPockets.canSelect ||
        MiniBillar.GameVars.GUIButtonDown
      ) {
        if (MiniBillar.GameVars.GUIButtonDown) {
          MiniBillar.GameVars.GUIButtonDown = false;
        }
        return;
      }
      if (
        MiniBillar.GameVars.gameMode !== MiniBillar.GameConstants.SOLO_MODE &&
        MiniBillar.GameVars.currentTurn !== MiniBillar.GameConstants.PLAYER
      ) {
        return;
      }
      if (pointer.timeUp - pointer.timeDown < 300) {
        let cueBall = MiniBillar.GameVars.ballArray[0];
        let px =
          ((pointer.x - this.parent.x) / MiniBillar.GameConstants.PHYS_SCALE) *
          MiniBillar.GameVars.scaleXMultInverse;
        let py =
          ((pointer.y - this.parent.y) / MiniBillar.GameConstants.PHYS_SCALE) *
          MiniBillar.GameVars.scaleYMultInverse;
        let dx;
        let dy;
        for (let i = 0; i < MiniBillar.GameVars.ballArray.length; i++) {
          let ball = MiniBillar.GameVars.ballArray[i];
          if (ball.id !== 0) {
            dx = ball.position.x - px;
            dy = ball.position.y - py;
            let d = Math.sqrt(dx * dx + dy * dy);
            if (d < 2.5 * MiniBillar.GameConstants.BALL_RADIUS) {
              px = ball.position.x;
              py = ball.position.y;
              break;
            }
          }
        }
        dx = px - cueBall.position.x;
        dy = py - cueBall.position.y;
        let angle = (Math.atan2(dy, dx) * 180) / Math.PI + 180;
        angle += -0.15 + 0.3 * Math.random();
        if (Math.abs(this.angle - angle) > 180) {
          angle -= 360;
        }
        this.game.add
          .tween(this)
          .to(
            {
              angle: angle,
            },
            180,
            Phaser.Easing.Cubic.Out,
            true
          )
          .onUpdateCallback(function () {
            this.aimDirectionVector = new Billiard.Vector2D(
              -Math.cos(this.rotation),
              -Math.sin(this.rotation)
            );
          }, this)
          .onComplete.add(this.transmitCueRotation, this);
      }
    }
    transmitCueRotation() {
      if (
        MiniBillar.GameVars.gameMode !== MiniBillar.GameConstants.SOLO_MODE &&
        MiniBillar.GameVars.currentTurn === MiniBillar.GameConstants.PLAYER
      ) {
        if (
          Math.abs(this.rotation - this.lastRotationTransmitted) >
            CueContainer.DELTA_ROTATIION &&
          this.game.time.time - this.timeRotationTransmitted >
            CueContainer.DELTA_TIME
        ) {
          this.timeRotationTransmitted = this.game.time.time;
          this.lastRotationTransmitted = this.rotation;
          if (
            MiniBillar.GameVars.gameMode === MiniBillar.GameConstants.PVP_MODE
          ) {
            MiniBillar.MatchManagerPVP.cueRotated(this.rotation);
          }
        }
      }
    }
  }
  CueContainer.MAX_IMPULSE = 2200;
  CueContainer.MAX_DELTA_CUE = 150;
  CueContainer.DELTA_ROTATIION = (5 / 180) * Math.PI;
  CueContainer.DELTA_TIME = 1250;
  MiniBillar.CueContainer = CueContainer;
})(MiniBillar || (MiniBillar = {}));
