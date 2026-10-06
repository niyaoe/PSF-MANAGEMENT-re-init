import { useState } from "react";

const Pagination = ({
    page,
    totalPages,
    onPageChange
}) => {
    const [pageInput, setPageInput] = useState(page);

    const handlePrevious = () => {
        if (page > 1) {
            onPageChange(page - 1);
        }
    };

    const handleNext = () => {
        if (page < totalPages) {
            onPageChange(page + 1);
        }
    };

    const handlePageJump = () => {
        const requestedPage = Number(pageInput);

        if (
            !requestedPage ||
            requestedPage < 1 ||
            requestedPage > totalPages
        ) {
            setPageInput(page);
            return;
        }

        onPageChange(requestedPage);
    };

    return (
        <div className="aero-pagination">

            <button
                className="aero-button"
                onClick={handlePrevious}
                disabled={page === 1}
            >
                Previous
            </button>

            <span className="aero-page-info">
                Page {page} of {totalPages}
            </span>

            <div className="aero-page-jump">

                <input
                    type="number"
                    min="1"
                    max={totalPages}
                    value={pageInput}
                    onChange={(event) => {
                        setPageInput(event.target.value);
                    }}
                    onKeyDown={(event) => {
                        if (event.key === "Enter") {
                            handlePageJump();
                        }
                    }}
                />

                <button
                    className="aero-button"
                    type="button"
                    onClick={handlePageJump}
                >
                    Go
                </button>

            </div>

            <button
                className="aero-button"
                onClick={handleNext}
                disabled={page === totalPages}
            >
                Next
            </button>

        </div>
    );
};

export default Pagination;