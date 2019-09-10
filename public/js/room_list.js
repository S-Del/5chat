"use strict";

/**
 * 要素生成
 *
 * <main>タグの中に含まれる部屋一覧用の要素
 * 部屋の作成、部屋の参加、部屋一覧の更新や並び替え等を行う。
 *
 * ---------- HTML構成 ----------
 * <section class="main__room-list">
 *   <div>
 *     <h2>部屋一覧</h2>
 *     <button type="button"
 *             id="relord_list_button"
 *             class="room-list__reload-list-button">
 *       一覧更新
 *     </button>
 *     <button type="button"
 *             id="create_room_button"
 *             class="room-list__create-room-button">
 *       部屋を作る
 *     </button>
 *     <span>
 *       現在の部屋数: 
 *       <span id="room_count"></span>
 *     </span>
 *     <hr>
 *   </div>
 *
 *   <div class="room_list__list-wrapper">
 *     <ul id="room_list" class="room-list">
 *       <li class="room-list__item">
 *         <h3>部屋名</h3>
 *         <span>人数: </span>
 *         <span>書き込み数: </span>
 *         <span>勢い: </span>
 *         <hr>
 *         <span>部屋の説明</span>
 *       </li>
 *     </ul>
 *   </div>
 * </section>
 */
window.addEventListener("load", () => {
  let main = document.getElementById("main");

  let room_list_section = document.createElement("section");
  room_list_section.className = "main__room-list";
  main.appendChild(room_list_section);

  let div = document.createElement("div");
  room_list_section.appendChild(div);

  let room_list_label = document.createElement("h2");
  room_list_label.textContent = "部屋一覧";
  div.appendChild(room_list_label);

  let relord_list_button = document.createElement("button");
  relord_list_button.type = "button";
  relord_list_button.id = "relord_list_button";
  relord_list_button.className = "room-list__reload-list-button";
  relord_list_button.textContent = "一覧を更新";
  div.appendChild(relord_list_button);

  let create_room_button = document.createElement("button");
  create_room_button.type = "button";
  create_room_button.id = "create_room_button";
  create_room_button.className = "room-list__create-room-button";
  create_room_button.textContent = "部屋を作る";
  div.appendChild(create_room_button);

  let room_count_label = document.createElement("span");
  room_count_label.textContent = "現在の部屋数: ";
  div.appendChild(room_count_label);

  let room_count = document.createElement("span");
  room_count.id = "room_count";
  div.appendChild(room_count);

  let room_list_hr = document.createElement("hr");
  div.appendChild(room_list_hr);

  let room_list_wrapper = document.createElement("div");
  room_list_wrapper.className = "room_list__list-wrapper";
  room_list_section.appendChild(room_list_wrapper);

  let room_list = document.createElement("ul");
  room_list.id = "room_list";
  room_list.className = "room-list";
  room_list_wrapper.appendChild(room_list);
});


/**
 * 要素やsocketのイベントを設定
 */
