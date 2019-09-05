"use strict";


/**
 * 引数に渡されたIPアドレスの形式をIPv4形式に変更する
 *
 * 「IPv4射影IPv6アドレス」形式であった場合にIPv6部分を取り除く
 * ::ffff:192.168.0.1 -> 192.168.0.1
 *
 * @param {string} ip どのような形式になっているか分からないIPアドレス
 * @return {string} IPv4形式に変更されたIPアドレス文字列
 */
function formatIp(ip) {
  let idx = ip.lastIndexOf(":");
  if (idx != -1) {
    ip = ip.slice(idx + 1);
  }

  return ip;
}
exports.formatIp = formatIp;


/**
 * 引数に渡された文字列が空であるかを検証する
 *
 * ・空文字("")
 * ・null
 * ・undefined
 * ・空白文字のみ("  "等)
 * ・改行文字のみ
 * かを検証し、空であった場合はtrueを返す。
 * そうで無ければfalseを返す。
 *
 * @param {string} str: ユーザーが入力した文字列
 * @return {boolean} 問題があればtrue、無ければfalse
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