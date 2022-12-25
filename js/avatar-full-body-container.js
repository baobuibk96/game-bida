var MiniBillar;
(function (MiniBillar) {
  class AvatarFullBodyContainer extends Phaser.Group {
    constructor(game) {
      super(game, null, "avatar-full-body-container");
      this.x = Math.min(
        MiniBillar.GameVars.gameWidth / 4,
        MiniBillar.GameVars.gameWidth / 2 - 380 * MiniBillar.GameVars.scaleXMult
      );
      this.y = 600;
      this.scale.set(
        MiniBillar.GameVars.scaleXMult,
        MiniBillar.GameVars.scaleYMult
      );
      this.fullBodyAvatar = new Phaser.Image(
        this.game,
        0,
        0,
        "texture_atlas_5",
        MiniBillar.GameVars.gameData.playerData.avatar + ".png"
      );
      this.fullBodyAvatar.anchor.set(0.5, 1);
      this.add(this.fullBodyAvatar);
      this.lastValidPlayerName = MiniBillar.GameVars.gameData.playerData.nick;
      const nameEditButton = new Phaser.Button(
        this.game,
        0,
        0,
        "texture_atlas_1"
      );
      nameEditButton.setFrames(
        "btn_edit_avatar_on.png",
        "btn_edit_avatar_off.png",
        "btn_edit_avatar_on.png",
        "btn_edit_avatar_off.png"
      );
      nameEditButton.anchor.set(0.5);
      if (this.game.device.touch) {
        nameEditButton.onInputDown.add(function () {
          nameEditButton.scale.set(
            nameEditButton.scale.x * 1.1,
            nameEditButton.scale.y * 1.1
          );
        }, this);
      }
      nameEditButton.onInputOver.add(function () {
        nameEditButton.scale.set(
          nameEditButton.scale.x * 1.1,
          nameEditButton.scale.y * 1.1
        );
      }, this);
      nameEditButton.onInputOut.add(function () {
        nameEditButton.scale.set(1);
      }, this);
      //   this.add(nameEditButton);
      const nameInputLine = new Phaser.Graphics(this.game, 0, 0);
      nameInputLine.lineStyle(4, 0xe5ffff, 1);
      this.add(nameInputLine);
      let nameInputLinePos;
      if (this.game.device.touch) {
        this.fakeNameInput = new Phaser.Text(
          this.game,
          -105,
          -this.fullBodyAvatar.height - 45,
          this.lastValidPlayerName,
          {
            font: "30px Oswald-Medium",
            fill: "#E5FFFF",
          }
        );
        this.fakeNameInput.inputEnabled = true;
        this.fakeNameInput.events.onInputUp.add(function () {
          MiniBillar.PlayerRegisteringState.currentInstance.showNameInputLayer();
        }, this);
        this.fakeNameInput.setText(
          MiniBillar.Utils.truncateName(this.lastValidPlayerName, 12)
        );
        this.add(this.fakeNameInput);
        nameInputLinePos = this.fakeNameInput.position;
        nameEditButton.events.onInputUp.add(function () {
          MiniBillar.PlayerRegisteringState.currentInstance.showNameInputLayer();
          nameEditButton.scale.set(1);
        }, this);
      } else {
        this.nameInput = new PhaserInput.InputField(
          this.game,
          -105,
          -this.fullBodyAvatar.height - 45,
          {
            font: "30px Oswald-Medium",
            fill: "#E5FFFF",
            cursorColor: "#E5FFFF",
            fillAlpha: 0,
            width: 180,
            max: "20",
          }
        );
        this.nameInput.setText(MiniBillar.GameVars.gameData.playerData.nick);
        this.nameInput.focusIn.add(this.onEnterInputField, this);
        this.nameInput.focusOut.add(this.onExitInputField, this);
        this.add(this.nameInput);
        nameInputLinePos = this.nameInput.position;
        nameEditButton.events.onInputUp.add(function () {
          this.nameInput.startFocus();
          nameEditButton.scale.set(1);
        }, this);
      }
      nameInputLine.moveTo(nameInputLinePos.x - 15, nameInputLinePos.y + 40);
      nameInputLine.lineTo(nameInputLinePos.x + 180, nameInputLinePos.y + 40);
      nameEditButton.position.set(
        nameInputLinePos.x + 200,
        nameInputLinePos.y + 25
      );
    }
    avatarSelected() {
      this.fullBodyAvatar.frameName =
        MiniBillar.GameVars.gameData.playerData.avatar + ".png";
    }
    updateDisplayedName() {
      this.fakeNameInput.text = MiniBillar.Utils.truncateName(
        MiniBillar.GameVars.gameData.playerData.nick,
        12
      );
    }
    onEnterInputField(inputField) {
      MiniBillar.AudioManager.playEffect(MiniBillar.AudioManager.BTN_NORMAL);
      this.lastValidPlayerName = MiniBillar.GameVars.gameData.playerData.nick;
    }
    onExitInputField() {
      MiniBillar.AudioManager.playEffect(MiniBillar.AudioManager.BTN_NORMAL);
      if (this.nameInput.value.length > 0) {
        MiniBillar.GameVars.gameData.playerData.nick = this.nameInput.value;
        MiniBillar.GameManager.writeGameData();
      } else {
        this.nameInput.setText(this.lastValidPlayerName);
      }
    }
  }
  MiniBillar.AvatarFullBodyContainer = AvatarFullBodyContainer;
})(MiniBillar || (MiniBillar = {}));
