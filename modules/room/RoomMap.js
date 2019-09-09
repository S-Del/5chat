'use strict';

const roomLogger = require('../logger/logger.js').roomLogger;

class RoomMap {

  constructor() {
    /**
     * @member {Object} rooms Roomが格納されたオブジェクト。キーはroom.id。
     * @see Room
     */
    this.rooms = {};
  }

  /**
   * 引数のroomIdで指定された部屋をマップから削除する
   *
   * @param {String} roomId 削除する部屋のID
   * @returns {void}
   */
  deleteRoom(roomId) {
    delete this.rooms[roomId];
    roomLogger.addContext('room', roomId);
    roomLogger.info('───部屋終了───');
  }

  /**
   * 引数で指定されたsocketIDのユーザー情報を全ての部屋から削除する
   * ユーザーを削除した部屋が空の部屋だった場合は、部屋も削除する。
   *
   * @param {String} socketId ユーザーを識別するためのソケットID
   * @returns {void}
   */
  deleteUserFromAllRooms(socketId) {
    for (let roomId in this.rooms) {
      let room = this.rooms[roomId];
      let userCount = room.deleteUser(socketId);
      if (userCount < 1) {
        this.deleteRoom(roomId);
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
    for (let roomId in this.rooms) {
      roomsInfo.push(this.rooms[roomId].getInfo());
    }

    return roomsInfo;
  }

}

module.exports = RoomMap;