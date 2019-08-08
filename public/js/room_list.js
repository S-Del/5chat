"use strict";

/**
 * 要素生成
 *
 * <main>タグの中に含まれる部屋一覧用の要素
 * 部屋の作成、部屋の参加、部屋一覧の更新や並び替え等を行う。
 *
 * ---------- HTML構成 ----------
 * <div id="room_list_wrapper">
 *   <h2>部屋一覧</h2>
 *   <button type="button">一覧更新</button>
 *   <button type="button">部屋を作る</button>
 *   <hr>
 *
 *   <ul id="room_list">
 *     <li>
 *       <h3>部屋名</h3>
 *       <hr>
 *       <span>部屋の説明</span>
 *     </li>
 *   </ul>
 * </div>
 */
window.addEventListener("load", () => {
  let main = document.getElementById("main");

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

  // 部屋を作るボタンが押されたときのウィンドウ生成イベント
  document.getElementById("create_room_button").addEventListener("click", () => {
    let create_room_panel = jsPanel.create({
      animateIn: "jsPanelFadeIn",
      theme: "dark filleddark",
      iconfont: [
        'custom-smallify',
        'custom-smallifyrev',
        'custom-minimize',
        'custom-normalize',
        'custom-maximize',
        'custom-close'
      ],
      contentSize: {
        width: () => {
          return window.innerWidth / 3;
        },
        height: () => {
          return window.innerHeight / 3;
        }
      },
      borderRadius: "0.5em",
      headerTitle: "新規部屋作成",
      headerControls: {
        size: "xs"
      },
      contentFetch: {
        resource: "/html/create_room.html",
        done: (panel, response) => {
          panel.content.innerHTML = response;

          function create_new_room() {
            let new_room_info = {
              input_room_name: panel.content.getElementsByClassName("input_room_name")[0].value,
              input_room_description: panel.content.getElementsByClassName("input_room_description")[0].value
            };

            socket.emit("create_new_room", new_room_info);
            panel.close();
          }

          // 部屋作成ウィンドウ内の「作る」ボタンが押されたときに部屋作成を要求
          panel.content.getElementsByClassName("add_room_button")[0].addEventListener("click", () => {
            create_new_room();
          });

          // 部屋名入力欄でのエンターキーで部屋作成を要求
          panel.content.getElementsByClassName("input_room_name")[0].addEventListener("keyup", (event) => {
            if (event.keyCode != 13) {
              return;
            }

            create_new_room();
          });

          // 説明入力欄でのエンターキーで部屋作成を要求
          panel.content.getElementsByClassName("input_room_description")[0].addEventListener("keyup", (event) => {
            if (event.keyCode != 13) {
              return;
            }

            create_new_room();
          });
        }
      },
      position: "center 50 50"
    });
  });

  // 入室許可のソケットイベントにて部屋ウィンドウを表示
  socket.on("accept_entry_room", (room_id, room) => {
    let room_panel = jsPanel.create({
      animateIn: "jsPanelFadeIn",
      theme: "dark filleddark",
      iconfont: [
        'custom-smallify',
        'custom-smallifyrev',
        'custom-minimize',
        'custom-normalize',
        'custom-maximize',
        'custom-close'
      ],
      contentSize: {
        width: () => {
          return window.innerWidth / 3;
        },
        height: () => {
          return window.innerHeight / 3;
        }
      },
      borderRadius: "0.5em",
      headerTitle: room.name,
      headerControls: {
        size: "xs"
      },
      contentFetch: {
        resource: "/html/room.html",
        done: (panel, response) => {
          panel.content.innerHTML = response;

          // 人数表示
          panel.content.getElementsByClassName("num_of_people")[0].textContent = Object.keys(room.users).length;

          // 人数更新
          socket.on("update_nop", (num_of_people) => {
            panel.content.getElementsByClassName("num_of_people")[0].textContent = num_of_people;
          })

          // 勢い表示
          panel.content.getElementsByClassName("room_power")[0].textContent = room.power.toFixed(1);

          // 部屋の書き込み受信時に部屋の書き込み一覧と勢いの表示を更新
          socket.on("message_room", (room_message) => {
            if (room_id != room_message.room_id) {
              return;
            }

            panel.content.getElementsByClassName("room_power")[0].textContent = room_message.power.toFixed(1);

            let room_chat_list = panel.content.getElementsByClassName("room_chat_list")[0];
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

          // 書き込み送信用
          function send_to_room() {
            let room_message = {
              room_id: room_id,
              input_room: panel.content.getElementsByClassName("input_room")[0].value
            }
            panel.content.getElementsByClassName("input_room")[0].value = "";

            socket.emit("send_to_room", room_message);
          }

          // 部屋ウィンドウ内の「書き込む」ボタンが押された時に部屋内発言を要求
          panel.content.getElementsByClassName("send_to_room_button")[0].addEventListener("click", () => {
            send_to_room();
          });

          // 書き込み欄でのエンターキーで部屋内発言を要求
          panel.content.getElementsByClassName("input_room")[0].addEventListener("keyup", (event) => {
            if (event.keyCode != 13) {
              return;
            }

            send_to_room();
          });
        }
      },
      onclosed: () => {
        // 部屋ウィンドウの閉じるボタンが押された時の退室要求
        socket.emit("leave_room", room_id);
      },
      position: "center 50 50"
    });
  });
});
