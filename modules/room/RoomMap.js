'use strict';

class RoomMap {

  constructor() {
    /**
     * @member {Object} rooms Roomが格納されたオブジェクト。キーはroom.id。
     * @see Room
     */
    this.rooms = {};
  }

  /**
   * 引数で指定されたsocketIDのユーザー情報を全ての部屋から削除する
   * ユーザーを削除した部屋が空の部屋だった場合は、部屋も削除する。
   *
   * @param {String} socketId ユーザーを識別するためのソケットID
   * @returns {void}
   */
  deleteUserFromAllRooms(socketId) {
    for (let id in this.rooms) {
      let room = this.rooms[id];
      let userCount = room.deleteUser(socketId);
      if (userCount < 1) {
        delete this.rooms[id];
      }
    }
  }

  /**
   * 現在存在するすべての部屋の情報を返却する
   *
   * @returns {Object[]} 各部屋の情報が格納された配列
   */
  getAllRoomsInfo() {
    let roomsInfo = [];
    for (let id in this.rooms) {
      roomsInfo.push(this.rooms[id].getInfo());
    }

    return roomsInfo;
  }

}

module.exports = RoomMap;