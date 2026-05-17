import { render } from "solid-js/web";
import { onMount } from "solid-js";
import App from "./App";
import "./App.css";

const Root = () => {
  onMount(() => {
    const fb = document.getElementById("fb");
    if (fb) {
      fb.style.opacity = "0";
      fb.style.transition = "opacity 0.3s";
      setTimeout(() => fb.remove(), 300);
    }
  });
  return <App />;
};

const root = document.getElementById("root");
if (root) render(() => <Root />, root);
