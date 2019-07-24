let socket = io();

window.addEventListener("load", () => {
  let wrapper = document.getElementById("wrapper");
  let header = document.createElement("header");
  wrapper.appendChild(header);

  let label = document.createElement("label");
  label.textContent = "名前：";
  let input = document.createElement("input");
  input.id = "input_name";
  input.autocomplete = false;
  label.appendChild(input);

  let button = document.createElement("button");
  button.type = "button";
  button.id = "name_send_button";
  button.textContent = "決 定"

  header.appendChild(label);
  header.appendChild(button);

  let hr = document.createElement("hr");
  wrapper.appendChild(hr);
});

window.addEventListener("load", () => {
  document.getElementById("name_send_button").addEventListener("click", () => {
    let name = document.getElementById("input_name").value;

//    // セッションストレージにユーザーネームを保存
//    // 今は必要性を感じないので無効
//    sessionStorage.setItem("name", name);

    socket.emit("user_name", name);
  });
});

//// 同一ipで切断された場合
//// 同一ip切断を無効化しているためこちらも無効
//socket.on("ip_alert", (msg) => {
//  alert(msg);
//});
