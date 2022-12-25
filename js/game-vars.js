var MiniBillar;
(function (MiniBillar) {
  class GameVars {
    static extractLineArrayString() {
      const lineArray = [];
      for (let i = 0; i < GameVars.lineArray.length; i++) {
        lineArray.push({
          name: GameVars.lineArray[i].name,
          direction: {
            x: GameVars.lineArray[i].direction.x,
            y: GameVars.lineArray[i].direction.y,
          },
          normal: {
            x: GameVars.lineArray[i].normal.x,
            y: GameVars.lineArray[i].normal.y,
          },
          p1: {
            x: GameVars.lineArray[i].p1.x,
            y: GameVars.lineArray[i].p1.y,
          },
          p2: {
            x: GameVars.lineArray[i].p2.x,
            y: GameVars.lineArray[i].p2.y,
          },
          p3: {
            x: GameVars.lineArray[i].p3.x,
            y: GameVars.lineArray[i].p3.y,
          },
          p4: {
            x: GameVars.lineArray[i].p4.x,
            y: GameVars.lineArray[i].p4.y,
          },
          p5: {
            x: GameVars.lineArray[i].p5.x,
            y: GameVars.lineArray[i].p5.y,
          },
          p6: {
            x: GameVars.lineArray[i].p6.x,
            y: GameVars.lineArray[i].p6.y,
          },
        });
      }
      return JSON.stringify(lineArray);
    }
    static extractVertexArrayString() {
      const vertexArray = [];
      for (let i = 0; i < GameVars.vertexArray.length; i++) {
        vertexArray.push({
          name: GameVars.vertexArray[i].name,
          position: {
            x: GameVars.vertexArray[i].position.x,
            y: GameVars.vertexArray[i].position.y,
          },
        });
      }
      return JSON.stringify(vertexArray);
    }
    static extractPocketArrayString() {
      const pocketArray = [];
      for (let i = 0; i < GameVars.pocketArray.length; i++) {
        pocketArray.push({
          id: GameVars.pocketArray[i].id,
          position: {
            x: GameVars.pocketArray[i].position.x,
            y: GameVars.pocketArray[i].position.y,
          },
          dropPosition: {
            x: GameVars.pocketArray[i].dropPosition.x,
            y: GameVars.pocketArray[i].dropPosition.y,
          },
        });
      }
      return JSON.stringify(pocketArray);
    }
    static extractBallsArrayString() {
      const ballsArray = [];
      for (let i = 0; i < GameVars.ballArray.length; i++) {
        ballsArray.push({
          id: GameVars.ballArray[i].id,
          active: GameVars.ballArray[i].active,
          position: {
            x: GameVars.ballArray[i].position.x,
            y: GameVars.ballArray[i].position.y,
          },
        });
      }
      return JSON.stringify(ballsArray);
    }
  }
  GameVars.gameWidth = MiniBillar.GameConstants.GAME_WIDTH;
  GameVars.gameHeight = MiniBillar.GameConstants.GAME_HEIGHT;
  MiniBillar.GameVars = GameVars;
})(MiniBillar || (MiniBillar = {}));
