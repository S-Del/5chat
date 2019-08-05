"use strict";

/**
 * 要素生成
 *
 * <main>
 *   <div id="room_list_wrapper">
 *     <h2>部屋一覧</h2>
 *     <button type="button">一覧更新</button>
 *     <button type="button">部屋を作る</button>
 *     <hr>
 *
 *     <ul id="room_list">
 *       <li>
 *         <h3>部屋名</h3>
 *         <hr>
 *         <span>部屋の説明</span>
 *       </li>
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

  let relord_list_button = document.createElement("button");
  relord_list_button.type = "button";
  relord_list_button.id = "relord_list_button";
  relord_list_button.textContent = "一覧を更新";
  room_list_wrapper.appendChild(relord_list_button);

  let create_room_button = document.createElement("button");
  create_room_button.type = "button";
  create_room_button.id = "create_room_button";
  create_room_button.textContent = "部屋を作る";
  room_list_wrapper.appendChild(create_room_button);

  let room_count_label = document.createElement("span");
  room_count_label.textContent = "現在の部屋数: ";
  room_list_wrapper.appendChild(room_count_label);

  let room_count = document.createElement("span");
  room_count.id = "room_count";
  room_list_wrapper.appendChild(room_count);

  let room_list_hr = document.createElement("hr");
  room_list_wrapper.appendChild(room_list_hr);

  let room_list = document.createElement("ul");
  room_list.id = "room_list";
  room_list_wrapper.appendChild(room_list);

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
  // 一覧を更新ボタンが押されたときのイベント
  document.getElementById("relord_list_button").addEventListener("click", () => {
    socket.emit("relord_list");
  });

  // 部屋一覧表示を更新するソケットイベント
  socket.on("update_room_list", (rooms) => {
    // 現在の部屋数表示を更新
    let room_count = document.getElementById("room_count");
    room_count.textContent = Object.keys(rooms).length;

    // 既に表示されている部屋を一旦すべて消去
    let room_list = document.getElementById("room_list");
    while (room_list.firstChild) {
      room_list.removeChild(room_list.firstChild);
    }

    // 新しく得た部屋一覧を全て表示
    for (let room_id in rooms) {
      let room = document.createElement("li");
      room.id = room_id;
      room.className = "list_box room_list_box"
      room_list.appendChild(room);

      let room_name = document.createElement("h3");
      room_name.textContent = rooms[room_id].name;
      room.appendChild(room_name);

      let num_of_people = document.createElement("span");
      num_of_people.textContent = "人数: " + Object.keys(rooms[room_id].users).length + " ";
      room.appendChild(num_of_people);

      let num_of_comment = document.createElement("span");
      num_of_comment.textContent = "書き込み数: " + rooms[room_id].messages.length + " ";
      room.appendChild(num_of_comment);

      let room_power = document.createElement("span");
      room_power.textContent = "勢い: " + rooms[room_id].power.toFixed(1) + " ";
      room.appendChild(room_power);

      let hr = document.createElement("hr");
      room.appendChild(hr);

      let room_desc = document.createElement("span");
      room_desc.textContent = rooms[room_id].desc;
      room.appendChild(room_desc);

      // 部屋がクリックされたときのイベントを各部屋に設定
      room.addEventListener("click", () => {
        socket.emit("join_room", room_id);
      });
    }
  });

  // 部屋を作るボタンが押されたときのイベント
  document.getElementById("create_room_button").addEventListener("click", () => {
    let vw = window.innerWidth;
    let vh = window.innerHeight;
    let width = vw / 3;
    let height = vh / 3;

    const jsFrame = new JSFrame();
    const frame = jsFrame.create({
      title: "新規部屋作成",
      left: (vw / 2) - (width / 2),
      top: (vh / 2) - (height / 2),
      width: width,
      height: height,
      movable: true,
      resizable: true,
      url: "/html/create_room.html",
      urlLoaded: (_frame) => {
        // ウィンドウ内の作るボタンが押されたときのソケットイベント
        frame.on("#add_room_button", "click", (_frame, evt) => {
          let new_room_info = {
            input_room_name: frame.$("#input_room_name").value,
            input_room_description: frame.$("#input_room_description").value
          };
          socket.emit("create_new_room", new_room_info);
          frame.closeFrame();
        });
      }
    });
    frame.show();
  });

  // 入室許可された際のウィンドウを表示するソケットイベント
  socket.on("accept_entry_room", (room_id, room) => {
    let vw = window.innerWidth;
    let vh = window.innerHeight;
    let width = vw / 3;
    let height = vh / 3;

    const jsFrame = new JSFrame();
    const frame = jsFrame.create({
      title: room.name,
      left: (vw / 2) - (width / 2),
      top: (vh / 2) - (height / 2),
      width: width,
      height: height,
      movable: true,
      resizable: true,
      url: "/html/room.html",
      urlLoaded: (_frame) => {
        // 人数表示
        frame.$("#num_of_people").textContent = Object.keys(room.users).length;

        // 勢い表示
        frame.$("#room_power").textContent = room.power.toFixed(1);

        // ウィンドウ内の書き込むボタンが押された際のイベント
        frame.on("#send_to_room_button", "click", (_frame, evt) => {
          let room_message = {
            room_id: room_id,
            input_room: frame.$("#input_room").value
          }
          socket.emit("send_to_room", room_message);
        });

        // 閉じるボタンが押された場合のイベント
        frame.on("closeButton", "click", (_frame, evt) => {
          socket.emit("leave_room", room_id);
          frame.closeFrame();
        });

        // 入退室者があった場合の人数更新のソケットイベント
        socket.on("update_nop", (num_of_people) => {
          frame.$("#num_of_people").textContent = num_of_people;
        })

        // 部屋当てのメッセージを受け取った時のソケットイベント
        socket.on("message_room", (room_message) => {
          if (room_id != room_message.room_id) {
            return;
          }

          frame.$("#room_power").textContent = room_message.power.toFixed(1);

          let room_chat_list = frame.$("#room_chat_list");
          let new_message = document.createElement("li");
          new_message.className = "list_box";
          room_chat_list.insertBefore(new_message, room_chat_list.firstChild);

          let message_box = document.createElement("ul");
          message_box.className = "message_box";
          new_message.appendChild(message_box);

          let message_box_content = document.createElement("li");
          message_box.appendChild(message_box_content);

          let resp_no = document.createElement("span");
          resp_no.textContent = room_message.no + " ";
          message_box_content.appendChild(resp_no);

          let name_label = document.createTextNode("名前：");
          message_box_content.appendChild(name_label);

          let name = document.createElement("span");
          name.textContent = room_message.user.name + " ";
          message_box_content.appendChild(name);

          let id_label = document.createTextNode("ID:");
          message_box_content.appendChild(id_label);

          let id = document.createElement("span");
          id.textContent = room_message.user.id;
          message_box_content.appendChild(id);

          let content = document.createElement("li");
          content.className = "message";
          content.textContent = room_message.input_room;
          message_box_content.appendChild(content);
        });
      }
    });

    frame.show();
  });

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
