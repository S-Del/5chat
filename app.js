'use strict';

const Lounge = require('./modules/lounge/Lounge.js');
const lounge = new Lounge();

const User = require('./modules/user/User.js');
const UserMap = require('./modules/user/UserMap.js');
const userMap = new UserMap();

const Room = require('./modules/room/Room.js');
const RoomMap = require('./modules/room/RoomMap.js');
const roomMap = new RoomMap();

const utils = require('./modules/utils.js');
const systemLogger = require('./modules/logger/logger.js').systemLogger;

const server = require('http').createServer();
const io = require('socket.io')(server, { cookie: false });
const PORT = process.env.PORT || 8080;

/* ------------------------------------------------------------------------- */

server.listen(PORT, () => {
  systemLogger.info('Socketサービス開始 ポート番号: ' + PORT);
});

/* ------------------------------------------------------------------------- */

io.on('connection', (socket) => {
  /*
   * 接続イベント
   * ユーザーをマップに追加し、ヘッダーと部屋一覧の表示を更新する。
   */
  let ip = utils.formatIp(socket.handshake.headers['x-real-ip']);
  let newUser = new User(ip, socket.id);
  systemLogger.info(ip + ': ─── 接続 ─── ' + socket.id);
  userMap.addUser(newUser);
  socket.emit('update_header_info', newUser.getInfo());
  socket.emit('update_room_list', roomMap.getAllRoomsInfo());


  /*
   * 名前変更イベント
   * トリップを含めて名前を変更し、ヘッダーの表示を更新する。
   */
  socket.on('change_name', (name, trip) => {
    const ip = utils.formatIp(socket.handshake.headers['x-real-ip']);
    systemLogger.info(ip + ': 受信 ┬ "change_name"');

    const user = userMap.users[socket.id];
    if (!utils.validateInputInterval(user.lastInput)) {
      systemLogger.warn(ip + ': 警告 └ 短すぎる要求間隔を拒否: "change_name"');
      return;
    }

    if (typeof name != 'string') {
      systemLogger.warn(ip + ': 警告 └ 文字列型ではない引数を受信: name');
      return;
    }

    if (typeof trip != 'string') {
      systemLogger.warn(ip + ': 警告 └ 文字列型ではない引数を受信: trip');
      return;
    }

    user.lastInput = Date.now();

    user.changeName(name, trip);
    socket.emit('update_header_info', user.getInfo());
    systemLogger.info(ip + ': 送信 └ "update_header_info"');
  });


  /*
   * ラウンジチャット書き込みイベント
   * 書き込みの検証と保存後、接続者全員に書き込みの内容が送信される。
   *
   * post 投稿したユーザの情報、書き込み内容が格納されたオブジェクト。
   *   no:      レス番号
   *   name:    書き込みユーザー名
   *   id:      書き込みユーザーのID(ソケットIDではない)
   *   power:   書き込みユーザーの勢い
   *   message: 書き込み内容
   */
  socket.on('send_to_lounge', (message) => {
    const ip = utils.formatIp(socket.handshake.headers['x-real-ip']);
    systemLogger.info(ip + ': 受信 ┬ "send_to_lounge"');

    const user = userMap.users[socket.id];
    if (!utils.validateInputInterval(user.lastInput)) {
      systemLogger.warn(ip + ': 警告 └ 短すぎる要求間隔を拒否: "send_to_lounge"');
      return;
    }

    if (typeof message != 'string') {
      systemLogger.warn(ip + ': 警告 └ 文字列型ではない引数を受信: message');
      return;
    }

    message = message.slice(0, 60);
    if (utils.isBlank(message)) {
      systemLogger.warn(ip + ': 警告 └ 空のメッセージでの発言要求を拒否');
      return;
    }

    user.lastInput = Date.now();

    const post = user.getInfo();
    post.message = message;

    lounge.addPost(ip, post);
    user.addPost('ラウンジ', message);
    systemLogger.info(ip + ': 格納 └ ラウンジでの発言を格納');

    post.no = lounge.posts.length;
    io.emit('update_lounge', post);
    systemLogger.info('全クライアント: 送信 ─ "update_lounge"');
  });


  /*
   * 部屋一覧の更新イベント
   */
  socket.on('reload_list', () => {
    const ip = utils.formatIp(socket.handshake.headers['x-real-ip']);
    systemLogger.info(ip + ': 受信 ┬ "reload_list"');

    const user = userMap.users[socket.id];
    if (!utils.validateInputInterval(user.lastInput)) {
      systemLogger.warn(ip + ': 警告 └ 短すぎる要求間隔を拒否: "reload_list"');
      return;
    }

    user.lastInput = Date.now();

    socket.emit('update_room_list', roomMap.getAllRoomsInfo());
    systemLogger.info(ip + ': 送信 └ "update_room_list"');
  });


  /*
   * 部屋作成イベント
   * 部屋名と説明の検証後、部屋を作成しマップへ保存、
   * オーナーを入室させ一覧の更新を行う。
   */
  socket.on('create_new_room', (name, desc) => {
    const ip = utils.formatIp(socket.handshake.headers['x-real-ip']);
    systemLogger.info(ip + ': 受信 ┬ "create_new_room"');

    const user = userMap.users[socket.id];
    if (!utils.validateInputInterval(user.lastInput)) {
      systemLogger.warn(ip + ': 警告 └ 短すぎる要求間隔を拒否: "create_new_room"');
      return;
    }

    if (typeof name != 'string') {
      systemLogger.warn(ip + ': 警告 └ 文字列型ではない引数を受信: name');
      return;
    }

    if (typeof desc != 'string') {
      systemLogger.warn(ip + ': 警告 └ 文字列型ではない引数を受信: desc');
      return;
    }

    if (utils.isBlank(name)) {
      systemLogger.warn(ip + ': 警告 └ 空の部屋名での部屋作成要求を拒否');
      return;
    }

    user.lastInput = Date.now();

    const newRoom = new Room(name, desc, user);
    roomMap.rooms[newRoom.id] = newRoom;
    socket.join(newRoom.id);

    socket.emit('accept_entry_room', newRoom.id, newRoom.getInfo());
    systemLogger.info(ip + ': 送信 ├ "accept_entry_room"');

    socket.emit('update_room_list', roomMap.getAllRoomsInfo());
    systemLogger.info(ip + ': 送信 └ "update_room_list"');
  });


  /*
   * 入室イベント
   * 部屋の存在の検証後、参加者の情報を保存し参加人数の更新を送信する。
   */
  socket.on('join_room', (roomId) => {
    const ip = utils.formatIp(socket.handshake.headers['x-real-ip']);
    systemLogger.info(ip + ': 受信 ┬ "join_room"');

    const user = userMap.users[socket.id];
    if (!utils.validateInputInterval(user.lastInput)) {
      systemLogger.warn(ip + ': 警告 └ 短すぎる要求間隔を拒否: "join_room"');
      return;
    }

    if (typeof roomId != 'string') {
      systemLogger.warn(ip + ': 警告 └ 文字列型ではない引数を受信: roomId');
      return;
    }

    let room = roomMap.rooms[roomId];
    if (!room) {
      systemLogger.warn(ip + ': 警告 - 存在しない部屋への入室要求を拒否');
      socket.emit('update_room_list', roomMap.getAllRoomsInfo());
      systemLogger.info(ip + ': 送信 └ "update_room_list"');
      return;
    }

    if (room.hasUser(socket.id)) {
      systemLogger.warn(ip + ': 警告 └ 入室済みの部屋への入室要求を拒否');
      return;
    }

    user.lastInput = Date.now();

    room.addUser(user);
    socket.join(roomId);

    socket.emit('accept_entry_room', roomId, room.getInfo());
    systemLogger.info(ip + ': 送信 ├ "accept_entry_room"');

    io.to(roomId).emit('update_nop', room.users.length);
    systemLogger.info(room.name + ': 送信 ─ "update_nop"');
  });


  /*
   * 部屋書き込みイベント
   * 書き込みの検証と保存後、部屋の参加者に新しい投稿を送信する。
   *
   * post 部屋のID、書き込みユーザ情報、書き込み内容が格納されたオブジェクト。
   *   roomId:  部屋のID
   *   no:      レス番号
   *   name:    書き込みユーザー名
   *   id:      書き込みユーザーのID(ソケットIDではない)
   *   power:   書き込みユーザーの勢い
   *   message: 書き込み内容
   */
  socket.on('send_to_room', (roomId, message) => {
    const ip = utils.formatIp(socket.handshake.headers['x-real-ip']);
    systemLogger.info(ip + ': 受信 ┬ "send_to_room"');

    const user = userMap.users[socket.id];
    if (!utils.validateInputInterval(user.lastInput)) {
      systemLogger.warn(ip + ': 警告 └ 短すぎる要求間隔を拒否: "send_to_room"');
      return;
    }

    if (typeof roomId != 'string') {
      systemLogger.warn(ip + ': 警告 └ 文字列型ではない引数を拒否: roomId');
      return;
    }

    if (typeof message != 'string') {
      systemLogger.warn(ip + ': 警告 └ 文字列型ではない引数を拒否: message');
      return;
    }

    const room = roomMap.rooms[roomId];
    if (!room) {
      systemLogger.warn(ip + ': 警告 └ 存在しない部屋の書き込み要求を拒否');
      return;
    }

    if (!room.hasUser(socket.id)) {
      systemLogger.warn(ip + ': 警告 └ 部屋に存在しないユーザーの書き込み要求を拒否');
      return;
    }

    message = message.slice(0, 60);
    if (utils.isBlank(message)) {
      systemLogger.warn(ip + ': 警告 └ 空のメッセージでの発言要求を拒否');
      return;
    }

    user.lastInput = Date.now();

    user.addPost(room.name, message);

    const post = user.getInfo();
    post.message = message;
    room.addPost(ip, post);
    post.no = room.posts.length;
    post.roomId = room.id;
    post.roomPower = room.power;
    systemLogger.info(ip + ': 格納 └ 部屋での発言を格納');

    io.to(roomId).emit('message_room', post);
    systemLogger.info(room.name + ': 送信 ─ "message_room"');
  });


  /*
   * 退室イベント
   * 引数のroomIdで指定された部屋から退室し、
   * 部屋一覧を更新する。
   */
  socket.on('leave_room', (roomId) => {
    const ip = utils.formatIp(socket.handshake.headers['x-real-ip']);
    systemLogger.info(ip + ': 受信 ┬ "leave_room"');

    if (typeof roomId != 'string') {
      systemLogger.warn(ip + ': 警告 └ 文字列型ではない引数を受信: roomId');
      return;
    }

    const room = roomMap.rooms[roomId];
    if (!room) {
      systemLogger.warn(ip + ': 警告 └ 存在しない部屋の退室要求を拒否');
      return;
    }

    if (room.deleteUser(socket.id) < 1) {
      roomMap.deleteRoom(roomId);
    }

    socket.leave(roomId);
    socket.emit('update_room_list', roomMap.getAllRoomsInfo());
    systemLogger.info(ip + ': 送信 └ "update_room_list"');
  });


  /*
   * 切断イベント
   * 接続していた全ての部屋から切断ユーザーの情報を削除し、
   * ユーザー一覧からも削除する。
   */
  socket.on('disconnect', (reason) => {
    roomMap.deleteUserFromAllRooms(socket.id);
    userMap.deleteUser(socket.id);
    socket.leaveAll();

    const ip = utils.formatIp(socket.handshake.headers['x-real-ip']);
    systemLogger.info(ip + ': ─── 切断 ─── ' + socket.id + ' (' + reason + ')');
  });
});