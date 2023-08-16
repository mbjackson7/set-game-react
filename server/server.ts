const { Server } = require("socket.io");

const io = new Server(3000, {
  cors: {
    origin: "*",
  },
});

const colors = ["red", "green", "purple"];
const shapes = ["oval", "squiggle", "diamond"];
const numbers = [1, 2, 3];
const shadings = ["solid", "striped", "outlined"];
var gameRooms = {};

function initializeGame(roomId) {
  // create a deck
  console.log("initializing game for room", roomId)
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

  gameRooms[roomId] = {
    scores: {},
    deck: newDeck,
    onTable: startingCards,
    selected: [],
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

function isSetOnTable(cards){
  for (let i = 0; i < cards.length; i++) {
    for (let j = i+1; j < cards.length; j++) {
      for (let k = j+1; k < cards.length; k++) {
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
    socket.join(roomId);
    socket.onAny((eventName, ...args) => {
      console.log(userId, "->", eventName, args);
    });
  
    socket.onAnyOutgoing((eventName, ...args) => {
      console.log(userId, "<-", eventName, args);
    });

    if (gameRooms[roomId] === undefined) {
      initializeGame(roomId);
    }
    if (gameRooms[roomId].scores[userId] === undefined) {
      console.log("adding user", userId, "to room", roomId)
      gameRooms[roomId].scores[userId] = 0;
    }
    console.log("joining room", roomId, "as user", userId)
    
    io.to(roomId).emit("user-connected", userId);

    // User starts game
    socket.on("start-game", () => {
      console.log("game started for room", roomId)
      io.to(roomId).emit("game-started", gameRooms[roomId]);
    });

    // User calls set
    socket.on("set-called", () => {
      const timeoutID = setTimeout(() => {
        if (gameRooms[roomId]['scores'][userId] > 0) {
          gameRooms[roomId]['scores'][userId] -= 1;
        }
        socket.off("select");
        return;
      }, 10000);

      socket.on("select", (card) => {
        if (gameRooms[roomId].selected.length < 3) {
          gameRooms[roomId].selected.push(card);
          io.to(roomId).emit("card-selected", card);
          if (gameRooms[roomId].selected.length === 3) {
            clearTimeout(timeoutID);
            socket.off("select");
            if (isSet(gameRooms[roomId].selected)) {
              gameRooms[roomId]['scores'][userId] += 1;
              gameRooms[roomId].selected.forEach((card) => {
                const index = gameRooms[roomId].onTable.indexOf(card);
                gameRooms[roomId].onTable[index] = gameRooms[roomId].deck.pop();
              });
              gameRooms[roomId].selected = [];
              gameRooms[roomId].onTable = gameRooms[roomId].onTable.filter(
                (card) => card !== undefined
              );
              io.to(roomId).emit("set-found", gameRooms[roomId]);
              if (!isSetOnTable(gameRooms[roomId].onTable)) {
                io.to(roomId).emit("game-over", gameRooms[roomId]);
              }
            } else {
              gameRooms[roomId].selected = [];
              gameRooms[roomId]['scores'][userId] -= 1;
              io.to(roomId).emit("set-not-found", gameRooms[roomId]);
            }
            gameRooms[roomId].selected = [];
            
          }
        }
      });
    });

    socket.on("request-cards", () => {
      if (gameRooms[roomId].deck.length > 0) {
        const newCards = gameRooms[roomId].deck.slice(0, 3);
        gameRooms[roomId].deck = gameRooms[roomId].deck.slice(3);
        gameRooms[roomId].onTable = gameRooms[roomId].onTable.concat(newCards);
        io.to(roomId).emit("cards-added", newCards);
      }
    });

    // User disconnects
    socket.on("disconnect", () => {
      socket.to(roomId).emit("user-disconnected", userId);
    });
  });
});

// Delete room when all users leave to save memory
io.of("/").adapter.on("delete-room", (room) => {
  delete gameRooms[room];
});

console.log("Server listening on port 3000");
