import { useNavigate } from "react-router-dom";

const DashBoard = () => {
  const navigate = useNavigate();

  const handleStatic = () => {
    navigate("/static");
  };
  const handleWebservice = () => {
    navigate("/webservice");
  };

  return (
    <div className="border flex-basic-between ">
      <h1>DASHBOARD</h1>
      <div>
        <button
          type="button"
          className="btn btn-secondary dropdown-toggle rounded-0 d-flex align-items-center justify-content-end"
          data-bs-toggle="dropdown"
          aria-expanded="false"
        >
          + New{" "}
        </button>
        <ul className="dropdown-menu show">
          <li>
            <button
              type="button"
              className="dropdown-item"
              onClick={handleStatic}
            >
              <i className="bi bi-pc-display pe-2"></i>
              Static Site
            </button>
          </li>
          <li>
            <button
              type="button"
              className="dropdown-item "
              onClick={handleWebservice}
            >
              <i className="bi bi-globe pe-2  "></i>
              WebService
            </button>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default DashBoard;
