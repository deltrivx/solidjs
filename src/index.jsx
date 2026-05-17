import { render } from "solid-js/web";
import { onMount } from "solid-js";
import App from "./App";
import "./App.css";

// 处理 404.html 重定向：取 sessionStorage.redirect 做 SPA 路由
const redirectPath = sessionStorage.getItem("redirect");
if (redirectPath && redirectPath !== "/") {
  sessionStorage.removeItem("redirect");
  history.replaceState(null, "", redirectPath);
}

const Root = () => {
  onMount(() => {
    const fb = document.getElementById("fallback");
    if (fb) {
      fb.style.opacity = "0";
      fb.style.transition = "opacity 0.3s";
      setTimeout(() => fb.remove(), 300);
    }
  });
  return <App />;
};

const root = document.getElementById("root");
if (root) {
  render(() => <Root />, root);
}
