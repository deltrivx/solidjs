import { Router, Route } from "@solidjs/router";
import { lazy } from "solid-js";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

const Home = lazy(() => import("./pages/Home"));
const Blog = lazy(() => import("./pages/Blog"));
const Post = lazy(() => import("./pages/Post"));

export default function App() {
  return (
    <div class="app">
      <div class="scanlines"></div>
      <Navbar />
      <main class="container">
        <Router>
          <Route path="/" component={Home} />
          <Route path="/blog" component={Blog} />
          <Route path="/post/:slug" component={Post} />
        </Router>
      </main>
      <Footer />
    </div>
  );
}
