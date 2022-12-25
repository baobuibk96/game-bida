var MiniBillar;
(function (MiniBillar) {
  class CueBallSpinButton extends Phaser.Group {
    constructor(game) {
      super(game, null, "cue-ball-spin-button");
      this.scale.set(
        MiniBillar.GameVars.scaleXMult,
        MiniBillar.GameVars.scaleYMult
      );
      this.cueBallButton = new Phaser.Button(
        this.game,
        0,
        0,
        "texture_atlas_1",
        this.onUpCueBallButton,
        this
      );
      this.cueBallButton.forceOut = true;
      this.cueBallButton.setFrames(
        "btn_spin_pressed.png",
        "btn_spin.png",
        "btn_spin_pressed.png",
        "btn_spin.png"
      );
      if (this.game.device.touch) {
        this.cueBallButton.onInputDown.add(
          function () {
            MiniBillar.GameVars.GUIButtonDown = true;
            this.cueBallButton.scale.set(
              this.cueBallButton.scale.x * 1.1,
              this.cueBallButton.scale.y * 1.1
            );
          },
          this,
          5
        );
      }
      this.cueBallButton.onInputOver.add(function () {
        this.cueBallButton.scale.set(
          this.cueBallButton.scale.x * 1.1,
          this.cueBallButton.scale.y * 1.1
        );
      }, this);
      this.cueBallButton.onInputOut.add(function () {
        this.cueBallButton.scale.set(1, 1);
      }, this);
      this.cueBallButton.anchor.set(0.5);
      this.add(this.cueBallButton);
      this.redDot = new Phaser.Graphics(this.game, 0, 0);
      this.redDot.beginFill(0xfa2e63);
      this.redDot.drawCircle(0, 0, 7);
      this.add(this.redDot);
    }
    disable() {
      this.cueBallButton.alpha = 0.6;
      this.cueBallButton.inputEnabled = false;
      this.redDot.x = 0;
      this.redDot.y = 0;
    }
    enable() {
      this.cueBallButton.alpha = 1;
      this.cueBallButton.inputEnabled = true;
      this.redDot.x = 0;
      this.redDot.y = 0;
    }
    setRedPointPosition(english, verticalSpin) {
      if (english && verticalSpin) {
        const x =
          MiniBillar.GUI.CUE_BALL_BUTTON_SCALE *
          MiniBillar.SpinCircleLayer.SPIN_CIRCLE_RADIUS *
          english;
        const y =
          -MiniBillar.GUI.CUE_BALL_BUTTON_SCALE *
          MiniBillar.SpinCircleLayer.SPIN_CIRCLE_RADIUS *
          verticalSpin;
        this.game.add.tween(this.cueBallButton.scale).to(
          {
            x: 1.125,
            y: 1.125,
          },
          175,
          Phaser.Easing.Cubic.Out,
          true,
          0,
          0,
          true
        );
        this.game.add.tween(this.redDot).to(
          {
            x: x,
            y: y,
          },
          350,
          Phaser.Easing.Cubic.Out,
          true,
          400
        );
      } else {
        this.redDot.x =
          MiniBillar.GUI.CUE_BALL_BUTTON_SCALE *
          MiniBillar.SpinCircleLayer.SPIN_CIRCLE_RADIUS *
          MiniBillar.GameVars.english;
        this.redDot.y =
          -MiniBillar.GUI.CUE_BALL_BUTTON_SCALE *
          MiniBillar.SpinCircleLayer.SPIN_CIRCLE_RADIUS *
          MiniBillar.GameVars.verticalSpin;
      }
    }
    onUpCueBallButton() {
      this.cueBallButton.scale.set(1, 1);
      if (
        MiniBillar.GameVars.shotRunning ||
        (MiniBillar.GameVars.gameMode !== MiniBillar.GameConstants.SOLO_MODE &&
          MiniBillar.GameVars.currentTurn !== MiniBillar.GameConstants.PLAYER)
      ) {
        return;
      }
      MiniBillar.MatchManager.showSpinCircleLayer();
      MiniBillar.AudioManager.playEffect(MiniBillar.AudioManager.BTN_NORMAL);
    }
  }
  MiniBillar.CueBallSpinButton = CueBallSpinButton;
})(MiniBillar || (MiniBillar = {}));
