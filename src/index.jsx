import { render } from "solid-js/web";
import { onMount } from "solid-js";
import App from "./App";
import "./App.css";

const Root = () => {
  onMount(() => {
    const fb = document.getElementById("fallback");
    if (fb) fb.style.display = "none";
  });
  return <App />;
};

const root = document.getElementById("root");
if (root) {
  render(() => <Root />, root);
}
