var MiniBillar;
(function (MiniBillar) {
  class LobbyState extends Phaser.State {
    init() {
      LobbyState.currentInstance = this;
      this.f = 0;
      this.leavingScene = false;
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
      this.lookingForPlayerContainer = this.game.add.group();
      this.buttonBack = new Phaser.Button(
        this.game,
        38 * MiniBillar.GameVars.scaleXMult,
        38 * MiniBillar.GameVars.scaleYMult,
        "texture_atlas_1",
        this.onClickExitLobby,
        this
      );
      this.buttonBack.anchor.set(0.5);
      if (this.game.device.touch) {
        this.buttonBack.onInputDown.add(function () {
          this.buttonBack.scale.set(
            this.buttonBack.scale.x * 1.1,
            this.buttonBack.scale.y * 1.1
          );
        }, this);
      }
      this.buttonBack.onInputOver.add(function () {
        this.buttonBack.scale.set(
          this.buttonBack.scale.x * 1.1,
          this.buttonBack.scale.y * 1.1
        );
      }, this);
      this.buttonBack.onInputOut.add(function () {
        this.buttonBack.scale.set(
          MiniBillar.GameVars.scaleXMult,
          MiniBillar.GameVars.scaleYMult
        );
      }, this);
      this.buttonBack.setFrames(
        "btn_back_on.png",
        "btn_back_off.png",
        "btn_back_on.png"
      );
      this.buttonBack.scale.set(
        MiniBillar.GameVars.scaleXMult,
        MiniBillar.GameVars.scaleYMult
      );
      this.lookingForPlayerContainer.add(this.buttonBack);
      this.titleLabel = new Phaser.Text(
        this.game,
        MiniBillar.GameVars.gameWidth / 2,
        420,
        "WAITING FOR A RIVAL",
        {
          font: "30px Oswald-DemiBold",
          fontWeight: "600",
          fill: "#e7f6f8",
          align: "center",
        }
      );
      this.titleLabel.anchor.x = 0.5;
      this.titleLabel.stroke = "#2f3237";
      this.titleLabel.strokeThickness = 5;
      this.titleLabel.scale.set(
        MiniBillar.GameVars.scaleXMult,
        MiniBillar.GameVars.scaleYMult
      );
      this.lookingForPlayerContainer.add(this.titleLabel);
      this.waitingAnimContainer = this.game.add.group();
      this.waitingAnimContainer.position.set(
        MiniBillar.GameVars.gameWidth / 2,
        360
      );
      this.waitingAnimContainer.scale.set(
        MiniBillar.GameVars.scaleXMult,
        MiniBillar.GameVars.scaleYMult
      );
      this.lookingForPlayerContainer.add(this.waitingAnimContainer);
      this.waitingAnim = new Phaser.Image(
        this.game,
        0,
        0,
        "texture_atlas_1",
        "loading_circle.png"
      );
      this.waitingAnim.anchor.set(0.5);
      this.waitingAnimContainer.add(this.waitingAnim);
      this.playerAvatar = new MiniBillar.AvatarBubble(
        this.game,
        MiniBillar.GameVars.gameData.playerData.avatar,
        MiniBillar.GameVars.gameWidth / 2 - 150,
        250,
        false
      );
      this.playerAvatar.visible = false;
      this.playerAvatar.scale.x *= 2 * MiniBillar.GameVars.scaleXMult;
      this.playerAvatar.scale.y *= 2 * MiniBillar.GameVars.scaleYMult;
      this.add.existing(this.playerAvatar);
      this.lookingForPlayerContainer.add(this.playerAvatar);
      this.adversaryAvatar = new MiniBillar.AvatarBubble(
        this.game,
        MiniBillar.GameVars.gameData.playerData.avatar,
        MiniBillar.GameVars.gameWidth / 2 + 150,
        250,
        false
      );
      this.adversaryAvatar.visible = false;
      this.adversaryAvatar.scale.x *= 2 * MiniBillar.GameVars.scaleXMult;
      this.adversaryAvatar.scale.y *= 2 * MiniBillar.GameVars.scaleYMult;
      this.add.existing(this.adversaryAvatar);
      this.lookingForPlayerContainer.add(this.adversaryAvatar);
      this.playerNick = new Phaser.Text(
        this.game,
        MiniBillar.GameVars.gameWidth / 2 - 150,
        340,
        "",
        {
          font: "26px Oswald-DemiBold",
          fontWeight: "600",
          fill: "#e7f6f8",
          align: "center",
        }
      );
      this.playerNick.anchor.x = 0.5;
      this.playerNick.visible = false;
      this.playerNick.stroke = "#2f3237";
      this.playerNick.strokeThickness = 5;
      this.playerNick.scale.set(
        MiniBillar.GameVars.scaleXMult,
        MiniBillar.GameVars.scaleYMult
      );
      this.lookingForPlayerContainer.add(this.playerNick);
      this.adversaryNick = new Phaser.Text(
        this.game,
        MiniBillar.GameVars.gameWidth / 2 + 150,
        340,
        "",
        {
          font: "26px Oswald-DemiBold",
          fontWeight: "600",
          fill: "#e7f6f8",
          align: "center",
        }
      );
      this.adversaryNick.anchor.x = 0.5;
      this.adversaryNick.visible = false;
      this.adversaryNick.stroke = "#2f3237";
      this.adversaryNick.strokeThickness = 5;
      this.adversaryNick.scale.set(
        MiniBillar.GameVars.scaleXMult,
        MiniBillar.GameVars.scaleYMult
      );
      this.lookingForPlayerContainer.add(this.adversaryNick);
      if (MiniBillar.GameConstants.LOG_SERVER_INFO) {
        this.roomIdLabel = new Phaser.Text(
          this.game,
          MiniBillar.GameVars.gameWidth / 2,
          120,
          "",
          {
            font: "20px Oswald-DemiBold",
            fontWeight: "600",
            fill: "#e7f6f8",
            align: "center",
          }
        );
        this.roomIdLabel.anchor.x = 0.5;
        this.roomIdLabel.stroke = "#2f3237";
        this.roomIdLabel.strokeThickness = 5;
        this.roomIdLabel.scale.set(
          MiniBillar.GameVars.scaleXMult,
          MiniBillar.GameVars.scaleYMult
        );
        this.lookingForPlayerContainer.add(this.roomIdLabel);
      }
    }
    update() {
      super.update();
      if (this.waitingAnim) {
        this.waitingAnim.angle += 5;
      }
      this.f++;
      if (this.f === 120 && !this.playerAvatar.visible) {
        MiniBillar.GameManager.setupBotMatchData();
        this.fakePlayerFound();
      }
    }
    shutdown() {
      LobbyState.currentInstance = null;
      super.shutdown();
    }
    onPlayerJoined() {
      if (this.roomIdLabel) {
        this.roomIdLabel.text =
          "ROOM ID: " + Communication.CommunicationManager.room.id;
      }
      this.playerAvatar.visible = true;
      this.playerAvatar.setFrameName(
        MiniBillar.GameVars.gameData.playerData.avatar + ".png"
      );
      this.playerNick.text = MiniBillar.GameVars.gameData.playerData.nick;
      this.playerNick.visible = true;
      if (MiniBillar.GameVars.adversaryData) {
        this.adversaryAvatar.visible = true;
        const avatarFileName =
          MiniBillar.GameVars.adversaryData.avatar + ".png";
        this.adversaryAvatar.setFrameName(avatarFileName);
        this.adversaryNick.text = MiniBillar.GameVars.adversaryData.nick;
        this.adversaryNick.visible = true;
      }
      if (this.playerAvatar.visible && this.adversaryAvatar.visible) {
        this.adversaryFound();
      }
    }
    setPlayers() {
      const darkLayer = this.add.sprite(
        0,
        0,
        this.game.cache.getBitmapData(MiniBillar.GameConstants.BLACK_SQUARE)
      );
      darkLayer.scale.set(
        MiniBillar.GameVars.gameWidth / MiniBillar.GameConstants.BITMAP_SIZE,
        MiniBillar.GameVars.gameHeight / MiniBillar.GameConstants.BITMAP_SIZE
      );
      darkLayer.alpha = 0.7;
      const matchedLabel = this.add.text(
        MiniBillar.GameVars.gameWidth / 2,
        400,
        "MATCHED, GAME STARTS!",
        {
          font: "50px Oswald-DemiBold",
          fill: "#E5FFFF",
        }
      );
      matchedLabel.anchor.set(0.5);
    }
    fakePlayerFound() {
      if (this.leavingScene) {
        return;
      }
      this.leavingScene = true;
      this.adversaryAvatar.visible = true;
      const avatarFileName = MiniBillar.GameVars.adversaryData.avatar + ".png";
      this.adversaryAvatar.setFrameName(avatarFileName);
      this.adversaryNick.text = MiniBillar.GameVars.adversaryData.nick;
      this.adversaryNick.visible = true;
      if (!this.playerAvatar.visible) {
        this.playerAvatar.visible = true;
        this.playerAvatar.setFrameName(
          MiniBillar.GameVars.gameData.playerData.avatar + ".png"
        );
        this.playerNick.text = MiniBillar.GameVars.gameData.playerData.nick;
        this.playerNick.visible = true;
      }
      if (this.playerAvatar.visible && this.adversaryAvatar.visible) {
        this.adversaryFound();
      }
      this.game.time.events.add(
        Phaser.Timer.SECOND,
        function () {
          MiniBillar.GameManager.enterPVBotGame();
        },
        MiniBillar.GameManager
      );
    }
    onClickExitLobby(b) {
      MiniBillar.AudioManager.playEffect(MiniBillar.AudioManager.BTN_NORMAL);
      MiniBillar.GameManager.exitLobby();
    }
    adversaryFound() {
      this.buttonBack.visible = false;
      this.waitingAnim.visible = false;
      this.titleLabel.visible = false;
      const vs = new Phaser.Image(
        this.game,
        MiniBillar.GameVars.gameWidth / 2,
        250,
        "texture_atlas_1",
        "vs.png"
      );
      vs.anchor.set(0.5);
      vs.scale.set(
        MiniBillar.GameVars.scaleXMult,
        MiniBillar.GameVars.scaleYMult
      );
      this.lookingForPlayerContainer.add(vs);
      this.game.add.tween(vs.scale).from(
        {
          x: 0.01,
          y: 0.01,
        },
        400,
        Phaser.Easing.Elastic.Out,
        true
      );
    }
  }
  MiniBillar.LobbyState = LobbyState;
})(MiniBillar || (MiniBillar = {}));
