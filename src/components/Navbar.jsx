export default function Navbar() {
  return (
    <nav id="navbar">
      <a href="/" style="text-decoration:none;font-size:1.5rem;font-weight:800;background:linear-gradient(135deg,var(--accent-1),var(--accent-2));-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;letter-spacing:-0.5px;">DeltrivX</a>
      <ul class="nav-links">
        <li><a href="/about">关于</a></li>
        <li><a href="/skills">技能</a></li>
        <li><a href="/projects">项目</a></li>
        <li><a href="/contact">联系</a></li>
      </ul>
    </nav>
  );
}
