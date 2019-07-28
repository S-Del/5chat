"use strict";

let crypto = require("crypto");
let express = require("express");
let helmet = require("helmet");
let app = express();
let server = require("http").Server(app);
let io = require("socket.io")(server, { cookie: false });
const PORT = process.env.PORT || 8080;

app.use(helmet());
app.use(express.static("public"));
app.use((req, res) => {
  res.sendStatus(404);
});

server.listen(PORT, () => {
  console.log("Server is Listening. Port: " + PORT);
});

let users = {};
let rooms = {};
let lounge = {
  part: 1,
  res_no: 0
};

io.on("connection", (socket) => {
  console.log("---------- " + socket.id + " Connected ----------");
  init_user_info(socket);
  socket.emit("update_room_list", rooms);
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

  socket.on("relord_list", () => {
    socket.emit("update_room_list", rooms);
  });

  socket.on("create_new_room", (new_room_info) => {
    if (is_blank(new_room_info.input_room_name)) {
      return;
    }

    if (is_blank(new_room_info.input_room_description)) {
      new_room_info.input_room_description = "説明なし";
    }

    let new_room = {
      name: new_room_info.input_room_name,
      desc: new_room_info.input_room_description.slice(0, 60),
      owner: socket.id,
      res_no: 0,
      power: 0,
      users: {}
    };
    new_room.users[socket.id] = {
      name: users[socket.id].name,
      id: users[socket.id].id,
      power: users[socket.id].power
    };

    let sha512 = crypto.createHash("sha512");
    // 要変更(ipと部屋名だけではだめ)
    sha512.update(users[socket.id].ip + new_room.name);
    let room_id = sha512.digest("hex");

    rooms[room_id] = new_room;

    socket.join(room_id);
//    console.log(rooms[room_id].users);
  });

  socket.on("join_room", (room_id) => {
    // roomが存在するかを確認
    console.log(rooms[room_id]);
  });

  socket.on("send_to_lounge", (message_text) => {
    message_text = message_text.slice(0, 60);
    if (is_blank(message_text)) {
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
 * 接続が確立した時のユーザー情報初期化用
 * ユーザー名とIDを設定してクライアントに送信する
 * 設定したユーザー情報はusers{}に保存される
 */
function init_user_info(socket) {
  let name = "名無しさん";

  // 取得したipアドレスが "Pv4射影IPv6アドレス" 形式の場合はIPv6部分を取り除く
  let ip = socket.handshake.address;
  let idx = ip.lastIndexOf(":");
  if (idx != -1) {
    ip = ip.slice(idx + 1);
  }

  let sha512 = crypto.createHash("sha512");
  sha512.update(ip);
  let id = sha512.digest("base64").slice(0, 10);

  let new_user = {
    name: name,
    ip: ip,
    id: id,
    power: 0
  };

  users[socket.id] = new_user;
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
 * ユーザーの入力が空であるかを検証する
 *
 * ユーザーが入力した文字列が
 * ・空文字("")
 * ・null
 * ・undefined
 * ・空白のみ("  "等)
 * かを検証し、空文字列・空白の連続などであった場合はtrueを返す。
 * そうで無ければfalseを返す。
 *
 * @param {string} user_input: ユーザーが入力した文字列
 * @return {boolean} 問題があればtrue、無ければfalse
 */
function is_blank(user_input) {
  if (!user_input) {
    return true;
  }

  let regex = /^[\s\n\r\t]+$/;
  if (regex.test(user_input)) {
    return true;
  }

  return false;
}


/**
 * ユーザー名変更用
 * トリップが入力されている場合は名前に付加する
 */
function change_name(name, trip) {
  if (is_blank(name)) {
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
