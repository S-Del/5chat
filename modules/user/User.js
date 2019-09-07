'use strict';

const crypto = require('crypto');

const utils = require('../utils.js');

class User {

  /**
   * @param {String} ip このユーザのIPv4アドレス
   * @param {String} socketId このユーザのsocket.id
   */
  constructor(ip, socketId) {
    this.ip = ip;
    this.socketId = socketId;
    this.name = '名無しさん';

    const sha512 = crypto.createHash('sha512');
    sha512.update(ip + new Date().getDate());
    this.id = sha512.digest('base64').slice(0, 10);

    this.lastInput = 0;
    this.created = Date.now();
    this.power = 0;
    this.posts = [];
  }

  /**
   * フロントに送信可能なこのユーザー情報を返却する
   *
   * @returns {Object} 名前やID等のフロント側で表示されるユーザー情報
   */
  getInfo() {
    return {
      name: this.name,
      id: this.id,
      power: this.power
    };
  }

  /**
   * ユーザー名変更用
   *
   * @param {String} name 新たに設定する名前
   * @param {String} trip 新たに設定するトリップの原型
   * @returns {void}
   */
  changeName(name, trip) {
    if (utils.isBlank(name)) {
      name = '名無しさん';
    }

    name = name.slice(0, 16).replace(/◆/g, '■');

    if (trip.length >= 3) {
      const salt = trip.slice(1, 3);
      const cipher = crypto.createCipher('des', salt);
      cipher.update(trip, 'utf-8', 'base64');
      trip = '◆' + cipher.final('base64').slice(0, 10);
      name += trip;
    }

    this.name = name;
    this.lastInput = Date.now();
  }

  /**
   * このユーザーが書き込みを行った場合に呼び出す。
   * postsにこのユーザーの投稿を追加し、最終入力時間と勢いの値を更新する。
   *
   * @param {String} dest    メッセージの送信先
   * @param {String} message メッセージの内容
   * @returns {void}
   */
  addPost(dest, message) {
    this.posts.push({ dest, message });
    this.lastInput = Date.now();
    this.power = utils.updatePower(this.created, this.posts.length);
  }

}

module.exports = User;