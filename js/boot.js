var MiniBillar;
(function (MiniBillar) {
  class Boot extends Phaser.State {
    static onYandexFullscreenChanged() {
      if (!gameConfig) {
        return;
      } else {
        if (gameConfig.GameVersion !== "yandex") {
          return;
        }
      }
      MiniBillar.Game.currentInstance.scale.setGameSize(
        screen.width,
        screen.height
      );
      MiniBillar.GameVars.gameWidth = screen.width;
      MiniBillar.GameVars.gameHeight = screen.height;
      Boot.onFullScreenChange();
      if (MiniBillar.Game.currentInstance.state.current === "SplashState") {
        MiniBillar.Game.currentInstance.state.restart(false);
      }
    }
    static onFullScreenChange() {
      const aspectRatio = screen.width / screen.height;
      MiniBillar.GameVars.scaleX_DO_NOT_USE_OUTSIDE_BOOT =
        MiniBillar.GameVars.gameWidth /
        MiniBillar.GameVars.gameHeight /
        aspectRatio;
      if (aspectRatio <= 1.35) {
        MiniBillar.GameVars.correctionScale_DO_NOT_USE_OUTSIDE_BOOT = 0.75;
      } else if (aspectRatio <= 1.55) {
        MiniBillar.GameVars.correctionScale_DO_NOT_USE_OUTSIDE_BOOT = 0.8;
      } else if (aspectRatio <= 1.65) {
        MiniBillar.GameVars.correctionScale_DO_NOT_USE_OUTSIDE_BOOT = 0.9;
      } else {
        MiniBillar.GameVars.correctionScale_DO_NOT_USE_OUTSIDE_BOOT = 1;
      }
      Boot.setScaleMultipliers();
      MiniBillar.Game.currentInstance.scale.refresh();
    }
    static onOrientationChange() {
      if (!Boot.currentInstance) {
        return;
      }
      Boot.currentInstance.game.time.events.add(
        300,
        function () {
          if (
            Boot.currentInstance.bootedInWrongOrientation &&
            window.innerHeight < window.innerWidth
          ) {
            Boot.currentInstance.game.state.restart(true, false);
          }
        },
        this
      );
    }
    static enterIncorrectOrientation() {
      document.getElementById("orientation").style.display = "block";
      document.getElementById("content").style.display = "none";
    }
    static leaveIncorrectOrientation() {
      document.getElementById("orientation").style.display = "none";
      document.getElementById("content").style.display = "block";
    }
    static onBlur() {
      MiniBillar.Game.currentInstance.sound.mute = true;
    }
    static onFocus() {
      if (!MiniBillar.GameVars.gameData.musicMuted) {
        MiniBillar.Game.currentInstance.sound.mute = false;
      }
    }
    static setScaleMultipliers() {
      MiniBillar.GameVars.scaleXMult =
        MiniBillar.GameVars.scaleX_DO_NOT_USE_OUTSIDE_BOOT *
        MiniBillar.GameVars.correctionScale_DO_NOT_USE_OUTSIDE_BOOT;
      MiniBillar.GameVars.scaleYMult =
        MiniBillar.GameVars.correctionScale_DO_NOT_USE_OUTSIDE_BOOT;
      MiniBillar.GameVars.scaleXMultInverse =
        1 / MiniBillar.GameVars.scaleXMult;
      MiniBillar.GameVars.scaleYMultInverse =
        1 / MiniBillar.GameVars.scaleYMult;
      MiniBillar.GameManager.log(
        "scaleX:" +
          MiniBillar.GameVars.scaleXMult +
          ", " +
          "scaleY:" +
          MiniBillar.GameVars.scaleYMult
      );
    }
    init() {
      Boot.currentInstance = this;
      this.input.maxPointers = 1;
      this.game.stage.backgroundColor = "#05060a";
      this.game.stage.disableVisibilityChange = true;
      this.game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
      this.game.scale.pageAlignHorizontally = true;
      if (this.game.device.desktop) {
        this.game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
        MiniBillar.GameVars.scaleX_DO_NOT_USE_OUTSIDE_BOOT = 1;
        MiniBillar.GameVars.correctionScale_DO_NOT_USE_OUTSIDE_BOOT = 1;
        this.game.scale.pageAlignHorizontally = true;
        if (!gameConfig) {
          return;
        } else {
          if (gameConfig.GameVersion === "yandex") {
            window.onresize = Boot.onYandexFullscreenChanged;
            Boot.onYandexFullscreenChanged();
          }
        }
      } else {
        this.game.scale.scaleMode = Phaser.ScaleManager.EXACT_FIT;
        if (this.game.scale.compatibility.supportsFullScreen) {
          this.game.scale.fullScreenScaleMode = Phaser.ScaleManager.EXACT_FIT;
          this.game.scale.onFullScreenChange.add(Boot.onFullScreenChange, this);
        } else {
          console.log("Device does not support fullscreen");
        }
        let aspectRatio = window.innerWidth / window.innerHeight;
        this.scale.setMinMax(window.innerWidth, window.innerHeight);
        MiniBillar.GameVars.scaleX_DO_NOT_USE_OUTSIDE_BOOT =
          MiniBillar.GameVars.gameWidth /
          MiniBillar.GameVars.gameHeight /
          aspectRatio;
        if (aspectRatio <= 1.35) {
          MiniBillar.GameVars.correctionScale_DO_NOT_USE_OUTSIDE_BOOT = 0.75;
        } else if (aspectRatio <= 1.55) {
          MiniBillar.GameVars.correctionScale_DO_NOT_USE_OUTSIDE_BOOT = 0.8;
        } else if (aspectRatio <= 1.65) {
          MiniBillar.GameVars.correctionScale_DO_NOT_USE_OUTSIDE_BOOT = 0.9;
        } else {
          MiniBillar.GameVars.correctionScale_DO_NOT_USE_OUTSIDE_BOOT = 1;
        }
        this.game.scale.pageAlignVertically = true;
        this.game.scale.forceOrientation(true, false);
        this.game.scale.onOrientationChange.add(Boot.onOrientationChange, this);
        this.game.scale.enterIncorrectOrientation.add(
          Boot.enterIncorrectOrientation,
          Boot
        );
        this.game.scale.leaveIncorrectOrientation.add(
          Boot.leaveIncorrectOrientation,
          Boot
        );
        this.bootedInWrongOrientation =
          window.innerHeight > window.innerWidth ? true : false;
        document.getElementById("ti").onblur = () => {
          if (MiniBillar.NameInputLayer.currentInstance) {
            MiniBillar.NameInputLayer.currentInstance.onExitInputFieldMobile();
            document.getElementById("ti").style.display = "none";
          }
        };
        document.getElementById("ti").onfocus = () => {
          if (MiniBillar.NameInputLayer.currentInstance) {
            const tiElement = document.getElementById("ti");
            tiElement.value =
              MiniBillar.NameInputLayer.currentInstance.onEnterInputFieldMobile();
          }
        };
      }
      ifvisible.on("blur", Boot.onBlur);
      ifvisible.on("focus", Boot.onFocus);
      Boot.setScaleMultipliers();
      if (MiniBillar.GameConstants.DEVELOPMENT) {
        this.game.time.advancedTiming = true;
      }
    }
    preload() {
      this.load.path = MiniBillar.GameConstants.ASSETS_PATH;
      this.load.crossOrigin = "anonymous";
      this.load.image("preload_background", "/preload_background.jpg");
      this.load.image("preload_cue", "/preload-cue.png");
      this.load.image("preload_cue_ball", "/preload-cue-ball.png");
    }
    create() {
      console.log("vao");
      if (!this.game.device.desktop && this.bootedInWrongOrientation) {
        return;
      }
      MiniBillar.GameManager.init(this.game);
      this.game.add.plugin(
        new PhaserInput.Plugin(this.game, this.game.plugins)
      );
    }
    shutdown() {
      Boot.currentInstance = null;
      super.shutdown();
    }
  }
  MiniBillar.Boot = Boot;
})(MiniBillar || (MiniBillar = {}));
