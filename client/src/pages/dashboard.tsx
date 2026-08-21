import { useState } from "react";
import { useNavigate } from "react-router-dom";

const DashBoard = () => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleStatic = () => {
    navigate("/static");
  };
  const handleWebservice = () => {
    navigate("/webservice");
  };

  return (
    <div className="flex-basic-between">
      <h1>DASHBOARD</h1>
      <div>
        <button
          type="button"
          className="btn btn-secondary "
          onClick={() => setMenuOpen((prev) => !prev)}
        >
          + New{" "}
          {menuOpen ? (
            <i className="bi bi-chevron-compact-up"></i>
          ) : (
            <i className="bi bi-chevron-compact-down"></i>
          )}
        </button>
        {menuOpen && (
          <ul className="dropdown-menu show">
            <li>
              <button
                type="button"
                className="dropdown-item"
                onClick={handleStatic}
              >
                <i className="bi bi-pc-display"></i>
                <div></div>
                Static Site
              </button>
            </li>
            <li>
              <button
                type="button"
                className="dropdown-item "
                onClick={handleWebservice}
              >
                <i className="bi bi-globe"></i>
                <div></div>
                WebService
              </button>
            </li>
          </ul>
        )}
      </div>
    </div>
  );
};

export default DashBoard;
