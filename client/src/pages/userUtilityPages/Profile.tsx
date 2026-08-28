import { useAuth } from "../../contexts/useAuth";
import { Link } from "react-router-dom";
import { userUtilityPage } from "./index";
import { useEffect, useState } from "react";

import placeholderImage from "../../assets/placeholder.jpg";

const baseApi = "http://localhost:3001/users";

type ProfileUser = {
  userId: number;
  displayname: string;
  username: string;
  email: string;
  avatar: {
    url: string | null;
    publicId: string | null;
  };
};

type ProfileFormData = {
  displayname: string;
  username: string;
  email: string;
};

const Profile = () => {
  const { setUser: setAuthUser } = useAuth();
  const [user, setUser] = useState<ProfileUser | null>(null);
  const [editing, setEditing] = useState({
    displayname: false,
    username: false,
    email: false,
    avatar: false,
  });

  const [formData, setFormData] = useState<ProfileFormData>({
    displayname: "",
    username: "",
    email: "",
  });

  const handleSave = async (field: keyof ProfileFormData) => {
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
      setAuthUser((prev) =>
        prev
          ? {
              ...prev,
              username: data.user.username,
              email: data.user.email,
            }
          : prev,
      );
      setEditing({
        ...editing,
        [field]: false,
      });
    } catch (error) {
      console.log(error);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("avatar", file);

    try {
      const response = await fetch(`${baseApi}/me/avatar`, {
        method: "PATCH",
        credentials: "include",
        body: formData,
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message);
      }

      setUser(data.user);
      setAuthUser((prev) =>
        prev
          ? {
              ...prev,
              avatar: {
                url: data.user.avatar.url,
              },
            }
          : prev,
      );
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteAvatar = async () => {
    try {
      const response = await fetch(`${baseApi}/me/avatar`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Delete avatar failed");
      }
      setUser(data.user);
      setAuthUser((prev) =>
        prev
          ? {
              ...prev,
              avatar: {
                url: null,
              },
            }
          : prev,
      );

      setEditing({
        ...editing,
        avatar: false,
      });
    } catch (error) {
      console.error(error);
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
                        <div className="ms-auto">
                          <button
                            className="btn btn-secondary me-1"
                            onClick={() => {
                              setEditing({
                                ...editing,
                                displayname: false,
                              });
                            }}
                          >
                            Cancel
                          </button>
                          <button
                            className="btn btn-success"
                            disabled={
                              formData.displayname === user?.displayname
                            }
                            onClick={() => handleSave("displayname")}
                          >
                            <i className="bi bi-check-lg pe-1"></i>
                            Save
                          </button>
                        </div>
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
                        <div className="ms-auto">
                          <button
                            className="btn btn-secondary me-1"
                            onClick={() => {
                              setEditing({
                                ...editing,
                                username: false,
                              });
                            }}
                          >
                            Cancel
                          </button>
                          <button
                            className="btn btn-success"
                            disabled={formData.username === user?.username}
                            onClick={() => handleSave("username")}
                          >
                            <i className="bi bi-check-lg pe-1"></i>
                            Save
                          </button>
                        </div>
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
                        <div className="ms-auto">
                          <button
                            className="btn btn-secondary me-1"
                            onClick={() => {
                              setEditing({
                                ...editing,
                                email: false,
                              });
                            }}
                          >
                            Cancel
                          </button>
                          <button
                            className="btn btn-success"
                            disabled={formData.email === user?.email}
                            onClick={() => handleSave("email")}
                          >
                            <i className="bi bi-check-lg pe-1"></i>
                            Save
                          </button>
                        </div>
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
                      src={user?.avatar.url || placeholderImage}
                      alt="placeholderImage"
                      className="user-avatar-big"
                    />
                    <div className="dropdown mt-2">
                      <button
                        className="btn btn-secondary dropdown-toggle"
                        onClick={() =>
                          setEditing({
                            ...editing,
                            avatar: !editing.avatar,
                          })
                        }
                      >
                        <i className="bi bi-pencil-square pe-1"></i>Edit
                      </button>
                      {editing.avatar && (
                        <ul className="dropdown-menu show">
                          <li>
                            <label
                              className="dropdown-item"
                              style={{ cursor: "pointer" }}
                            >
                              <i className="bi bi-upload pe-2"></i>
                              Upload avatar
                              <input
                                type="file"
                                accept="image/*"
                                hidden
                                onChange={(e) => {
                                  handleAvatarChange(e);
                                  setEditing({
                                    ...editing,
                                    avatar: false,
                                  });
                                }}
                              />
                            </label>
                          </li>

                          {user?.avatar.url && (
                            <li>
                              <button
                                type="button"
                                className="dropdown-item text-danger"
                                onClick={handleDeleteAvatar}
                              >
                                <i className="bi bi-trash pe-2"></i>
                                Delete avatar
                              </button>
                            </li>
                          )}
                        </ul>
                      )}
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
