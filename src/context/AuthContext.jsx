import { createContext, useContext, createSignal } from 'solid-js';

const AUTH_HASH = "ba5f920b7136c1cd3101518a952c085a4e2313e4800d628c86b630f142808039";

async function sha256(str) {
    const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(str));
    return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("");
}

const AuthContext = createContext();

export function AuthProvider(props) {
    const [isLoggedIn, setIsLoggedIn] = createSignal(
        localStorage.getItem("auth_logged_in") === "true"
    );
    const [username, setUsername] = createSignal(
        localStorage.getItem("auth_username") || ""
    );

    const login = async (user, password) => {
        const hash = await sha256(password);
        if (hash === AUTH_HASH) {
            localStorage.setItem("auth_logged_in", "true");
            localStorage.setItem("auth_username", user);
            setIsLoggedIn(true);
            setUsername(user);
            return true;
        }
        return false;
    };

    const logout = () => {
        localStorage.removeItem("auth_logged_in");
        localStorage.removeItem("auth_username");
        setIsLoggedIn(false);
        setUsername("");
    };

    return (
        <AuthContext.Provider value={{ isLoggedIn, username, login, logout }}>
            {props.children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within AuthProvider");
    return ctx;
}
