"use strict";

let crypto = require("crypto");


/**
 * ユーザー情報が格納されるオブジェクト
 */
let users = {};
exports.map = users;


/**
 * 接続が確立した時のユーザー情報初期化用
 * ユーザー名とIDを設定してクライアントに送信する
 * 設定したユーザー情報はmap{}に保存される
 */
let init_user_info = (socket) => {
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
exports.init_user_info = init_user_info;


/**
 * header等に表示されるユーザー情報を送信して更新する
 * 今のところはユーザー名とIDのみ
 */
let update_user_info = (socket) => {
  socket.emit("update_user_info", {
    name: users[socket.id].name,
    id: users[socket.id].id
  });
}
exports.update_user_info = update_user_info;


/**
 * ユーザー名変更用
 * トリップが入力されている場合は名前に付加する
 */
let change_name = (name, trip) => {
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
exports.change_name = change_name;


/**
 * ユーザーの送信間隔を検証する
 *
 * 連投等の防止用
 * とりあえず1.5秒としている
 *
 * @param {socket} socket : ユーザーを識別するためのソケットオブジェクト
 * @return {boolean} : 間隔が短い場合はtrue、問題が無ければfalse。
 */
let is_interval_short = (socket) => {
  let diff = Date.now() - users[socket.id].last_input;
  if (diff < 1500) {
    return true;
  }

  users[socket.id].last_input = Date.now();
  return false;
}
exports.is_interval_short = is_interval_short;


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
let is_blank = (user_input) => {
  if (!user_input) {
    return true;
  }

  let regex = /^[\s\n\r\t]+$/;
  if (regex.test(user_input)) {
    return true;
  }

  return false;
}
exports.is_blank = is_blank;


/**
 * 現在接続しているユーザーの情報を出力する
 *
 * 主にテスト用
 * 接続者数が増えるほど重くなる機能（のはず）
 * name, id, ip等全て表示される
 */
let put_all = () => {
  console.log("users:");
  console.log(users);
  console.log("-------------------------------------------------------------------------------");
}
exports.put_all = put_all;


/**
 * 同一IPからの接続を切断する
 * 接続者数が増えるほど重くなる機能（のはず）
 * 有効、無効を切り替える場合はheader.jsの"ip_alert"イベントも切り替えること
 * ※現在使用していない
 */
let kick_duplicate_ip = (socket) => {
  for (let key in users) {
    if (users[key].ip == socket.handshake.address) {
      socket.emit("ip_alert", "既に同じipが存在するので切断します");
      socket.disconnect(true);
      return;
    }
  }
}
exports.kick_duplicate_ip = kick_duplicate_ip;
