/**
 * 要素生成
 *
 * <footer>
 *   <small>
 *     (C) 2019 
 *     <a href="https://github.com/S-Del" target="_blank">
 *       S-Del
 *     </a>
 *   </small>
 * </footer>
 */
window.addEventListener("load", () => {
  let main = document.getElementById("main");
  let footer = document.createElement("footer");
  main.parentNode.insertBefore(footer, main.nextSibling);

  let small = document.createElement("small");
  small.textContent = "(C) 2019 ";
  footer.appendChild(small);

  let github = document.createElement("a");
  github.href = "https://github.com/S-Del";
  github.target = "_blank";
  github.textContent = "S-Del";
  small.appendChild(github);
});
