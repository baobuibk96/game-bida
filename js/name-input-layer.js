var MiniBillar;
(function (MiniBillar) {
  class NameInputLayer extends Phaser.Group {
    constructor(game, lastValidPlayerName) {
      super(game, null, "name-input-layer-container");
      NameInputLayer.currentInstance = this;
      this.lastValidPlayerName = lastValidPlayerName;
      let transparentBackground = new Phaser.Sprite(
        this.game,
        0,
        0,
        this.game.cache.getBitmapData(MiniBillar.GameConstants.BLUE_SQUARE)
      );
      transparentBackground.scale.set(
        MiniBillar.GameVars.gameWidth / 64,
        MiniBillar.GameVars.gameHeight / 64
      );
      transparentBackground.alpha = 0.8;
      transparentBackground.inputEnabled = true;
      transparentBackground.events.onInputUp.add(
        this.onDownTransparentLayer,
        this
      );
      this.add(transparentBackground);
      document.getElementById("ti").style.display = "block";
      const tiElement = document.getElementById("ti");
      this.game.time.events.add(
        0.15 * Phaser.Timer.SECOND,
        function () {
          tiElement.focus();
        },
        this
      );
    }
    onExitInputFieldMobile() {
      const tiElement = document.getElementById("ti");
      const newNick = tiElement.value;
      if (newNick.length > 0 && newNick.length < 25) {
        MiniBillar.GameVars.gameData.playerData.nick = newNick;
        MiniBillar.GameManager.writeGameData();
      }
      MiniBillar.PlayerRegisteringState.currentInstance.updateDisplayedName();
      MiniBillar.PlayerRegisteringState.currentInstance.hideNameInputLayer();
    }
    onEnterInputFieldMobile() {
      MiniBillar.AudioManager.playEffect(MiniBillar.AudioManager.BTN_NORMAL);
      this.lastValidPlayerName = MiniBillar.GameVars.gameData.playerData.nick;
      return this.lastValidPlayerName;
    }
    onDownTransparentLayer() {
      const tiElement = document.getElementById("ti");
      this.game.time.events.add(
        0.15 * Phaser.Timer.SECOND,
        function () {
          tiElement.blur();
        },
        this
      );
      MiniBillar.AudioManager.playEffect(MiniBillar.AudioManager.BTN_NORMAL);
      MiniBillar.PlayerRegisteringState.currentInstance.updateDisplayedName();
      MiniBillar.PlayerRegisteringState.currentInstance.hideNameInputLayer();
    }
  }
  MiniBillar.NameInputLayer = NameInputLayer;
})(MiniBillar || (MiniBillar = {}));
