var MiniBillar;
(function (MiniBillar) {
  class PoolState extends Phaser.State {
    init() {
      PoolState.currentInstance = this;
      this.playerSetPVP = false;
      this.victoryLayer = null;
      this.loseLayer = null;
      this.adversaryLeftLayer = null;
      this.notificationLayer = null;
      this.chatLayer = null;
      if (MiniBillar.GameVars.gameMode === MiniBillar.GameConstants.SOLO_MODE) {
        MiniBillar.MatchManagerSolo.init(this.game);
      }
    }
    create() {
      this.createStage();
      if (MiniBillar.GameVars.playerPoints === 0) {
        this.game.camera.flash(0x203161, 750);
      }
      MiniBillar.AudioManager.stopEffect(
        MiniBillar.AudioManager.TIME_RUNNING_OUT
      );
      MiniBillar.AudioManager.stopMusic(
        MiniBillar.AudioManager.MUSIC_MINIBILLARD,
        false
      );
      this.game.time.events.add(
        250,
        function () {
          MiniBillar.AudioManager.playMusic(
            MiniBillar.AudioManager.MUSIC_MATCH_MINIBILLARD,
            true
          );
        },
        this
      );
    }
    shutdown() {
      PoolState.currentInstance = null;
      super.shutdown();
    }
    update() {
      MiniBillar.MatchManager.update();
      if (MiniBillar.GameVars.gameMode === MiniBillar.GameConstants.PVP_MODE) {
        if (!this.playerSetPVP) {
          MiniBillar.MatchManagerPVP.playerSet();
          this.playerSetPVP = true;
        }
      }
      super.update();
    }
    createStage() {
      const background = this.add.image(
        MiniBillar.GameVars.gameWidth / 2,
        MiniBillar.GameVars.gameHeight / 2,
        "texture_atlas_2",
        "background.png"
      );
      background.anchor.set(0.5);
      background.scale.set(
        MiniBillar.GameVars.gameWidth / background.width,
        MiniBillar.GameVars.gameHeight / background.height
      );
      this.stageContainer = new MiniBillar.StageContainer(this.game);
      this.add.existing(this.stageContainer);
      this.hud = new MiniBillar.HUD(this.game);
      this.add.existing(this.hud);
      this.gui = new MiniBillar.GUI(this.game);
      this.add.existing(this.gui);
      if (MiniBillar.GameVars.gameMode === MiniBillar.GameConstants.SOLO_MODE) {
        this.arrow = new Phaser.Image(
          this.game,
          MiniBillar.GameVars.gameWidth / 2 + 140,
          160,
          "texture_atlas_1",
          "timer_up_arrow.png"
        );
        this.arrow.scale.x = MiniBillar.GameVars.scaleXMult;
        this.arrow.alpha = 0;
        this.arrow.scale.y = 0.2;
        this.arrow.anchor.set(0.5, 1);
        this.add.existing(this.arrow);
        this.arrowOnTween = false;
      }
      this.groupMessagesLayer = new Phaser.Group(this.game);
      this.add.existing(this.groupMessagesLayer);
      this.groupPauseLayers = new Phaser.Group(this.game);
      this.add.existing(this.groupPauseLayers);
      this.spinCircleLayer = new MiniBillar.SpinCircleLayer(this.game);
      this.groupPauseLayers.add(this.spinCircleLayer);
      if (MiniBillar.GameVars.startMatch) {
        throw "Match already started";
      }
      if (MiniBillar.GameVars.gameMode === MiniBillar.GameConstants.SOLO_MODE) {
        MiniBillar.GameVars.timeMatch = Date.now();
      }
      this.startGame();
    }
    startGame() {
      if (MiniBillar.GameVars.canStart) {
        return;
      }
      MiniBillar.GameVars.startMatch = true;
      MiniBillar.GameVars.canStart = true;
      if (MiniBillar.GameVars.gameMode === MiniBillar.GameConstants.SOLO_MODE) {
        MiniBillar.MatchManagerSolo.startGame();
      } else if (
        MiniBillar.GameVars.gameMode === MiniBillar.GameConstants.PVP_MODE
      ) {
        MiniBillar.MatchManagerPVP.startGame();
      } else if (
        MiniBillar.GameVars.gameMode === MiniBillar.GameConstants.PVBOT_MODE
      ) {
        MiniBillar.MatchManagerPVBot.startGame();
      } else if (
        MiniBillar.GameVars.gameMode === MiniBillar.GameConstants.NO_GAME
      ) {
        throw "No game mode selected";
      }
      if (MiniBillar.GameVars.gameMode === MiniBillar.GameConstants.SOLO_MODE) {
        if (
          MiniBillar.GameVars.gameEnded ===
          MiniBillar.GameConstants.GAME_UNDECIDED
        ) {
          MiniBillar.MatchManagerSolo.startSoloTime();
        } else {
          this.endGame();
          return;
        }
      }
      this.startStage();
    }
    ballPocketed(ballId) {
      this.hud.ballPocketed(ballId);
    }
    updateBallsHUD() {
      this.hud.updateBallsHUD();
    }
    startStage() {
      this.stageContainer.start();
      this.hud.start();
      this.gui.start();
    }
    showSpinCircleLayer() {
      this.stageContainer.pauseGame();
      this.spinCircleLayer.show();
    }
    onNonSoloTimeOut(playerTurn) {
      this.hideSpinCircleLayer();
      if (this.game.device.touch && !playerTurn) {
        this.gui.forceSettingContainer.disable();
        this.gui.forceSettingContainer.hide();
      }
    }
    hideSpinCircleLayer() {
      this.stageContainer.resumeGame();
      this.gui.setRedPointPosition();
      this.spinCircleLayer.hide();
    }
    resetSpinCircleLayer() {
      this.spinCircleLayer.reset();
    }
    pauseGame() {
      MiniBillar.AudioManager.stopEffect(
        MiniBillar.AudioManager.TIME_RUNNING_OUT
      );
      if (MiniBillar.GameVars.gameMode === MiniBillar.GameConstants.SOLO_MODE) {
        this.hideNotificationLayer();
      }
      this.pauseLayer = new MiniBillar.PauseLayer(this.game);
      this.groupPauseLayers.add(this.pauseLayer);
      this.stageContainer.pauseGame();
    }
    resumeGame() {
      if (this.pauseLayer) {
        this.pauseLayer.destroy();
      }
      this.stageContainer.resumeGame();
    }
    showVictoryLayer(victoryData) {
      MiniBillar.AudioManager.stopEffect(
        MiniBillar.AudioManager.TIME_RUNNING_OUT
      );
      if (this.pauseLayer) {
        this.pauseLayer.destroy();
      }
      if (this.notificationLayer) {
        this.notificationLayer.destroy();
        this.notificationLayer = null;
      }
      if (this.spinCircleLayer) {
        this.spinCircleLayer.hide();
      }
      this.stageContainer.pauseGame();
      this.gui.visible = false;
      this.hud.stopClock();
      this.stageContainer.hideGuide("Showing victory layer");
      this.stageContainer.hideCue("Showing victory layer");
      this.stageContainer.hideSelectPocket("Showing victory layer");
      PoolState.currentInstance.victoryLayer = new MiniBillar.VictoryLayer(
        this.game
      );
      PoolState.currentInstance.victoryLayer.init(victoryData);
      this.groupPauseLayers.add(PoolState.currentInstance.victoryLayer);
      if (this.chatLayer) {
        this.hideChatLayer();
      }
    }
    hideVictoryLayer() {
      PoolState.currentInstance.victoryLayer.destroy();
      PoolState.currentInstance.endGame();
    }
    showLoseLayer(victoryData) {
      MiniBillar.AudioManager.stopEffect(
        MiniBillar.AudioManager.TIME_RUNNING_OUT
      );
      if (this.pauseLayer) {
        this.pauseLayer.destroy();
      }
      if (this.notificationLayer) {
        this.notificationLayer.destroy();
        this.notificationLayer = null;
      }
      if (this.spinCircleLayer) {
        this.spinCircleLayer.hide();
      }
      this.stageContainer.pauseGame();
      this.gui.visible = false;
      this.hud.stopClock();
      this.stageContainer.hideGuide("Showing lose layer");
      this.stageContainer.hideCue("Showing lose layer");
      this.stageContainer.hideSelectPocket("Showing lose layer");
      PoolState.currentInstance.loseLayer = new MiniBillar.LosePVPLayer(
        this.game
      );
      this.groupPauseLayers.add(PoolState.currentInstance.loseLayer);
      if (this.chatLayer) {
        this.hideChatLayer();
      }
    }
    hideLoseLayer() {
      PoolState.currentInstance.loseLayer.destroy();
      this.endGame();
    }
    showAdversaryLeftLayer() {
      MiniBillar.AudioManager.stopEffect(
        MiniBillar.AudioManager.TIME_RUNNING_OUT
      );
      if (this.pauseLayer) {
        this.pauseLayer.destroy();
      }
      if (this.notificationLayer) {
        this.notificationLayer.destroy();
        this.notificationLayer = null;
      }
      if (this.spinCircleLayer) {
        this.spinCircleLayer.hide();
      }
      this.stageContainer.pauseGame();
      this.gui.visible = false;
      this.hud.stopClock();
      this.stageContainer.hideGuide("Showing adversary left layer");
      this.stageContainer.hideCue("Showing adversary left layer");
      this.stageContainer.hideSelectPocket("Showing adversary left layer");
      let cueBall = MiniBillar.GameVars.ballArray[0];
      cueBall.hideHandIcon();
      PoolState.currentInstance.adversaryLeftLayer =
        new MiniBillar.AdversaryLeftLayer(this.game);
      this.groupPauseLayers.add(PoolState.currentInstance.adversaryLeftLayer);
      if (this.chatLayer) {
        this.hideChatLayer();
      }
    }
    hideAdversaryLeftLayer() {
      PoolState.currentInstance.adversaryLeftLayer.destroy();
      this.endGame();
    }
    showSoloRetryLayer() {
      MiniBillar.AudioManager.stopEffect(
        MiniBillar.AudioManager.TIME_RUNNING_OUT
      );
      if (this.pauseLayer) {
        this.pauseLayer.destroy();
      }
      if (this.spinCircleLayer) {
        this.spinCircleLayer.hide();
      }
      this.stageContainer.pauseGame();
      this.gui.visible = false;
      this.stageContainer.hideGuide("Showing retry layer");
      this.stageContainer.hideCue("Showing retry layer");
      this.soloRetryLayer = new MiniBillar.RetrySoloLayer(this.game);
      this.groupPauseLayers.add(this.soloRetryLayer);
    }
    hideRetryLayer() {
      this.stageContainer.resumeGame();
      this.soloRetryLayer.destroy();
    }
    showNotificationLayer(type, isPlayerTurn, opponentChoosingPocket) {
      if (this.notificationLayer) {
        this.notificationLayer.destroy();
        this.notificationLayer = null;
      }
      this.notificationLayer = new MiniBillar.NotificationLayer(
        this.game,
        type,
        isPlayerTurn,
        opponentChoosingPocket
      );
      this.groupMessagesLayer.add(this.notificationLayer);
    }
    hideNotificationLayer() {
      if (this.notificationLayer) {
        this.notificationLayer.destroy();
        this.notificationLayer = null;
      }
    }
    hideNonSOLOTimers() {
      this.hud.hideNonSOLOTimers();
    }
    endGame() {
      MiniBillar.GameManager.enterSplash();
      if (MiniBillar.GameVars.gameMode === MiniBillar.GameConstants.SOLO_MODE) {
        MiniBillar.AudioManager.stopEffect(
          MiniBillar.AudioManager.TIME_RUNNING_OUT
        );
      }
    }
    newTurn() {
      this.gui.newTurn();
      this.stageContainer.newTurn();
    }
    changePowerBar() {
      this.pauseLayer.changePower();
      if (this.gui.forceSettingContainer !== null) {
        this.gui.forceSettingContainer.changeSide();
      }
      this.stageContainer.pocketedBallsTrail.changeSide();
    }
    animArrow() {
      if (!this.arrowOnTween) {
        this.arrowOnTween = true;
        this.game.add.tween(this.arrow.scale).to(
          {
            y: 1,
          },
          400,
          Phaser.Easing.Cubic.In,
          true
        );
        let tweenA = this.game.add.tween(this.arrow).to(
          {
            alpha: 1,
          },
          400,
          Phaser.Easing.Cubic.In,
          true
        );
        let tweenB = this.game.add.tween(this.arrow).to(
          {
            y: 110,
            alpha: 0,
          },
          400,
          Phaser.Easing.Cubic.Out
        );
        tweenA.chain(tweenB);
        this.game.time.events.add(
          900,
          function () {
            this.arrowOnTween = false;
            this.arrow.scale.y = 0.2;
            this.arrow.y = 160;
          },
          this
        );
      }
    }
    changePowerBarSide() {
      if (this.gui.forceSettingContainer) {
        this.gui.forceSettingContainer.changeSide();
      }
    }
    showAdversaryEmoticon(emoticonID) {
      this.hud.showEmoticon(emoticonID, false);
    }
    emoticonSelected(emoticonID) {
      if (this.chatLayer) {
        this.chatLayer.destroy();
        this.chatLayer = null;
      }
      this.hud.showEmoticon(emoticonID, true);
    }
    onPlayerEmoticonShown() {
      this.game.time.events.add(
        1500,
        function () {
          this.gui.showChatButton();
        },
        this
      );
    }
    showChatLayer() {
      this.gui.hideChatButton();
      this.chatLayer = new MiniBillar.ChatLayer(this.game);
      this.add.existing(this.chatLayer);
    }
    hideChatLayer() {
      this.gui.showChatButton();
      this.chatLayer.destroy();
      this.chatLayer = null;
    }
  }
  MiniBillar.PoolState = PoolState;
})(MiniBillar || (MiniBillar = {}));
