let crypto = require("crypto");
let express = require("express");
let app = express();
let server = require("http").Server(app);
let io = require("socket.io")(server, { cookie: false });
const PORT = process.env.PORT || 8080;

let users = {};
let rooms = {};
let lounge = {
  part: 1,
  res_no: 0
};

server.listen(PORT, () => {
  console.log("Server is Listening. Port: " + PORT);
});

app.disable('x-powered-by');

app.use(express.static("public"));
app.use((req, res) => {
  res.sendStatus(404);
});

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

  socket.on("send_to_lounge", (message_text) => {
    message_text = message_text.slice(0, 60);
    if (!validate_message(message_text)) {
      return;
    }

    lounge.res_no++;
    if (lounge.res_no > 1000) {
      lounge.res_no = 1;
      lounge.part++;
    }

    let message = {
      no: lounge.res_no,
      name: users[socket.id].name,
      id: users[socket.id].id,
      content: message_text
    };

    io.emit("message_lounge", message);
  });
});


/**
 * ユーザーが入力した文字列を検証する
 *
 * 入力に問題が無ければtrue、
 * 空文字列・空白の連続などであった場合はfalseを返す。
 */
function validate_message(message_text) {
  if (!message_text) {
    return false;
  }

  let regex = /^[\s\n\r\t]+$/;
  if (regex.test(message_text)) {
    return false;
  }

  return true;
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
 * ユーザー名変更用
 * トリップが入力されている場合は名前に付加する
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
 * 接続者数が増えるほど重くなる機能（のはず）
 * name, id, ip等全て表示される
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
    if (users[key].ip == socket.handshake.address) {
      socket.emit("ip_alert", "既に同じipが存在するので切断します");
      socket.disconnect(true);
      return;
    }
  }
}
