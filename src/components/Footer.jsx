export default function Footer() {
    const currentYear = new Date().getFullYear();
    return (
        <footer>
            <p>© {currentYear} DeltrivX. Made with ❤️ and lots of ☕<br/><small>Based on <a href="https://github.com/Chan-Kris/Kris-personal_blog" target="_blank" rel="noopener">KrisChan's SolidJS Blog Template</a></small></p>
        </footer>
    );
}