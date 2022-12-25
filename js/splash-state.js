var MiniBillar;
(function (MiniBillar) {
  class SplashState extends Phaser.State {
    init() {
      SplashState.currentInstance = this;
      this.portraitButton = null;
      this.nameLabel = null;
      this.settingsLayer = null;
    }
    create() {
      const background = this.add.image(
        MiniBillar.GameVars.gameWidth / 2,
        MiniBillar.GameVars.gameHeight / 2,
        "texture_atlas_2",
        "splash.png"
      );
      background.anchor.set(0.5);
      background.scale.set(
        MiniBillar.GameVars.scaleXMult,
        MiniBillar.GameVars.gameHeight / background.height
      );
      this.scaledItemsContainer = this.add.group();
      this.scaledItemsContainer.position.set(
        MiniBillar.GameVars.gameWidth / 2,
        MiniBillar.GameVars.gameHeight / 2
      );
      this.scaledItemsContainer.scale.x = MiniBillar.GameVars.scaleXMult;
      this.scaledItemsContainer.scale.y = MiniBillar.GameVars.scaleYMult;
      this.gameLogo = new Phaser.Image(
        this.game,
        MiniBillar.GameVars.gameWidth / 2,
        135,
        "texture_atlas_1",
        "game_logo.png"
      );
      this.gameLogo.anchor.set(0.5);
      this.gameLogo.scale.set(
        MiniBillar.GameVars.scaleXMult,
        MiniBillar.GameVars.scaleYMult
      );
      this.add.existing(this.gameLogo);
      this.gameLogoShine = new Phaser.Sprite(
        this.game,
        this.gameLogo.x - 11,
        this.gameLogo.y - 18,
        "texture_atlas_1"
      );
      this.gameLogoShine.visible = false;
      const gameLogoShineFrames = MiniBillar.Utils.createAnimFramesArr(
        "game_logo_shine",
        19
      );
      this.gameLogoShine.animations.add("shine", gameLogoShineFrames, 24);
      this.gameLogoShine.frameName = gameLogoShineFrames[0];
      this.gameLogoShine.anchor.set(0.5);
      this.gameLogoShine.scale.set(
        MiniBillar.GameVars.scaleXMult,
        MiniBillar.GameVars.scaleYMult
      );
      this.gameLogoShineCounter = this.game.rnd.integerInRange(4, 8);
      this.add.existing(this.gameLogoShine);
      this.playerAvatarContainer = new MiniBillar.PlayerAvatarContainer(
        this.game
      );
      this.playerAvatarContainer.scale.set(
        MiniBillar.GameVars.scaleXMult,
        MiniBillar.GameVars.scaleYMult
      );
      this.playerAvatarContainer.x = 55;
      this.playerAvatarContainer.y = 55;
      this.add.existing(this.playerAvatarContainer);
      if (!MiniBillar.GameVars.gameData.statistics.rewards.allUnlocked) {
        const animStarBox = new MiniBillar.AnimatedStarBox(this.game, true);
        animStarBox.x = 120 * MiniBillar.GameVars.scaleXMult;
        animStarBox.y =
          MiniBillar.GameVars.gameHeight - 35 * MiniBillar.GameVars.scaleYMult;
        for (
          let i = 0;
          i < MiniBillar.RewardsManager.getCurrentStarProgress();
          i++
        ) {
          animStarBox.setStarActive(i);
        }
        this.add.existing(animStarBox);
      }
      console.log(MiniBillar.GameVars.gameData);
      // Show Balance
      this.balanceText = new Phaser.Text(
        this.game,
        MiniBillar.GameVars.gameWidth - 100 * MiniBillar.GameVars.scaleXMult,
        45,
        "",
        {
          font: "22px Oswald-DemiBold",
          fill: "#E5FFFF",
        }
      );
      this.balanceText.anchor.set(1, 0);
      this.add.existing(this.balanceText);

      this.settingsButton = this.add.button(
        MiniBillar.GameVars.gameWidth - 45 * MiniBillar.GameVars.scaleXMult,
        45,
        "texture_atlas_1",
        this.showSettingsLayer,
        this
      );
      this.settingsButton.setFrames(
        "btn_settings_on.png",
        "btn_settings_off.png",
        "btn_settings_on.png",
        "btn_settings_off.png"
      );
      this.settingsButton.anchor.set(0.5);
      if (this.game.device.touch) {
        this.settingsButton.onInputDown.add(function () {
          this.settingsButton.scale.set(
            this.settingsButton.scale.x * 1.1,
            this.settingsButton.scale.y * 1.1
          );
        }, this);
      }
      this.settingsButton.onInputOver.add(function () {
        this.settingsButton.scale.set(
          this.settingsButton.scale.x * 1.1,
          this.settingsButton.scale.y * 1.1
        );
      }, this);
      this.settingsButton.onInputOut.add(function () {
        this.settingsButton.scale.set(
          MiniBillar.GameVars.scaleXMult,
          MiniBillar.GameVars.scaleYMult
        );
      }, this);
      this.settingsButton.scale.set(
        MiniBillar.GameVars.scaleXMult,
        MiniBillar.GameVars.scaleYMult
      );

      // Connect Button
      //   this.connectButton = this.add.button(
      //     MiniBillar.GameVars.gameWidth - 45 * MiniBillar.GameVars.scaleXMult,
      //     45,
      //     "texture_atlas_1",
      //     this.showSettingsLayer,
      //     this
      //   );
      //   this.connectButton.setFrames(
      //     "btn_settings_on.png",
      //     "btn_settings_off.png",
      //     "btn_settings_on.png",
      //     "btn_settings_off.png"
      //   );
      //   this.connectButton.anchor.set(0.5);
      //   if (this.game.device.touch) {
      //     this.connectButton.onInputDown.add(function () {
      //       this.connectButton.scale.set(
      //         this.connectButton.scale.x * 1.1,
      //         this.connectButton.scale.y * 1.1
      //       );
      //     }, this);
      //   }
      //   this.connectButton.onInputOver.add(function () {
      //     this.connectButton.scale.set(
      //       this.connectButton.scale.x * 1.1,
      //       this.connectButton.scale.y * 1.1
      //     );
      //   }, this);
      //   this.connectButton.onInputOut.add(function () {
      //     this.connectButton.scale.set(
      //       MiniBillar.GameVars.scaleXMult,
      //       MiniBillar.GameVars.scaleYMult
      //     );
      //   }, this);
      //   this.connectButton.scale.set(
      //     MiniBillar.GameVars.scaleXMult,
      //     MiniBillar.GameVars.scaleYMult
      //   );

      if (!this.game.device.cordova && gameConfig.GameVersion !== "yandex") {
        // const googlePlayButton = this.add.button(
        //   MiniBillar.GameVars.gameWidth - 45 * MiniBillar.GameVars.scaleXMult,
        //   116,
        //   "texture_atlas_1",
        //   this.onStoreButtonClicked,
        //   this
        // );
        // googlePlayButton.setFrames(
        //   "btn_google_on.png",
        //   "btn_google_off.png",
        //   "btn_google_on.png",
        //   "btn_google_off.png"
        // );
        // googlePlayButton.anchor.set(0.5);
        // googlePlayButton.scale.set(
        //   MiniBillar.GameVars.scaleXMult,
        //   MiniBillar.GameVars.scaleYMult
        // );
        // googlePlayButton.name = MiniBillar.GameConstants.ANDROID;
        // const appStoreButton = this.add.button(
        //   MiniBillar.GameVars.gameWidth - 45 * MiniBillar.GameVars.scaleXMult,
        //   192,
        //   "texture_atlas_1",
        //   this.onStoreButtonClicked,
        //   this
        // );
        // appStoreButton.setFrames(
        //   "btn_apple_on.png",
        //   "btn_apple_off.png",
        //   "btn_apple_on.png",
        //   "btn_apple_off.png"
        // );
        // appStoreButton.anchor.set(0.5);
        // appStoreButton.scale.set(
        //   MiniBillar.GameVars.scaleXMult,
        //   MiniBillar.GameVars.scaleYMult
        // );
        // appStoreButton.name = MiniBillar.GameConstants.APPLE;
      }
      this.moreGames = new Phaser.Image(this.game, 52, -30, "more-games");
      this.moreGames.anchor.set(0.5);
      this.moreGames.inputEnabled = true;
      this.moreGames.events.onInputOver.add(function () {
        this.moreGames.scale.set(1.05);
      }, this);
      this.moreGames.events.onInputOut.add(function () {
        this.moreGames.scale.set(1);
      }, this);
      this.moreGames.events.onInputDown.add(function () {
        let targetUrl = "https://mnj.gs/more-pool";
        if (
          typeof gameConfig.GameVersion !== "undefined" &&
          gameConfig.GameVersion === "yandex"
        ) {
          targetUrl = "https://yandex.ru/games/";
        }
        const win = window.open(targetUrl);
        win.focus();
      }, this);
      this.scaledItemsContainer.add(this.moreGames);
      const pvpButton = new Phaser.Button(
        this.game,
        -175,
        235 * MiniBillar.GameVars.scaleYMultInverse,
        "texture_atlas_1",
        this.onClickPVP,
        this
      );
      pvpButton.setFrames(
        "btn_pvp_on.png",
        "btn_pvp_off.png",
        "btn_pvp_on.png"
      );
      if (this.game.device.touch) {
        pvpButton.onInputDown.add(function () {
          pvpButton.scale.set(pvpButton.scale.x * 1.1, pvpButton.scale.y * 1.1);
        }, this);
      }
      pvpButton.onInputOver.add(function () {
        pvpButton.scale.set(pvpButton.scale.x * 1.1, pvpButton.scale.y * 1.1);
      }, this);
      pvpButton.onInputOut.add(function () {
        pvpButton.scale.set(1);
      }, this);
      pvpButton.anchor.set(0.5);
      pvpButton.inputEnabled = false;
      this.scaledItemsContainer.add(pvpButton);
      const soloButton = new Phaser.Button(
        this.game,
        175,
        235 * MiniBillar.GameVars.scaleYMultInverse,
        "texture_atlas_1",
        this.onClickSolo
      );
      soloButton.setFrames(
        "btn_solo_on.png",
        "btn_solo_off.png",
        "btn_solo_on.png"
      );
      if (this.game.device.touch) {
        soloButton.onInputDown.add(function () {
          soloButton.scale.set(
            soloButton.scale.x * 1.1,
            soloButton.scale.y * 1.1
          );
        }, this);
      }
      soloButton.onInputOver.add(function () {
        soloButton.scale.set(
          soloButton.scale.x * 1.1,
          soloButton.scale.y * 1.1
        );
      }, this);
      soloButton.onInputOut.add(function () {
        soloButton.scale.set(1);
      }, this);
      soloButton.anchor.set(0.5);
      this.scaledItemsContainer.add(soloButton);
      const buttonEquipment = this.add.button(
        MiniBillar.GameVars.gameWidth - 61 * MiniBillar.GameVars.scaleXMult,
        MiniBillar.GameVars.gameHeight - 74 * MiniBillar.GameVars.scaleYMult,
        "texture_atlas_1",
        this.onClickEquipment,
        this
      );
      buttonEquipment.setFrames(
        "btn_equipment_on.png",
        "btn_equipment_off.png",
        "btn_equipment_on.png",
        "btn_equipment_off.png"
      );
      if (this.game.device.touch) {
        buttonEquipment.onInputDown.add(function () {
          buttonEquipment.scale.set(
            buttonEquipment.scale.x * 1.1,
            buttonEquipment.scale.y * 1.1
          );
        }, this);
      }
      buttonEquipment.onInputOver.add(function () {
        buttonEquipment.scale.set(
          buttonEquipment.scale.x * 1.1,
          buttonEquipment.scale.y * 1.1
        );
      }, this);
      buttonEquipment.onInputOut.add(function () {
        buttonEquipment.scale.set(
          MiniBillar.GameVars.scaleXMult,
          MiniBillar.GameVars.scaleYMult
        );
      }, this);
      buttonEquipment.anchor.set(0.5);
      buttonEquipment.scale.set(
        MiniBillar.GameVars.scaleXMult,
        MiniBillar.GameVars.scaleYMult
      );
      MiniBillar.AudioManager.playMusic(
        MiniBillar.AudioManager.MUSIC_MINIBILLARD,
        true
      );
      this.game.camera.flash(0x000000, 350, false);

      // Connect wallet
      (async () => {
        await connectWallet();
      })();
    }
    shutdown() {
      SplashState.currentInstance = null;
      super.shutdown();
    }
    update() {
      if (MiniBillar.GameVars.goDirectlyToLobby) {
        MiniBillar.GameVars.goDirectlyToLobby = false;
        MiniBillar.GameManager.enterPVPGame();
      }
      if (this.gameLogoShineCounter < 0) {
        this.gameLogoShine.visible = true;
        this.gameLogoShine.play("shine");
        this.game.add.tween(this.gameLogoShine.scale).to(
          {
            x: this.gameLogoShine.scale.x * 1.05,
            y: this.gameLogoShine.scale.y * 1.05,
          },
          250,
          Phaser.Easing.Cubic.Out,
          true,
          150,
          0,
          true
        );
        this.game.add.tween(this.gameLogo.scale).to(
          {
            x: this.gameLogo.scale.x * 1.05,
            y: this.gameLogo.scale.y * 1.05,
          },
          250,
          Phaser.Easing.Cubic.Out,
          true,
          150,
          0,
          true
        );
        this.gameLogoShineCounter = this.game.rnd.integerInRange(4, 8);
      } else {
        this.gameLogoShineCounter -= this.game.time.physicsElapsed;
      }
    }
    refreshPortraitAndName(doWriteGameData) {
      this.portraitButton.setFrames(
        MiniBillar.GameVars.gameData.playerData.avatar,
        MiniBillar.GameVars.gameData.playerData.avatar,
        MiniBillar.GameVars.gameData.playerData.avatar,
        MiniBillar.GameVars.gameData.playerData.avatar
      );
      this.nameLabel.text = MiniBillar.GameVars.gameData.playerData.nick;
      if (doWriteGameData) {
        MiniBillar.GameManager.writeGameData();
      }
    }
    hideSettingsLayer() {
      this.settingsLayer.destroy();
    }
    showSettingsLayer() {
      MiniBillar.AudioManager.playEffect(MiniBillar.AudioManager.BTN_NORMAL);
      this.settingsButton.scale.set(
        MiniBillar.GameVars.scaleXMult,
        MiniBillar.GameVars.scaleYMult
      );
      this.settingsLayer = new MiniBillar.SettingsLayer(this.game);
      this.add.existing(this.settingsLayer);
    }
    onClickSolo() {
      MiniBillar.AudioManager.playEffect(MiniBillar.AudioManager.BTN_NORMAL);
      MiniBillar.GameManager.enterSoloGame(true);
    }
    onClickPVP() {
      // MiniBillar.AudioManager.playEffect(MiniBillar.AudioManager.BTN_NORMAL);
      // MiniBillar.GameManager.enterPVPGame();
    }
    onClickEquipment(b) {
      MiniBillar.AudioManager.playEffect(MiniBillar.AudioManager.BTN_NORMAL);
      MiniBillar.GameManager.enterEquipment();
    }
    onStoreButtonClicked(b) {
      let win;
      if (b.name === MiniBillar.GameConstants.APPLE) {
        win = window.open("https://mnj.gs/minipool-ios");
      } else {
        win = window.open("https://mnj.gs/minipool-android");
      }
      win.focus();
      MiniBillar.AudioManager.playEffect(MiniBillar.AudioManager.BTN_NORMAL);
    }
  }
  MiniBillar.SplashState = SplashState;
})(MiniBillar || (MiniBillar = {}));
