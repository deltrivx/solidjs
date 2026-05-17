import { Router, Route } from "@solidjs/router";
import { lazy } from "solid-js";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Particles from "./components/Particles";

const Home = lazy(() => import("./pages/Home"));
const Blog = lazy(() => import("./pages/Blog"));
const Post = lazy(() => import("./pages/Post"));
const About = lazy(() => import("./pages/About"));
const NotFound = lazy(() => import("./pages/NotFound"));

export default function App() {
  return (
    <div class="app">
      <Particles />
      <div class="scanlines"></div>
      <Router>
        <Navbar />
        <main class="container" style="position: relative; z-index: 1;">
          <Route path="/" component={Home} />
          <Route path="/blog" component={Blog} />
          <Route path="/post/:slug" component={Post} />
          <Route path="/about" component={About} />
          <Route path="*" component={NotFound} />
        </main>
        <Footer />
      </Router>
    </div>
  );
}
