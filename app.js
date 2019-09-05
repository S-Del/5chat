"use strict";

const users = require("./users.js");
const rooms = require("./rooms.js");
const systemLogger = require("./log.js").systemLogger;

const server = require("http").createServer((req, res) => {
  res.writeHead(200);
  res.end();
});

const io = require("socket.io")(server, { cookie: false });
const PORT = process.env.PORT || 8080;

server.listen(PORT, () => {
  systemLogger.info("Socketサービス開始 ポート番号: " + PORT);
});

io.on("connection", (socket) => {
//  // 同一IPからの接続を切断
//  if (users.is_duplicate_ip(socket.handshake.address)) {
//    socket.emit("ip_alert", "既に同じipが存在するので切断します");
//    socket.disconnect(true);
//  }

  // 接続時の初期処理(ユーザ情報・部屋一覧の更新)
  users.init_user_info(socket.id, users.format_ip(socket.handshake.address));
  socket.emit("update_header_info", users.get(socket.id));
  socket.emit("update_room_list", rooms.map);

  // 切断
  socket.on("disconnect", (reason) => {
    systemLogger.info(users.get_ip(socket.id) + ": 切断");
    rooms.delete_user(socket.id);
    users.delete_user(socket.id, reason);
  });

  // 名前変更要求
  socket.on("change_name", (new_name) => {
    systemLogger.info(users.get_ip(socket.id)
                      + ": 名前 - 変更要求 ("
                      + users.get(socket.id).name
                      + " -> "
                      + new_name.name
                      + ")");
    if (users.is_interval_short(socket.id)) {
      return;
    }

    users.change_name(socket.id, new_name);
    socket.emit("update_header_info", users.get(socket.id));
  });

  // 部屋一覧更新要求
  socket.on("relord_list", () => {
    systemLogger.info(users.get_ip(socket.id) + ": 部屋一覧 - 更新要求");
    if (users.is_interval_short(socket.id)) {
      return;
    }

    socket.emit("update_room_list", rooms.map);
  });

  // 部屋新規作成要求
  socket.on("create_new_room", (new_room_info) => {
    systemLogger.info(users.get_ip(socket.id)
                      + ": 部屋 - 新規作成要求 ("
                      + new_room_info.input_room_name
                      + ")");
    if (users.is_interval_short(socket.id)) {
      return;
    }

    if (Object.keys(new_room_info).length != 2) {
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

    socket.emit("accept_entry_room", room_id, rooms.map[room_id]);
    socket.emit("update_room_list", rooms.map);
  });

  // 部屋参加要求
  socket.on("join_room", (room_id) => {
    systemLogger.info(users.get_ip(socket.id) + ": 部屋 - 参加要求 (" + room_id + ")");
    if (!rooms.map[room_id]) {
      socket.emit("update_room_list", rooms.map);
      return;
    }

    if (rooms.map[room_id].users[socket.id]) {
      return;
    }

    socket.join(room_id);
    rooms.map[room_id].users[socket.id] = users.get(socket.id);
    socket.emit("accept_entry_room", room_id, rooms.map[room_id]);
    io.to(room_id).emit("update_nop", Object.keys(rooms.map[room_id].users).length);
  });

  // 部屋発言要求
  socket.on("send_to_room", (room_message) => {
    systemLogger.info(users.get_ip(socket.id) + ": 部屋 - 発言要求 (" + room_message.room_id + ")");
    if (users.is_interval_short(socket.id)) {
      return;
    }

    if (Object.keys(room_message).length != 2) {
      return;
    }

    if (!rooms.map[room_message.room_id]) {
      return;
    }

    if (!rooms.map[room_message.room_id].users[socket.id]) {
      return;
    }

    room_message.input_room = room_message.input_room.slice(0, 60);
    if (users.is_blank(room_message.input_room)) {
      return;
    }

    room_message.user = users.get(socket.id);
    rooms.update_room(room_message);
    room_message.no = rooms.map[room_message.room_id].messages.length;
    rooms.update_power(room_message.room_id);
    room_message.power = rooms.map[room_message.room_id].power;

    io.to(room_message.room_id).emit("message_room", room_message);
  });

  // 退室要求
  socket.on("leave_room", (room_id) => {
    systemLogger.info(users.get_ip(socket.id) + ": 部屋 - 退室要求 (" + room_id + ")");
    if (!rooms.map[room_id]) {
      return;
    }

    delete rooms.map[room_id].users[socket.id];
    socket.leave(room_id);
    io.to(room_id).emit("update_nop", Object.keys(rooms.map[room_id].users).length);

    rooms.delete_empty_room(room_id);
    socket.emit("update_room_list", rooms.map);
  });

  // ラウンジチャット発言要求
  socket.on("send_to_lounge", (message_text) => {
    systemLogger.info(users.get_ip(socket.id) + ": ラウンジチャット - 発言要求");
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