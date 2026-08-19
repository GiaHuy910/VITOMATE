import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/useAuth";

import brandLogo from "../assets/brand-logo-small.png";
import placeholderImage from "../assets/placeholder.jpg";
import { userUtilityPage } from "../pages/userUtilityPages";

const nameLogo = "VITOMATE";

const Header = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogOut = () => {
    logout();
    navigate("/sign");
  };
  const handleLogo = () => {
    navigate("/dashboard");
  };
  const handleWorkSpace = () => {
    navigate("/workspace");
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light">
      <div className="container-fluid">
        <div
          className="logo-container"
          style={{
            width: "130px",
            height: "40px",
          }}
          onClick={handleLogo}
        >
          <img
            src={brandLogo}
            alt={nameLogo}
            style={{ width: "90%", cursor: "pointer" }}
            className="logo-image img-fluid "
          />
        </div>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarSupportedContent"
          aria-controls="navbarSupportedContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarSupportedContent">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <a
                className="nav-link active"
                aria-current="page"
                href=""
                onClick={handleWorkSpace}
              >
                My Workspace
              </a>
            </li>
          </ul>
          <form className="d-flex">
            <input
              className="form-control me-2"
              type="search"
              placeholder="Search"
              aria-label="Search"
            ></input>
            <button className="btn btn-outline-success" type="submit">
              Search
            </button>
          </form>
          {!user && (
            <button
              className="btn btn-primary"
              type="button"
              onClick={() => navigate("/sign")}
            >
              Sign In
            </button>
          )}
        </div>
        {user && (
          <div className="dropdown ms-2">
            <button
              className="btn btn-secondary dropdown-toggle d-flex flex-row"
              type="button"
              id="dropdownMenuButton1"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              <img
                src={user?.avatar.url || placeholderImage}
                alt=""
                className="user-avatar-small"
              />
              {user.displayname}
            </button>

            <ul className="dropdown-menu" aria-labelledby="dropdownMenuButton1">
              {userUtilityPage.map((page) => (
                <li key={page.path}>
                  <Link className="dropdown-item" to={page.path}>
                    {page.name}
                  </Link>
                </li>
              ))}
              <li>
                <hr className="dropdown-divider" />
              </li>

              <li>
                <button
                  type="button"
                  className="dropdown-item"
                  onClick={handleLogOut}
                >
                  Log out
                </button>
              </li>
            </ul>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Header;
