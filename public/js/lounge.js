"use strict";

/**
 * 要素生成
 *
 * <main>タグの中に含まれるラウンジチャット用の要素
 * ラウンジチャットを受信した場合の反映、ラウンジチャットへの発言を行う。
 *
 * ---------- HTML構成 ----------
 * <div id="lounge_chat_wrapper">
 *   <h2>ラウンジチャット<h2>
 *   <hr>
 *   <input id="input_lounge" maxlength="60" autocomplete="false">
 *   <button id="send_to_lounge_button" type="button">コメント</button>
 *   <hr>
 *
 *   <ul id="lounge_chat_list">
 *     <li>
 *       <ul class="message_box">
 *         <li>
 *           <span>798</span> 名前: <span>名無しさん</span> ID: <span>sdf9879a8</span>
 *         </li>
 *         <li>test</li>
 *       </ul>
 *     </li>
 *   </ul>
 * </div>
 */
window.addEventListener("load", () => {
  let main = document.getElementById("main");

  let lounge_chat_wrapper = document.createElement("div");
  lounge_chat_wrapper.id = "lounge_chat_wrapper";
  lounge_chat_wrapper.className = "box";
  main.appendChild(lounge_chat_wrapper);

  let lounge_chat_label = document.createElement("h2");
  lounge_chat_label.textContent = "ラウンジチャット";
  lounge_chat_wrapper.appendChild(lounge_chat_label);

  let lounge_hr_1 = document.createElement("hr");
  lounge_chat_wrapper.appendChild(lounge_hr_1);

  let input_lounge_label = document.createElement("label");
  input_lounge_label.textContent = "メッセージ:";
  lounge_chat_wrapper.appendChild(input_lounge_label);

  let input_lounge = document.createElement("input");
  input_lounge.id = "input_lounge";
  input_lounge.maxlength = "60";
  input_lounge.autocomplete = false;
  input_lounge_label.appendChild(input_lounge);

  let send_to_lounge_button = document.createElement("button");
  send_to_lounge_button.type = "button";
  send_to_lounge_button.id = "send_to_lounge_button";
  send_to_lounge_button.textContent = "書き込む";
  lounge_chat_wrapper.appendChild(send_to_lounge_button);

  let lounge_chat_list = document.createElement("ul");
  lounge_chat_list.id = "lounge_chat_list";
  lounge_chat_wrapper.appendChild(lounge_chat_list);
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
    new_message.className = "list_box";
    lounge_chat_list.insertBefore(new_message, lounge_chat_list.firstChild)

    let message_box = document.createElement("ul");
    message_box.className = "message_box";
    new_message.appendChild(message_box);

    let message_box_content = document.createElement("li");
    message_box.appendChild(message_box_content);

    let resp_no = document.createElement("span");
    resp_no.textContent = message.no + " ";
    message_box_content.appendChild(resp_no);

    let name_label = document.createTextNode("名前：");
    message_box_content.appendChild(name_label);

    let name = document.createElement("span");
    name.textContent = message.name + " ";
    message_box_content.appendChild(name);

    let id_label = document.createTextNode("ID:");
    message_box_content.appendChild(id_label);

    let id = document.createElement("span");
    id.textContent = message.id;
    message_box_content.appendChild(id);

    let content = document.createElement("li");
    content.className = "message";
    content.textContent = message.content;
    message_box_content.appendChild(content);
  });
});
