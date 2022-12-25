var MiniBillar;
(function (MiniBillar) {
  class RewardsManager {
    static init(game) {
      RewardsManager.game = game;
      this.unlockedCards = [];
    }
    static loadAndVerifyCards() {
      const cardsData = this.game.cache.getJSON("card-data");
      this.cardsJSONData = cardsData;
      const loadCardsForFirstTime =
        MiniBillar.GameVars.gameData.statistics.rewards.cards.length === 0;
      if (loadCardsForFirstTime) {
        RewardsManager.populateCardDatabase();
        RewardsManager.initialEquip();
      } else {
        RewardsManager.updateCardDatabase();
      }
      for (let card of MiniBillar.GameVars.gameData.statistics.rewards.cards) {
        let cardTypeMax = this.getMaxForCardType(
          this.getCardType(card.cardName)
        );
        if (card.cardPoints === cardTypeMax) {
          this.updateUnlockedCardsArray(card.cardName);
        }
      }
      MiniBillar.GameManager.writeGameData();
    }
    static getCuesList() {
      let answer = [];
      for (let i = 0; i < this.cardsJSONData.length; i++) {
        if (this.cardsJSONData[i].type === "cue") {
          answer.push(this.cardsJSONData[i].id);
        } else {
          continue;
        }
      }
      if (answer.length === 0) {
        throw "No cues found";
      }
      return answer;
    }
    static getMaxForCardType(type) {
      return type === "cue"
        ? MiniBillar.GameConstants.MIN_PTS_UNLOCK_CUE
        : MiniBillar.GameConstants.MIN_PTS_UNLOCK_TABLE;
    }
    static getCurrentStarProgress() {
      return MiniBillar.GameVars.gameData.statistics.rewards.starProgress;
    }
    static getCueSpriteFrames(cardId) {
      let cardOnDatabase = this.cardsJSONData.filter(
        (obj) => obj.id === cardId
      )[0];
      if (cardOnDatabase.type !== "cue") {
        throw "Cannot request sprite data from table card. Check card_data.json";
      }
      if (cardOnDatabase.spriteFrames) {
        return cardOnDatabase.spriteFrames;
      } else {
        return 1;
      }
    }
    static getCueSpriteIntermittent(cardId) {
      let cardOnDatabase = this.cardsJSONData.filter(
        (obj) => obj.id === cardId
      )[0];
      if (cardOnDatabase.type !== "cue") {
        throw "Cannot request animation data from table card. Check card_data.json";
      }
      return cardOnDatabase.intermittentAnimation;
    }
    static getTableTunnelColour(cardId) {
      let cardOnDatabase = this.cardsJSONData.filter(
        (obj) => obj.id === cardId
      )[0];
      if (cardOnDatabase.type !== "table") {
        throw "Cannot request tunnel colour data from cue card. Check card_data.json";
      }
      if (cardOnDatabase.customTunnelColour) {
        return parseInt(cardOnDatabase.customTunnelColour);
      } else {
        return 0x3a2a3a;
      }
    }
    static getMostLikelyNextCard() {
      let highestCardId = "";
      let highestCardPoints = 0;
      for (let card of MiniBillar.GameVars.gameData.statistics.rewards.cards) {
        if (highestCardPoints <= card.cardPoints) {
          const cardType = this.getCardType(card.cardName);
          const typeMax = this.getMaxForCardType(cardType);
          if (card.cardPoints >= typeMax) {
            continue;
          }
          highestCardId = card.cardName;
          highestCardPoints = card.cardPoints;
        }
      }
      return {
        cardId: highestCardId,
        cardPoints: highestCardPoints,
      };
    }
    static getCardPoints(cardId) {
      const cardOnDatabase =
        MiniBillar.GameVars.gameData.statistics.rewards.cards.filter(
          (obj) => obj.cardName === cardId
        )[0];
      if (cardOnDatabase) {
        return cardOnDatabase.cardPoints;
      } else {
        throw cardId.toString() + " not found in gameData";
      }
    }
    static getCardType(cardId) {
      const cardOnDatabase = this.cardsJSONData.filter(
        (obj) => obj.id === cardId
      )[0];
      if (cardOnDatabase) {
        return cardOnDatabase.type;
      } else {
        throw cardId + " not found in gameData";
      }
    }
    static getRandomCardIds(requestedCardsCount = 3) {
      let cuesAvailable = [];
      let tablesAvailable = [];
      MiniBillar.GameVars.gameData.statistics.rewards.cards.forEach(
        (cardData) => {
          if (RewardsManager.unlockedCards.indexOf(cardData.cardName) < 0) {
            if (RewardsManager.getCardType(cardData.cardName) === "cue") {
              if (
                cardData.cardName !==
                MiniBillar.GameVars.gameData.playerData.equipedCue
              ) {
                cuesAvailable.push(cardData.cardName);
              }
            } else {
              if (
                cardData.cardName !== MiniBillar.GameVars.gameData.equippedTable
              ) {
                tablesAvailable.push(cardData.cardName);
              }
            }
          }
        }
      );
      let selectedCues = new Set();
      while (selectedCues.size < 2 && cuesAvailable.length > 0) {
        const randomIndex = this.game.rnd.integerInRange(
          0,
          cuesAvailable.length - 1
        );
        selectedCues.add(cuesAvailable[randomIndex]);
        cuesAvailable.splice(randomIndex, 1);
      }
      let selectedTables = new Set();
      while (selectedTables.size < 1 && tablesAvailable.length > 0) {
        const randomIndex = this.game.rnd.integerInRange(
          0,
          tablesAvailable.length - 1
        );
        selectedTables.add(tablesAvailable[randomIndex]);
        tablesAvailable.splice(randomIndex, 1);
      }
      return Array.from(selectedCues.values()).concat(
        Array.from(selectedTables.values())
      );
    }
    static resetStarCount() {
      MiniBillar.GameVars.gameData.statistics.rewards.starProgress = 0;
    }
    static unlockAllCards() {
      let cardArray = MiniBillar.GameVars.gameData.statistics.rewards.cards;
      cardArray.forEach((card) => {
        if (
          RewardsManager.unlockedCards.indexOf(card.cardName) < 0 &&
          card.cardName !==
            MiniBillar.GameVars.gameData.playerData.equipedCue &&
          card.cardName !== MiniBillar.GameVars.gameData.equippedTable
        ) {
          const cardType = RewardsManager.getCardType(card.cardName);
          const progMaxValue =
            cardType === "cue"
              ? MiniBillar.GameConstants.MIN_PTS_UNLOCK_CUE
              : MiniBillar.GameConstants.MIN_PTS_UNLOCK_TABLE;
          card.cardPoints = progMaxValue;
          this.updateUnlockedCardsArray(card.cardName);
        }
      });
      MiniBillar.GameManager.writeGameData();
    }
    static equipTable(cardId) {
      if (RewardsManager.getCardType(cardId) !== "table") {
        throw "Cannot equip cue as table";
      } else {
        MiniBillar.GameVars.gameData.equippedTable = cardId;
      }
    }
    static equipCue(cardId) {
      if (RewardsManager.getCardType(cardId) !== "cue") {
        throw "Cannot equip table as cue";
      } else {
        MiniBillar.GameVars.gameData.playerData.equipedCue = cardId;
      }
    }
    static prepareRewardStats() {
      let victoryData = {
        starUnlocked: 0,
        recentlyUnlockedCardIds: [],
        numberOfCardsUnlocked: [],
      };
      if (!MiniBillar.GameVars.gameData.statistics.rewards.allUnlocked) {
        MiniBillar.GameVars.gameData.statistics.rewards.starProgress++;
        const numberOfCardsToUnlock = 3;
        const potentialUnlockableCards = RewardsManager.getRandomCardIds(
          numberOfCardsToUnlock
        );
        if (potentialUnlockableCards.length < 1) {
          MiniBillar.GameVars.gameData.statistics.rewards.allUnlocked = true;
          MiniBillar.GameManager.enterSplash();
        } else {
          victoryData.starUnlocked = 1;
          if (
            MiniBillar.GameVars.gameData.statistics.rewards.starProgress === 2
          ) {
            victoryData.starUnlocked = 2;
          } else if (
            MiniBillar.GameVars.gameData.statistics.rewards.starProgress === 3
          ) {
            victoryData.starUnlocked = 3;
            RewardsManager.resetStarCount();
            victoryData.recentlyUnlockedCardIds = potentialUnlockableCards;
            victoryData.numberOfCardsUnlocked =
              RewardsManager.fillNumberArrayWithIntRange(
                victoryData.recentlyUnlockedCardIds.length,
                MiniBillar.GameConstants.MIN_CARDS_WON_AT_A_TIME,
                MiniBillar.GameConstants.MAX_CARDS_WON_AT_A_TIME
              );
            for (
              let i = 0;
              i < victoryData.recentlyUnlockedCardIds.length;
              i++
            ) {
              RewardsManager.incrementCardPoint(
                victoryData.recentlyUnlockedCardIds[i],
                victoryData.numberOfCardsUnlocked[i]
              );
            }
          }
        }
      }
      return victoryData;
    }
    static incrementCardPoint(cardId, incrementValue) {
      let currentPoints = this.getCardPoints(cardId);
      currentPoints += incrementValue;
      const cardType = RewardsManager.getCardType(cardId);
      const progMaxValue =
        cardType === "cue"
          ? MiniBillar.GameConstants.MIN_PTS_UNLOCK_CUE
          : MiniBillar.GameConstants.MIN_PTS_UNLOCK_TABLE;
      const finalPoints = Math.min(progMaxValue, currentPoints);
      for (
        let i = 0;
        i < MiniBillar.GameVars.gameData.statistics.rewards.cards.length;
        i++
      ) {
        if (
          MiniBillar.GameVars.gameData.statistics.rewards.cards[i].cardName ===
          cardId
        ) {
          RewardsManager.setCardPoints(cardId, finalPoints, cardType);
        }
      }
    }
    static initialEquip() {
      let cueFound = false;
      let tableFound = false;
      for (let i = 0; i < this.cardsJSONData.length; i++) {
        if (!cueFound) {
          if (this.cardsJSONData[i].type === "cue") {
            RewardsManager.setCardPoints(
              this.cardsJSONData[i].id,
              MiniBillar.GameConstants.MIN_PTS_UNLOCK_CUE,
              "cue"
            );
            RewardsManager.equipCue(this.cardsJSONData[i].id);
            cueFound = true;
          } else {
            continue;
          }
        }
        if (!tableFound) {
          if (this.cardsJSONData[i].type === "table") {
            RewardsManager.setCardPoints(
              this.cardsJSONData[i].id,
              MiniBillar.GameConstants.MIN_PTS_UNLOCK_TABLE,
              "table"
            );
            RewardsManager.equipTable(this.cardsJSONData[i].id);
            tableFound = true;
          } else {
            continue;
          }
        }
      }
      if (!cueFound) {
        throw "No cues present";
      }
      if (!tableFound) {
        throw "No tables present";
      }
    }
    static updateUnlockedCardsArray(cardId) {
      if (RewardsManager.unlockedCards.indexOf(cardId) < 0) {
        RewardsManager.unlockedCards.push(cardId);
      }
    }
    static setCardPoints(cardId, points, cardType) {
      for (
        let i = 0;
        i < MiniBillar.GameVars.gameData.statistics.rewards.cards.length;
        i++
      ) {
        if (
          MiniBillar.GameVars.gameData.statistics.rewards.cards[i].cardName ===
          cardId
        ) {
          const cardTypeMax = RewardsManager.getMaxForCardType(cardType);
          if (points >= cardTypeMax) {
            MiniBillar.GameVars.gameData.statistics.rewards.cards[
              i
            ].cardPoints = cardTypeMax;
            this.updateUnlockedCardsArray(cardId);
          } else {
            MiniBillar.GameVars.gameData.statistics.rewards.cards[
              i
            ].cardPoints = points;
          }
          return;
        }
      }
      MiniBillar.GameManager.log("Failed to find " + cardId);
    }
    static updateCardDatabase() {
      let pruneList = [];
      for (let preexistingCards of MiniBillar.GameVars.gameData.statistics
        .rewards.cards) {
        if (
          !MiniBillar.Game.currentInstance.cache.getFrameByName(
            "texture_atlas_5",
            preexistingCards.cardName + ".png"
          )
        ) {
          MiniBillar.GameManager.log(
            "No art for " +
              preexistingCards.cardName +
              ". Removing card from gameData"
          );
          pruneList.push(preexistingCards);
        }
      }
      for (let ri of pruneList) {
        MiniBillar.GameVars.gameData.statistics.rewards.cards =
          MiniBillar.GameVars.gameData.statistics.rewards.cards.filter(
            (obj) => obj !== ri
          );
      }
      for (let c of this.cardsJSONData) {
        if (
          MiniBillar.GameVars.gameData.statistics.rewards.cards.filter(
            (x) => x.cardName === c.id
          ).length < 1
        ) {
          if (
            MiniBillar.Game.currentInstance.cache.getFrameByName(
              "texture_atlas_5",
              c.id + ".png"
            )
          ) {
            MiniBillar.GameManager.log("Adding card_" + c.id);
            MiniBillar.GameVars.gameData.statistics.rewards.cards.push({
              cardName: c.id,
              cardPoints: 0,
            });
          }
        }
      }
    }
    static populateCardDatabase() {
      for (let c of this.cardsJSONData) {
        const cardIdFromJSON = c.id;
        if (
          MiniBillar.Game.currentInstance.cache.getFrameByName(
            "texture_atlas_5",
            cardIdFromJSON + ".png"
          )
        ) {
          MiniBillar.GameManager.log("First time adding card " + c.id);
          MiniBillar.GameVars.gameData.statistics.rewards.cards.push({
            cardName: cardIdFromJSON,
            cardPoints: 0,
          });
        } else {
          MiniBillar.GameManager.log("No art for card " + cardIdFromJSON);
        }
      }
    }
    static fillNumberArrayWithIntRange(count, min, max) {
      let answer = [];
      for (let i = 0; i < count; i++) {
        answer.push(RewardsManager.game.rnd.integerInRange(min, max));
      }
      return answer;
    }
  }
  MiniBillar.RewardsManager = RewardsManager;
})(MiniBillar || (MiniBillar = {}));