window.addEventListener("load", () => {
  // 一覧を更新ボタンが押されたときのイベント
  document.getElementById("relord_list_button").addEventListener("click", () => {
    socket.emit("reload_list");
  });

  // 部屋一覧表示を更新するソケットイベント
  socket.on("update_room_list", (rooms) => {
    // 現在の部屋数表示を更新
    let room_count = document.getElementById("room_count");
    room_count.textContent = rooms.length;

    // 既に表示されている部屋を一旦すべて消去
    let room_list = document.getElementById("room_list");
    while (room_list.firstChild) {
      room_list.removeChild(room_list.firstChild);
    }

    // 新しく得た部屋一覧を全て表示
    for (let i = 0; i < rooms.length; i++) {
      let room = document.createElement("li");
      room.className = "room-list__item";
      room_list.appendChild(room);

      let room_name = document.createElement("h3");
      room_name.textContent = rooms[i].name;
      room.appendChild(room_name);

      let num_of_people = document.createElement("span");
      num_of_people.textContent = "人数: " + rooms[i].usersCount;
      room.appendChild(num_of_people);

      let num_of_comment = document.createElement("span");
      num_of_comment.textContent = "書き込み数: " + rooms[i].postsCount;
      room.appendChild(num_of_comment);

      let room_power = document.createElement("span");
      room_power.textContent = "勢い: " + rooms[i].power.toFixed(1) + " ";
      room.appendChild(room_power);

      let hr = document.createElement("hr");
      room.appendChild(hr);

      let room_desc = document.createElement("span");
      room_desc.textContent = rooms[i].desc;
      room.appendChild(room_desc);

      // 部屋がクリックされたときのイベントを各部屋に設定
      room.addEventListener("click", () => {
        socket.emit("join_room", rooms[i].id);
      });
    }
  });

  // 部屋を作るボタンが押されたときのウィンドウ生成イベント
  document.getElementById("create_room_button").addEventListener("click", () => {
    jsPanel.create({
      animateIn: "jsPanelFadeIn",
      theme: {
        bgPanel: "rgb(192, 192, 192)",
        colorHeader: "rgb(32, 32, 32)",
        bgContent: "rgb(48, 48, 48)",
        colorContent: "rgb(192, 192, 192)"
      },
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
          return Math.round(window.innerWidth / 3);
        },
        height: () => {
          return Math.round(window.innerHeight / 3);
        }
      },
      borderRadius: "0.5em",
      headerTitle: "新規部屋作成",
      contentFetch: {
        resource: "/html/create_room.html",
        done: (panel, response) => {
          panel.content.innerHTML = response;

          function create_new_room() {
            let name = panel.content
                .getElementsByClassName("create-room-window__input-room-name")[0].value;
            let desc = panel.content
                .getElementsByClassName("create-room-window__input-room-description")[0].value;

            socket.emit("create_new_room", name, desc);
            panel.close();
          }

          // 部屋作成ウィンドウ内の「作る」ボタンが押されたときに部屋作成を要求
          panel.content.getElementsByClassName("create-room-window__add-room-button")[0].addEventListener("click", () => {
            create_new_room();
          });

          // 部屋名入力欄でのエンターキーで部屋作成を要求
          panel.content.getElementsByClassName("create-room-window__input-room-name")[0].addEventListener("keyup", (event) => {
            if (event.keyCode != 13) {
              return;
            }

            create_new_room();
          });

          // 説明入力欄でのエンターキーで部屋作成を要求
          panel.content.getElementsByClassName("create-room-window__input-room-description")[0].addEventListener("keyup", (event) => {
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
    jsPanel.create({
      animateIn: "jsPanelFadeIn",
      theme: {
        bgPanel: "rgb(192, 192, 192)",
        colorHeader: "rgb(32, 32, 32)",
        bgContent: "rgb(48, 48, 48)",
        colorContent: "rgb(192, 192, 192)"
      },
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
          return Math.round(window.innerWidth / 3);
        },
        height: () => {
          return Math.round(window.innerHeight / 3);
        }
      },
      borderRadius: "0.5em",
      headerTitle: room.name,
      contentFetch: {
        resource: "/html/room.html",
        done: (panel, response) => {
          panel.content.innerHTML = response;

          // 人数表示
          panel.content.getElementsByClassName("room-window__num-of-people")[0].textContent =
              "人数: " + room.usersCount;

          // 人数更新
          socket.on("notification_enter_or_leave", (newNotification) => {
            panel.content.getElementsByClassName("room-window__num-of-people")[0].textContent =
                "人数: " + newNotification.memberCount;
            
            let room_chat_list = panel.content.getElementsByClassName("room-window__room-chat-list")[0];
            let new_member_message = document.createElement("li");
            new_member_message.className = "room-chat-list__item--new-member";
            new_member_message.textContent = "----- "
                                             + newNotification.newMemberName
                                             + " が"
                                             + newNotification.memberAction
                                             + "しました -----";
            room_chat_list.insertBefore(new_member_message, room_chat_list.firstChild);
          });

          // 勢い表示
          panel.content.getElementsByClassName("room-window__room-power")[0].textContent =
              "勢い: " + room.power.toFixed(1);

          // 部屋の書き込み受信時に部屋の書き込み一覧と勢いの表示を更新
          socket.on("message_room", (room_message) => {
            if (room_id != room_message.roomId) {
              return;
            }

            panel.content.getElementsByClassName("room-window__room-power")[0].textContent =
                "勢い: " + room_message.roomPower.toFixed(1);

            let room_chat_list = panel.content.getElementsByClassName("room-window__room-chat-list")[0];
            let new_message = document.createElement("li");
            new_message.className = "room-chat-list__item";
            // レスのクリック時にレスアンカーを生成して入力欄にフォーカス
            new_message.addEventListener("click", () => {
              let input_room = panel.content.getElementsByClassName("room-window__input-room")[0];
              input_room.value += ">>" + room_message.no + " ";
              input_room.focus();
            });
            room_chat_list.insertBefore(new_message, room_chat_list.firstChild);

            let resp_no = document.createElement("span");
            resp_no.textContent = room_message.no + " ";
            new_message.appendChild(resp_no);

            let name = document.createElement("span");
            name.textContent = "名前：" + room_message.name + " ";
            new_message.appendChild(name);

            let id = document.createElement("span");
            id.textContent = "ID:" + room_message.id;
            new_message.appendChild(id);

            let br = document.createElement("br");
            new_message.appendChild(br);

            let content = document.createElement("span");
            content.className = "room-chat-list__item-message";
            content.textContent = room_message.message;
            new_message.appendChild(content);
          });

          // 書き込み送信用
          function send_to_room() {
            let input_room = panel.content.getElementsByClassName("room-window__input-room")[0].value;
            panel.content.getElementsByClassName("room-window__input-room")[0].value = "";

            socket.emit("send_to_room", room_id, input_room);
          }

          // 部屋ウィンドウ内の「書き込む」ボタンが押された時に部屋内発言を要求
          panel.content.getElementsByClassName("room-window__send-to-room-button")[0].addEventListener("click", () => {
            send_to_room();
          });

          // 書き込み欄でのエンターキーで部屋内発言を要求
          panel.content.getElementsByClassName("room-window__input-room")[0].addEventListener("keyup", (event) => {
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
