export default function Footer() {
    const currentYear = new Date().getFullYear();
    return (
        <footer>
            <p>© {currentYear} Kris. Made with ❤️ and lots of ☕</p>
        </footer>
    );
}