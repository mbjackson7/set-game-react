const { Server } = require("socket.io");
console.log(process.env.PORT);
const port = process.env.PORT || 3000;
const io = new Server(port, {
  cors: {
    origin: "*",
  },
});

const colors = ["red", "green", "purple"];
const shapes = ["oval", "squiggle", "diamond"];
const numbers = [1, 2, 3];
const shadings = ["solid", "striped", "outlined"];
var gameRooms = {};
var gameRoomsPrivate = {};

function initializeGame(roomId, existingPlayers = []) {
  // create a deck
  console.log("initializing game for room", roomId);
  let newDeck = [];
  colors.forEach((color) => {
    shapes.forEach((shape) => {
      numbers.forEach((number) => {
        shadings.forEach((shading) => {
          newDeck.push({
            shape: shape,
            color: color,
            number: number,
            shading: shading,
          });
        });
      });
    });
  });
  // shuffle the deck
  newDeck.sort(() => Math.random() - 0.5);
  let startingCards = newDeck.slice(0, 12);
  newDeck = newDeck.slice(12);

  while (!isSetOnTable(startingCards)) {
    const newCards = newDeck.slice(0, 3);
    newDeck = newDeck.slice(3);
    startingCards = startingCards.concat(newCards);
  }

  gameRooms[roomId] = {
    gameState: "waiting",
    scores: {},
    players: existingPlayers,
    onTable: startingCards,
    selected: [],
    overflowLevel: 0,
  };

  for (let i = 0; i < existingPlayers.length; i++) {
    gameRooms[roomId].scores[existingPlayers[i]] = 0;
  }

  gameRoomsPrivate[roomId] = {
    deck: newDeck,
    timerID: "",
    deleteTimerID: "",
  };
}

function isSet(cards) {
  const shapeSet = new Set();
  const colorSet = new Set();
  const numberSet = new Set();
  const shadingSet = new Set();
  cards.forEach((card) => {
    shapeSet.add(card.shape);
    colorSet.add(card.color);
    numberSet.add(card.number);
    shadingSet.add(card.shading);
  });
  return (
    shapeSet.size !== 2 &&
    colorSet.size !== 2 &&
    numberSet.size !== 2 &&
    shadingSet.size !== 2
  );
}

function isSetOnTable(cards) {
  for (let i = 0; i < cards.length; i++) {
    for (let j = i + 1; j < cards.length; j++) {
      for (let k = j + 1; k < cards.length; k++) {
        if (isSet([cards[i], cards[j], cards[k]])) {
          return true;
        }
      }
    }
  }
  return false;
}

