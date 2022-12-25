var MiniBillar;
(function (MiniBillar) {
  class SwitchButton extends Phaser.Group {
    constructor(game, isOn, typeSwitch) {
      super(game, null, "switch-button");
      this.isOn = isOn;
      this.typeSwitch = typeSwitch;
      const button = new Phaser.Button(
        this.game,
        0,
        0,
        "texture_atlas_1",
        this.onDown,
        this
      );
      button.anchor.set(0.5);
      this.add(button);
      if (this.isOn) {
        button.setFrames(
          "btn_switch_on_on.png",
          "btn_switch_on_off.png",
          "btn_switch_on_on.png",
          "btn_switch_on_off.png"
        );
      } else {
        button.setFrames(
          "btn_switch_off_on.png",
          "btn_switch_off_off.png",
          "btn_switch_off_on.png",
          "btn_switch_off_off.png"
        );
      }
    }
    onDown(button) {
      MiniBillar.AudioManager.playEffect(MiniBillar.AudioManager.BTN_NORMAL);
      this.isOn = !this.isOn;
      if (this.isOn) {
        button.setFrames(
          "btn_switch_on_on.png",
          "btn_switch_on_off.png",
          "btn_switch_on_on.png",
          "btn_switch_on_off.png"
        );
      } else {
        button.setFrames(
          "btn_switch_off_on.png",
          "btn_switch_off_off.png",
          "btn_switch_off_on.png",
          "btn_switch_off_off.png"
        );
      }
      if (this.typeSwitch === SwitchButton.MUSIC) {
        MiniBillar.AudioManager.switchAudio();
      } else if (this.typeSwitch === SwitchButton.POWER) {
        MiniBillar.GameManager.changePowerBar();
      }
      MiniBillar.AudioManager.playEffect(MiniBillar.AudioManager.BTN_NORMAL);
    }
  }
  SwitchButton.MUSIC = "music";
  SwitchButton.POWER = "power";
  MiniBillar.SwitchButton = SwitchButton;
})(MiniBillar || (MiniBillar = {}));
