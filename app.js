let express = require("express");
let app = express();
let server = require("http").Server(app);
let io = require("socket.io")(server, { cookie: false });
const PORT = process.env.PORT || 8080;

server.listen(PORT, () => {
  console.log("Server is Listening. Port: " + PORT);
});

app.disable('x-powered-by');

app.use(express.static("public"));
app.use((req, res) => {
  res.sendStatus(404);
});

let users = {};

io.on("connection", (socket) => {
  console.log("-----" + socket.id + " Connected-----");

//  // 同一IPからの接続を切断する
//  // 接続者数が増えるほど重くなる機能のはずなので無効
//  kick_duplicate_ip(socket);

  let user = {};
  user.ip = socket.handshake.address;
  users[socket.id] = user;
  put_users();

  socket.on("disconnect", (reason) => {
    delete users[socket.id];
    console.log("-----" + socket.id + " is " + reason + " Disconnected-----")
    put_users();
  });

  socket.on("user_name", (name) => {
    console.log("Input UserName: " + name);
    users[socket.id].name = name.slice(0, 15);
    put_users();
  });

});


/**
 * 現在接続しているユーザーの情報を表示する
 * socket_id, user_ip, user_name等全て表示される
 */
function put_users() {
  console.log("users:");
  console.log(users);
  console.log("-------------------------------------------------------------------------------");
}


/**
 * 同一IPからの接続を切断する
 * 有効、無効を切り替える場合はname.jsの"ip_alert"イベントも切り替えること
 */
function kick_duplicate_ip(socket) {
  for (let key in users) {
    console.log(users[key].ip);
    console.log(socket.handshake.address);
    if (users[key].ip == socket.handshake.address) {
      socket.emit("ip_alert", "既に同じipが存在するので切断します");
      socket.disconnect(true);
      return;
    }
  }
}
