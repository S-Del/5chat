/**
 * 要素生成
 *
 * サイト上部に表示されるヘッダー部の生成
 * ユーザー名やトリップの変更、それらの表示を行う。
 * ページの主要素が含まれる、空の<main>タグの作成までを行う。
 *
 * <header>
 *   <label>
 *     名前：<input id="input_name">
 *   </label>
 *   <label>
 *     トリップ:<input id="input_trip">
 *   </label>
 *   <button type="button" id="name_send_button">決 定</button>
 *
 *   <span>
 *     現在の状態 - 
 *     名前: <span id="crnt_name"></span>
 *     ID: <span id="crnt_id"></span>
 *   </span>
 * </header>
 *
 * <main id="main">
 * </main>
 */
window.addEventListener("load", () => {
  let body = document.body;
  let header = document.createElement("header");
  body.insertBefore(header, body.firstChild);

  // 名前入力部
  let name_label = document.createElement("label");
  name_label.textContent = "名前:";
  header.appendChild(name_label);
  let input_name = document.createElement("input");
  input_name.id = "input_name";
  input_name.maxlength = "15";
  name_label.appendChild(input_name);

  // トリップ入力部
  let trip_label = document.createElement("label");
  trip_label.textContent = "トリップ:";
  header.appendChild(trip_label);
  let input_trip = document.createElement("input");
  input_trip.id = "input_trip";
  input_trip.maxlength = "8";
  trip_label.appendChild(input_trip);

  let button = document.createElement("button");
  button.type = "button";
  button.id = "name_send_button";
  button.textContent = "決 定"
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

  let crnt_id_label = document.createTextNode(" - ID: ")
  crnt_status.appendChild(crnt_id_label);

  let crnt_id = document.createElement("span");
  crnt_id.id = "crnt_id";
  crnt_id.textContent = "";
  crnt_status.appendChild(crnt_id);

  // 空のmain部の作成
  let main = document.createElement("main");
  main.id = "main";
  header.parentNode.insertBefore(main, header.nextSibling);
});


/**
 * 要素やsocketのイベントを設定
 */
window.addEventListener("load", () => {
  // 名前入力欄でのエンターキー入力で決定する
  document.getElementById("input_name").addEventListener("keyup", (event) => {
    if (event.keyCode === 13) {
      let new_name = {
        name: document.getElementById("input_name").value,
        trip: document.getElementById("input_trip").value
      };

      socket.emit("change_name", new_name);
    }
  });

  // トリップ入力欄でのエンターキー入力で決定する
  document.getElementById("input_trip").addEventListener("keyup", (event) => {
    if (event.keyCode === 13) {
      let new_name = {
        name: document.getElementById("input_name").value,
        trip: document.getElementById("input_trip").value
      };

      socket.emit("change_name", new_name);
    }
  });

  // 名前決定ボタン
  document.getElementById("name_send_button").addEventListener("click", () => {
    let new_name = {
      name: document.getElementById("input_name").value,
      trip: document.getElementById("input_trip").value
    };

    socket.emit("change_name", new_name);
  });

  // 名前やIDが変更された場合に呼び出されるsocketイベント
  socket.on("update_header_info", (user_info) => {
    document.getElementById("crnt_name").textContent = user_info.name;
    document.getElementById("crnt_id").textContent = user_info.id;
  });
});
