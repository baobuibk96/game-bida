var MiniBillar;
(function (MiniBillar) {
  class GuideContainer extends Phaser.Group {
    constructor(game) {
      super(game, null, "guide-container");
      GuideContainer.currentInstance = this;
      this.guide = new Phaser.Graphics(this.game);
      this.add(this.guide);
      this.prohibitedBalls = [];
      this.guideWidth = 2;
      this.guideAlpha = 1;
      this.alpha = 0;
      this.game.add.tween(this).to(
        {
          alpha: 1,
        },
        300,
        Phaser.Easing.Cubic.Out,
        true
      );
    }
    update() {
      super.update();
      if (MiniBillar.GameVars.shotRunning || !MiniBillar.GameVars.startMatch) {
        return;
      }
      this.guide.lineStyle(this.guideWidth, 0xffffff, this.guideAlpha);
      let cueBallPos = MiniBillar.GameVars.ballArray[0].position;
      let distantPoint = cueBallPos.plus(
        MiniBillar.CueContainer.currentInstance.aimDirectionVector.times(5e5)
      );
      let distantPointPosition = new Billiard.Point(
        distantPoint.x,
        distantPoint.y
      );
      let intersectedBalls = [];
      let intersectionPoints = [];
      let cueBallCenter = new Billiard.Point(cueBallPos.x, cueBallPos.y);
      for (let i = 1, ln = MiniBillar.GameVars.ballArray.length; i < ln; i++) {
        let ball = MiniBillar.GameVars.ballArray[i];
        if (ball.active) {
          let ballPosition = new Billiard.Point(
            ball.position.x,
            ball.position.y
          );
          let intersection = Billiard.Maths.lineIntersectCircle(
            cueBallCenter,
            distantPointPosition,
            ballPosition,
            2 * MiniBillar.GameConstants.BALL_RADIUS
          );
          if (intersection.intersects) {
            intersectedBalls.push(ball);
            if (intersection.enter !== null) {
              intersectionPoints.push(intersection.enter);
            }
          }
        }
      }
      let touchedBall;
      let circleCenter = null;
      if (intersectedBalls.length > 0) {
        let minSquaredDistance = 1e10;
        for (let i = 0, ln = intersectedBalls.length; i < ln; i++) {
          let squaredDistance =
            (intersectedBalls[i].position.x - cueBallPos.x) *
              (intersectedBalls[i].position.x - cueBallPos.x) +
            (intersectedBalls[i].position.y - cueBallPos.y) *
              (intersectedBalls[i].position.y - cueBallPos.y);
          if (squaredDistance < minSquaredDistance) {
            minSquaredDistance = squaredDistance;
            touchedBall = intersectedBalls[i];
            circleCenter = intersectionPoints[i];
          }
        }
        this.guide.clear();
        this.guide.lineStyle(this.guideWidth, 0xffffff, this.guideAlpha);
        this.guide.moveTo(
          cueBallPos.x * MiniBillar.GameConstants.PHYS_SCALE,
          cueBallPos.y * MiniBillar.GameConstants.PHYS_SCALE
        );
        if (circleCenter) {
          this.guide.lineTo(
            circleCenter.x * MiniBillar.GameConstants.PHYS_SCALE,
            circleCenter.y * MiniBillar.GameConstants.PHYS_SCALE
          );
        }
        let drawTrajectoryLines = true;
        if (
          MiniBillar.GameVars.gameMode !== MiniBillar.GameConstants.SOLO_MODE
        ) {
          if (!MiniBillar.GameVars.laserGuideActive) {
            if (this.isBallProhibited(touchedBall.id)) {
              this.guide.lineStyle(
                this.guideWidth * 1.35,
                0xff0000,
                this.guideAlpha
              );
              drawTrajectoryLines = false;
            }
          }
        }
        if (circleCenter) {
          this.guide.drawCircle(
            circleCenter.x * MiniBillar.GameConstants.PHYS_SCALE,
            circleCenter.y * MiniBillar.GameConstants.PHYS_SCALE,
            2 *
              MiniBillar.GameConstants.BALL_RADIUS *
              MiniBillar.GameConstants.PHYS_SCALE
          );
        }
        if (drawTrajectoryLines) {
          if (!circleCenter) {
            this.guide.clear();
            return;
          }
          let w = Billiard.Maths.findBearing(
            circleCenter.x - cueBallPos.x,
            circleCenter.y - cueBallPos.y
          );
          let b = Billiard.Maths.findBearing(
            touchedBall.position.x - circleCenter.x,
            touchedBall.position.y - circleCenter.y
          );
          let P = Math.abs(Billiard.Maths.angleDiff(b, w));
          let touchedBallLineLength =
            5 * MiniBillar.GameConstants.BALL_RADIUS * ((90 - P) / 90);
          if (MiniBillar.GameVars.laserGuideActive) {
            touchedBallLineLength = 80000;
          }
          let touchedBallLineEnd = new Billiard.Point(
            touchedBall.position.x +
              Math.cos((b * Math.PI) / 180) * touchedBallLineLength,
            touchedBall.position.y +
              Math.sin((b * Math.PI) / 180) * touchedBallLineLength
          );
          this.guide.lineStyle(this.guideWidth, 0xffffff, this.guideAlpha);
          this.guide.moveTo(
            touchedBall.position.x * MiniBillar.GameConstants.PHYS_SCALE,
            touchedBall.position.y * MiniBillar.GameConstants.PHYS_SCALE
          );
          this.guide.lineTo(
            touchedBallLineEnd.x * MiniBillar.GameConstants.PHYS_SCALE,
            touchedBallLineEnd.y * MiniBillar.GameConstants.PHYS_SCALE
          );
          let C = Billiard.Maths.findBearing(
            circleCenter.x - cueBallPos.x,
            circleCenter.y - cueBallPos.y
          );
          let T = Billiard.Maths.findBearing(
            touchedBallLineEnd.x - circleCenter.x,
            touchedBallLineEnd.y - circleCenter.y
          );
          P = Billiard.Maths.angleDiff(T, C);
          let whiteBallLineEnd =
            (5 * MiniBillar.GameConstants.BALL_RADIUS * P) / 90;
          if (MiniBillar.GameVars.laserGuideActive) {
            whiteBallLineEnd = 80000 * P;
          }
          let E = T - 90;
          let M = new Billiard.Point(
            circleCenter.x + whiteBallLineEnd * Math.cos((E * Math.PI) / 180),
            circleCenter.y + whiteBallLineEnd * Math.sin((E * Math.PI) / 180)
          );
          this.guide.lineStyle(this.guideWidth, 0xffffff, this.guideAlpha);
          this.guide.moveTo(
            circleCenter.x * MiniBillar.GameConstants.PHYS_SCALE,
            circleCenter.y * MiniBillar.GameConstants.PHYS_SCALE
          );
          this.guide.lineTo(
            M.x * MiniBillar.GameConstants.PHYS_SCALE,
            M.y * MiniBillar.GameConstants.PHYS_SCALE
          );
        }
      } else {
        for (let i = 0; i < 4; i++) {
          const intersection = Billiard.Maths.lineIntersectLine(
            cueBallCenter,
            distantPointPosition,
            MiniBillar.StageContainer.CUSHION_VERTEXES[i],
            MiniBillar.StageContainer.CUSHION_VERTEXES[i + 1]
          );
          if (intersection) {
            circleCenter = intersection;
          }
        }
        if (circleCenter) {
          this.guide.clear();
          this.guide.lineStyle(this.guideWidth, 0xffffff, this.guideAlpha);
          this.guide.moveTo(
            cueBallPos.x * MiniBillar.GameConstants.PHYS_SCALE,
            cueBallPos.y * MiniBillar.GameConstants.PHYS_SCALE
          );
          this.guide.lineTo(
            circleCenter.x * MiniBillar.GameConstants.PHYS_SCALE,
            circleCenter.y * MiniBillar.GameConstants.PHYS_SCALE
          );
          this.guide.drawCircle(
            circleCenter.x * MiniBillar.GameConstants.PHYS_SCALE,
            circleCenter.y * MiniBillar.GameConstants.PHYS_SCALE,
            2 *
              MiniBillar.GameConstants.BALL_RADIUS *
              MiniBillar.GameConstants.PHYS_SCALE
          );
        }
      }
    }
    setGuideProhibitedBalls(ballIds, prohibited) {
      for (let i = 0; i < ballIds.length; i++) {
        const index = this.prohibitedBalls.indexOf(ballIds[i]);
        if (prohibited) {
          if (index < 0) {
            this.prohibitedBalls.push(ballIds[i]);
          }
        } else {
          if (index > -1) {
            this.prohibitedBalls.splice(index, 1);
          }
        }
      }
    }
    isBallProhibited(ballId) {
      return this.prohibitedBalls.indexOf(ballId) > -1;
    }
  }
  MiniBillar.GuideContainer = GuideContainer;
})(MiniBillar || (MiniBillar = {}));
