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

  // 切断
  socket.on("disconnect", (reason) => {
    delete users[socket.id];
    console.log("---------- " + socket.id + " Disconnected: " + reason + " ----------");
  });

  // 名前変更要求
  socket.on("change_name", (name, trip) => {
    if (is_interval_short(socket)) {
      return;
    }
    users[socket.id].name = change_name(name, trip);
    update_user_info(socket);
  });

  // 部屋一覧更新要求
  socket.on("relord_list", () => {
    if (is_interval_short(socket)) {
      return;
    }
    socket.emit("update_room_list", rooms);
  });

  // 部屋新規作成要求
  socket.on("create_new_room", (new_room_info) => {
    if (is_interval_short(socket)) {
      return;
    }

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
    sha512.update(socket.id + new_room.name + Date.now());
    let room_id = sha512.digest("hex");

    rooms[room_id] = new_room;

    socket.join(room_id);
    socket.emit("update_room_list", rooms);
  });

  // 部屋参加要求
  socket.on("join_room", (room_id) => {
    if (!rooms[room_id]) {
      socket.emit("update_room_list", rooms);
      return;
    }

    socket.join(room_id);
    rooms[room_id].users[socket.id] = {
      name: users[socket.id].name,
      id: users[socket.id].id,
      power: users[socket.id].power
    }
    socket.emit("accept_entry_room", rooms[room_id]);

// ↓test↓
//    console.log(socket.adapter.rooms);
//    console.log(rooms[room_id].users);
    put_room_users(room_id);
// ↑test↑
  });

  // ラウンジチャット発言要求
  socket.on("send_to_lounge", (message_text) => {
    if (is_interval_short(socket)) {
      return;
    }

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
    last_input: 0,
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
 * ユーザーの送信間隔を検証する
 *
 * 連投等の防止用
 * とりあえず1.5秒としている
 *
 * @param {socket} socket : ユーザーを識別するためのソケットオブジェクト
 * @return {boolean} : 間隔が短い場合はtrue、問題が無ければfalse。
 */
function is_interval_short(socket) {
  let diff = Date.now() - users[socket.id].last_input;
  if (diff < 1500) {
    return true;
  }

  users[socket.id].last_input = Date.now();
  return false;
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
 * 現在接続しているユーザーの情報を出力する
 *
 * 主にテスト用
 * 接続者数が増えるほど重くなる機能（のはず）
 * name, id, ip等全て表示される
 */
function put_users() {
  console.log("users:");
  console.log(users);
  console.log("-------------------------------------------------------------------------------");
}


/**
 * 部屋内のユーザーを出力する
 *
 * 主にテスト用
 * @param {string} room_id: 部屋を識別するためのID文字列
 */
function put_room_users(room_id) {
  if (!rooms[room_id]) {
    console.log("その部屋は存在しません");
    return;
  }

  console.log(rooms[room_id].users);
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
