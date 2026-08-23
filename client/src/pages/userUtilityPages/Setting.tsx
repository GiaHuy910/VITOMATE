import { Link, Outlet, NavLink } from "react-router-dom";

const Setting = () => {
  return (
    <div className="container-fluid mt-3 px-0">
      <div className="row g-0">
        {/* SIDE BAR */}
        <div className="col-md-3">
          <div className="card rounded-0">
            <div className="card-body">
              <div>
                <h5 className="ms-3">General</h5>
                <div className="d-grid mb-3">
                  <NavLink
                    className={({ isActive }) =>
                      `btn d-flex justify-content-start  ${
                        isActive ? "active" : ""
                      }`
                    }
                    to="general/account"
                  >
                    Account
                  </NavLink>

                  <NavLink
                    className={({ isActive }) =>
                      `btn d-flex justify-content-start ${
                        isActive ? "active" : ""
                      }`
                    }
                    to="general/theme"
                  >
                    Theme
                  </NavLink>
                </div>
              </div>
              <div className="divider">
                <hr></hr>
              </div>
              <div>
                <h5 className="ms-3">Something else</h5>
                <div className="d-grid  mb-3 ">
                  <button className="btn d-flex justify-content-start">
                    Another setting
                  </button>
                  <button className="btn d-flex justify-content-start ">
                    Another
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* DETAILS */}
        <div className="col-md-9">
          <div className="card rounded-0">
            <div className="card-body px-5">
              <Outlet />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Setting;
