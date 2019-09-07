'use strict';

class UserMap {

  constructor() {
    /**
     * @member {Object} users Userが格納されたオブジェクト。キーはsocket.id。
     * @see User
     */
    this.users = {};
  }

  /**
   * 引数に渡されたユーザーをマップ追加する
   *
   * @param {User} user 情報が保存される接続中のユーザー
   * @returns {void}
   */
  addUser(user) {
    this.users[user.socketId] = user;
  }

  /**
   * 引数のソケットIDで指定されたユーザーをマップからから削除する
   *
   * @param {String} socketId ユーザを識別するためのソケットID
   * @returns {void}
   */
  deleteUser(socketId) {
    delete this.users[socketId];
  }

}

module.exports = UserMap;