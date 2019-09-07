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
const systemLogger = require('./modules/logger/log.js').systemLogger;

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
  let ip = utils.formatIp(socket.handshake.address);
  let newUser = new User(ip, socket.id);
  systemLogger.info(ip + ': 接続');
  userMap.addUser(newUser);
  socket.emit('update_header_info', newUser.getInfo());
  socket.emit('update_room_list', roomMap.getAllRoomsInfo());


  /*
   * 名前変更イベント
   * トリップを含めて名前を変更し、ヘッダーの表示を更新する。
   */
  socket.on('change_name', (name, trip) => {
    let user = userMap.users[socket.id];
    if (!utils.validateInputInterval(user.lastInput)) {
      return;
    }

    if (typeof name != 'string') {
      return;
    }

    if (typeof trip != 'string') {
      return;
    }

    user.changeName(name, trip);
    socket.emit('update_header_info', user.getInfo());
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
    let user = userMap.users[socket.id];
    if (!utils.validateInputInterval(user.lastInput)) {
      return;
    }

    if (typeof message != 'string') {
      return;
    }

    message = message.slice(0, 60);
    if (utils.isBlank(message)) {
      return;
    }

    const post = user.getInfo();
    post.message = message;
    lounge.addPost(post);
    post.no = lounge.posts.length;
    user.addPost('ラウンジ', message);

    io.emit('update_lounge', post);
  });


  /*
   * 部屋一覧の更新イベント
   */
  socket.on('reload_list', () => {
    let user = userMap.users[socket.id];
    if (!utils.validateInputInterval(user.lastInput)) {
      return;
    }

    socket.emit('update_room_list', roomMap.getAllRoomsInfo());
  });


  /*
   * 部屋作成イベント
   */
  socket.on('create_new_room', (name, desc) => {
    let user = userMap.users[socket.id];
    if (!utils.validateInputInterval(user.lastInput)) {
      return;
    }

    if (typeof name != 'string') {
      return;
    }

    if (utils.isBlank(name)) {
      return;
    }

    if (typeof desc != 'string') {
      return;
    }

    if (utils.isBlank(desc)) {
      desc = '説明なし';
    }

    let newRoom = new Room(name, desc, user);
    roomMap.rooms[newRoom.id] = newRoom;
    socket.join(newRoom.id);

    socket.emit('accept_entry_room', newRoom.id, newRoom.getInfo());
    socket.emit('update_room_list', roomMap.getAllRoomsInfo());
  });


  /*
   * 入室イベント
   * 部屋の存在の検証後、参加者の情報を保存し参加人数の更新を送信する。
   */
  socket.on('join_room', (roomId) => {
    if (typeof roomId != 'string') {
      return;
    }

    let room = roomMap.rooms[roomId];
    if (!room) {
      return;
    }

    if (room.hasUser(socket.id)) {
      return;
    }

    let user = userMap.users[socket.id];
    room.users.push(user);
    socket.join(roomId);

    socket.emit('accept_entry_room', roomId, room.getInfo());
    io.to(roomId).emit('update_nop', room.users.length);
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
    let user = userMap.users[socket.id];
    if (!utils.validateInputInterval(user.lastInput)) {
      return;
    }

    if (typeof roomId != 'string') {
      return;
    }

    let room = roomMap.rooms[roomId];
    if (!room) {
      return;
    }

    if (!room.hasUser(socket.id)) {
      return;
    }

    if (typeof message != 'string') {
      return;
    }

    message = message.slice(0, 60);
    if (utils.isBlank(message)) {
      return;
    }

    user.addPost(room.name, message);

    const post = user.getInfo();
    post.message = message;
    room.addPost(post);
    post.no = room.posts.length;
    post.roomId = room.id;
    post.roomPower = room.power;

    io.to(roomId).emit('message_room', post);
  });


  /*
   * 退室イベント
   * 引数のroomIdで指定された部屋から退室し、
   * 部屋一覧を更新する。
   */
  socket.on('leave_room', (roomId) => {
    if (typeof roomId != 'string') {
      return;
    }

    let room = roomMap.rooms[roomId];
    if (!room) {
      return;
    }

    if (room.deleteUser(socket.id) < 1) {
      delete roomMap.rooms[roomId];
    }

    socket.leave(roomId);
    socket.emit('update_room_list', roomMap.getAllRoomsInfo());
  });


  /*
   * 切断イベント
   * 接続していた全ての部屋から切断ユーザーの情報を削除し、
   * ユーザー一覧からも削除する。
   */
  socket.on('disconnect', (reason) => {
    const ip = utils.formatIp(socket.handshake.address);
    systemLogger.info(ip + ': 切断 - ' + reason);
    roomMap.deleteUserFromAllRooms(socket.id);
    userMap.deleteUser(socket.id);
    socket.leaveAll();
  });
});