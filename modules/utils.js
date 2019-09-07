'use strict';


/**
 * 引数に渡されたIPアドレスの形式をIPv4形式に変更する
 *
 * 「IPv4射影IPv6アドレス」形式であった場合にIPv6部分を取り除く
 * ::ffff:192.168.0.1 -> 192.168.0.1
 *
 * @param {String} ip どのような形式になっているか分からないIPアドレス
 * @return {String} IPv4形式に変更されたIPアドレス文字列
 */
function formatIp(ip) {
  let idx = ip.lastIndexOf(':');
  if (idx != -1) {
    ip = ip.slice(idx + 1);
  }

  return ip;
}
exports.formatIp = formatIp;


/**
 * 引数に渡された文字列が空であるかを検証する
 *
 * ・空文字('')
 * ・null
 * ・undefined
 * ・空白文字のみ('  '等)
 * ・改行文字のみ
 * かを検証し、空であった場合はtrueを返す。
 * そうで無ければfalseを返す。
 *
 * @param {String} str: ユーザーが入力した文字列
 * @return {Boolean} 問題があればtrue、無ければfalse
 */
function isBlank(str) {
  if (!str) {
    return true;
  }

  const regex = /^[\s\n\r\t]+$/;
  if (regex.test(str)) {
    return true;
  }

  return false;
}
exports.isBlank = isBlank;


/**
 * 新たな勢いの値を求めて返却する
 *
 * @param {Number} created   基準となるオブジェクトが作成された時間
 * @param {Number} postCount 現在の投稿数
 * @returns {Number} 新しい勢いの値
 */
function updatePower(created, postCount) {
  const diff = (Date.now()-created) / 1000 / 60;
  return postCount / diff;
}
exports.updatePower = updatePower;


/**
 * 入力間隔の検証を行う
 *
 * @param {Number} lastInput 最後に入力した時間(ミリ秒)
 * @returns {Boolean} 入力間隔が短ければfalse、そうでなければtrue。
 */
function validateInputInterval(lastInput) {
  const diff = Date.now() - lastInput;
  if (diff < 1500) {
    return false;
  }

  return true;
}
exports.validateInputInterval = validateInputInterval;