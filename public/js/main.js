/**
 * 要素生成
 *
 * <main>
 *   <div id="room_list_wrapper">
 *     <h2>部屋一覧</h2>
 *     <hr>
 *
 *     <ul id="room_list">
 *       <li></li>
 *     </ul>
 *   </div>
 *
 *   <div id="lounge_chat_wrapper">
 *     <h2>ラウンジチャット<h2>
 *     <hr>
 *     <input id="input_lounge" maxlength="60" autocomplete="false">
 *     <button id="send_to_lounge_button" type="button">コメント</button>
 *     <hr>
 *
 *     <ul id="lounge_chat_list">
 *       <li>
 *         <span>No</span>
 *         <span>名前：</span>
 *         <span>コメント</span>
 *       </li>
 *     </ul>
 *   </div>
 * </main>
 */
window.addEventListener("load", () => {
  let wrapper = document.getElementById("wrapper");
  let main = document.createElement("main");
  wrapper.appendChild(main);

  // 部屋一覧部
  let room_list_wrapper = document.createElement("div");
  room_list_wrapper.id = "room_list_wrapper";
  room_list_wrapper.className = "box";
  main.appendChild(room_list_wrapper);

  let room_list_label = document.createElement("h2");
  room_list_label.textContent = "部屋一覧";
  room_list_wrapper.appendChild(room_list_label);

  let room_list_hr = document.createElement("hr");
  room_list_wrapper.appendChild(room_list_hr);

  let room_list = document.createElement("ul");
  room_list.id = "room_list";
  room_list_wrapper.appendChild(room_list);

/* ↓TEST↓ */
  let test_room = document.createElement("li");
  test_room.className = "list_box";
  test_room.textContent = "test_room";
  room_list.appendChild(test_room);
/* ↑TEST↑ */

  // ラウンジチャット部
  let lounge_chat_wrapper = document.createElement("div");
  lounge_chat_wrapper.id = "lounge_chat_wrapper";
  lounge_chat_wrapper.className = "box";
  main.appendChild(lounge_chat_wrapper);

  let lounge_chat_label = document.createElement("h2");
  lounge_chat_label.textContent = "ラウンジチャット";
  lounge_chat_wrapper.appendChild(lounge_chat_label);

  let lounge_hr_1 = document.createElement("hr");
  lounge_chat_wrapper.appendChild(lounge_hr_1);

  let input_lounge = document.createElement("input");
  input_lounge.id = "input_lounge";
  input_lounge.maxlength = "60";
  input_lounge.autocomplete = false;
  lounge_chat_wrapper.appendChild(input_lounge);

  let send_to_lounge_button = document.createElement("button");
  send_to_lounge_button.type = "button";
  send_to_lounge_button.id = "send_to_lounge_button";
  send_to_lounge_button.textContent = "コメント";
  lounge_chat_wrapper.appendChild(send_to_lounge_button);

  let lounge_chat_list = document.createElement("ul");
  lounge_chat_list.id = "lounge_chat_list";
  lounge_chat_wrapper.appendChild(lounge_chat_list);
});


/**
 * 要素やsocketのイベントを設定
 */
window.addEventListener("load", () => {
  // ラウンジチャット欄でのエンターキーで入力でメッセージを送信
  document.getElementById("input_lounge").addEventListener("keyup", (event) => {
    if (event.keyCode === 13) {
      let input_lounge = document.getElementById("input_lounge");
      let message = input_lounge.value;
      socket.emit("send_to_lounge", message);
      input_lounge.value = "";
    }
  });

  // コメントボタンでラウンジチャットにメッセージを送信
  document.getElementById("send_to_lounge_button").addEventListener("click", () => {
    let input_lounge = document.getElementById("input_lounge");
    let message = input_lounge.value;
    socket.emit("send_to_lounge", message);
    input_lounge.value = "";
  });

  // ラウンジにメッセージが送られた場合に呼び出されるsocketイベント
  socket.on("message_lounge", (message) => {
    let lounge_chat_list = document.getElementById("lounge_chat_list");
    let new_message = document.createElement("li");
    new_message.className = "list_box";
    new_message.textContent = message;
    lounge_chat_list.insertBefore(new_message, lounge_chat_list.firstChild)
  });
});
