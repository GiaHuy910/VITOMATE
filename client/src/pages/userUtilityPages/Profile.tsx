// import { useAuth } from "../../contexts/useAuth";
import { Link } from "react-router-dom";
import { userUtilityPage } from "./index";

const Profile = () => {
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
            <div className="card-body ps-5">
              <h3>Profile details </h3>
              <div className="card-body border rounded-0">
                <div className="row" style={{ height: "100px" }}>
                  <div className="h-100">
                    {" "}
                    <div className="col-md-4">
                      <div>Display Name</div>
                    </div>
                    <div className="col-md-8">
                      <input type="text" style={{ width: "100%" }} />
                    </div>
                  </div>
                </div>
                <div className="row" style={{ height: "100px" }}>
                  <div className="h-100">
                    {" "}
                    <div className="col-md-4">
                      <div>User Name</div>
                    </div>
                    <div className="col-md-8">
                      <input type="text" style={{ width: "100%" }} />
                    </div>
                  </div>
                </div>
                <div className="row" style={{ height: "100px" }}>
                  <div className="h-100">
                    {" "}
                    <div className="col-md-4">
                      <div>Emails</div>
                    </div>
                    <div className="col-md-8">
                      <input type="text" style={{ width: "100%" }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
