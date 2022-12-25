var MiniBillar;
(function (MiniBillar) {
  class PlayerRegisteringState extends Phaser.State {
    init() {
      PlayerRegisteringState.currentInstance = this;
      this.tweening = false;
    }
    create() {
      const background = this.add.image(
        MiniBillar.GameVars.gameWidth / 2,
        MiniBillar.GameVars.gameHeight / 2,
        "texture_atlas_2",
        "lobby.png"
      );
      background.anchor.set(0.5);
      background.scale.set(
        MiniBillar.GameVars.scaleXMult,
        MiniBillar.GameVars.gameHeight / background.height
      );
      this.avatarsContainer = this.add.group();
      this.avatarsContainer.x =
        MiniBillar.GameVars.gameWidth / 2 -
        160 * MiniBillar.GameVars.scaleXMult;
      this.avatarsContainer.y = 190;
      let startScrolledDown = false;
      let selectedAvatar;
      for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
          let avatarName;
          let index = i + 1 + 4 * j;
          if (index % 2 === 0) {
            avatarName = "billar_w0" + Math.round(index / 2);
          } else {
            avatarName = "billar_m0" + Math.round(index / 2);
          }
          let avatar = new MiniBillar.Avatar(this.game, avatarName);
          avatar.x = 170 * i * MiniBillar.GameVars.scaleXMult;
          avatar.y = 170 * j;
          if (MiniBillar.GameVars.gameData.playerData.avatar === avatarName) {
            if (j > 2) {
              startScrolledDown = true;
            }
            selectedAvatar = avatar;
          }
          this.avatarsContainer.add(avatar);
        }
      }
      const titleMask = this.add.image(
        MiniBillar.GameVars.gameWidth / 2,
        0,
        "texture_atlas_1",
        "title_mask.png"
      );
      titleMask.anchor.set(0.5, 0);
      titleMask.scale.set(
        MiniBillar.GameVars.scaleXMult,
        MiniBillar.GameVars.gameHeight / background.height
      );
      const avatarSettingTitle = this.add.image(
        MiniBillar.GameVars.gameWidth / 2,
        0,
        "texture_atlas_1",
        "avatar_settings_title.png"
      );
      avatarSettingTitle.anchor.set(0.5, 0);
      avatarSettingTitle.scale.set(
        MiniBillar.GameVars.scaleXMult,
        MiniBillar.GameVars.scaleYMult
      );
      const buttonBack = new Phaser.Button(
        this.game,
        38 * MiniBillar.GameVars.scaleXMult,
        38 * MiniBillar.GameVars.scaleYMult,
        "texture_atlas_1",
        this.onClickBack,
        this
      );
      buttonBack.scale.set(
        MiniBillar.GameVars.scaleXMult,
        MiniBillar.GameVars.scaleYMult
      );
      buttonBack.anchor.set(0.5);
      if (this.game.device.touch) {
        buttonBack.onInputDown.add(function () {
          buttonBack.scale.set(
            buttonBack.scale.x * 1.1,
            buttonBack.scale.y * 1.1
          );
        }, this);
      }
      buttonBack.onInputOver.add(function () {
        buttonBack.scale.set(
          buttonBack.scale.x * 1.1,
          buttonBack.scale.y * 1.1
        );
      }, this);
      buttonBack.onInputOut.add(function () {
        buttonBack.scale.set(
          MiniBillar.GameVars.scaleXMult,
          MiniBillar.GameVars.scaleYMult
        );
      }, this);
      buttonBack.setFrames(
        "btn_back_on.png",
        "btn_back_off.png",
        "btn_back_on.png"
      );
      buttonBack.forceOut = true;
      this.add.existing(buttonBack);
      if (startScrolledDown) {
        this.avatarsContainer.y = PlayerRegisteringState.AVATARS_CONTAINER_PY_2;
      }
      this.avatarFullBodyContainer = new MiniBillar.AvatarFullBodyContainer(
        this.game
      );
      this.add.existing(this.avatarFullBodyContainer);
      selectedAvatar.select();
      this.originalPreviewYPos = this.avatarsContainer.y;
      this.game.input.onDown.add(this.startSwipe, this);
      this.game.input.onUp.add(this.endSwipe, this);
      this.originalPreviewYPos = null;
      this.lastPreviewYProgress = 0;
      this.clearSwipe();
      this.game.camera.flash(0x000000, 350, false);
    }
    update() {
      if (this.swiping) {
        const currentPointerPos = this.game.input.activePointer.position;
        let yDelta = this.swipeStartPosY - currentPointerPos.y;
        let swipeProgress =
          yDelta / MiniBillar.GameConstants.MIN_SWIPE_CHANGE_DISTANCE;
        swipeProgress = Phaser.Math.clamp(swipeProgress, -0.999, 0.999);
        this.scrollPreview(swipeProgress);
      }
      super.update();
    }
    shutdown() {
      PlayerRegisteringState.currentInstance = null;
      super.shutdown();
    }
    avatarSelected() {
      this.avatarFullBodyContainer.avatarSelected();
    }
    updateDisplayedName() {
      this.avatarFullBodyContainer.updateDisplayedName();
    }
    showNameInputLayer() {
      this.nameInputLayer = new MiniBillar.NameInputLayer(
        this.game,
        MiniBillar.GameVars.gameData.playerData.nick
      );
      this.add.existing(this.nameInputLayer);
    }
    hideNameInputLayer() {
      if (this.nameInputLayer) {
        this.nameInputLayer.destroy();
        this.nameInputLayer = null;
      }
    }
    onClickBack() {
      MiniBillar.AudioManager.playEffect(MiniBillar.AudioManager.BTN_NORMAL);
      MiniBillar.GameManager.fullscreenFilter(
        MiniBillar.GameManager.enterSplash
      );
    }
    startSwipe() {
      this.clearSwipe();
      if (this.game.input.activePointer.position.x > 120) {
        if (this.tweening) {
          return;
        }
        this.swipeStartPosY = this.game.input.activePointer.position.y;
        this.swiping = true;
      }
    }
    endSwipe() {
      if (!this.swiping) {
        return;
      }
      const currentPointerPos = this.game.input.activePointer.position;
      let yDelta = this.swipeStartPosY - currentPointerPos.y;
      let swipeProgress =
        yDelta / MiniBillar.GameConstants.MIN_SWIPE_CHANGE_DISTANCE;
      swipeProgress = Phaser.Math.clamp(swipeProgress, -1, 1);
      swipeProgress = Math.round(swipeProgress);
      this.scrollStepped(swipeProgress);
      this.clearSwipe();
    }
    clearSwipe() {
      this.swiping = false;
      this.swipeStartPosY = null;
      this.originalPreviewYPos = null;
    }
    scrollStepped(steps) {
      if (this.tweening) {
        return;
      }
      this.tweening = true;
      const diff = steps;
      steps = -Math.round(this.lastPreviewYProgress);
      if (steps > 0) {
        this.game.add
          .tween(this.avatarsContainer)
          .to(
            {
              y: 190,
            },
            Math.abs(diff) < 0.1 ? 50 : 650,
            Phaser.Easing.Cubic.Out,
            true
          )
          .onComplete.add(function () {
            this.tweening = false;
          }, this);
      } else if (steps < 0) {
        this.game.add
          .tween(this.avatarsContainer)
          .to(
            {
              y: 0,
            },
            Math.abs(diff) < 0.1 ? 50 : 650,
            Phaser.Easing.Cubic.Out,
            true
          )
          .onComplete.add(function () {
            this.tweening = false;
          }, this);
      } else {
        this.game.add
          .tween(this.avatarsContainer)
          .to(
            {
              y: this.originalPreviewYPos,
            },
            Math.abs(diff) < 0.1 ? 50 : 650,
            Phaser.Easing.Cubic.Out,
            true
          )
          .onComplete.add(function () {
            this.tweening = false;
          }, this);
      }
      this.lastPreviewYProgress = 0;
      return;
    }
    scrollPreview(distance) {
      if (this.tweening) {
        return;
      }
      if (!this.originalPreviewYPos) {
        this.originalPreviewYPos = this.avatarsContainer.y;
      }
      let py =
        this.originalPreviewYPos -
        PlayerRegisteringState.STEP_DISTANCE * distance;
      this.lastPreviewYProgress = distance;
      this.avatarsContainer.y = py;
    }
  }
  PlayerRegisteringState.STEP_DISTANCE = 190;
  PlayerRegisteringState.AVATARS_CONTAINER_PY_2 = 0;
  MiniBillar.PlayerRegisteringState = PlayerRegisteringState;
})(MiniBillar || (MiniBillar = {}));
