import { Link } from "react-router-dom";

// import { useAuth } from "../../contexts/useAuth";
import { userUtilityPage } from "./index";

const Setting = () => {
  // const { user, loading } = useAuth();

  return (
    <div className="container-fluid mt-3 px-0">
      <div className="row g-0">
        {/* SIDE BAR */}
        <div className="col-md-3">
          <div className="card rounded-0">
            <div className="card-body">
              <h5>Account</h5>
              <div className="d-grid gap-2">
                {userUtilityPage.map((page) => (
                  <Link
                    className="dropdown-item"
                    key={page.path}
                    to={page.path}
                  >
                    {page.name}
                  </Link>
                ))}
              </div>
              <h5>Placeholder Name</h5>
              <div className="d-grid gap-2">
                {userUtilityPage.map((page) => (
                  <Link
                    className="dropdown-item"
                    key={page.path}
                    to={page.path}
                  >
                    {page.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
        {/* DETAILS */}
        <div className="col-md-9">
          <div className="card rounded-0">
            <div className="card-body px-5">
              <h3>Setting</h3>
              <div className="card-body border rounded-0"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Setting;
