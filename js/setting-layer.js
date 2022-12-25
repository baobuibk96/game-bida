var MiniBillar;
(function (MiniBillar) {
  class SettingsLayer extends Phaser.Group {
    constructor(game) {
      super(game, null, "settings-layer");
      SettingsLayer.currentInstance = this;
      const transparentBackground = new Phaser.Sprite(
        this.game,
        0,
        0,
        this.game.cache.getBitmapData(MiniBillar.GameConstants.BLUE_SQUARE)
      );
      transparentBackground.scale.set(
        MiniBillar.GameVars.gameWidth / 64,
        MiniBillar.GameVars.gameHeight / 64
      );
      transparentBackground.alpha = 0.96;
      transparentBackground.inputEnabled = true;
      transparentBackground.events.onInputDown.add(
        this.onDownTransparentLayer,
        this
      );
      this.add(transparentBackground);
      const buttonBack = new Phaser.Button(
        this.game,
        38 * MiniBillar.GameVars.scaleXMult,
        38 * MiniBillar.GameVars.scaleYMult,
        "texture_atlas_1",
        this.onClickExit,
        this
      );
      buttonBack.setFrames(
        "btn_back_on.png",
        "btn_back_off.png",
        "btn_back_on.png"
      );
      buttonBack.anchor.set(0.5);
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
      buttonBack.scale.set(
        MiniBillar.GameVars.scaleXMult,
        MiniBillar.GameVars.scaleYMult
      );
      this.add(buttonBack);
      const titleLabel = new Phaser.Text(
        this.game,
        MiniBillar.GameVars.gameWidth / 2,
        40,
        "CONNECT WALLET",
        {
          font: "56px Oswald-DemiBold",
          fontWeight: "600",
          fill: "#e7f6f8",
        }
      );
      titleLabel.anchor.x = 0.5;
      titleLabel.stroke = "#2f3237";
      titleLabel.strokeThickness = 5;
      titleLabel.scale.set(
        MiniBillar.GameVars.scaleXMult,
        MiniBillar.GameVars.scaleYMult
      );
      this.add(titleLabel);
      const scaledItemsContainer = new Phaser.Group(this.game);
      scaledItemsContainer.x = MiniBillar.GameVars.gameWidth / 2;
      scaledItemsContainer.y = MiniBillar.GameVars.gameHeight / 2;
      scaledItemsContainer.scale.set(
        MiniBillar.GameVars.scaleXMult,
        MiniBillar.GameVars.scaleYMult
      );
      scaledItemsContainer.bac;
      this.add(scaledItemsContainer);
      //   const audioSwitchButton = new MiniBillar.SwitchButton(
      //     this.game,
      //     !MiniBillar.GameVars.gameData.musicMuted,
      //     MiniBillar.SwitchButton.MUSIC
      //   );
      //   audioSwitchButton.x = 30;
      //   audioSwitchButton.y = -100;
      //   scaledItemsContainer.add(audioSwitchButton);

      const buttonConnect = new Phaser.Button(
        this.game,
        // 38 * MiniBillar.GameVars.scaleXMult,
        // 38 * MiniBillar.GameVars.scaleYMult,
        0,
        0,
        "button",
        this.onClickConnect,
        this,
        2,
        1,
        0
      );
      //   buttonConnect.setFrames(
      //     "btn_back_on.png",
      //     "btn_back_off.png",
      //     "btn_back_on.png"
      //   );
      buttonConnect.x = -30;
      buttonConnect.y = -100;
      scaledItemsContainer.add(buttonConnect);
      //   const audioLabel = new Phaser.Text(
      //     this.game,
      //     -24,
      //     audioSwitchButton.y + 2,
      //     "AUDIO",
      //     {
      //       font: "24px Oswald-DemiBold",
      //       fontWeight: "600",
      //       fill: "#e7f6f8",
      //       align: "center",
      //       stroke: "#2f3237",
      //       strokeThickness: 3,
      //     }
      //   );
      //   audioLabel.anchor.set(1, 0.5);
      //   scaledItemsContainer.add(audioLabel);
      if (this.game.device.touch) {
        const switchStartingState =
          MiniBillar.GameVars.gameData.powerBarSide ===
          MiniBillar.GameConstants.RIGHT;
        const powerSwitchButton = new MiniBillar.SwitchButton(
          this.game,
          switchStartingState,
          MiniBillar.SwitchButton.POWER
        );
        powerSwitchButton.x = 30;
        powerSwitchButton.y = -160;
        scaledItemsContainer.add(powerSwitchButton);
        const powerTextLeft = "POWER BAR: LEFT";
        const powerTextRight = "POWER BAR: RIGHT";
        this.powerLabel = new Phaser.Text(
          this.game,
          -24,
          powerSwitchButton.y + 2,
          powerTextLeft,
          {
            font: "24px Oswald-DemiBold",
            fontWeight: "600",
            fill: "#e7f6f8",
            align: "center",
            stroke: "#2f3237",
            strokeThickness: 3,
          }
        );
        this.powerLabel.anchor.set(1, 0.5);
        scaledItemsContainer.add(this.powerLabel);
        if (
          MiniBillar.GameVars.gameData.powerBarSide ===
          MiniBillar.GameConstants.RIGHT
        ) {
          this.powerLabel.text = powerTextRight;
        }
        if (
          MiniBillar.GameVars.gameMode !== MiniBillar.GameConstants.SOLO_MODE
        ) {
          scaledItemsContainer.y += 100;
        }
      }
      if (MiniBillar.GameConstants.DEVELOPMENT) {
        const buttonBot = new Phaser.Button(
          this.game,
          10 * MiniBillar.GameVars.scaleXMult,
          MiniBillar.GameVars.gameHeight - 10 * MiniBillar.GameVars.scaleYMult,
          "texture_atlas_0",
          this.onClickBot,
          this
        );
        buttonBot.anchor.set(0, 1);
        buttonBot.setFrames(
          "btn_bot_pressed.png",
          "btn_bot.png",
          "btn_bot_pressed.png",
          "btn_bot.png"
        );
        buttonBot.scale.set(
          MiniBillar.GameVars.scaleXMult,
          MiniBillar.GameVars.scaleYMult
        );
        this.add(buttonBot);
      }
      //   const copyrightLabel = new Phaser.Text(
      //     this.game,
      //     MiniBillar.GameVars.gameWidth * 0.5,
      //     MiniBillar.GameVars.gameHeight - 46,
      //     "developed by RavalMatic",
      //     {
      //       font: "28px Oswald-DemiBold",
      //       fill: "#E5FFFF",
      //     }
      //   );
      //   copyrightLabel.anchor.x = 0.5;
      //   copyrightLabel.alpha = 0.75;
      //   copyrightLabel.scale.set(
      //     MiniBillar.GameVars.scaleXMult,
      //     MiniBillar.GameVars.scaleYMult
      //   );
      //   this.add(copyrightLabel);
      const versionLabel = new Phaser.Text(
        this.game,
        30,
        MiniBillar.GameVars.gameHeight - 26,
        "v" + MiniBillar.GameConstants.VERSION,
        {
          font: "16px Arial",
          fill: "#E5FFFF",
        }
      );
      versionLabel.anchor.x = 0.5;
      versionLabel.alpha = 0.75;
      versionLabel.scale.set(
        MiniBillar.GameVars.scaleXMult,
        MiniBillar.GameVars.scaleYMult
      );
      this.add(versionLabel);
      this.alpha = 0;
      this.game.add.tween(this).to(
        {
          alpha: 1,
        },
        400,
        Phaser.Easing.Cubic.Out,
        true
      );
    }
    changePower() {
      const powerTextLeft = "POWER BAR: LEFT";
      const powerTextRight = "POWER BAR: RIGHT";
      if (
        MiniBillar.GameVars.gameData.powerBarSide ===
        MiniBillar.GameConstants.LEFT
      ) {
        this.powerLabel.text = powerTextLeft;
      } else {
        this.powerLabel.text = powerTextRight;
      }
    }
    destroy() {
      MiniBillar.PauseLayer.currentInstance = null;
      super.destroy();
    }
    onClickExit(b) {
      b.clearFrames();
      MiniBillar.AudioManager.playEffect(MiniBillar.AudioManager.BTN_NORMAL);
      MiniBillar.SplashState.currentInstance.hideSettingsLayer();
    }
    async onClickConnect(b) {
      b.clearFrames();

      if (window.ethereum) {
        await window.ethereum.request({ method: "eth_requestAccounts" });
        window.web3 = new Web3(window.ethereum);
        const account = web3.eth.accounts;
        //Get the current MetaMask selected/active wallet
        const walletAddress = account.givenProvider.selectedAddress;
        console.log(`Wallet: ${walletAddress}`);
        const value = walletAddress;

        MiniBillar.GameVars.gameData.playerData.nick = value;
        MiniBillar.GameManager.writeGameData();
        MiniBillar.SplashState.currentInstance.playerAvatarContainer.updateName(
          value
        );
        MiniBillar.SplashState.currentInstance.balanceText.setText("2000");
      } else {
        console.log("No wallet");
      }

      MiniBillar.AudioManager.playEffect(MiniBillar.AudioManager.BTN_NORMAL);
      MiniBillar.SplashState.currentInstance.hideSettingsLayer();
    }
    onClickBot(b) {
      MiniBillar.AudioManager.playEffect(MiniBillar.AudioManager.BTN_NORMAL);
      b.clearFrames();
      MiniBillar.GameManager.setupBotMatchData();
      MiniBillar.GameManager.enterPVBotGame();
    }
    onDownTransparentLayer() {}
  }
  MiniBillar.SettingsLayer = SettingsLayer;
})(MiniBillar || (MiniBillar = {}));
