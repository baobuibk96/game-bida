var MiniBillar;
(function (MiniBillar) {
  class Game extends Phaser.Game {
    constructor() {
      let renderer;
      if (
        navigator.userAgent.match(/iPhone/i) ||
        navigator.userAgent.match(/iPad/i) ||
        navigator.userAgent.match(/iPod/i)
      ) {
        renderer = Phaser.CANVAS;
      } else {
        renderer = Phaser.AUTO;
      }
      super(
        MiniBillar.GameConstants.GAME_WIDTH,
        MiniBillar.GameConstants.GAME_HEIGHT,
        renderer,
        "content",
        null,
        false,
        true
      );
      Game.currentInstance = this;
      this.state.add("Boot", MiniBillar.Boot, true);
      this.state.add("PreLoader", MiniBillar.PreLoader, false);
      this.state.add("SplashState", MiniBillar.SplashState, false);
      this.state.add("LobbyState", MiniBillar.LobbyState, false);
      this.state.add("PoolState", MiniBillar.PoolState, false);
      this.state.add("EquipmentState", MiniBillar.EquipmentState, false);
      this.state.add(
        "PlayerRegisteringState",
        MiniBillar.PlayerRegisteringState,
        false
      );
      this.state.start("Boot");
    }
  }
  MiniBillar.Game = Game;
})(MiniBillar || (MiniBillar = {}));
