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
 *         <ul class="message_box">
 *           <li>
 *             <span>798</span> 名前: <span>名無しさん</span> ID: <span>sdf9879a8</span>
 *           </li>
 *           <li>test</li>
 *         </ul>
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

  let create_room_button = document.createElement("button");
  create_room_button.type = "button";
  create_room_button.id = "create_room_button";
  create_room_button.textContent = "部屋を作る";
  room_list_wrapper.appendChild(create_room_button);

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
      let message_text = input_lounge.value;
      socket.emit("send_to_lounge", message_text);
      input_lounge.value = "";
    }
  });

  // コメントボタンでラウンジチャットにメッセージを送信
  document.getElementById("send_to_lounge_button").addEventListener("click", () => {
    let input_lounge = document.getElementById("input_lounge");
    let message_text = input_lounge.value;
    socket.emit("send_to_lounge", message_text);
    input_lounge.value = "";
  });

  // 部屋を作るボタンが押されたときのイベント
  document.getElementById("create_room_button").addEventListener("click", () => {
    const jsFrame = new JSFrame();
    const frame = jsFrame.create({
      title: "新規部屋作成",
      width: 320, height: 220,
      movable: true,
      resizable: true,
      html: "<label>部屋名<input id='input_room_name'></label>"
          + "<label>説明<input id='input_room_description'></label>"
          + "<hr>"
          + "<button type='button' id='add_room_button'>決定</button>"
    });
    frame.on("#add_room_button", "click", (_frame, evt) => {
      alert("test");
    });
    frame.show();
  });

  // ラウンジにメッセージが送られた場合に呼び出されるsocketイベント
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
