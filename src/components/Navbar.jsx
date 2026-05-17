import { A } from "@solidjs/router";

export default function Navbar() {
  return (
    <nav class="navbar">
      <div class="container">
        <A href="/" class="logo">[DELTRIVX]</A>
        <div class="nav-links">
          <A href="/">HOME</A>
          <A href="/blog">BLOG</A>
          <A href="/about">ABOUT</A>
        </div>
      </div>
    </nav>
  );
}
