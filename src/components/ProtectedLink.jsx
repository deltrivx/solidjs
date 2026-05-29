import { useAuth } from "../context/AuthContext";
import { useNavigate } from "@solidjs/router";

export default function ProtectedLink(props) {
    const { isLoggedIn } = useAuth();
    const navigate = useNavigate();

    const handleClick = (e) => {
        if (!isLoggedIn()) {
            e.preventDefault();
            navigate(`/login?redirect=${encodeURIComponent(props.href)}`);
        }
    };

    return (
        <a href={props.href} onClick={handleClick} target="_blank" rel="noopener noreferrer">
            {props.label}
        </a>
    );
}
