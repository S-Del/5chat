"use strict";


/**
 * 部屋情報が格納されるオブジェクト
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
 * socket.idで指定されたユーザーを全ての部屋から削除する
 */
let delete_user(socket_id) {
  for (let room_id in rooms) {
    if (!rooms[room_id].users[socket_id]) {
      continue;
    }
    delete rooms.map[room_id].users[socket_id];
  }
}
exports.delete_user = delete_user;


/**
 * ユーザ情報、メッセージを保存し、ラウンジ情報を更新する。
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

  console.log(rooms[room_id].users);
}
exports.put_all_users = put_all_users;
