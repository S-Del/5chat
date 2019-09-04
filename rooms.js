"use strict";

let crypto = require("crypto");


/**
 * 部屋情報が格納されるオブジェクト
 *
 * @type {Object} rooms 存在している部屋とその情報が格納される
 * @property {String}   name     部屋名
 * @property {String}   desc     部屋の説明
 * @property {String}   owner    部屋の作成者
 * @property {Number}   created  部屋が作られた時間(ミリ秒)
 * @property {Number}   power    部屋の勢い
 * @property {Object}   users    部屋内のユーザー
 * @property {Object[]} messages 部屋内のメッセージ
 */
let rooms = {};
exports.map = rooms;


/**
 * ラウンジチャットの情報が格納されるオブジェクト
 *
 * @type {Object} lounge
 * @property {Number}   part     書き込み数が1000を超えると1ずつ加算されるカウンタ
 * @property {Object[]} messages ラウンジ内での発言
 */
let lounge = {
  part: 1,
  messages: []
};
exports.lounge = lounge;


/**
 * 新しい部屋が作成されたときの処理
 * その部屋のオーナー情報と共にrooms{}に格納される
 *
 * @param {object} new_room_info:
 *   {string} input_room_name: ユーザーが入力した部屋名
 *   {string} input_room_description: ユーザが入力した部屋の説明
 * @param {string} socket_id: オーナーのsocket.id
 * @param {object} owner_info:
 *   {string} name: ユーザー名
 *   {string} id: ユーザーID
 *   {string} power: ユーザーの勢い
 * @return {string} room_id: 新しく作成した部屋のID
 */
function create_new_room(new_room_info, socket_id, owner_info) {
  if (new_room_info.input_room_name.length > 30) {
    new_room_info.input_room_name = new_room_info.input_room_name.slice(0, 29) + "…";
  }

  if (new_room_info.input_room_description.length > 60) {
    new_room_info.input_room_description = new_room_info.input_room_description.slice(0, 59) + "…";
  }

  let new_room = {
    name: new_room_info.input_room_name,
    desc: new_room_info.input_room_description,
    owner: socket_id,
    created: Date.now(),
    power: 0,
    users: {},
    messages: []
  };
  new_room.users[socket_id] = owner_info;

  let sha512 = crypto.createHash("sha512");
  sha512.update(socket_id + new_room.name + Date.now());
  let room_id = sha512.digest("hex");

  rooms[room_id] = new_room;
  console.log("---------- Create Room: " + rooms[room_id].name + " ----------");

  return room_id;
}
exports.create_new_room = create_new_room;


/**
 * socket.idで指定されたユーザーを全ての部屋から削除する
 * 急なdisconnected(ブラウザを閉じる等)の際などに利用する
 *
 * @param {string} socket_id: ユーザーを識別するためのsocket.id
 */
function delete_user(socket_id) {
  for (let room_id in rooms) {
    if (!rooms[room_id].users[socket_id]) {
      continue;
    }
    delete rooms[room_id].users[socket_id];
  }
}
exports.delete_user = delete_user;


/**
 * ユーザーが1名も存在しない部屋であれば削除する
 *
 * @param {string} room_id: 部屋を識別するための固有ID
 */
function delete_empty_room(room_id) {
  if (!Object.keys(rooms[room_id].users).length) {
    console.log("---------- Delete room: " + rooms[room_id].name + " is Empty ----------");
    delete rooms[room_id];
  }
}
exports.delete_empty_room = delete_empty_room;


/**
 * 部屋内で発言があった際に呼び出される関数
 * 部屋内の情報を更新する
 *
 * @param {object} room_message:
 *   room_id: 部屋を識別するためのID
 *   user: 発言したユーザーの情報
 *   input_room: ユーザーが入力したメッセージ文字列
 */
function update_room(room_message) {
  let info = {
    user: room_message.user,
    message: room_message.input_room
  };
  rooms[room_message.room_id].messages.push(info);
//  console.log(rooms[room_message.room_id]);
}
exports.update_room = update_room;


/**
 * 部屋の勢いの値を更新する
 */
function update_power(room_id) {
  let diff = (Date.now() - rooms[room_id].created) / 1000 / 60;
  rooms[room_id].power = rooms[room_id].messages.length / diff;
}
exports.update_power = update_power;


/**
 * ラウンジチャットにて発言があった際に呼び出される関数
 * ユーザ情報、メッセージを保存し、ラウンジ情報を更新する。
 *
 * @param {object} user_info: ラウンジで発言を行ったユーザーとその情報
 */
function update_lounge(user_info) {
  if (lounge.messages.length > 1000) {
    lounge.messages = [];
    rooms.lounge.part++;
  }

  lounge.messages.push(user_info);
}
exports.update_lounge = update_lounge;


/**
 * 部屋内のユーザーを出力する
 *
 * 主にテスト用
 * @param {string} room_id: 部屋を識別するためのID文字列
 */
function put_all_users(room_id) {
  if (!rooms[room_id]) {
    console.log("その部屋は存在しません");
    return;
  }

  console.log(room_id + ":");
  console.log(rooms[room_id].users);
}
exports.put_all_users = put_all_users;