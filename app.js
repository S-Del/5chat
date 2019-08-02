"use strict";

let users = require("./users.js");
let rooms = require("./rooms.js");

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

io.on("connection", (socket) => {
//  // 同一IPからの接続を切断
//  if (is_duplicate_ip(socket.handshake.address)) {
//    socket.emit("ip_alert", "既に同じipが存在するので切断します");
//    socket.disconnect(true);
//  }

  // 接続時の初期処理(ユーザ情報・部屋一覧の更新)
  users.init_user_info(socket);
  socket.emit("update_header_info", users.get(socket.id));
  socket.emit("update_room_list", rooms.map);
  console.log("---------- " + socket.id + " Connected ----------");

  // 切断
  socket.on("disconnect", (reason) => {
    rooms.delete_user(socket.id);
    users.delete_user(socket.id);
    console.log("---------- " + socket.id + " Disconnected: " + reason + " ----------");
  });

  // 名前変更要求
  socket.on("change_name", (new_name) => {
    if (users.is_interval_short(socket.id)) {
      return;
    }
    users.change_name(socket.id, new_name);
    socket.emit("update_header_info", users.get(socket.id));
  });

  // 部屋一覧更新要求
  socket.on("relord_list", () => {
    if (users.is_interval_short(socket.id)) {
      return;
    }
    socket.emit("update_room_list", rooms.map);
  });

  // 部屋新規作成要求
  socket.on("create_new_room", (new_room_info) => {
    if (users.is_interval_short(socket.id)) {
      return;
    }

    if (users.is_blank(new_room_info.input_room_name)) {
      return;
    }

    if (users.is_blank(new_room_info.input_room_description)) {
      new_room_info.input_room_description = "説明なし";
    }

    let room_id = rooms.create_new_room(new_room_info, socket.id, users.get(socket.id));

    socket.join(room_id);
    console.log("---------- " + socket.id + " Join Room: " + rooms.map[room_id].name + " ----------");

    socket.emit("accept_entry_room", room_id, rooms.map[room_id]);
    socket.emit("update_room_list", rooms.map);

    // ↓てすと↓
    rooms.put_all_users(room_id);
    // ↑てすと↑
  });

  // 部屋参加要求
  socket.on("join_room", (room_id) => {
    if (!rooms.map[room_id]) {
      socket.emit("update_room_list", rooms.map);
      return;
    }

    socket.join(room_id);
    console.log("---------- " + socket.id + " Join Room: " + rooms.map[room_id].name + " ----------");

    rooms.map[room_id].users[socket.id] = users.get(socket.id);
    socket.emit("accept_entry_room", room_id, rooms.map[room_id]);

    // ↓てすと↓
    rooms.put_all_users(room_id);
    // ↑てすと↑
  });

  // 部屋発言要求
  socket.on("send_to_room", (room_message) => {
    if (users.is_interval_short(socket.id)) {
      return;
    }

    room_message.input_room = room_message.input_room.slice(0, 60);
    if (users.is_blank(room_message.input_room)) {
      return;
    }

    room_message.user = users.get(socket.id);
    rooms.update_room(room_message);
    room_message.no = rooms.map[room_message.room_id].messages.length;

    io.to(room_message.room_id).emit("message_room", room_message);
  });

  // 退室要求
  socket.on("leave_room", (room_id) => {
    if (!rooms.map[room_id]) {
      return;
    }

    delete rooms.map[room_id].users[socket.id];
    socket.leave(room_id);
    console.log("---------- " + socket.id + " Leave Room: " + rooms.map[room_id].name + " ----------");

    rooms.delete_empty_room(room_id);
    socket.emit("update_room_list", rooms.map);
  });

  // ラウンジチャット発言要求
  socket.on("send_to_lounge", (message_text) => {
    if (users.is_interval_short(socket.id)) {
      return;
    }

    message_text = message_text.slice(0, 60);
    if (users.is_blank(message_text)) {
      return;
    }

    let user_info = users.get(socket.id);
    user_info.content = message_text;

    rooms.update_lounge(user_info);

    user_info.no = rooms.lounge.messages.length;
    io.emit("message_lounge", user_info);
  });
});
