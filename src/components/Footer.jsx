export default function Footer() {
    const currentYear = new Date().getFullYear();
    return (
        <footer>
            <p>© {currentYear} DeltrivX. Made with ❤️ and lots of ☕</p>
        </footer>
    );
}
