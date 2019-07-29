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
  res_no: 0
};
exports.lounge = lounge;


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
