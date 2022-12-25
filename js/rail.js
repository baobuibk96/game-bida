var MiniBillar;
(function (MiniBillar) {
  class Rail extends Phaser.Group {
    constructor(game, cards, railType) {
      super(game, null, "rail");
      this.railSocketWidth = 0;
      this.tweening = false;
      this.cardArray = [];
      const cardsScale = 0.8;
      this.railWidth = 0;
      this.borderWidth = 25;
      this.x = this.borderWidth;
      this.originalPreviewXPos = null;
      this.lastPreviewXProgress = 0;
      let i = 0;
      for (let card of cards) {
        let rewardCard = new MiniBillar.RewardCard(
          this.game,
          0,
          0,
          card.id,
          MiniBillar.RewardsManager.getCardPoints(card.id),
          false,
          true
        );
        rewardCard.setParentRail(this);
        rewardCard.scale.x *= cardsScale;
        rewardCard.scale.y *= cardsScale;
        this.railSocketWidth = rewardCard.width;
        rewardCard.x = i * this.railSocketWidth + this.railSocketWidth * 0.5;
        this.railWidth += this.railSocketWidth;
        this.add(rewardCard);
        this.cardArray.push(rewardCard);
        this.bringToTop(rewardCard);
        i++;
      }
    }
    scrollStepped(steps, useTween = true) {
      if (this.tweening) {
        return;
      }
      this.tweening = true;
      const diff = steps - this.lastPreviewXProgress;
      steps = diff;
      let px = this.x - this.railSocketWidth * steps;
      this.originalPreviewXPos = null;
      const maxX = this.borderWidth;
      const minX = -(
        this.railWidth -
        (MiniBillar.GameVars.gameWidth - this.borderWidth)
      );
      let reachedEdge = false;
      if (steps < 0) {
        if (px >= maxX) {
          reachedEdge = true;
          px = maxX;
        }
      } else {
        if (px <= minX) {
          reachedEdge = true;
          px = minX;
        }
      }
      if (useTween) {
        this.game.add
          .tween(this)
          .to(
            {
              x: px,
            },
            Math.abs(diff) < 0.1 ? (reachedEdge ? 650 : 10) : 650,
            Phaser.Easing.Cubic.Out,
            true
          )
          .onComplete.add(function () {
            this.tweening = false;
          }, this);
      } else {
        this.x = px;
        this.tweening = false;
      }
      this.lastPreviewXProgress = 0;
    }
    scrollPreview(distance) {
      if (this.tweening) {
        return;
      }
      if (!this.originalPreviewXPos) {
        this.originalPreviewXPos = this.x;
      }
      let px = this.originalPreviewXPos - this.railSocketWidth * distance;
      this.lastPreviewXProgress = distance;
      this.x = px;
    }
  }
  MiniBillar.Rail = Rail;
})(MiniBillar || (MiniBillar = {}));
