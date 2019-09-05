"use strict";

/**
 * ラウンジチャットの情報が格納されるクラス
 *
 * @class Lounge
 */
class Lounge {

  constructor() {
    this.part = 1;
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

    if (this.posts.length > 1000) {
      this.part++;
      this.posts = [];
    }
  }
}

module.exports = Lounge;