const SummaryCard = ({ title, value }) => {
    return (
        <div className="aero-summary-card">
            <div className="aero-summary-title">
                {title}
            </div>

            <div className="aero-summary-value">
                {value}
            </div>
        </div>
    );
};

export default SummaryCard;