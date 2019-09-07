'use strict';

const utils = require('../utils.js');

/**
 * ラウンジチャットの情報が格納されるクラス
 *
 * @class Lounge
 */
class Lounge {

  constructor() {
    this.part = 1;
    this.created = Date.now();
    this.power = 0;
    this.posts = [];
  }

  /**
   * postsにユーザーの投稿を追加する
   *
   * 投稿数(postsの要素数)が1000より大きくなった時は、
   * partを1増加し古い投稿は削除される。
   *
   * @param {object} post ユーザー情報とメッセージが格納されたオブジェクト
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

module.exports = Lounge;