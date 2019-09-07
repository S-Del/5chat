'use strict';

const crypto = require('crypto');
const utils = require('../utils.js');

class Room {

  /**
   * @param {string} name  部屋名
   * @param {string} desc  部屋の説明
   * @param {User}   owner 部屋の作成者
   */
  constructor(name, desc, owner) {
    if (name.length > 30) {
      name = name.slice(0, 29) + '…';
    }

    if (desc.length > 60) {
      desc = desc.slice(0, 59) + '…';
    }

    this.name = name;
    this.desc = desc;
    this.users = [owner];

    const sha512 = crypto.createHash('sha512');
    sha512.update(owner.socketId + name + Date.now());
    this.id = sha512.digest('hex');

    this.created = Date.now();
    this.part = 1;
    this.posts = [];
    this.power = 0;
  }

  /**
   * 引数で指定されたソケットIDのユーザーがこの部屋に存在するか確認する
   *
   * @param {String} socketId ユーザーを識別するためのソケットID
   * @returns {Boolean} ユーザーが存在するならtrue、そうでなければfalse。
   */
  hasUser(socketId) {
    for (let i = 0; i < this.users.length; i++) {
      if (this.users[i].socketId == socketId) {
        return true;
      }
    }

    return false;
  }

  /**
   * 引数で指定されたソケットIDのユーザーがこの部屋に存在すれば削除し、
   * 部屋の残り人数を返却する。
   *
   * @param {String} socketId ユーザを識別するためのソケットID
   * @returns {Number} 削除後の部屋内の残り人数
   */
  deleteUser(socketId) {
    for (let i = 0; i < this.users.length; i++) {
      if (this.users[i].socketId == socketId) {
        this.users.splice(i, 1);
        return this.users.length;
      }
    }

    return this.users.length;
  }

  /**
   * フロントに送信可能なこの部屋の情報を返却する
   *
   * @returns {Object} フロントで表示できる部屋情報を格納したオブジェクト
   */
  getInfo() {
    return {
      id: this.id,
      name: this.name,
      part: this.part,
      desc: this.desc,
      usersCount: this.users.length,
      postsCount: this.posts.length,
      power: this.power
    };
  }

  /**
   * この部屋に書き込みが行われた場合に呼び出す。
   * postsにユーザーの投稿を追加し、勢いの値を更新する。
   *
   * 投稿数(postsの要素数)が1000より大きくなった時は、
   * partを1増加し古い投稿は削除される。
   *
   * @param {Object} post ユーザー情報とメッセージが格納されたオブジェクト
   * @returns {void}
   */
  addPost(post) {
    this.posts.push(post);
    this.power = utils.updatePower(this.created, this.posts.length);

    if (this.posts.length > 1000) {
      this.posts = [];
      this.part++;
      this.created = Date.now();
    }
  }

}

module.exports = Room;