window.addEventListener("load", () => {
  let wrapper = document.getElementById("wrapper");
  let main = document.createElement("main");
  wrapper.appendChild(main);

  let test = document.createElement("p");
  test.textContent = "mainコンテンツ";
  main.appendChild(test);
});
