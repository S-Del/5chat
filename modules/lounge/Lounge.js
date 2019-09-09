'use strict';

const loungeLogger = require('../logger/logger.js').loungeLogger;
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
    loungeLogger.info(post.name + '(' + ip + '): ' + post.message);

    this.power = utils.updatePower(this.created, this.posts.length);

    if (this.posts.length > 1000) {
      this.posts = [];
      this.part++;
      this.created = Date.now();
    }
  }

}

module.exports = Lounge;