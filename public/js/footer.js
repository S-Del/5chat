"use strict";

/**
 * 要素生成
 *
 * <footer class="body__footer">
 *   <small class="copyright">
 *     (C) 2019 
 *     <a href="https://github.com/S-Del/5chat" target="_blank" class="copyright__link-github">
 *       S-Del
 *     </a>
 *   </small>
 * </footer>
 */
window.addEventListener("load", () => {
  let main = document.getElementById("main");
  let footer = document.createElement("footer");
  footer.className = "body__footer";
  main.parentNode.insertBefore(footer, main.nextSibling);

  let small = document.createElement("small");
  small.className = "copyright";
  small.textContent = "(C) 2019 ";
  footer.appendChild(small);

  let github = document.createElement("a");
  github.href = "https://github.com/S-Del/5chat";
  github.target = "_blank";
  github.className = "copyright__link-github";
  github.textContent = "S-Del";
  small.appendChild(github);
});
