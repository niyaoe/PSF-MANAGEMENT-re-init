
import "../styles/psfDashboard.css";

const PSFSectionSidebar = ({ activeSection, onSectionChange }) => {
  const sections = [
    { id: "open", label: "Open", icon: "🔴" },
    { id: "pending", label: "Pending", icon: "🟡" },
    { id: "closed", label: "Closed", icon: "🟢" },
  ];

  return (
    <aside className="psfd-section-sidebar">
      <div className="psfd-sidebar-heading">
        <span className="psfd-sidebar-brand-mark">P</span>
        <div className="psfd-sidebar-brand">
          <strong>PSF Manager</strong>
          <span>Customer Follow-up</span>
        </div>
      </div>

      <div className="psfd-sidebar-label">WORKSPACE</div>

      <nav className="psfd-section-navigation" aria-label="PSF sections">
        {sections.map((section) => (
          <button
            type="button"
            key={section.id}
            className={`psfd-section-link ${
              activeSection === section.id ? "psfd-section-link-active" : ""
            }`}
            onClick={() => onSectionChange(section.id)}
            aria-current={
              activeSection === section.id ? "page" : undefined
            }
          >
            <span className="psfd-section-icon" aria-hidden="true">
              {section.icon}
            </span>
            <span>{section.label}</span>
            {activeSection === section.id && (
              <span className="psfd-section-active-indicator" />
            )}
          </button>
        ))}
      </nav>

      <div className="psfd-sidebar-footer">
        <span className="psfd-sidebar-footer-dot" />
        <span>PSF Management</span>
      </div>
    </aside>
  );
};

export default PSFSectionSidebar;
