let crypto = require("crypto");

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
  console.log("---------- " + socket.id + " Connected ----------");
  init_user_info(socket);
  put_users();

  socket.on("disconnect", (reason) => {
    delete users[socket.id];
    console.log("---------- " + socket.id + " Disconnected: " + reason + " ----------");
    put_users();
  });

  socket.on("change_name", (name, trip) => {
    users[socket.id].name = change_name(name, trip);
    update_user_info(socket);
    put_users();
  });

});


/**
 * header等に表示されるユーザー情報を送信して更新する
 * 今のところはユーザー名とIDのみ
 */
function update_user_info(socket) {
  socket.emit("update_user_info", {
    name: users[socket.id].name,
    id: users[socket.id].id
  });
}


/**
 * 接続が確立した時のユーザー情報初期化用
 * ユーザー名とIDを設定してクライアントに送信する
 * 設定したユーザー情報はusers[]に保存される
 */
function init_user_info(socket) {
  let connect_user = {};
  connect_user.name = "名無しさん";

  // 取得したipアドレスが "Pv4射影IPv6アドレス" 形式の場合はIPv6部分を取り除く
  connect_user.ip = socket.handshake.address;
  let idx = connect_user.ip.lastIndexOf(":");
  if (idx != -1) {
    connect_user.ip = connect_user.ip.slice(idx + 1);
  }

  let sha512 = crypto.createHash("sha512");
  sha512.update(connect_user.ip);
  connect_user.id = sha512.digest("base64").slice(0, 10);

  users[socket.id] = connect_user;
  update_user_info(socket);
}


/**
 * ユーザー名変更用
 * トリップが存在する場合は名前に付加する
 */
function change_name(name, trip) {
  if (!name) {
    name = "名無しさん";
  }
  name = name.slice(0, 16).replace(/◆/g, "■");

  if (trip.length >= 3) {
    let salt = trip.slice(1, 3);
    let key = crypto.createCipher("des", trip);
    key.update(trip, "utf-8", "base64");
    trip = "◆" + key.final("base64").slice(0, 10);
    name += trip;
  }

  return name;
}


/**
 * 現在接続しているユーザーの情報を表示する
 * id, ip, name等全て表示される
 */
function put_users() {
  console.log("users:");
  console.log(users);
  console.log("-------------------------------------------------------------------------------");
}


/**
 * 同一IPからの接続を切断する
 * 接続者数が増えるほど重くなる機能（のはず）
 * 有効、無効を切り替える場合はheader.jsの"ip_alert"イベントも切り替えること
 * ※現在使用していない
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
