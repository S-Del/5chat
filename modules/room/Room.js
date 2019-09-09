'use strict';

const crypto = require('crypto');

const utils = require('../utils.js');
const roomLogger = require('../logger/logger.js').roomLogger;
const userLogger = require('../logger/logger.js').userLogger;

class Room {

  /**
   * @param {String} name  部屋名
   * @param {String} desc  部屋の説明
   * @param {User}   owner 部屋の作成者
   */
  constructor(name, desc, owner) {
    if (utils.isBlank(desc)) {
      desc = '説明なし';
    }

    if (name.length > 30) {
      name = name.slice(0, 29) + '…';
    }

    if (desc.length > 60) {
      desc = desc.slice(0, 59) + '…';
    }

    this.name = name;
    this.desc = desc;

    this.users = [];
    this.addUser(owner);

    const sha512 = crypto.createHash('sha512');
    sha512.update(owner.socketId + name + Date.now());
    this.id = sha512.digest('hex');

    this.created = Date.now();
    this.part = 1;
    this.posts = [];
    this.power = 0;

    roomLogger.addContext('room', this.id);
    roomLogger.info('───部屋開始───: 部屋名-' + this.name
                    + ' 作成者-' + owner.name + '(' + owner.ip + ')');
  }

  /**
   * 入室時に利用。引数で渡されたユーザーをusersに追加する。
   *
   * @param {User} user この部屋に参加したユーザー
   * @returns {void}
   */
  addUser(user) {
    this.users.push(user);
    roomLogger.addContext('room', this.id);
    roomLogger.info('ユーザー追加: '
                    + user.ip + ' - '
                    + user.name + '('
                    + user.socketId + ')');

    userLogger.addContext('user', user.ip);
    userLogger.info('部屋参加('
                    + user.socketId + '): '
                    + this.name);
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
        roomLogger.addContext('room', this.id);
        roomLogger.info('ユーザー削除: '
                        + this.users[i].ip + ' - '
                        + this.users[i].name + '('
                        + this.users[i].socketId + ')');
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
   * postsにユーザーの投稿を追加し、勢いの値を更新する。
   *
   * 投稿数(postsの要素数)が1000より大きくなった時は、
   * partを1増加し古い投稿は削除される。
   *
   * @param {String} ip   書き込みを行ったユーザーのIPアドレス
   * @param {Object} post ユーザー情報とメッセージが格納されたオブジェクト
   * @returns {void}
   */
  addPost(ip, post) {
    this.posts.push(post);
    roomLogger.addContext('room', this.id);
    roomLogger.info(post.name + '(' + ip + '): ' + post.message);

    this.power = utils.updatePower(this.created, this.posts.length);

    if (this.posts.length > 1000) {
      this.posts = [];
      this.part++;
      this.created = Date.now();
    }
  }

}

module.exports = Room;