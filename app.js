let express = require("express");
let app = express();
app.use(express.static("public"));
app.use((req, res) => {
  res.sendStatus(404);
});
let server = require("http").Server(app);

const socketio = require("socket.io")(server);
socketio.on("connection", function(socket) {
  socket.on("message", function(msg) {
    console.log("message: " + msg);
    socketio.emit("message", msg);
  });
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, function() {
  console.log("Server is Listening. Port: " + PORT);
});
