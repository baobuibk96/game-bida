var MiniBillar;
(function (MiniBillar) {
  class AudioManager {
    static init(game) {
      AudioManager.game = game;
      AudioManager.loopPlayingKey = null;
      AudioManager.audioSprite =
        AudioManager.game.add.audioSprite("audio-sprite");
      AudioManager.ballHitEffectPlayedTime = AudioManager.game.time.time;
      AudioManager.cushionHitEffectPlayedTime = AudioManager.game.time.time;
      AudioManager.pocketHitEffectPlayedTime = AudioManager.game.time.time;
      AudioManager.runningTime = false;
      AudioManager.game.sound.mute = MiniBillar.GameVars.gameData.musicMuted;
    }
    static switchAudio() {
      MiniBillar.GameVars.gameData.musicMuted =
        !MiniBillar.GameVars.gameData.musicMuted;
      AudioManager.game.sound.mute = MiniBillar.GameVars.gameData.musicMuted;
      MiniBillar.GameManager.writeGameData();
    }
    static playEffect(key, volume) {
      if (key === null || typeof key === "undefined") {
        return;
      }
      if (key === AudioManager.TIME_RUNNING_OUT) {
        if (AudioManager.runningTime) {
          return;
        } else {
          AudioManager.runningTime = true;
        }
      }
      let omitEffect = false;
      if (key === AudioManager.BALL_HIT) {
        if (
          AudioManager.game.time.time - AudioManager.ballHitEffectPlayedTime <
          AudioManager.MIN_TIME
        ) {
          omitEffect = true;
        } else {
          AudioManager.ballHitEffectPlayedTime = AudioManager.game.time.time;
        }
      } else if (key === AudioManager.CUSHION_HIT) {
        if (
          AudioManager.game.time.time -
            AudioManager.cushionHitEffectPlayedTime <
          AudioManager.MIN_TIME
        ) {
          omitEffect = true;
        } else {
          AudioManager.cushionHitEffectPlayedTime = AudioManager.game.time.time;
        }
      } else if (key === AudioManager.POCKET) {
        if (
          AudioManager.game.time.time - AudioManager.pocketHitEffectPlayedTime <
          AudioManager.MIN_TIME
        ) {
          omitEffect = true;
        } else {
          AudioManager.pocketHitEffectPlayedTime = AudioManager.game.time.time;
        }
      }
      if (!omitEffect) {
        AudioManager.audioSprite.play(key, volume);
      }
    }
    static stopEffect(key, fade) {
      if (key === null || typeof key === "undefined") {
        return;
      }
      if (key === AudioManager.TIME_RUNNING_OUT) {
        AudioManager.runningTime = false;
      }
      if (fade) {
        const sound = AudioManager.audioSprite.get(key);
        sound.fadeOut(850);
      } else {
        AudioManager.audioSprite.stop(key);
      }
    }
    static playMusic(key, loop, volume) {
      loop = loop || false;
      volume = volume || 1;
      if (loop) {
        if (
          AudioManager.loopPlayingKey &&
          AudioManager.loopPlayingKey !== key
        ) {
          AudioManager.stopMusic(AudioManager.loopPlayingKey, true, true);
        }
      }
      if (key !== this.loopPlayingKey) {
        AudioManager.audioSprite.play(key, volume);
        AudioManager.loopPlayingKey = key;
      }
    }
    static stopMusic(key, fade, loop) {
      if (key === null || typeof key === "undefined") {
        return;
      }
      if (fade) {
        const sound = this.audioSprite.get(key);
        sound.fadeOut(850);
      } else {
        AudioManager.audioSprite.stop(key);
      }
      if (loop) {
        AudioManager.loopPlayingKey = null;
      }
    }
  }
  AudioManager.BALL_HIT = "ball_hit";
  AudioManager.POCKET = "pocket";
  AudioManager.CUSHION_HIT = "cushion_hit";
  AudioManager.LOSE_POINTS = "lose_points";
  AudioManager.CUE_HIT = "cue_hit";
  AudioManager.POCKET_ADD_TIME = "pocket_add_time";
  AudioManager.BTN_NORMAL = "click_btn";
  AudioManager.GIFT_CARD_SWISH = "gift_card_swish";
  AudioManager.GIFT_OPENS = "gift_opens";
  AudioManager.LOSE = "lose";
  AudioManager.WIN = "win";
  AudioManager.MUSIC_MATCH_MINIBILLARD = "music_match_minibilliard";
  AudioManager.MUSIC_MINIBILLARD = "music_minibilliard";
  AudioManager.TIME_RUNNING_OUT = null;
  AudioManager.MIN_TIME = 75;
  MiniBillar.AudioManager = AudioManager;
})(MiniBillar || (MiniBillar = {}));
