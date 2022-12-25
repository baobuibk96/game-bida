var MiniBillar;
(function (MiniBillar) {
  class ForceSettingContainer extends Phaser.Group {
    constructor(game) {
      super(game, null, "force-setting-container");
      this.x =
        MiniBillar.GameVars.gameData.powerBarSide ===
        MiniBillar.GameConstants.LEFT
          ? 0
          : MiniBillar.GameVars.gameWidth;
      this.y = MiniBillar.GameVars.gameHeight / 2 + 40;
      this.canMove = true;
      this.initialY = 0;
      this.powerBarEmpty = new Phaser.Sprite(
        this.game,
        0,
        0,
        "texture_atlas_1",
        "power_bar_empty.png"
      );
      this.powerBarEmpty.anchor.set(0, 0.5);
      this.powerBarEmpty.scale.set(
        MiniBillar.GameVars.scaleXMult,
        MiniBillar.GameVars.scaleYMult
      );
      this.powerBarEmpty.inputEnabled = true;
      this.powerBarEmpty.events.onInputDown.add(this.onDownPowerBarEmpty, this);
      this.powerBarEmpty.events.onInputUp.add(this.onUpPowerBarEmpty, this);
      this.add(this.powerBarEmpty);
      this.maskHeight = 505 * MiniBillar.GameVars.scaleYMult;
      this.powerMask = new Phaser.Graphics(
        this.game,
        0,
        -this.maskHeight * 0.5
      );
      this.powerMask.beginFill(0xffffff);
      this.powerMask.drawRect(0, 0, this.powerBarEmpty.width, this.maskHeight);
      this.add(this.powerMask);
      this.forceBar = new Phaser.Sprite(
        this.game,
        0,
        0,
        "texture_atlas_1",
        "power_bar_full.png"
      );
      this.forceBar.anchor.set(0, 0.5);
      this.forceBar.scale.set(
        MiniBillar.GameVars.scaleXMult,
        MiniBillar.GameVars.scaleYMult
      );
      this.forceBar.mask = this.powerMask;
      this.add(this.forceBar);
      this.cue = new Phaser.Sprite(
        this.game,
        this.powerBarEmpty.x + this.powerBarEmpty.width * 0.5 - 8,
        0,
        "texture_atlas_1",
        "cue_power.png"
      );
      this.cue.anchor.set(0.5);
      this.cue.scale.set(
        MiniBillar.GameVars.scaleXMult,
        MiniBillar.GameVars.scaleYMult
      );
      this.add(this.cue);
      if (
        MiniBillar.GameVars.gameData.powerBarSide ===
        MiniBillar.GameConstants.RIGHT
      ) {
        this.powerBarEmpty.scale.x *= -1;
        this.forceBar.scale.x *= -1;
        this.powerMask.scale.x *= -1;
        this.cue.scale.x *= -1;
        this.cue.x *= -1;
      }
      this.visible = false;
    }
    update() {
      if (
        MiniBillar.CueContainer.currentInstance.settingPower &&
        this.canMove
      ) {
        let localY = this.game.input.activePointer.y - this.y - this.initialY;
        localY += 230;
        localY = Phaser.Math.clamp(localY, 0, 430);
        MiniBillar.CueContainer.currentInstance.impulseFactor =
          Billiard.Maths.fixNumber(localY / 430);
        this.cue.y = localY;
        this.powerMask.scale.y = 1 - localY / 430;
        if (this.powerMask.scale.y === 0) {
          this.powerMask.scale.y = 0.001;
        }
      }
    }
    changeSide() {
      this.powerBarEmpty.scale.x *= -1;
      this.forceBar.scale.x *= -1;
      this.powerMask.scale.x *= -1;
      this.cue.scale.x *= -1;
      this.cue.x *= -1;
      if (
        MiniBillar.GameVars.gameData.powerBarSide ===
        MiniBillar.GameConstants.LEFT
      ) {
        if (this.canMove) {
          this.x = 0;
        } else {
          this.x = -100;
        }
      } else {
        if (this.canMove) {
          this.x = MiniBillar.GameVars.gameWidth;
        } else {
          this.x = MiniBillar.GameVars.gameWidth + 100;
        }
      }
    }
    show() {
      this.visible = true;
    }
    hide() {
      this.canMove = false;
      this.game.add.tween(this.cue).to(
        {
          y: 0,
        },
        150,
        Phaser.Easing.Cubic.Out,
        true
      );
      this.game.add.tween(this).to(
        {
          x:
            this.x -
            100 *
              (MiniBillar.GameVars.gameData.powerBarSide ===
              MiniBillar.GameConstants.LEFT
                ? 1
                : -1),
        },
        200,
        Phaser.Easing.Cubic.In,
        true,
        100
      );
      this.game.add.tween(this.powerMask.scale).to(
        {
          y: 1,
        },
        150,
        Phaser.Easing.Cubic.Out,
        true
      );
    }
    disable() {
      MiniBillar.CueContainer.currentInstance.settingPower = false;
      MiniBillar.CueContainer.currentInstance.impulseFactor = 0;
    }
    reset() {
      this.canMove = true;
      this.powerMask.scale.y = 1;
      this.cue.y = 0;
      this.game.add.tween(this).to(
        {
          x:
            MiniBillar.GameVars.gameData.powerBarSide ===
            MiniBillar.GameConstants.LEFT
              ? 0
              : MiniBillar.GameVars.gameWidth,
        },
        200,
        Phaser.Easing.Cubic.Out,
        true
      );
      this.disable();
    }
    onDownPowerBarEmpty() {
      if (MiniBillar.StageContainer.currentInstance.selectPockets.canSelect) {
        return;
      }
      this.initialY = this.game.input.activePointer.y - 110;
      MiniBillar.CueContainer.currentInstance.settingPower = true;
    }
    onUpPowerBarEmpty() {
      if (MiniBillar.StageContainer.currentInstance.selectPockets.canSelect) {
        return;
      }
      MiniBillar.CueContainer.currentInstance.settingPower = false;
      if (MiniBillar.CueContainer.currentInstance.impulseFactor > 0) {
        this.hide();
        MiniBillar.CueContainer.currentInstance.shoot();
      }
    }
  }
  MiniBillar.ForceSettingContainer = ForceSettingContainer;
})(MiniBillar || (MiniBillar = {}));
