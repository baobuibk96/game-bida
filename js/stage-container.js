var MiniBillar;
(function (MiniBillar) {
  class StageContainer extends Phaser.Group {
    constructor(game) {
      super(game, null, "stage-container");
      StageContainer.currentInstance = this;
      this.scale.set(
        MiniBillar.GameVars.scaleXMult,
        MiniBillar.GameVars.scaleYMult
      );
      this.position.set(MiniBillar.GameVars.gameWidth / 2, 365);
      this.pocketedBallsTrail = new MiniBillar.PocketedBallsTrail(this.game);
      this.add(this.pocketedBallsTrail);
      this.tunnelContainer = new Phaser.Group(this.game);
      if (MiniBillar.GameConstants.DEBUG) {
        this.tunnelContainer.visible = false;
      }
      this.add(this.tunnelContainer);
      const bgName =
        MiniBillar.GameVars.gameData.equippedTable + "_surface.png";
      let tableLayer2 = new Phaser.Image(
        this.game,
        0,
        0,
        "texture_atlas_4",
        bgName
      );
      tableLayer2.anchor.set(0.5);
      if (MiniBillar.GameConstants.DEBUG) {
        tableLayer2.visible = false;
      }
      this.add(tableLayer2);
      let tableLayer1 = new Phaser.Graphics(this.game, 0, 0);
      tableLayer1.beginFill(
        MiniBillar.RewardsManager.getTableTunnelColour(
          MiniBillar.GameVars.gameData.equippedTable
        )
      );
      tableLayer1.drawRect(
        -tableLayer2.width * 0.446,
        -tableLayer2.height * 0.426,
        tableLayer2.width * 0.892,
        tableLayer2.height * 0.852
      );
      this.tunnelContainer.add(tableLayer1);
      this.ballsContainer = new MiniBillar.BallsContainer(this.game);
      this.add(this.ballsContainer);
      this.guideContainer = new MiniBillar.GuideContainer(this.game);
      this.add(this.guideContainer);
      const fgName =
        MiniBillar.GameVars.gameData.equippedTable + "_cushions.png";
      let tableLayer3 = new Phaser.Image(
        this.game,
        0,
        0,
        "texture_atlas_3",
        fgName
      );
      tableLayer3.anchor.set(0.5);
      if (MiniBillar.GameConstants.DEBUG) {
        tableLayer3.visible = false;
      }
      this.add(tableLayer3);
      this.selectPockets = new MiniBillar.SelectPockets(this.game);
      this.add(this.selectPockets);
      this.cueContainer = new MiniBillar.CueContainer(this.game);
      this.add(this.cueContainer);
      if (MiniBillar.GameConstants.DEBUG) {
        this.addDebugObjectsContainer();
      } else {
        this.debugObjectContainer = null;
      }
    }
    static onContact(contactEvent) {
      let ball = contactEvent.ball;
      let contact = {
        collisionType: contactEvent.collisionType,
        type: null,
        target: null,
        targetVelocity: null,
        position: ball.position,
        targetPosition: contactEvent.target.position,
        velocity: null,
        screw: ball.screw,
        deltaScrew: null,
      };
      if (contactEvent.collisionType === Billiard.Engine.BALL) {
        if (
          MiniBillar.GameVars.gameMode !== MiniBillar.GameConstants.SOLO_MODE
        ) {
          if (
            MiniBillar.GameVars.gameMode === MiniBillar.GameConstants.PVP_MODE
          ) {
            MiniBillar.MatchManagerPVP.setTouchedBall(ball.id);
          } else if (
            MiniBillar.GameVars.gameMode === MiniBillar.GameConstants.PVBOT_MODE
          ) {
            MiniBillar.MatchManagerPVBot.setTouchedBall(ball.id);
          }
        }
        contact.target = contactEvent.target;
        contact.targetVelocity = contactEvent.targetVelocity;
        contact.deltaScrew = contactEvent.deltaScrew;
        contact.type = contactEvent.collisionType;
        ball.contactArray.push(contact);
        const relativeVelocity = contactEvent.ballVelocity.minus(
          contactEvent.targetVelocity
        ).magnitude;
        let volumeEffect = relativeVelocity / 6e3;
        volumeEffect = volumeEffect > 1 ? 1 : volumeEffect;
        MiniBillar.AudioManager.playEffect(
          MiniBillar.AudioManager.BALL_HIT,
          volumeEffect
        );
      } else if (
        contactEvent.collisionType === Billiard.Engine.VERTEX ||
        contactEvent.collisionType === Billiard.Engine.LINE
      ) {
        if (
          MiniBillar.GameVars.gameMode !== MiniBillar.GameConstants.SOLO_MODE
        ) {
          if (
            MiniBillar.GameVars.gameMode === MiniBillar.GameConstants.PVP_MODE
          ) {
            MiniBillar.MatchManagerPVP.setTouchedCushion(true);
          }
        }
        ball.contactArray.push(contact);
        MiniBillar.GameVars.wallCollisions.push(ball.id);
        MiniBillar.GameVars.wallCollisions =
          StageContainer.currentInstance.removeDuplicates(
            MiniBillar.GameVars.wallCollisions
          );
        const normalVelocity = contactEvent.normalVelocity.magnitude;
        let volumeEffect = normalVelocity / 6e3;
        volumeEffect = volumeEffect > 1 ? 1 : volumeEffect;
        MiniBillar.AudioManager.playEffect(
          MiniBillar.AudioManager.CUSHION_HIT,
          volumeEffect
        );
      } else if (contactEvent.collisionType === Billiard.Engine.POCKET) {
        ball.active = false;
        ball.contactArray.push(contact);
        const speed = contactEvent.speed;
        if (
          MiniBillar.GameVars.gameMode !== MiniBillar.GameConstants.SOLO_MODE ||
          ball.id === 0
        ) {
          MiniBillar.AudioManager.playEffect(MiniBillar.AudioManager.POCKET);
          if (
            MiniBillar.GameVars.gameMode ===
              MiniBillar.GameConstants.SOLO_MODE &&
            ball.id === 0
          ) {
            MiniBillar.AudioManager.playEffect(
              MiniBillar.AudioManager.LOSE_POINTS
            );
          }
        } else {
          MiniBillar.AudioManager.playEffect(
            MiniBillar.AudioManager.POCKET_ADD_TIME
          );
        }
        StageContainer.currentInstance.playPocketAnimation(contactEvent);
      }
    }
    update() {
      if (
        (MiniBillar.GameVars.paused &&
          MiniBillar.GameVars.gameMode ===
            MiniBillar.GameConstants.SOLO_MODE) ||
        !MiniBillar.GameVars.startMatch
      ) {
        return;
      }
      if (MiniBillar.GameVars.shotRunning) {
        this.billiardEngine.update();
        for (
          let i = 0, ln = MiniBillar.GameVars.ballArray.length;
          i < ln;
          i++
        ) {
          let ball = MiniBillar.GameVars.ballArray[i];
          if (ball.active && ball.velocity.magnitudeSquared !== 0) {
            ball.mc.x = ball.position.x * MiniBillar.GameConstants.PHYS_SCALE;
            ball.mc.y = ball.position.y * MiniBillar.GameConstants.PHYS_SCALE;
            ball.shadow.x =
              ball.mc.x +
              0.35 *
                MiniBillar.GameConstants.BALL_RADIUS *
                MiniBillar.GameConstants.PHYS_SCALE *
                (ball.mc.x / 300);
            ball.shadow.y =
              ball.mc.y +
              0.35 *
                MiniBillar.GameConstants.BALL_RADIUS *
                MiniBillar.GameConstants.PHYS_SCALE *
                (ball.mc.y / 150);
            ball.mc.updateRotation(
              ball.velocity.x * MiniBillar.GameConstants.PHYS_SCALE * ball.grip,
              ball.velocity.y * MiniBillar.GameConstants.PHYS_SCALE * ball.grip,
              ball.ySpin
            );
          }
        }
      }
      super.update();
    }
    start() {
      this.billiardEngine = new Billiard.Engine(
        StageContainer.onContact,
        MiniBillar.GameVars.ballArray,
        MiniBillar.GameVars.lineArray,
        MiniBillar.GameVars.vertexArray,
        MiniBillar.GameVars.pocketArray
      );
      this.billiardEngine.friction = MiniBillar.GameConstants.FRICTION;
      this.billiardEngine.ballRadius = MiniBillar.GameConstants.BALL_RADIUS;
      this.billiardEngine.pocketRadius = MiniBillar.GameConstants.POCKET_RADIUS;
      this.billiardEngine.physScale = MiniBillar.GameConstants.PHYS_SCALE;
      this.billiardEngine.minVelocity = MiniBillar.GameConstants.MIN_VELOCITY;
      this.billiardEngine.cushionRestitution =
        MiniBillar.GameConstants.CUSHION_RESTITUTION;
      this.billiardEngine.ballRestitution =
        MiniBillar.GameConstants.BALL_RESTITUTION;
      this.ballsContainer.startGame();
      this.pocketedBallsTrail.setPocketedBalls();
      this.showCue("starting match");
      if (MiniBillar.GameVars.gameMode === MiniBillar.GameConstants.SOLO_MODE) {
        this.showGuide("your turn");
      } else {
        if (
          MiniBillar.GameVars.currentTurn === MiniBillar.GameConstants.PLAYER
        ) {
          this.showGuide("your turn");
        } else {
          this.hideGuide("not your turn");
        }
      }
    }
    pauseGame() {
      MiniBillar.GameVars.paused = true;
      MiniBillar.AudioManager.stopEffect(
        MiniBillar.AudioManager.TIME_RUNNING_OUT
      );
      this.pocketedBallsTrail.pauseGame();
    }
    resumeGame() {
      MiniBillar.GameVars.paused = false;
      this.pocketedBallsTrail.resumeGame();
    }
    removeDuplicates(arr) {
      let unique_array = [];
      for (let i = 0; i < arr.length; i++) {
        if (unique_array.indexOf(arr[i]) === -1) {
          unique_array.push(arr[i]);
        }
      }
      return unique_array;
    }
    newTurn() {
      this.updateCueSprite();
      this.showCue("Stage container new turn");
      this.cueContainer.aimHelper();
      if (MiniBillar.GameVars.gameMode !== MiniBillar.GameConstants.SOLO_MODE) {
        if (
          MiniBillar.GameVars.currentTurn === MiniBillar.GameConstants.PLAYER
        ) {
          this.showGuide("Stage container new turn and your turn");
        } else {
          this.hideGuide("Stage container new turn and not your turn");
        }
        if (MiniBillar.GameVars.skipShowingPocketAndCue) {
          this.hideGuide("skipShowingPocket");
          this.hideCue("skipShowingPocket");
        }
      } else {
        this.showGuide("Stage container new turn");
      }
      this.ballsContainer.newTurn();
    }
    ballHasBeenShot() {
      this.hideCue("Stage container ball has been shot");
      this.hideGuide("Stage container ball has been shot");
      this.ballsContainer.ballHasBeenShot();
      this.selectPockets.resetSelectedPocket();
    }
    showSetCueBall(reason) {
      if (reason) {
        MiniBillar.GameManager.log(
          "Showing setCueBall because " + reason,
          null,
          "purple"
        );
      }
      this.ballsContainer.setCueBall();
    }
    hideGuide(reason) {
      if (reason) {
        MiniBillar.GameManager.log(
          "Hiding guide because " + reason,
          null,
          "blue"
        );
      }
      this.guideContainer.visible = false;
    }
    showGuide(reason) {
      if (reason) {
        MiniBillar.GameManager.log(
          "Showing guide because " + reason,
          null,
          "orange"
        );
      }
      this.guideContainer.visible = true;
    }
    setGuideProhibitedBalls(ballIds, prohibited) {
      this.guideContainer.setGuideProhibitedBalls(ballIds, prohibited);
    }
    hideCue(reason) {
      if (reason) {
        MiniBillar.GameManager.log(
          "Hiding cue because " + reason,
          null,
          "darkblue"
        );
      }
      this.cueContainer.hideCue();
    }
    updateCueSprite() {
      this.cueContainer.updateCueSprite();
    }
    showCue(reason) {
      if (reason) {
        MiniBillar.GameManager.log(
          "Showing cue because " + reason,
          null,
          "darkorange"
        );
      }
      this.cueContainer.showCueAndUpdatePos();
    }
    showSelectPocket(reason) {
      if (reason) {
        MiniBillar.GameManager.log(
          "Showing pocket selector because " + reason,
          null,
          "green"
        );
      }
      this.selectPockets.showSelectPockets();
    }
    setRivalPocket(pocketId) {
      this.selectPockets.setRivalPocket(pocketId);
    }
    hideSelectPocket(reason) {
      if (reason) {
        MiniBillar.GameManager.log(
          "Hiding pocket selector because " + reason,
          null,
          "darkorange"
        );
      }
      this.selectPockets.hideSelectPockets();
    }
    addBallToTrail(ball) {
      this.pocketedBallsTrail.addBall(ball);
    }
    playPocketAnimation(contactEvent) {
      let ball = contactEvent.ball;
      let pocket = contactEvent.target;
      let speed = contactEvent.speed;
      if (MiniBillar.GameVars.gameMode === MiniBillar.GameConstants.SOLO_MODE) {
        MiniBillar.MatchManagerSolo.ballPocketed(ball);
      } else {
        if (ball.id === 8) {
          MiniBillar.GameVars.pocketIdWhereBlackFell = pocket.id;
        }
        if (
          MiniBillar.GameVars.gameMode === MiniBillar.GameConstants.PVP_MODE
        ) {
          MiniBillar.MatchManagerPVP.ballPocketed(ball);
        } else if (
          MiniBillar.GameVars.gameMode === MiniBillar.GameConstants.PVBOT_MODE
        ) {
          MiniBillar.MatchManagerPVBot.ballPocketed(ball);
        }
      }
      ball.mc.pocketTween = true;
      if (ball.id === 0) {
        ball.shadow.visible = false;
      } else {
        ball.shadow.parent.removeChild(ball.shadow);
      }
      let t;
      if (speed < 1e3) {
        t = 150;
      } else if (speed < 2e3) {
        t = 120;
      } else if (speed < 3e3) {
        t = 90;
      } else if (speed < 5e3) {
        t = 60;
      } else {
        t = 30;
      }
      this.game.add.tween(ball.mc.scale).to(
        {
          x: 0.925,
          y: 0.925,
        },
        t,
        Phaser.Easing.Cubic.Out,
        true
      );
      ball.velocity = new Billiard.Vector2D(
        (pocket.dropPosition.x - ball.mc.x) / t,
        (pocket.dropPosition.y - ball.mc.y) / t
      );
      this.game.add
        .tween(ball.mc)
        .to(
          {
            x: pocket.dropPosition.x * MiniBillar.GameConstants.PHYS_SCALE,
            y: pocket.dropPosition.y * MiniBillar.GameConstants.PHYS_SCALE,
          },
          t,
          Phaser.Easing.Cubic.Out,
          true
        )
        .onComplete.add(function () {
          ball.mc.parent.removeChild(ball.mc);
          this.tunnelContainer.add(ball.mc);
          this.game.add.tween(ball.mc.scale).to(
            {
              x: 0.65,
              y: 0.65,
            },
            1.75 * t,
            Phaser.Easing.Linear.None,
            true
          );
          ball.velocity = new Billiard.Vector2D(
            (0.7 * pocket.dropPosition.x - ball.mc.x) / t,
            (0.7 * pocket.dropPosition.y - ball.mc.y) / t
          );
          let pocketTween = this.game.add.tween(ball.mc).to(
            {
              x:
                0.7 *
                pocket.dropPosition.x *
                MiniBillar.GameConstants.PHYS_SCALE,
              y:
                0.7 *
                pocket.dropPosition.y *
                MiniBillar.GameConstants.PHYS_SCALE,
            },
            1.75 * t,
            Phaser.Easing.Linear.None,
            true
          );
          if (ball.id === 0) {
            if (
              MiniBillar.GameVars.gameMode ===
              MiniBillar.GameConstants.SOLO_MODE
            ) {
              pocketTween.onComplete.add(this.releaseCueBall, this, 0, [
                contactEvent,
              ]);
            } else {
              pocketTween.onComplete.add(function () {
                this.tunnelContainer.removeChild(ball.mc);
                ball.mc.pocketTween = false;
                ball.velocity = new Billiard.Vector2D(0, 0);
              }, this);
            }
          } else {
            pocketTween.onComplete.add(function () {
              this.tunnelContainer.removeChild(ball.mc);
              ball.mc.pocketTween = false;
              ball.velocity = new Billiard.Vector2D(0, 0);
            }, this);
          }
        }, this);
    }
    releaseCueBall(ball, tween, args) {
      const cueBall = MiniBillar.GameVars.ballArray[0];
      const contactEvent = args[0];
      const pocket = contactEvent.target;
      let outPocketId;
      let outVelocity;
      MiniBillar.GameManager.log(pocket.id);
      switch (pocket.id) {
        case 0:
          outPocketId = 5;
          outVelocity = new Billiard.Vector2D(-1, -1).normalize().times(200);
          break;
        case 1:
          outPocketId = 4;
          outVelocity = new Billiard.Vector2D(0, -1).normalize().times(200);
          break;
        case 2:
          outPocketId = 3;
          outVelocity = new Billiard.Vector2D(1, -1).normalize().times(200);
          break;
        case 3:
          outPocketId = 2;
          outVelocity = new Billiard.Vector2D(-1, 1).normalize().times(200);
          break;
        case 4:
          outPocketId = 1;
          outVelocity = new Billiard.Vector2D(0, 1).normalize().times(200);
          break;
        case 5:
          outPocketId = 0;
          outVelocity = new Billiard.Vector2D(1, 1).normalize().times(200);
          break;
        default:
      }
      const outPocket = MiniBillar.GameVars.pocketArray[outPocketId];
      const tweenTime = 200;
      this.game.add.tween(cueBall.mc.scale).to(
        {
          x: 1,
          y: 1,
        },
        tweenTime,
        Phaser.Easing.Linear.None,
        true
      );
      this.game.add
        .tween(cueBall.mc)
        .to(
          {
            x: outPocket.position.x * MiniBillar.GameConstants.PHYS_SCALE,
            y: outPocket.position.y * MiniBillar.GameConstants.PHYS_SCALE,
          },
          tweenTime,
          Phaser.Easing.Linear.None,
          true
        )
        .onComplete.add(function () {
          const x = cueBall.mc.x;
          const y = cueBall.mc.y;
          this.tunnelContainer.removeChild(cueBall.mc);
          this.ballsContainer.add(cueBall.mc);
          cueBall.position.x = x / MiniBillar.GameConstants.PHYS_SCALE;
          cueBall.position.y = y / MiniBillar.GameConstants.PHYS_SCALE;
          cueBall.velocity = outVelocity;
          cueBall.active = true;
          this.game.time.events.add(
            200,
            function () {
              cueBall.mc.pocketTween = false;
              cueBall.shadow.visible = true;
            },
            this
          );
        }, this);
    }
    addDebugObjectsContainer() {
      this.debugObjectContainer = new MiniBillar.DebugObjectsContainer(
        this.game
      );
      this.add(this.debugObjectContainer);
      for (let i = 0; i < MiniBillar.GameVars.pocketArray.length; i++) {
        this.debugObjectContainer.drawPoint(
          MiniBillar.GameVars.pocketArray[i].position,
          MiniBillar.DebugObjectsContainer.RED
        );
        this.debugObjectContainer.drawPoint(
          MiniBillar.GameVars.pocketArray[i].dropPosition,
          MiniBillar.DebugObjectsContainer.GREEN
        );
        this.debugObjectContainer.drawCircle(
          MiniBillar.GameVars.pocketArray[i].position,
          MiniBillar.GameConstants.POCKET_RADIUS,
          MiniBillar.DebugObjectsContainer.WHITE
        );
      }
      for (let i = 0; i < MiniBillar.GameVars.lineArray.length; i++) {
        this.debugObjectContainer.drawLine(
          MiniBillar.GameVars.lineArray[i].p1,
          MiniBillar.GameVars.lineArray[i].p2,
          MiniBillar.DebugObjectsContainer.GREEN
        );
        this.debugObjectContainer.drawLine(
          MiniBillar.GameVars.lineArray[i].p3,
          MiniBillar.GameVars.lineArray[i].p4,
          MiniBillar.DebugObjectsContainer.YELLOW
        );
        this.debugObjectContainer.drawLine(
          MiniBillar.GameVars.lineArray[i].p5,
          MiniBillar.GameVars.lineArray[i].p6,
          MiniBillar.DebugObjectsContainer.BLUE
        );
      }
    }
  }
  StageContainer.CUSHION_VERTEXES = [
    new Billiard.Point(
      -42e3 + MiniBillar.GameConstants.BALL_RADIUS,
      -21e3 + MiniBillar.GameConstants.BALL_RADIUS
    ),
    new Billiard.Point(
      42e3 - MiniBillar.GameConstants.BALL_RADIUS,
      -21e3 + MiniBillar.GameConstants.BALL_RADIUS
    ),
    new Billiard.Point(
      42e3 - MiniBillar.GameConstants.BALL_RADIUS,
      21e3 - MiniBillar.GameConstants.BALL_RADIUS
    ),
    new Billiard.Point(
      -42e3 + MiniBillar.GameConstants.BALL_RADIUS,
      21e3 - MiniBillar.GameConstants.BALL_RADIUS
    ),
    new Billiard.Point(
      -42e3 + MiniBillar.GameConstants.BALL_RADIUS,
      -21e3 + MiniBillar.GameConstants.BALL_RADIUS
    ),
  ];
  MiniBillar.StageContainer = StageContainer;
})(MiniBillar || (MiniBillar = {}));
