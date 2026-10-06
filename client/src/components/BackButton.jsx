import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";

const BackButton = ({ className = "aero-back-button" }) => {
    const navigate = useNavigate();

    const handleBack = () => {
        navigate("/dashboard");
    };

    return (
        <button
            className={className}
            type="button"
            onClick={handleBack}
        >
            <FaArrowLeft />
            
        </button>
    );
};

export default BackButton;