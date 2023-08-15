const { Server } = require("socket.io");

const io = new Server(3000, {
  cors: {
    origin: '*'
  }
});

io.on("connection", (socket) => {
  // User starts a room
  socket.on("create-room", (roomId, userId) => {
    socket.join(roomId);
    socket.to(roomId).broadcast.emit("user-connected", userId);
  });
  
  
  //joins an existing room
  socket.on("join-room", (roomId, userId) => {
    socket.join(roomId);
    socket.to(roomId).broadcast.emit("user-connected", userId);

    // User sends a message
    socket.on("message", (message) => {
      io.to(roomId).emit("createMessage", message);
    });

    // User disconnects
    socket.on("disconnect", () => {
      socket.to(roomId).broadcast.emit("user-disconnected", userId);
    });
  }
  );

});

console.log("Server listening on port 3000");