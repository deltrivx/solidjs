import { Router, Route } from "@solidjs/router";
import { lazy } from "solid-js";
import Navbar from "./components/Navbar";
import Particles from "./components/Particles";

const Home = lazy(() => import("./pages/Home"));
const About = lazy(() => import("./pages/About"));

export default function App() {
  return (
    <div class="app">
      <Particles />
      <Navbar />
      <main>
        <Router>
          <Route path="/" component={Home} />
          <Route path="/about" component={About} />
        </Router>
      </main>
    </div>
  );
}
