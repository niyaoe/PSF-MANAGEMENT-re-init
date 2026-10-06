const BranchFilter = ({
    branches,
    branchId,
    setBranchId
}) => {
    return (
        <div className="aero-filter-group">
            <label>Branch</label>

            <select
                value={branchId}
                onChange={(event) => {
                    setBranchId(event.target.value);
                }}
            >
                <option value="">
                    All Branches
                </option>

                {branches.map((branch) => {
                    const id = branch._id || branch.id;

                    return (
                        <option
                            key={id}
                            value={id}
                        >
                            {branch.name}
                        </option>
                    );
                })}
            </select>
        </div>
    );
};

export default BranchFilter;