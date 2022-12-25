var MiniBillar;
(function (MiniBillar) {
  class Avatar extends Phaser.Group {
    constructor(game, avatarName) {
      super(game, null, "avatar");
      avatarName = avatarName || "billar_m01";
      this.name = avatarName;
      this.scale.set(
        MiniBillar.GameVars.scaleXMult,
        MiniBillar.GameVars.scaleYMult
      );
      this.button = new Phaser.Button(
        this.game,
        0,
        0,
        "texture_atlas_1",
        this.onDown,
        this
      );
      this.button.input.pixelPerfectClick = true;
      this.button.input.pixelPerfectOver = true;
      this.button.input.pixelPerfectAlpha = 0.5;
      this.button.anchor.set(0.5);
      this.button.setFrames(
        "btn_avatar_unselected_on.png",
        "btn_avatar_unselected_off.png",
        "btn_avatar_unselected_on.png",
        "btn_avatar_unselected_off.png"
      );
      this.add(this.button);
      this.selectionRing = new Phaser.Image(
        this.game,
        0,
        0,
        "texture_atlas_1",
        "avatar_unselected_frame.png"
      );
      this.selectionRing.anchor.set(0.5);
      this.add(this.selectionRing);
      const avatar = new Phaser.Image(
        this.game,
        0,
        0,
        "texture_atlas_5",
        avatarName + ".png"
      );
      avatar.anchor.set(0.5, 0.325);
      avatar.scale.set(0.7);
      this.add(avatar);
      const mask = new Phaser.Graphics(this.game);
      mask.beginFill(0xffffff);
      mask.drawCircle(0, 0, 130);
      this.add(mask);
      avatar.mask = mask;
    }
    deselect() {
      this.button.setFrames(
        "btn_avatar_unselected_on.png",
        "btn_avatar_unselected_off.png",
        "btn_avatar_unselected_on.png",
        "btn_avatar_unselected_off.png"
      );
      this.selectionRing.frameName = "avatar_unselected_frame.png";
    }
    select() {
      MiniBillar.PlayerRegisteringState.currentInstance.currentlySelectedAvatar =
        this;
      MiniBillar.GameManager.avatarSelected(this.name);
      this.button.setFrames(
        "btn_avatar_selected.png",
        "btn_avatar_selected.png",
        "btn_avatar_selected.png",
        "btn_avatar_selected.png"
      );
      this.selectionRing.frameName = "avatar_selected_frame.png";
    }
    onDown() {
      MiniBillar.AudioManager.playEffect(MiniBillar.AudioManager.BTN_NORMAL);
      if (
        MiniBillar.PlayerRegisteringState.currentInstance
          .currentlySelectedAvatar
      ) {
        if (
          MiniBillar.PlayerRegisteringState.currentInstance
            .currentlySelectedAvatar !== this
        ) {
          MiniBillar.PlayerRegisteringState.currentInstance.currentlySelectedAvatar.deselect();
          this.select();
        }
      }
    }
  }
  MiniBillar.Avatar = Avatar;
})(MiniBillar || (MiniBillar = {}));
