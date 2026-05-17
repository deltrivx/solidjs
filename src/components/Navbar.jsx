export default function Navbar() {
  const linkStyle = {
    color: "#64748b",
    textDecoration: "none",
    fontSize: "0.9rem",
    transition: "all 0.3s",
  };

  return (
    <nav class="navbar">
      <div class="container">
        <a href="/" class="logo">[DELTRIVX]</a>
        <div class="nav-links">
          <a href="/">HOME</a>
          <a href="/blog">BLOG</a>
          <a href="/about">ABOUT</a>
        </div>
      </div>
    </nav>
  );
}
