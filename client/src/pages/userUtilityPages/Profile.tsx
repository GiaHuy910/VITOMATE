// import { useAuth } from "../../contexts/useAuth";
import { Link } from "react-router-dom";
import { userUtilityPage } from "./index";
import { useEffect, useState } from "react";

import placeholderImage from "../../assets/placeholder.jpg";

const baseApi = "http://localhost:3001/users";

type ProfileUser = {
  displayname: string;
  username: string;
  email: string;
};

const Profile = () => {
  // const { user, loading } = useAuth();
  const [user, setUser] = useState<ProfileUser | null>(null);
  const [editing, setEditing] = useState({
    displayname: false,
    username: false,
    email: false,
  });

  const [formData, setFormData] = useState<ProfileUser>({
    displayname: "",
    username: "",
    email: "",
  });

  const handleSave = async (field: keyof ProfileUser) => {
    // Không cho save nếu giá trị không thay đổi
    if (formData[field] === user?.[field]) {
      return;
    }
    try {
      const response = await fetch(`${baseApi}/me`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          [field]: formData[field],
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Update failed");
      }

      setUser(data.user);
      setEditing({
        ...editing,
        [field]: false,
      });
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetch(`${baseApi}/me`, { credentials: "include" })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.message);
        }
        return data;
      })
      .then((data) => {
        setUser(data.user);
        setFormData({
          displayname: data.user.displayname,
          username: data.user.username,
          email: data.user.email,
        });
      })
      .catch((error) => {
        console.error(error);
      });
  }, []);

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
              <h3>Profile details </h3>
              <div className="card-body border rounded-0">
                <div className="row align-items-start mb-4">
                  <div className="col-md-4 pe-md-4">
                    <div>Display Name</div>
                  </div>
                  <div className="col-md-8">
                    <input
                      type="text"
                      className="form-control"
                      value={formData.displayname}
                      disabled={!editing.displayname}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          displayname: e.target.value,
                        })
                      }
                    />
                    <div className="d-flex">
                      {editing.displayname ? (
                        <button
                          className="btn btn-success ms-auto"
                          disabled={formData.displayname === user?.displayname}
                          onClick={() => handleSave("displayname")}
                        >
                          <i className="bi bi-check-lg pe-1"></i>
                          Save
                        </button>
                      ) : (
                        <button
                          className="btn btn-secondary ms-auto"
                          onClick={() =>
                            setEditing({ ...editing, displayname: true })
                          }
                        >
                          <i className="bi bi-pencil-square pe-1"></i>
                          Edit
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                <div className="row align-items-start mb-4">
                  <div className="col-md-4 pe-md-4">
                    <div>User Name</div>
                  </div>
                  <div className="col-md-8">
                    <input
                      type="text"
                      className="form-control"
                      value={formData.username}
                      disabled={!editing.username}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          username: e.target.value,
                        })
                      }
                    />
                    <div className="d-flex">
                      {editing.username ? (
                        <button
                          className="btn btn-success ms-auto"
                          disabled={formData.username === user?.username}
                          onClick={() => handleSave("username")}
                        >
                          <i className="bi bi-check-lg pe-1"></i>
                          Save
                        </button>
                      ) : (
                        <button
                          className="btn btn-secondary ms-auto"
                          onClick={() =>
                            setEditing({ ...editing, username: true })
                          }
                        >
                          <i className="bi bi-pencil-square pe-1"></i>
                          Edit
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                <div className="row align-items-start mb-4">
                  <div className="col-md-4 pe-md-4">
                    <div>Emails</div>
                  </div>
                  <div className="col-md-8">
                    <input
                      type="text"
                      className="form-control"
                      value={formData.email}
                      disabled={!editing.email}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          email: e.target.value,
                        })
                      }
                    />
                    <div className="d-flex">
                      {editing.email ? (
                        <button
                          className="btn btn-success ms-auto"
                          disabled={formData.email === user?.email}
                          onClick={() => handleSave("email")}
                        >
                          <i className="bi bi-check-lg pe-1"></i>
                          Save
                        </button>
                      ) : (
                        <button
                          className="btn btn-secondary ms-auto"
                          onClick={() =>
                            setEditing({ ...editing, email: true })
                          }
                        >
                          <i className="bi bi-pencil-square pe-1"></i>
                          Edit
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                <div className="row align-items-start">
                  <div className="col-md-4 pe-md-4">
                    <div>Avatar</div>
                  </div>
                  <div className="d-flex flex-column align-items-start col-md-8 ">
                    <img
                      src={placeholderImage}
                      alt="placeholderImage"
                      className="user-avatar-big"
                    />
                    <div style={{ paddingInlineStart: "5px" }}>
                      {" "}
                      <button className="btn btn-secondary">
                        {" "}
                        <i className="bi bi-pencil-square pe-1"></i>Edit
                      </button>
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
