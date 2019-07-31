"use strict";

let crypto = require("crypto");


/**
 * 部屋情報が格納されるオブジェクト
 *
 * name: 部屋名
 * desc: 部屋の説明
 * owner: 部屋の作成者
 * power: 部屋の勢い
 * users: 部屋内のユーザー
 * messages: 部屋内のメッセージ
 */
let rooms = {};
exports.map = rooms;


/**
 * ラウンジチャットの情報が格納されるオブジェクト
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
 * @param {object} new_room_info: 部屋作成ユーザーが入力した部屋名等
 * @return {string} room_id: 新しく作成した部屋のID
 */
let create_new_room = (new_room_info, socket_id, owner_info) => {
  let new_room = {
    name: new_room_info.input_room_name,
    desc: new_room_info.input_room_description.slice(0, 60),
    owner: socket_id,
    power: 0,
    users: {},
    messages: []
  };
  new_room.users[socket_id] = owner_info;

  let sha512 = crypto.createHash("sha512");
  sha512.update(socket_id + new_room.name + Date.now());
  let room_id = sha512.digest("hex");

  rooms[room_id] = new_room;

  return room_id;
};
exports.create_new_room = create_new_room;


/**
 * socket.idで指定されたユーザーを全ての部屋から削除する
 * 急なdisconnected(ブラウザを閉じる等)の際などに利用する
 *
 * @param {string} socket_id: ユーザーを識別するためのsocket.id
 */
let delete_user = (socket_id) => {
  for (let room_id in rooms) {
    if (!rooms[room_id].users[socket_id]) {
      continue;
    }
    delete rooms[room_id].users[socket_id];
  }
}
exports.delete_user = delete_user;


/**
 * 部屋内で発言があった際に呼び出される関数
 * 部屋内の情報を更新する
 *
 * @param {object} room_message:
 *   room_id: 部屋を識別するためのID
 *   user: 発言したユーザーの情報
 *   input_room: ユーザーが入力したメッセージ文字列
 */
let update_room = (room_message) => {
  let info = {
    user: room_message.user,
    message: room_message.input_room
  };
  rooms[room_message.room_id].messages.push(info);
}
exports.update_room = update_room;


/**
 * ラウンジチャットにて発言があった際に呼び出される関数
 * ユーザ情報、メッセージを保存し、ラウンジ情報を更新する。
 *
 * @param {object} user_info: ラウンジで発言を行ったユーザーとその情報
 */
let update_lounge = (user_info) => {
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
let put_all_users = (room_id) => {
  if (!rooms[room_id]) {
    console.log("その部屋は存在しません");
    return;
  }

  console.log(room_id + ":");
  console.log(rooms[room_id].users);
}
exports.put_all_users = put_all_users;
