import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

import { userUtilityPage } from "./index";
import { useAuth } from "../../contexts/auth/useAuth";
import ProfileField from "../../components/ProfileFieldProps";
import AvatarField from "../../components/AvatarField";
import {
  getCurrentUser,
  uploadAvatar,
  deleteAvatar,
  updateUser,
} from "../../api/users";

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
  });

  const [formData, setFormData] = useState<ProfileFormData>({
    displayname: "",
    username: "",
    email: "",
  });
  const profileFields = [
    {
      key: "displayname",
      label: "Display Name",
    },
    {
      key: "username",
      label: "User Name",
    },
    {
      key: "email",
      label: "Email",
    },
  ] as const;

  const handleCancel = (field: keyof ProfileFormData) => {
    if (!user) return;
    setFormData((prev) => ({ ...prev, [field]: user[field] }));
    setEditing((prev) => ({ ...prev, [field]: false }));
  };
  const syncUser = (updatedUser: ProfileUser) => {
    setUser(updatedUser);
    setAuthUser((prev) =>
      prev
        ? {
            ...prev,
            displayname: updatedUser.displayname,
            username: updatedUser.username,
            email: updatedUser.email,
            avatar: {
              url: updatedUser.avatar.url,
            },
          }
        : prev,
    );
  };

  const handleSave = async (field: keyof ProfileFormData) => {
    if (formData[field] === user?.[field]) {
      return;
    }
    try {
      const data = await updateUser(field, formData[field]);

      syncUser(data.user);

      setEditing((prev) => ({
        ...prev,
        [field]: false,
      }));
    } catch (error) {
      console.log(error);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const data = await uploadAvatar(file);

      syncUser(data.user);
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteAvatar = async () => {
    try {
      const data = await deleteAvatar();

      syncUser(data.user);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    getCurrentUser()
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
              <div className="d-grid gap-2 mb-3">
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
              <div className="d-grid gap-2 mb-3">
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
                {profileFields.map(({ key, label }) => (
                  <ProfileField
                    key={key}
                    label={label}
                    value={formData[key]}
                    editing={editing[key]}
                    canSave={formData[key] !== user?.[key]}
                    onChange={(value) =>
                      setFormData({
                        ...formData,
                        [key]: value,
                      })
                    }
                    onEdit={() =>
                      setEditing({
                        ...editing,
                        [key]: true,
                      })
                    }
                    onCancel={() => handleCancel(key)}
                    onSave={() => handleSave(key)}
                  />
                ))}
                <AvatarField
                  avatar={user?.avatar}
                  onUpLoad={handleAvatarChange}
                  onDelete={handleDeleteAvatar}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
