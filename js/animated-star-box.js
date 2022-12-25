var MiniBillar;
(function (MiniBillar) {
  class AnimatedStarBox extends Phaser.Group {
    constructor(game, useFixedTexture) {
      super(game, null, "animated-star-box");
      this.starsDistBetween = 60;
      this.scale.set(
        MiniBillar.GameVars.scaleXMult,
        MiniBillar.GameVars.scaleYMult
      );
      this.boxContainerImage = new Phaser.Image(
        game,
        0,
        0,
        "texture_atlas_1",
        useFixedTexture ? "box_stars_fixed.png" : "box_stars.png"
      );
      this.boxContainerImage.anchor.set(0.5);
      this.add(this.boxContainerImage);
      this.starImages = [];
      if (useFixedTexture) {
        this.createStarsSmallVersion(-26, 0, "star_void.png");
      } else {
        this.createStars(-15, 0, "star_void.png");
      }
      if (!useFixedTexture) {
        this.giftBox = new MiniBillar.GiftBox(game, 120, 25);
        this.add(this.giftBox);
      }
    }
    setStarActive(star) {
      this.starImages[star].frameName = "star_full.png";
      this.starImages[star].visible = true;
    }
    animateStarToFullScale(index) {
      this.starImages[index].frameName = "star_full.png";
      this.starImages[index].scale.set(0);
      this.game.add.tween(this.starImages[index].scale).to(
        {
          x: 1,
          y: 1,
        },
        500,
        Phaser.Easing.Elastic.Out,
        true,
        500
      );
      this.game.time.events.add(
        Phaser.Timer.SECOND * 0.75,
        function () {
          const sparkleSprite = new Phaser.Sprite(
            this.game,
            this.starImages[index].x,
            this.starImages[index].y,
            "texture_atlas_1"
          );
          sparkleSprite.anchor.set(0.5);
          const sparkleFrames = MiniBillar.Utils.createAnimFramesArr(
            "sparkle_effect",
            14,
            false,
            0,
            15
          );
          sparkleSprite.animations
            .add("sparkle", sparkleFrames)
            .play(24, false, true);
          this.add(sparkleSprite);
          this.swapChildren(sparkleSprite, this.starImages[index]);
        },
        this
      );
    }
    animateGiftBox() {
      let rattleFrame = 0;
      const rattleFPS = 0.6;
      this.game.add
        .tween(this.giftBox)
        .to(
          {
            angle: 0,
          },
          750,
          Phaser.Easing.Elastic.Out,
          true
        )
        .onUpdateCallback(function () {
          rattleFrame += rattleFPS;
          let s = Math.sin(rattleFrame);
          const rattleAngle = 10;
          this.giftBox.angle = s * rattleAngle;
        }, this)
        .onComplete.add(function () {
          this.game.add.tween(this.giftBox.scale).to(
            {
              x: 1,
              y: 1,
            },
            750,
            Phaser.Easing.Cubic.Out,
            true
          );
          this.fadeOutStarsBox();
          this.game.add
            .tween(this.giftBox)
            .to(
              {
                x: this.giftBox.x - 120,
                y: this.giftBox.y - 120,
              },
              750,
              Phaser.Easing.Cubic.Out,
              true
            )
            .onComplete.add(function () {
              this.giftBox.openGiftBox();
            }, this);
        }, this);
    }
    createStars(x, y, imageName) {
      for (let i = 0; i < 3; i++) {
        const boxContainerImage = new Phaser.Image(
          this.game,
          x + this.starsDistBetween * (i - 1),
          y,
          "texture_atlas_1",
          imageName
        );
        boxContainerImage.anchor.set(0.5);
        this.starImages.push(boxContainerImage);
        this.add(this.starImages[i]);
      }
    }
    fadeOutStarsBox() {
      for (let i = 0; i < this.starImages.length; i++) {
        this.game.add.tween(this.starImages[i]).to(
          {
            alpha: 0,
          },
          750,
          Phaser.Easing.Cubic.Out,
          true
        );
      }
      this.game.add.tween(this.boxContainerImage).to(
        {
          alpha: 0,
        },
        750,
        Phaser.Easing.Cubic.Out,
        true
      );
    }
    createStarsSmallVersion(x, y, imageName) {
      this.starsDistBetween = 34;
      for (let i = 0; i < 3; i++) {
        const boxContainerImage = new Phaser.Image(
          this.game,
          x + this.starsDistBetween * (i - 1),
          y,
          "texture_atlas_1",
          imageName
        );
        boxContainerImage.anchor.set(0.5);
        boxContainerImage.scale.set(0.6);
        boxContainerImage.visible = false;
        this.starImages.push(boxContainerImage);
        this.add(this.starImages[i]);
      }
    }
  }
  MiniBillar.AnimatedStarBox = AnimatedStarBox;
})(MiniBillar || (MiniBillar = {}));
