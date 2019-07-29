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

let users = require("./users.js");
let rooms = require("./rooms.js");

io.on("connection", (socket) => {
  console.log("---------- " + socket.id + " Connected ----------");
  users.init_user_info(socket);
  socket.emit("update_room_list", rooms.map);

  // 切断
  socket.on("disconnect", (reason) => {
    delete users.map[socket.id];
    console.log("---------- " + socket.id + " Disconnected: " + reason + " ----------");
  });

  // 名前変更要求
  socket.on("change_name", (name, trip) => {
    if (users.is_interval_short(socket)) {
      return;
    }
    users.map[socket.id].name = users.change_name(name, trip);
    users.update_user_info(socket);
  });

  // 部屋一覧更新要求
  socket.on("relord_list", () => {
    if (users.is_interval_short(socket)) {
      return;
    }
    socket.emit("update_room_list", rooms.map);
  });

  // 部屋新規作成要求
  socket.on("create_new_room", (new_room_info) => {
    if (users.is_interval_short(socket)) {
      return;
    }

    if (users.is_blank(new_room_info.input_room_name)) {
      return;
    }

    if (users.is_blank(new_room_info.input_room_description)) {
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
      name: users.map[socket.id].name,
      id: users.map[socket.id].id,
      power: users.map[socket.id].power
    };

    let sha512 = crypto.createHash("sha512");
    sha512.update(socket.id + new_room.name + Date.now());
    let room_id = sha512.digest("hex");

    rooms.map[room_id] = new_room;

    socket.join(room_id);
    socket.emit("update_room_list", rooms.map);
  });

  // 部屋参加要求
  socket.on("join_room", (room_id) => {
    if (!rooms.map[room_id]) {
      socket.emit("update_room_list", rooms.map);
      return;
    }

    socket.join(room_id);
    rooms.map[room_id].users[socket.id] = {
      name: users.map[socket.id].name,
      id: users.map[socket.id].id,
      power: users.map[socket.id].power
    }
    socket.emit("accept_entry_room", rooms[room_id]);

    rooms.put_all_users(room_id);
  });

  // ラウンジチャット発言要求
  socket.on("send_to_lounge", (message_text) => {
    if (users.is_interval_short(socket)) {
      return;
    }

    message_text = message_text.slice(0, 60);
    if (users.is_blank(message_text)) {
      return;
    }

    rooms.lounge.res_no++;
    if (rooms.lounge.res_no > 1000) {
      rooms.lounge.res_no = 1;
      rooms.lounge.part++;
    }

    let message = {
      no: rooms.lounge.res_no,
      name: users.map[socket.id].name,
      id: users.map[socket.id].id,
      content: message_text
    };

    io.emit("message_lounge", message);
  });
});
