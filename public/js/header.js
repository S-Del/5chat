/**
 * 要素生成
 */
window.addEventListener("load", () => {
  let wrapper = document.getElementById("wrapper");
  let header = document.createElement("header");
  wrapper.appendChild(header);

  let name_label = document.createElement("label");
  name_label.textContent = "名前:";
  let input_name = document.createElement("input");
  input_name.id = "input_name";
  input_name.maxlength = "15";
  name_label.appendChild(input_name);

  let trip_label = document.createElement("label");
  trip_label.textContent = "トリップ:";
  let input_trip = document.createElement("input");
  input_trip.id = "input_trip";
  input_trip.maxlength = "8";
  trip_label.appendChild(input_trip);

  let button = document.createElement("button");
  button.type = "button";
  button.id = "name_send_button";
  button.textContent = "決 定"

  let crnt_status = document.createElement("span");
  crnt_status.textContent = "現在の状態 - ";

  let crnt_name_label = document.createElement("span");
  crnt_name_label.textContent = "名前:";
  crnt_status.appendChild(crnt_name_label);
  let crnt_name = document.createElement("span");
  crnt_name.id = "crnt_name";
  crnt_name.textContent = "";
  crnt_status.appendChild(crnt_name);

  let crnt_id_label = document.createElement("span");
  crnt_id_label.textContent = "ID:";
  crnt_status.appendChild(crnt_id_label);
  let crnt_id = document.createElement("span");
  crnt_id.id = "crnt_id";
  crnt_id.textContent = "";
  crnt_status.appendChild(crnt_id);

  header.appendChild(name_label);
  header.appendChild(trip_label);
  header.appendChild(button);
  header.appendChild(crnt_status);

  let hr = document.createElement("hr");
  wrapper.appendChild(hr);
});


/**
 * 要素のイベントを設定
 */
window.addEventListener("load", () => {
  // 名前入力欄でのエンターキー入力で決定する
  document.getElementById("input_name").addEventListener("keyup", (event) => {
    if (event.keyCode === 13) {
      let name = document.getElementById("input_name").value;
      let trip = document.getElementById("input_trip").value;
      socket.emit("change_name", name, trip);
    }
  });

  // トリップ入力欄でのエンターキー入力で決定する
  document.getElementById("input_trip").addEventListener("keyup", (event) => {
    if (event.keyCode === 13) {
      let name = document.getElementById("input_name").value;
      let trip = document.getElementById("input_trip").value;
      socket.emit("change_name", name, trip);
    }
  });

  // 名前決定ボタン
  document.getElementById("name_send_button").addEventListener("click", () => {
    let name = document.getElementById("input_name").value;
    let trip = document.getElementById("input_trip").value;
    socket.emit("change_name", name, trip);
  });


  // 名前やIDが変更された場合に呼び出されるsocketイベント
  socket.on("update_user_info", (user_info) => {
    document.getElementById("crnt_name").textContent = user_info.name;
    document.getElementById("crnt_id").textContent = user_info.id;
  });

//// 同一ipで切断された場合
//// 同一ip切断を無効化しているためこちらも無効
//socket.on("ip_alert", (msg) => {
//  alert(msg);
//});
});
