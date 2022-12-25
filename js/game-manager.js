var MiniBillar;
(function (MiniBillar) {
  class GameManager {
    static init(game) {
      GameManager.game = game;
      Communication.CommunicationManager.init();
      GameManager.communicationFunctionsPVP();
      GameManager.setBilliardConstants();
      GameManager.readGameData();
    }
    static resetNonSOLOVars() {
      if (
        MiniBillar.GameConstants.LOG_SERVER_INFO ||
        MiniBillar.GameConstants.LOG_BOT_SERVER_INFO
      ) {
        console.error("resetNonSOLOVars");
      }
      MiniBillar.LobbyState.currentInstance = null;
      MiniBillar.GameVars.adversaryData = null;
      MiniBillar.GameVars.gameData.playerData.ballsMoving = false;
      MiniBillar.GameVars.gameData.playerData.canPocketBlackBall = false;
      MiniBillar.GameVars.gameData.playerData.id = "";
      MiniBillar.GameVars.gameData.playerData.sessionId = "";
      MiniBillar.GameVars.gameData.playerData.set = false;
      MiniBillar.GameVars.gameData.playerData.typeBalls =
        MiniBillar.GameConstants.BALL_TYPE_NONE;
      MiniBillar.GameVars.playersSetForPVP = false;
      MiniBillar.GameVars.playersSetForPVBot = false;
    }
    static communicationFunctionsPVP() {
      Communication.CommunicationManager.onPlayerJoined = (
        players,
        isPlayerA
      ) => GameManager.onPlayerJoinedPVP(players, isPlayerA);
      Communication.CommunicationManager.startMatch = () =>
        GameManager.startPVPMatch();
      Communication.CommunicationManager.onTurnChange = (state) =>
        GameManager.onPVPTurnChange(state);
      Communication.CommunicationManager.matchFinished = (winnerSessionId) =>
        MiniBillar.MatchManagerPVP.matchFinished(winnerSessionId);
      Communication.CommunicationManager.adversaryLeftRoom = () =>
        MiniBillar.MatchManagerPVP.adversaryLeftRoomPVP();
      Communication.CommunicationManager.matchOverDueToResignation = (data) =>
        MiniBillar.MatchManagerPVP.matchOverDueToResignation(data);
      Communication.CommunicationManager.showPocketSelected = (data) =>
        MiniBillar.MatchManagerPVP.showPocketSelected(data);
      Communication.CommunicationManager.adversaryRotatedCue = (data) =>
        MiniBillar.MatchManagerPVP.adversaryRotatedCue(data);
      Communication.CommunicationManager.adversaryCueBallPosition = (data) =>
        MiniBillar.MatchManagerPVP.adversaryCueBallPosition(data);
      Communication.CommunicationManager.shotDataReceived = (data) =>
        MiniBillar.MatchManagerPVP.shotDataReceived(data);
      Communication.CommunicationManager.waitingPlayerEnd = () =>
        GameManager.waitingPlayerEndPVP();
      Communication.CommunicationManager.showEmoticon = (data) =>
        MiniBillar.MatchManager.showAdversaryEmoticon(data);
      Communication.CommunicationManager.cueBallSpinSet = (data) =>
        MiniBillar.MatchManager.cueBallSpinSet(data);
    }
    static readGameData() {
      GameManager.getGameStorageData(
        MiniBillar.GameConstants.SAVED_GAME_DATA_KEY,
        function (gameData) {
          if (gameData) {
            MiniBillar.GameVars.gameData = JSON.parse(gameData);
          } else {
            GameManager.resetGameVars();
          }
          GameManager.startGame();
        },
        function (error) {
          GameManager.log("error retriving saved game data.", error);
        }
      );
    }
    static onGameAssetsLoaded() {
      MiniBillar.AudioManager.init(GameManager.game);
      MiniBillar.RewardsManager.init(GameManager.game);
      MiniBillar.RewardsManager.loadAndVerifyCards();
      MiniBillar.GameVars.goDirectlyToLobby = false;
      let cache = this.game.cache;
      let frameNames = cache._cache.image.texture_atlas_5.frameData._frameNames;
      let i = 0;
      while (
        typeof frameNames["emoticon_" + (i + 1) + ".png"] !== "undefined"
      ) {
        i++;
      }
      MiniBillar.GameVars.emoticonsAmount = i;
      GameManager.enterSplash();
    }
    static exitLobby() {
      Communication.CommunicationManager.sendMessage({
        type: MiniBillar.GameConstants.MESSAGE_TYPE_PLAYER_QUIT_LOBBY,
        data: null,
      });
      GameManager.enterSplash();
    }
    static enterSoloGame(enteringFromSplash) {
      enteringFromSplash = enteringFromSplash || false;
      if (enteringFromSplash) {
        lechuck.ads.showInterlevelAd(
          "https://ext.minijuegos.com/video/tags.php?id=mini-pool-io&type=desktop",
          function () {
            GameManager.game.paused = true;
          },
          function () {
            GameManager.game.paused = false;
            GameManager.fullscreenFilter(function () {
              GameManager.resetMatchVars();
              MiniBillar.GameVars.gameMode = MiniBillar.GameConstants.SOLO_MODE;
              GameManager.game.state.start("PoolState", true, false);
            });
          },
          function () {
            GameManager.game.paused = false;
            GameManager.fullscreenFilter(function () {
              GameManager.resetMatchVars();
              MiniBillar.GameVars.gameMode = MiniBillar.GameConstants.SOLO_MODE;
              GameManager.game.state.start("PoolState", true, false);
            });
          }
        );
      } else {
        GameManager.resetMatchVars();
        MiniBillar.GameVars.gameMode = MiniBillar.GameConstants.SOLO_MODE;
        GameManager.game.state.start("PoolState", true, false);
      }
    }
    static enterPVBotGame() {
      GameManager.fullscreenFilter(function () {
        GameManager.resetMatchVars();
        MiniBillar.RulesManager.init(
          MiniBillar.GameVars.gameData.playerData,
          MiniBillar.GameVars.adversaryData
        );
        GameManager.onPVBotTurnChange(null);
      });
    }
    static enterPVPGame() {
      lechuck.ads.showInterlevelAd(
        "https://ext.minijuegos.com/video/tags.php?id=mini-pool-io&type=desktop",
        function () {
          GameManager.game.paused = true;
        },
        function () {
          GameManager.game.paused = false;
          GameManager.fullscreenFilter(function () {
            GameManager.resetMatchVars();
            const roomCreated = Communication.CommunicationManager.joinRoom(
              MiniBillar.GameVars.gameData.playerData
            );
            if (roomCreated) {
              GameManager.game.state.start("LobbyState", true, false);
            }
          });
        },
        function () {
          GameManager.game.paused = false;
          GameManager.fullscreenFilter(function () {
            GameManager.resetMatchVars();
            const roomCreated = Communication.CommunicationManager.joinRoom(
              MiniBillar.GameVars.gameData.playerData
            );
            if (roomCreated) {
              GameManager.game.state.start("LobbyState", true, false);
            }
          });
        }
      );
    }
    static enterEquipment() {
      GameManager.game.state.start("EquipmentState", true, false);
    }
    static enterSplash() {
      GameManager.resetNonSOLOVars();
      GameManager.game.state.start("SplashState", true, false);
    }
    static enterPortraitSelectionScreen() {
      GameManager.fullscreenFilter(function () {
        GameManager.game.state.start("PlayerRegisteringState", true, false);
      });
    }
    static writeGameData() {
      GameManager.setGameStorageData(
        MiniBillar.GameConstants.SAVED_GAME_DATA_KEY,
        MiniBillar.GameVars.gameData,
        function () {
          GameManager.log("game data successfully saved");
        },
        function (error) {
          GameManager.log("error saving game data", error);
        }
      );
    }
    static log(text, error, color) {
      if (!MiniBillar.GameConstants.VERBOSE) {
        return;
      }
      if (error) {
        console.error(text + ":", error);
      } else {
        console.log("%c " + text, "color:" + color);
      }
    }
    static changePowerBar() {
      if (
        MiniBillar.GameVars.gameData.powerBarSide ===
        MiniBillar.GameConstants.LEFT
      ) {
        MiniBillar.GameVars.gameData.powerBarSide =
          MiniBillar.GameConstants.RIGHT;
      } else {
        MiniBillar.GameVars.gameData.powerBarSide =
          MiniBillar.GameConstants.LEFT;
      }
      if (MiniBillar.PoolState.currentInstance) {
        MiniBillar.PoolState.currentInstance.changePowerBar();
      }
      GameManager.writeGameData();
    }
    static validatePocketedBalls() {
      let ballsToRemoveFromPocketedBalls = [];
      for (let i = 0; i < MiniBillar.GameVars.pocketedBalls.length; i++) {
        let ballId = MiniBillar.GameVars.pocketedBalls[i];
        for (let j = 0; j < MiniBillar.GameVars.ballsData.length; j++) {
          let ballData = MiniBillar.GameVars.ballsData[j];
          if (ballData.id === ballId && ballData.active) {
            ballsToRemoveFromPocketedBalls.push(ballId);
          }
        }
      }
      if (ballsToRemoveFromPocketedBalls.length > 0) {
        for (let i = ballsToRemoveFromPocketedBalls.length - 1; i >= 0; i--) {
          let index = MiniBillar.GameVars.pocketedBalls.indexOf(
            ballsToRemoveFromPocketedBalls[i]
          );
          MiniBillar.GameVars.pocketedBalls.splice(index, 1);
        }
      }
      let ballsToAddToPocketedBalls = [];
      for (let i = 0; i < MiniBillar.GameVars.ballsData.length; i++) {
        let ballData = MiniBillar.GameVars.ballsData[i];
        if (!ballData.active) {
          let needAdd = false;
          for (let j = 0; j < MiniBillar.GameVars.pocketedBalls.length; j++) {
            let ballId = MiniBillar.GameVars.pocketedBalls[j];
            if (ballId === ballData.id) {
              needAdd = true;
              break;
            }
          }
          if (needAdd) {
            ballsToAddToPocketedBalls.push(ballData.id);
          }
        }
      }
      if (ballsToAddToPocketedBalls.length > 0) {
        for (let i = ballsToAddToPocketedBalls.length - 1; i >= 0; i--) {
          MiniBillar.GameVars.pocketedBalls.push(ballsToAddToPocketedBalls[i]);
        }
      }
    }
    static exitFullscreen() {
      if (
        GameManager.game.device.touch &&
        GameManager.game.scale.compatibility.supportsFullScreen
      ) {
        GameManager.game.scale.stopFullScreen();
      }
    }
    static fullscreenFilter(onSuccess) {
      const isYabrowser = navigator.userAgent.indexOf("YaBrowser") > -1;
      const isIosOrSafari =
        GameManager.game.device.iOS && GameManager.game.device.mobileSafari;
      const goAheadWithFullscreen =
        isYabrowser || (!isYabrowser && !isIosOrSafari);
      if (
        GameManager.game.device.touch &&
        GameManager.game.scale.compatibility.supportsFullScreen &&
        goAheadWithFullscreen
      ) {
        const root = document.documentElement;
        GameManager.game.scale.fullScreenTarget = root;
        GameManager.game.scale.startFullScreen();
        GameManager.game.time.events.add(
          0.15 * Phaser.Timer.SECOND,
          function () {
            GameManager.game.scale.setMinMax(
              window.innerWidth,
              window.innerHeight
            );
            MiniBillar.Boot.onFullScreenChange();
            onSuccess();
          },
          this
        );
      } else {
        onSuccess();
      }
    }
    static waitingPlayerEndPVP() {
      if (MiniBillar.GameConstants.LOG_SERVER_INFO) {
        console.error("waitingPlayerEndPVP()");
      }
      if (MiniBillar.LobbyState.currentInstance) {
        GameManager.setupBotMatchData();
        MiniBillar.LobbyState.currentInstance.fakePlayerFound();
      }
    }
    static onPVPTurnChange(state) {
      if (MiniBillar.GameConstants.LOG_SERVER_INFO) {
        console.error("onPVPTurnChange()");
      }
      if (MiniBillar.GameVars.playersSetForPVP) {
        MiniBillar.MatchManagerPVP.newTurn(state);
        MiniBillar.PoolState.currentInstance.hud.newTurn();
      } else {
        GameManager.setPlayer(state.currentTurn);
      }
    }
    static setupBotMatchData() {
      MiniBillar.GameVars.adversaryData = {
        nick: this.game.rnd.pick(MiniBillar.Utils.getRandomUsernameList()),
        avatar: this.game.rnd.pick(MiniBillar.Utils.getRandomAvatarImageList()),
        equipedCue: this.game.rnd.pick(MiniBillar.RewardsManager.getCuesList()),
        sessionId: "bot",
        id: "",
        set: false,
        ballsMoving: false,
        typeBalls: MiniBillar.GameConstants.BALL_TYPE_NONE,
        canPocketBlackBall: false,
      };
      MiniBillar.GameVars.gameData.playerData.sessionId = "player";
    }
    static onPVBotTurnChange(state) {
      if (MiniBillar.GameConstants.LOG_BOT_SERVER_INFO) {
        console.error("onPVBotTurnChange()");
      }
      if (MiniBillar.GameVars.playersSetForPVBot) {
        MiniBillar.MatchManagerPVBot.newTurn(state);
        MiniBillar.PoolState.currentInstance.hud.newTurn();
      } else {
        MiniBillar.GameVars.playersSetForPVBot = true;
        MiniBillar.GameVars.gameMode = MiniBillar.GameConstants.PVBOT_MODE;
        MiniBillar.MatchManagerPVBot.init(GameManager.game);
      }
    }
    static setPlayer(currentTurn) {
      MiniBillar.GameVars.playersSetForPVP = true;
      GameManager.game.time.events.add(
        Phaser.Timer.SECOND,
        function () {
          if (MiniBillar.LobbyState.currentInstance) {
            MiniBillar.LobbyState.currentInstance.setPlayers();
          }
        },
        GameManager
      );
      GameManager.game.time.events.add(
        2 * Phaser.Timer.SECOND,
        function () {
          MiniBillar.GameVars.gameMode = MiniBillar.GameConstants.PVP_MODE;
          MiniBillar.MatchManagerPVP.init(GameManager.game, currentTurn);
        },
        GameManager
      );
    }
    static onPlayerJoinedPVP(players, isPlayerA) {
      if (MiniBillar.GameConstants.LOG_SERVER_INFO) {
        console.error("onPlayerJoinedPVP()");
      }
      if (!players.playerB) {
        if (isPlayerA) {
          MiniBillar.GameVars.gameData.playerData.sessionId =
            players.playerA.sessionId;
          MiniBillar.GameVars.gameData.playerData.id = players.playerA.id;
        } else {
          MiniBillar.GameVars.adversaryData = players.playerA;
        }
      } else {
        if (isPlayerA) {
          MiniBillar.GameVars.adversaryData = players.playerB;
        } else {
          MiniBillar.GameVars.gameData.playerData.sessionId =
            players.playerB.sessionId;
          MiniBillar.GameVars.gameData.playerData.id = players.playerB.id;
        }
      }
      if (MiniBillar.LobbyState.currentInstance) {
        GameManager.game.time.events.add(
          150,
          MiniBillar.LobbyState.currentInstance.onPlayerJoined,
          MiniBillar.LobbyState.currentInstance
        );
      } else {
        if (MiniBillar.GameConstants.LOG_SERVER_INFO) {
          console.error("Lobby not ready");
        }
      }
    }
    static avatarSelected(avatarName) {
      MiniBillar.GameVars.gameData.playerData.avatar = avatarName;
      MiniBillar.PlayerRegisteringState.currentInstance.avatarSelected();
      GameManager.writeGameData();
    }
    static onItemEquiChange(cardType, cardId) {
      if (cardType === "cue") {
        MiniBillar.GameVars.gameData.playerData.equipedCue = cardId;
        miniplaySend2API("cues", parseInt(cardId[cardId.length - 1]));
      } else {
        MiniBillar.GameVars.gameData.equippedTable = cardId;
        miniplaySend2API("tables", parseInt(cardId[cardId.length - 1]));
      }
      GameManager.writeGameData();
    }
    static startPVPMatch() {
      if (MiniBillar.GameConstants.LOG_SERVER_INFO) {
        console.error("startPVPMatch()");
      }
    }
    static startGame() {
      GameManager.game.state.start("PreLoader", true, false);
    }
    static resetGameVars() {
      let nonSolo = {
        gamesPlayed: 0,
        gamesWon: 0,
        gamesLost: 0,
      };
      let solo = {
        highScore: 0,
      };
      let rewards = {
        starProgress: 0,
        cards: [],
        allUnlocked: false,
      };
      let statistics = {
        nonSolo: nonSolo,
        solo: solo,
        rewards: rewards,
      };
      MiniBillar.GameVars.gameData = {
        playerData: {
          nick: "Player",
          avatar: GameManager.game.rnd.pick(
            MiniBillar.Utils.getRandomAvatarImageList()
          ),
          equipedCue: "NO_CUE_SELECTED",
          sessionId: "player",
          id: "",
          set: false,
          ballsMoving: false,
          typeBalls: MiniBillar.GameConstants.BALL_TYPE_NONE,
          canPocketBlackBall: false,
        },
        equippedTable: "NO_TABLE_SELECTED",
        musicMuted: false,
        effectsMuted: false,
        powerBarSide: MiniBillar.GameConstants.LEFT,
        statistics: statistics,
        soloTutorial: true,
        multiplayerTutorial: true,
      };
      if (MiniBillar.GameConstants.DEVELOPMENT) {
        MiniBillar.GameVars.gameData = {
          playerData: {
            nick: "Player",
            avatar: GameManager.game.rnd.pick(
              MiniBillar.Utils.getRandomAvatarImageList()
            ),
            equipedCue: "NO_CUE_SELECTED",
            sessionId: "player",
            id: "",
            set: false,
            ballsMoving: false,
            typeBalls: MiniBillar.GameConstants.BALL_TYPE_NONE,
            canPocketBlackBall: false,
          },
          equippedTable: "NO_TABLE_SELECTED",
          musicMuted: false,
          effectsMuted: false,
          powerBarSide: MiniBillar.GameConstants.RIGHT,
          statistics: statistics,
          soloTutorial: true,
          multiplayerTutorial: true,
        };
      }
    }
    static resetMatchVars() {
      MiniBillar.GameVars.gameMode = MiniBillar.GameConstants.NO_GAME;
      MiniBillar.GameVars.pocketedBalls = [];
      MiniBillar.GameVars.ballsData = [];
      this.resetSoloMatchScoreAndTime();
      MiniBillar.GameVars.shotCount = 0;
      MiniBillar.GameVars.timerPVP = 30;
      MiniBillar.GameVars.startMatch = false;
      MiniBillar.GameVars.gameEnded = MiniBillar.GameConstants.GAME_UNDECIDED;
      MiniBillar.GameVars.currentTurn = null;
      MiniBillar.GameVars.firstShot = true;
      MiniBillar.GameVars.rematch = false;
      MiniBillar.GameVars.timeMatch = 0;
      MiniBillar.GameVars.paused = false;
      MiniBillar.GameVars.shotRunning = false;
      MiniBillar.GameVars.turnSet = true;
      MiniBillar.GameVars.wallCollisions = [];
      MiniBillar.GameVars.english = 0;
      MiniBillar.GameVars.verticalSpin = 0;
      MiniBillar.GameVars.GUIButtonDown = false;
      MiniBillar.GameVars.draggingCueBall = false;
      MiniBillar.GameVars.skipShowingPocketAndCue = false;
      MiniBillar.GameVars.pocketIdWhereBlackFell = -1;
      MiniBillar.GameVars.canStart = false;
      if (MiniBillar.GameConstants.DEVELOPMENT) {
        MiniBillar.GameVars.gameMode = MiniBillar.GameConstants.NO_GAME;
        MiniBillar.GameVars.pocketedBalls = [];
        MiniBillar.GameVars.ballsData = [];
        MiniBillar.GameVars.startMatch = false;
        MiniBillar.GameVars.gameEnded = MiniBillar.GameConstants.GAME_UNDECIDED;
        MiniBillar.GameVars.currentTurn = null;
        MiniBillar.GameVars.firstShot = true;
        MiniBillar.GameVars.rematch = false;
        MiniBillar.GameVars.timeMatch = 0;
      }
    }
    static resetSoloMatchScoreAndTime() {
      if (
        MiniBillar.GameVars.resetScoreAndTime ||
        (!MiniBillar.GameVars.playerPoints && !MiniBillar.GameVars.timerSolo)
      ) {
        if (MiniBillar.GameConstants.DEVELOPMENT) {
          MiniBillar.GameVars.playerPoints = 0;
          MiniBillar.GameVars.timerSolo = 50;
        } else {
          MiniBillar.GameVars.playerPoints = 0;
          MiniBillar.GameVars.timerSolo =
            MiniBillar.GameConstants.TIME_SOLO_MATCH;
        }
      }
      MiniBillar.GameVars.resetScoreAndTime = true;
    }
    static setBilliardConstants() {
      MiniBillar.GameVars.pocketArray = [];
      let pocket = {
        id: 0,
        position: new Billiard.Vector2D(
          -42e3 - MiniBillar.GameConstants.POCKET_RADIUS / 4,
          -21e3 - MiniBillar.GameConstants.POCKET_RADIUS / 4
        ),
        dropPosition: new Billiard.Vector2D(
          -42840 - MiniBillar.GameConstants.POCKET_RADIUS / 2,
          -21840 - MiniBillar.GameConstants.POCKET_RADIUS / 4
        ),
      };
      MiniBillar.GameVars.pocketArray.push(pocket);
      pocket = {
        id: 1,
        position: new Billiard.Vector2D(
          0,
          -21e3 - MiniBillar.GameConstants.POCKET_RADIUS
        ),
        dropPosition: new Billiard.Vector2D(
          0,
          -21420 - MiniBillar.GameConstants.POCKET_RADIUS
        ),
      };
      MiniBillar.GameVars.pocketArray.push(pocket);
      pocket = {
        id: 2,
        position: new Billiard.Vector2D(
          42e3 + MiniBillar.GameConstants.POCKET_RADIUS / 4,
          -21e3 - MiniBillar.GameConstants.POCKET_RADIUS / 4
        ),
        dropPosition: new Billiard.Vector2D(
          42840 + MiniBillar.GameConstants.POCKET_RADIUS / 2,
          -21840 - MiniBillar.GameConstants.POCKET_RADIUS / 4
        ),
      };
      MiniBillar.GameVars.pocketArray.push(pocket);
      pocket = {
        id: 3,
        position: new Billiard.Vector2D(
          -42e3 - MiniBillar.GameConstants.POCKET_RADIUS / 4,
          21e3 + MiniBillar.GameConstants.POCKET_RADIUS / 4
        ),
        dropPosition: new Billiard.Vector2D(
          -42840 - MiniBillar.GameConstants.POCKET_RADIUS / 2,
          21840 + MiniBillar.GameConstants.POCKET_RADIUS / 4
        ),
      };
      MiniBillar.GameVars.pocketArray.push(pocket);
      pocket = {
        id: 4,
        position: new Billiard.Vector2D(
          0,
          21e3 + MiniBillar.GameConstants.POCKET_RADIUS
        ),
        dropPosition: new Billiard.Vector2D(
          0,
          21420 + MiniBillar.GameConstants.POCKET_RADIUS
        ),
      };
      MiniBillar.GameVars.pocketArray.push(pocket);
      pocket = {
        id: 5,
        position: new Billiard.Vector2D(
          42e3 + MiniBillar.GameConstants.POCKET_RADIUS / 4,
          21e3 + MiniBillar.GameConstants.POCKET_RADIUS / 4
        ),
        dropPosition: new Billiard.Vector2D(
          42840 + MiniBillar.GameConstants.POCKET_RADIUS / 2,
          21840 + MiniBillar.GameConstants.POCKET_RADIUS / 4
        ),
      };
      MiniBillar.GameVars.pocketArray.push(pocket);
      MiniBillar.GameVars.lineArray = [];
      MiniBillar.GameVars.vertexArray = [];
      let line = {
        name: "AB",
        direction: null,
        normal: null,
        p1: new Billiard.Vector2D(-42e3, -24360),
        p2: new Billiard.Vector2D(-38640, -21e3),
        p3: null,
        p4: null,
        p5: null,
        p6: null,
      };
      MiniBillar.GameVars.lineArray.push(line);
      let vertex = {
        name: "B",
        position: new Billiard.Vector2D(line.p2.x, line.p2.y),
      };
      MiniBillar.GameVars.vertexArray.push(vertex);
      line = {
        name: "BC",
        direction: null,
        normal: null,
        p1: new Billiard.Vector2D(-38640, -21e3),
        p2: new Billiard.Vector2D(-3360, -21e3),
        p3: null,
        p4: null,
        p5: null,
        p6: null,
      };
      MiniBillar.GameVars.lineArray.push(line);
      vertex = {
        name: "C",
        position: new Billiard.Vector2D(line.p2.x, line.p2.y),
      };
      MiniBillar.GameVars.vertexArray.push(vertex);
      line = {
        name: "CD",
        direction: null,
        normal: null,
        p1: new Billiard.Vector2D(-3360, -21e3),
        p2: new Billiard.Vector2D(-1680, -24360),
        p3: null,
        p4: null,
        p5: null,
        p6: null,
      };
      MiniBillar.GameVars.lineArray.push(line);
      line = {
        name: "EF",
        direction: null,
        normal: null,
        p1: new Billiard.Vector2D(1680, -24360),
        p2: new Billiard.Vector2D(3360, -21e3),
        p3: null,
        p4: null,
        p5: null,
        p6: null,
      };
      MiniBillar.GameVars.lineArray.push(line);
      vertex = {
        name: "F",
        position: new Billiard.Vector2D(line.p2.x, line.p2.y),
      };
      MiniBillar.GameVars.vertexArray.push(vertex);
      line = {
        name: "FG",
        direction: null,
        normal: null,
        p1: new Billiard.Vector2D(3360, -21e3),
        p2: new Billiard.Vector2D(38640, -21e3),
        p3: null,
        p4: null,
        p5: null,
        p6: null,
      };
      MiniBillar.GameVars.lineArray.push(line);
      vertex = {
        name: "G",
        position: new Billiard.Vector2D(line.p2.x, line.p2.y),
      };
      MiniBillar.GameVars.vertexArray.push(vertex);
      line = {
        name: "GH",
        direction: null,
        normal: null,
        p1: new Billiard.Vector2D(38640, -21e3),
        p2: new Billiard.Vector2D(42e3, -24360),
        p3: null,
        p4: null,
        p5: null,
        p6: null,
      };
      MiniBillar.GameVars.lineArray.push(line);
      line = {
        name: "IJ",
        direction: null,
        normal: null,
        p1: new Billiard.Vector2D(45360, -21e3),
        p2: new Billiard.Vector2D(42e3, -17640),
        p3: null,
        p4: null,
        p5: null,
        p6: null,
      };
      MiniBillar.GameVars.lineArray.push(line);
      vertex = {
        name: "J",
        position: new Billiard.Vector2D(line.p2.x, line.p2.y),
      };
      MiniBillar.GameVars.vertexArray.push(vertex);
      line = {
        name: "JK",
        direction: null,
        normal: null,
        p1: new Billiard.Vector2D(42e3, -17640),
        p2: new Billiard.Vector2D(42e3, 17640),
        p3: null,
        p4: null,
        p5: null,
        p6: null,
      };
      MiniBillar.GameVars.lineArray.push(line);
      vertex = {
        name: "K",
        position: new Billiard.Vector2D(line.p2.x, line.p2.y),
      };
      MiniBillar.GameVars.vertexArray.push(vertex);
      line = {
        name: "KL",
        direction: null,
        normal: null,
        p1: new Billiard.Vector2D(42e3, 17640),
        p2: new Billiard.Vector2D(45360, 21e3),
        p3: null,
        p4: null,
        p5: null,
        p6: null,
      };
      MiniBillar.GameVars.lineArray.push(line);
      line = {
        name: "MN",
        direction: null,
        normal: null,
        p1: new Billiard.Vector2D(42e3, 24360),
        p2: new Billiard.Vector2D(38640, 21e3),
        p3: null,
        p4: null,
        p5: null,
        p6: null,
      };
      MiniBillar.GameVars.lineArray.push(line);
      vertex = {
        name: "N",
        position: new Billiard.Vector2D(line.p2.x, line.p2.y),
      };
      MiniBillar.GameVars.vertexArray.push(vertex);
      line = {
        name: "NO",
        direction: null,
        normal: null,
        p1: new Billiard.Vector2D(38640, 21e3),
        p2: new Billiard.Vector2D(3360, 21e3),
        p3: null,
        p4: null,
        p5: null,
        p6: null,
      };
      MiniBillar.GameVars.lineArray.push(line);
      vertex = {
        name: "O",
        position: new Billiard.Vector2D(line.p2.x, line.p2.y),
      };
      MiniBillar.GameVars.vertexArray.push(vertex);
      line = {
        name: "OP",
        direction: null,
        normal: null,
        p1: new Billiard.Vector2D(3360, 21e3),
        p2: new Billiard.Vector2D(1680, 24360),
        p3: null,
        p4: null,
        p5: null,
        p6: null,
      };
      MiniBillar.GameVars.lineArray.push(line);
      line = {
        name: "QR",
        direction: null,
        normal: null,
        p1: new Billiard.Vector2D(-1680, 24360),
        p2: new Billiard.Vector2D(-3360, 21e3),
        p3: null,
        p4: null,
        p5: null,
        p6: null,
      };
      MiniBillar.GameVars.lineArray.push(line);
      vertex = {
        name: "R",
        position: new Billiard.Vector2D(line.p2.x, line.p2.y),
      };
      MiniBillar.GameVars.vertexArray.push(vertex);
      line = {
        name: "RS",
        direction: null,
        normal: null,
        p1: new Billiard.Vector2D(-3360, 21e3),
        p2: new Billiard.Vector2D(-38640, 21e3),
        p3: null,
        p4: null,
        p5: null,
        p6: null,
      };
      MiniBillar.GameVars.lineArray.push(line);
      vertex = {
        name: "S",
        position: new Billiard.Vector2D(line.p2.x, line.p2.y),
      };
      MiniBillar.GameVars.vertexArray.push(vertex);
      line = {
        name: "ST",
        direction: null,
        normal: null,
        p1: new Billiard.Vector2D(-38640, 21e3),
        p2: new Billiard.Vector2D(-42e3, 24360),
        p3: null,
        p4: null,
        p5: null,
        p6: null,
      };
      MiniBillar.GameVars.lineArray.push(line);
      line = {
        name: "UV",
        direction: null,
        normal: null,
        p1: new Billiard.Vector2D(-45360, 21e3),
        p2: new Billiard.Vector2D(-42e3, 17640),
        p3: null,
        p4: null,
        p5: null,
        p6: null,
      };
      MiniBillar.GameVars.lineArray.push(line);
      vertex = {
        name: "V",
        position: new Billiard.Vector2D(line.p2.x, line.p2.y),
      };
      MiniBillar.GameVars.vertexArray.push(vertex);
      line = {
        name: "VW",
        direction: null,
        normal: null,
        p1: new Billiard.Vector2D(-42e3, 17640),
        p2: new Billiard.Vector2D(-42e3, -17640),
        p3: null,
        p4: null,
        p5: null,
        p6: null,
      };
      MiniBillar.GameVars.lineArray.push(line);
      vertex = {
        name: "W",
        position: new Billiard.Vector2D(line.p2.x, line.p2.y),
      };
      MiniBillar.GameVars.vertexArray.push(vertex);
      line = {
        name: "WX",
        direction: null,
        normal: null,
        p1: new Billiard.Vector2D(-42e3, -17640),
        p2: new Billiard.Vector2D(-45360, -21e3),
        p3: null,
        p4: null,
        p5: null,
        p6: null,
      };
      MiniBillar.GameVars.lineArray.push(line);
      for (let i = 0; i < MiniBillar.GameVars.lineArray.length; i++) {
        let line = MiniBillar.GameVars.lineArray[i];
        line.direction = new Billiard.Vector2D(
          line.p2.x - line.p1.x,
          line.p2.y - line.p1.y
        ).normalize();
        line.normal = line.direction.getLeftNormal();
        let r = line.normal.times(MiniBillar.GameConstants.BALL_RADIUS);
        line.p3 = line.p1.plus(r);
        line.p4 = line.p2.plus(r);
        let s = line.normal.times(0.525 * MiniBillar.GameConstants.BALL_RADIUS);
        line.p5 = line.p1.plus(s);
        line.p6 = line.p2.plus(s);
      }
    }
    static getGameStorageData(key, successCb, failureCb) {
      const gameDataStr = localStorage.getItem(key);
      successCb(gameDataStr);
    }
    static setGameStorageData(key, value, successCb, failureCb) {
      localStorage.setItem(key, JSON.stringify(value));
      successCb();
    }
  }
  MiniBillar.GameManager = GameManager;
})(MiniBillar || (MiniBillar = {}));