io.on("connection", (socket) => {
  //  User joins room

  socket.on("create-room", () => {
    // Generate random room 4 digit room code
    let roomId = Math.floor(1000 + Math.random() * 9000);
    while (gameRooms[roomId] !== undefined) {
      roomId = Math.floor(1000 + Math.random() * 9000);
    }
    socket.emit("room-created", roomId);
  });

  socket.on("join-room", (roomId, userId) => {
    if (
      gameRoomsPrivate[roomId] !== undefined &&
      gameRoomsPrivate[roomId].deleteTimerID !== ""
    ) {
      clearTimeout(gameRoomsPrivate[roomId].deleteTimerID);
      gameRoomsPrivate[roomId].deleteTimerID = "";
    }

    socket.join(roomId);
    socket.onAny((eventName, ...args) => {
      console.log(userId, "->", eventName, args);
    });
    socket.onAnyOutgoing((eventName) => {
      console.log(userId, "<-", eventName);
    });
    if (gameRooms[roomId] === undefined) {
      console.log("initializing game for room", roomId);
      initializeGame(roomId);
    }
    if (gameRooms[roomId].players.includes(userId)) {
      console.log("user", userId, "already in room", roomId);
      socket.emit("already-in-room");
      socket.leave(roomId);
      return;
    }
    if (gameRooms[roomId].scores[userId] === undefined) {
      console.log("adding user", userId, "to room", roomId);
      gameRooms[roomId].scores[userId] = 0;
    }

    gameRooms[roomId].players.push(userId);
    console.log("joining room", roomId, "as user", userId);

    io.to(roomId).emit("user-connected", userId, gameRooms[roomId]);

    // User starts game
    socket.on("start-game", (config) => {
      if (gameRooms[roomId] === undefined) {
        return;
      }
      gameRooms[roomId].drawThree = config?.drawThree ?? false;
      gameRooms[roomId].timeLimit = config?.timeLimit ?? 10;
      gameRoomsPrivate[roomId].setPoints = config?.setPoints ?? 1;
      gameRoomsPrivate[roomId].timeOutPenalty = config?.timeOutPenalty ?? 1;
      gameRoomsPrivate[roomId].wrongSetPenalty = config?.wrongSetPenalty ?? 1;
      gameRooms[roomId].gameState = "in-progress";
      io.to(roomId).emit("game-started", gameRooms[roomId]);
    });

    // User calls set
    socket.on("call-set", () => {
      if (gameRooms[roomId].gameState === "in-progress") {
        gameRooms[roomId].gameState = userId;
        io.to(roomId).emit("set-called", userId);
        gameRoomsPrivate[roomId].timerID = setTimeout(() => {
          if (gameRooms[roomId].gameState === userId) {
            gameRooms[roomId].gameState = "in-progress";
            gameRooms[roomId].scores[userId] -= gameRoomsPrivate[roomId].timeOutPenalty;
            gameRooms[roomId].selected = [];
            io.to(roomId).emit("set-not-found", gameRooms[roomId], userId);
          }
        }, gameRooms[roomId].timeLimit * 1000);
      }
    });

    socket.on("select", (index) => {
      console.log("user", userId, "selected card", index, "in room", roomId);
      if (
        gameRooms[roomId].selected.length < 3 &&
        gameRooms[roomId].gameState === userId
      ) {
        if (gameRooms[roomId].selected.includes(index)) {
          gameRooms[roomId].selected = gameRooms[roomId].selected.filter(
            (i) => i !== index
          );
          io.to(roomId).emit("card-deselected", index);
          return;
        }
        gameRooms[roomId].selected.push(index);
        io.to(roomId).emit("card-selected", index);
        if (gameRooms[roomId].selected.length === 3) {
          console.log(gameRooms[roomId].selected);
          console.log(gameRooms[roomId].onTable.length);
          clearTimeout(gameRoomsPrivate[roomId].timerID);
          gameRooms[roomId].gameState = "in-progress";
          let cards = gameRooms[roomId].selected.map(
            (index) => gameRooms[roomId].onTable[index]
          );
          console.log(cards);
          if (isSet(cards)) {
            gameRooms[roomId]["scores"][userId] += gameRoomsPrivate[roomId].setPoints;
            if (gameRooms[roomId].onTable.length <= 12) {
              gameRooms[roomId].selected.forEach((index) => {
                gameRooms[roomId].onTable[index] =
                  gameRoomsPrivate[roomId].deck.pop();
              });
            } else {
              gameRooms[roomId].overflowLevel -= 1;
              gameRooms[roomId].onTable = gameRooms[roomId].onTable.filter(
                (card) => !cards.includes(card)
              );
            }

            gameRooms[roomId].selected = [];
            gameRooms[roomId].onTable = gameRooms[roomId].onTable.filter(
              (card) => card !== undefined
            );

            while (!isSetOnTable(gameRooms[roomId].onTable)) {
              if (gameRoomsPrivate[roomId].deck.length === 0) {
                setTimeout(() => {
                  gameRooms[roomId].gameState = "game-over";
                  io.to(roomId).emit("game-over", gameRooms[roomId]);
                  return;
                }, 3000);
                break;
              }
              const newCards = gameRoomsPrivate[roomId].deck.slice(0, 3);
              gameRoomsPrivate[roomId].deck =
                gameRoomsPrivate[roomId].deck.slice(3);
              gameRooms[roomId].onTable =
                gameRooms[roomId].onTable.concat(newCards);
              gameRooms[roomId].overflowLevel += 1;
            }

            io.to(roomId).emit("set-found", gameRooms[roomId], userId);
          } else {
            gameRooms[roomId].selected = [];
            gameRooms[roomId]["scores"][userId] -= 1;
            io.to(roomId).emit("set-not-found", gameRooms[roomId], userId);
          }
        }
      }
    });

    socket.on("draw-three", () => {
      if (gameRoomsPrivate[roomId].deck.length > 0) {
        const newCards = gameRoomsPrivate[roomId].deck.slice(0, 3);
        gameRoomsPrivate[roomId].deck = gameRoomsPrivate[roomId].deck.slice(3);
        gameRooms[roomId].onTable = gameRooms[roomId].onTable.concat(newCards);
        gameRooms[roomId].overflowLevel += 1;
        console.log("added", newCards, "to room", roomId);
        io.to(roomId).emit("cards-added", gameRooms[roomId]);
      }
    });

    socket.on("play-again", () => {
      console.log("playing again in room", roomId);
      initializeGame(roomId, gameRooms[roomId].players);
      io.to(roomId).emit("game-started", gameRooms[roomId]);
    });

    // User disconnects
    socket.on("disconnect", () => {
      console.log("user", userId, "disconnected from room", roomId);
      if (gameRooms[roomId] === undefined) {
        return;
      }
      gameRooms[roomId].players = gameRooms[roomId].players.filter(
        (player) => player !== userId
      );
      socket.to(roomId).emit("user-disconnected", userId);
    });
  });
});

// Delete room when all users leave to save memory
io.of("/").adapter.on("delete-room", (room) => {
  console.log("deleting room", room);
  if (gameRoomsPrivate[room] === undefined) {
    return;
  }
  gameRoomsPrivate[room].deleteTimerID = setTimeout(() => {
    delete gameRooms[room];
    delete gameRoomsPrivate[room];
  }, 60000 * 12);
});

console.log(`Server listening on port ${port}`);
