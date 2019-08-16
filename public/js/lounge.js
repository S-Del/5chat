"use strict";

/**
 * 要素生成
 *
 * <main>タグの中に含まれるラウンジチャット用の要素
 * ラウンジチャットを受信した場合の反映、ラウンジチャットへの発言を行う。
 *
 * ---------- HTML構成 ----------
 * <section class="main__lounge-chat">
 *   <div>
 *     <h2>ラウンジチャット<h2>
 *     <input id="input_lounge"
 *            class="lounge-chat__message-input"
 *            maxlength="60"
 *            autocomplete="false">
 *     <button type="button"
 *             id="send_to_lounge_button"
 *             class="lounge-chat__send-to-lounge-button">
 *       コメント
 *     </button>
 *     <hr>
 *   </div>
 *
 *   <div class="lounge-chat__list-wrapper">
 *     <ul id="lounge_chat_list" class="lounge-chat-list">
 *       <li class="lounge-chat-list__item">
 *         <span>no </span>
 *         <span>名前：name </span>
 *         <span>ID:id </span>
 *         <br>
 *         <span class="lounge-chat-list__item-message">message<span>
 *       </li>
 *     </ul>
 *   </div>
 * </section>
 */
window.addEventListener("load", () => {
  let main = document.getElementById("main");

  let lounge_chat_section = document.createElement("section");
  lounge_chat_section.className = "main__lounge-chat";
  main.appendChild(lounge_chat_section);

  let div = document.createElement("div");
  lounge_chat_section.appendChild(div);

  let lounge_chat_label = document.createElement("h2");
  lounge_chat_label.textContent = "ラウンジチャット";
  div.appendChild(lounge_chat_label);

  let input_lounge_label = document.createElement("label");
  input_lounge_label.textContent = "メッセージ:";
  div.appendChild(input_lounge_label);

  let input_lounge = document.createElement("input");
  input_lounge.id = "input_lounge";
  input_lounge.className = "lounge-chat__message-input";
  input_lounge.maxlength = "60";
  input_lounge.autocomplete = false;
  input_lounge_label.appendChild(input_lounge);

  let send_to_lounge_button = document.createElement("button");
  send_to_lounge_button.type = "button";
  send_to_lounge_button.id = "send_to_lounge_button";
  send_to_lounge_button.className = "lounge-chat__send-to-lounge-button";
  send_to_lounge_button.textContent = "書き込む";
  div.appendChild(send_to_lounge_button);

  let hr = document.createElement("hr");
  div.appendChild(hr);

  let lounge_chat_list_wrapper = document.createElement("div");
  lounge_chat_list_wrapper.className = "lounge_chat__list-wrapper";
  lounge_chat_section.appendChild(lounge_chat_list_wrapper);

  let lounge_chat_list = document.createElement("ul");
  lounge_chat_list.id = "lounge_chat_list";
  lounge_chat_list.className = "lounge-chat-list";
  lounge_chat_list_wrapper.appendChild(lounge_chat_list);
});


/**
 * 要素やsocketのイベントを設定
 */
window.addEventListener("load", () => {
  // ラウンジチャット送信用
  function send_to_lounge() {
    let input_lounge = document.getElementById("input_lounge");
    let message_text = input_lounge.value;
    socket.emit("send_to_lounge", message_text);
    input_lounge.value = "";
  }

  // コメントボタンでラウンジチャットにメッセージを送信
  document.getElementById("send_to_lounge_button").addEventListener("click", () => {
    send_to_lounge();
  });

  // ラウンジチャット欄でのエンターキーで入力メッセージを送信
  document.getElementById("input_lounge").addEventListener("keyup", (event) => {
    if (event.keyCode != 13) {
      return;
    }

    send_to_lounge();
  });

  // ラウンジに送られたメッセージを反映
  socket.on("message_lounge", (message) => {
    let lounge_chat_list = document.getElementById("lounge_chat_list");
    let new_message = document.createElement("li");
    new_message.className = "lounge-chat-list__item";
    // 新しいメッセージは先頭(最上部)に追加(末尾に追加すると見にくい為)
    lounge_chat_list.insertBefore(new_message, lounge_chat_list.firstChild)

    // レス番号
    let resp_no = document.createElement("span");
    resp_no.textContent = message.no + " ";
    new_message.appendChild(resp_no);

    // コテハン
    let name = document.createElement("span");
    name.textContent = "名前：" + message.name + " ";
    new_message.appendChild(name);

    // ユーザーのID
    let id = document.createElement("span");
    id.textContent = "ID:" + message.id;
    new_message.appendChild(id);

    // 本文の表示の前に改行
    let br = document.createElement("br");
    new_message.appendChild(br);

    // 本文
    let content = document.createElement("span");
    content.className = "lounge-chat-list__item-message";
    content.textContent = message.content;
    new_message.appendChild(content);
  });
});
