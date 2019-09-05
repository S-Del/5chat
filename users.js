"use strict";

let crypto = require("crypto");

/**
 * 接続中のユーザー情報が格納されるオブジェクト
 *
 * サーバー(app.js)からは直接アクセスできない(exportsしない)
 * クライアントに送信するユーザー情報が必要となった場合はget()を使用する
 *
 * @type {Object} users ユーザーとそのユーザー情報が格納される
 * @property {String} name       ユーザーが設定した名前。トリップがある場合は末尾に付加される。
 * @property {String} id         IPアドレスから作成されたID
 * @property {String} power      ユーザーの勢い
 * @property {String} ip         ユーザーのIPアドレス
 * @property {number} last_input 最後にメッセージ等を入力した時刻(ミリ秒)
 * @property {number} power      ユーザの勢い
 */
let users = {};


/**
 * 接続が確立したユーザー情報初期と保存を行う
 *
 * 初期デフォルトユーザー名とIDを設定してusers{}に保存する
 * IDはipアドレスに日付を付加したものをハッシュ化した文字列の一部を設定する
 *
 * @param {string} socket_id socket.idから得られる1コネクションを表す文字列
 * @param {string} ip        socket.handshake.addressから得られるユーザーのIPアドレス
 * @returns {void}
 */
function init_user_info(socket_id, ip) {
  let sha512 = crypto.createHash("sha512");
  sha512.update(ip + new Date().getDate());
  let id = sha512.digest("base64").slice(0, 10);

  let new_user = {
    name:  "名無しさん",
    ip: ip,
    id: id,
    last_input: 0,
    power: 0
  };

  users[socket_id] = new_user;
//  logger.systemLogger.info("Connected: " + ip + "(" + socket_id + ")")
}
exports.init_user_info = init_user_info;


/**
 * ユーザー情報取得用
 *
 * headerの表示や発言の表示などに必要な情報のみ返却する(ipアドレスなどは返却しない)
 *
 * @param {string} socket_id: ユーザーを指定するためのsocket.id
 * @return {Object} 以下の値が格納されたObjectを返却する
 *     name  ユーザ名
 *     id    ユーザーID
 *     power ユーザの勢い
 */
function get(socket_id) {
  if (!users[socket_id]) {
    return;
  }

  return {
    name: users[socket_id].name,
    id: users[socket_id].id,
    power: users[socket_id].power
  };
}
exports.get = get;


/**
 * ユーザー情報削除用
 *
 * socket_idで指定されたユーザーをusers{}内から削除する
 * 切断等によって不要になったユーザー情報の削除に利用
 *
 * @param {string} socket_id 情報を削除するユーザーのsocket.id文字列
 * @param {string} reason    削除理由
 * @returns {void}
 */
function delete_user(socket_id, reason) {
  if (!users[socket_id]) {
    return;
  }

//  logger.systemLogger.info("Delete User: "
//                           + users[socket_id].ip
//                           + "(" + socket_id + ") "
//                           + reason);
  delete users[socket_id];
}
exports.delete_user = delete_user;


/**
 * ユーザー名変更用
 *
 * 名前が空欄(又は初期値)の場合は「名無しさん」とする
 * トリップが入力されている場合は生成して名前に付加する
 *
 * @param {string} socket_id ユーザーを識別するための個別ID
 * @param {Object} new_name ユーザーが入力したnameとtripを格納するオブジェクト
 * @returns {void}
 */
function change_name(socket_id, new_name) {
  if (utils.isBlank(new_name.name)) {
    new_name.name = "名無しさん";
  }
  new_name.name = new_name.name.slice(0, 16).replace(/◆/g, "■");

  if (new_name.trip.length >= 3) {
    let salt = new_name.trip.slice(1, 3);
    let key = crypto.createCipher("des", salt);
    key.update(new_name.trip, "utf-8", "base64");

    new_name.trip = "◆" + key.final("base64").slice(0, 10);
    new_name.name += new_name.trip;
  }

  users[socket_id].name = new_name.name;
}
exports.change_name = change_name;


/**
 * ユーザーの送信間隔を検証する
 *
 * 連投等の防止用
 * とりあえず1.5秒としている
 *
 * @param {string} socket_id ユーザーを識別するためのソケットオブジェクト
 * @return {boolean} 間隔が短い場合はtrue、問題が無ければfalse。
 */
function is_interval_short(socket_id) {
  let diff = Date.now() - users[socket_id].last_input;
  if (diff < 1500) {
    return true;
  }

  users[socket_id].last_input = Date.now();
  return false;
}
exports.is_interval_short = is_interval_short;


/**
 * 現在接続しているユーザーの情報を出力する
 *
 * ※※※※※ この関数は現在使用していない ※※※※※
 *
 * 主にテスト用
 * 接続者数が増えるほど重くなる機能（のはず）
 * name, id, ip等全て表示される
 *
 * @returns {void}
 */
function put_all() {
  console.log("users:");
  console.log(users);
  console.log("-------------------------------------------------------------------------------");
}
exports.put_all = put_all;


/**
 * 同一IPからの接続を切断する
 *
 * ※※※※※ この関数は現在使用していない ※※※※※
 *
 * 接続者数が増えるほど重くなる機能（のはず）
 * 有効・無効を切り替える場合は、
 * フロント側のスクリプトに"ip_alert"のソケットイベントを追加する。
 *
 * @param {string} ip ユーザーのIPアドレス。socket.handshake.addressから取得
 * @return {boolean} 重複したipが存在する場合はtrue、存在しなければfalse
 */
function is_duplicate_ip(ip) {
  for (let socket_id in users) {
    if (users[socket_id].ip == ip) {
      return true;
    }
  }

  return false;
}
exports.is_duplicate_ip = is_duplicate_ip;