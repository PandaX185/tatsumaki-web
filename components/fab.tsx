import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';

export default function FAB({ onClick }: { onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className="absolute bottom-4 right-4 p-4 bg-button-login text-chat-message-text rounded-full shadow-lg hover:bg-button-login-hover transition hover:scale-105 cursor-pointer flex items-center justify-center"
        >
            <FontAwesomeIcon icon={faPlus} />
        </button>
    );
}
