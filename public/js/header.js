"use strict";

/**
 * 要素生成
 *
 * サイト上部に表示されるヘッダー部の生成
 * ユーザー名やトリップの変更、それらの表示を行う。
 * ページの主要素が含まれる、空の<main>タグの作成までを行う。
 *
 * <header class="body__header">
 *   <label>
 *     名前：<input id="input_name" class="header__name-input">
 *   </label>
 *   <label>
 *     トリップ:<input id="input_trip" class="header__trip-input">
 *   </label>
 *   <button type="button" id="name_send_button" class="header__name_send_button">決 定</button>
 *
 *   <span>
 *     現在の状態 - 
 *     名前: <span id="crnt_name"></span>
 *     ID: <span id="crnt_id"></span>
 *   </span>
 * </header>
 *
 * <main id="main" class="body__main">
 * </main>
 */
window.addEventListener("load", () => {
  let body = document.body;
  let header = document.createElement("header");
  header.className = "body__header";
  body.insertBefore(header, body.firstChild);

  // 名前入力部
  let name_label = document.createElement("label");
  name_label.textContent = "名前:";
  header.appendChild(name_label);
  let input_name = document.createElement("input");
  input_name.id = "input_name";
  input_name.className = "header__name-input";
  input_name.maxlength = "15";
  name_label.appendChild(input_name);

  // トリップ入力部
  let trip_label = document.createElement("label");
  trip_label.textContent = "トリップ:";
  header.appendChild(trip_label);
  let input_trip = document.createElement("input");
  input_trip.id = "input_trip";
  input_trip.className = "header__trip-input";
  input_trip.maxlength = "8";
  trip_label.appendChild(input_trip);

  let button = document.createElement("button");
  button.type = "button";
  button.id = "name_send_button";
  button.className = "header__name-send-button";
  button.textContent = "決 定";
  header.appendChild(button);
  let wbr = document.createElement("wbr");
  header.appendChild(wbr);

  // 状態表示部
  let crnt_status = document.createElement("span");
  crnt_status.textContent = "現在の状態 - 名前: ";
  header.appendChild(crnt_status);

  let crnt_name = document.createElement("span");
  crnt_name.id = "crnt_name";
  crnt_name.textContent = "";
  crnt_status.appendChild(crnt_name);

  let crnt_id_label = document.createTextNode(" - ID: ");
  crnt_status.appendChild(crnt_id_label);

  let crnt_id = document.createElement("span");
  crnt_id.id = "crnt_id";
  crnt_id.textContent = "";
  crnt_status.appendChild(crnt_id);

  // 空のmain部の作成
  let main = document.createElement("main");
  main.id = "main";
  main.className = "body__main";
  header.parentNode.insertBefore(main, header.nextSibling);
});


/**
 * 要素やsocketのイベントを設定
 */
window.addEventListener("load", () => {
  // 名前とトリップの変更用関数
  function change_name() {
    let name = document.getElementById("input_name").value;
    let trip = document.getElementById("input_trip").value;

    socket.emit("change_name", name, trip);
  }

  // 名前入力欄でのエンターキー入力で名前更新
  document.getElementById("input_name").addEventListener("keyup", (event) => {
    if (event.keyCode != 13) {
      return;
    }

    change_name();
  });

  // トリップ入力欄でのエンターキー入力で名前更新
  document.getElementById("input_trip").addEventListener("keyup", (event) => {
    if (event.keyCode != 13) {
      return;
    }

    change_name();
  });

  // 名前決定ボタンクリックで名前更新
  document.getElementById("name_send_button").addEventListener("click", () => {
    change_name();
  });

  // 名前やIDが変更された場合に呼び出されるsocketイベント
  socket.on("update_header_info", (user_info) => {
    document.getElementById("crnt_name").textContent = user_info.name;
    document.getElementById("crnt_id").textContent = user_info.id;
  });
});
