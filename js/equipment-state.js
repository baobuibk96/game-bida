var MiniBillar;
(function (MiniBillar) {
  class EquipmentState extends Phaser.State {
    init() {
      EquipmentState.currentInstance = this;
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
      this.railContainer = this.add.group();
      const tablesLabel = this.add.image(
        MiniBillar.GameVars.gameWidth * 0.5 +
          4 * MiniBillar.GameVars.scaleXMult,
        16,
        "texture_atlas_1",
        "tables_cues_text.png"
      );
      tablesLabel.scale.set(
        MiniBillar.GameVars.scaleXMult,
        MiniBillar.GameVars.scaleYMult
      );
      tablesLabel.anchor.set(0.5, 0);
      const buttonBack = this.add.button(
        38 * MiniBillar.GameVars.scaleXMult,
        38 * MiniBillar.GameVars.scaleYMult,
        "texture_atlas_1",
        this.onClickBack,
        this
      );
      buttonBack.setFrames(
        "btn_back_on.png",
        "btn_back_off.png",
        "btn_back_on.png"
      );
      buttonBack.forceOut = true;
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
      buttonBack.anchor.set(0.5);
      buttonBack.scale.set(
        MiniBillar.GameVars.scaleXMult,
        MiniBillar.GameVars.scaleYMult
      );
      if (
        MiniBillar.GameConstants.DEVELOPMENT &&
        !MiniBillar.GameVars.gameData.statistics.rewards.allUnlocked
      ) {
        const buttonUnlock = this.add.button(
          MiniBillar.GameVars.gameWidth - 10 * MiniBillar.GameVars.scaleXMult,
          10 * MiniBillar.GameVars.scaleYMult,
          "texture_atlas_0",
          this.onClickUnlock,
          this
        );
        buttonUnlock.forceOut = true;
        buttonUnlock.anchor.set(1, 0);
        buttonUnlock.setFrames(
          "btn_unlock_on.png",
          "btn_unlock_off.png",
          "btn_unlock_on.png"
        );
        buttonUnlock.scale.set(
          MiniBillar.GameVars.scaleXMult,
          MiniBillar.GameVars.scaleYMult
        );
      }
      const cardsData = this.game.cache.getJSON("card-data");
      let cardsInJSON = cardsData;
      this.cueRail = this.createRail(505, cardsInJSON, "cue");
      this.tableRail = this.createRail(236, cardsInJSON, "table");
      if (!this.cueRail || !this.tableRail) {
        throw "Error creating rails";
      }
      this.scrollToEquippedCards();
      this.game.input.onDown.add(this.startSwipe, this);
      this.game.input.onUp.add(this.endSwipe, this);
      this.clearSwipe();
      this.game.camera.flash(0x000000, 350, false);
    }
    update() {
      if (this.swiping) {
        const currentPointerPos = this.game.input.activePointer.position;
        let xDelta = this.swipeStartPosX - currentPointerPos.x;
        let swipeProgress =
          xDelta / MiniBillar.GameConstants.MIN_SWIPE_CHANGE_DISTANCE;
        swipeProgress = Phaser.Math.clamp(swipeProgress, -0.999, 0.999);
        if (this.swipingCueRail) {
          this.cueRail.scrollPreview(swipeProgress);
        } else {
          this.tableRail.scrollPreview(swipeProgress);
        }
      }
      super.update();
    }
    shutdown() {
      EquipmentState.currentInstance = null;
      super.shutdown();
    }
    scrollToEquippedCards() {
      let stepsToScrollTable = 0;
      for (let i = 0; i < this.tableRail.cardArray.length; i++) {
        const card = this.tableRail.cardArray[i];
        if (card.cardType !== "table") {
          continue;
        }
        if (card.cardId === MiniBillar.GameVars.gameData.equippedTable) {
          stepsToScrollTable = i;
          break;
        }
      }
      this.tableRail.scrollStepped(stepsToScrollTable - 2, false);
      let stepsToScrollCard = 0;
      for (let i = 0; i < this.cueRail.cardArray.length; i++) {
        const card = this.cueRail.cardArray[i];
        if (card.cardType !== "cue") {
          continue;
        }
        if (
          card.cardId === MiniBillar.GameVars.gameData.playerData.equipedCue
        ) {
          stepsToScrollCard = i;
          break;
        }
      }
      this.cueRail.scrollStepped(stepsToScrollCard - 2, false);
    }
    createRail(y, cardsInJSON, type) {
      const cueCards = cardsInJSON.filter((obj) => obj.type === type);
      let railObject;
      if (type === "cue") {
        railObject = new MiniBillar.Rail(this.game, cueCards, type);
      } else {
        railObject = new MiniBillar.Rail(this.game, cueCards, type);
      }
      railObject.y = y;
      this.railContainer.add(railObject);
      return railObject;
    }
    onClickBack() {
      MiniBillar.AudioManager.playEffect(MiniBillar.AudioManager.BTN_NORMAL);
      MiniBillar.GameManager.enterSplash();
    }
    onClickUnlock(b) {
      MiniBillar.AudioManager.playEffect(MiniBillar.AudioManager.BTN_NORMAL);
      MiniBillar.GameVars.gameData.statistics.rewards.allUnlocked = true;
      MiniBillar.RewardsManager.unlockAllCards();
      MiniBillar.GameManager.enterEquipment();
      b.visible = false;
    }
    startSwipe() {
      this.clearSwipe();
      if (this.game.input.activePointer.position.y > 110) {
        this.swipingCueRail = this.game.input.activePointer.position.y > 370;
        if (this.swipingCueRail && this.cueRail.tweening) {
          return;
        } else if (!this.swipingCueRail && this.tableRail.tweening) {
          return;
        }
        this.swipeStartPosX = this.game.input.activePointer.position.x;
        this.swiping = true;
      }
    }
    endSwipe() {
      if (!this.swiping) {
        return;
      }
      const currentPointerPos = this.game.input.activePointer.position;
      let xDelta = this.swipeStartPosX - currentPointerPos.x;
      let swipeProgress =
        xDelta / MiniBillar.GameConstants.MIN_SWIPE_CHANGE_DISTANCE;
      swipeProgress = Phaser.Math.clamp(swipeProgress, -1, 1);
      swipeProgress = Math.round(swipeProgress);
      if (this.swipingCueRail) {
        this.cueRail.scrollStepped(swipeProgress);
      } else {
        this.tableRail.scrollStepped(swipeProgress);
      }
      this.clearSwipe();
    }
    clearSwipe() {
      this.swipingCueRail = true;
      this.swiping = false;
      this.swipeStartPosX = null;
    }
  }
  MiniBillar.EquipmentState = EquipmentState;
})(MiniBillar || (MiniBillar = {}));
