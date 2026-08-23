import { useState } from "react";
import placeholderImage from "../assets/placeholder.jpg";

type Avatar = { url: string | null; publicId: string | null };
type AvatarFieldProps = {
  avatar: Avatar | null | undefined;
  onUpLoad: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDelete: () => void;
};

const AvatarField = ({ avatar, onUpLoad, onDelete }: AvatarFieldProps) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpLoad(e);
    setMenuOpen(false);
  };
  const handleDelete = () => {
    onDelete();
    setMenuOpen(false);
  };
  return (
    <div className="row align-items-start">
      <div className="col-md-4 pe-md-4">
        <div>Avatar</div>
      </div>
      <div className="d-flex flex-column align-items-start col-md-8 ">
        <img
          src={avatar?.url || placeholderImage}
          alt="User Avatar"
          className="user-avatar-big"
        />
        <div className="dropdown mt-2">
          <button
            type="button"
            className="btn btn-secondary dropdown-toggle"
            onClick={() => setMenuOpen((prev) => !prev)}
          >
            <i className="bi bi-pencil-square pe-1"></i>Edit
          </button>
          {menuOpen && (
            <ul className="dropdown-menu show">
              <li>
                <label className="dropdown-item" style={{ cursor: "pointer" }}>
                  <i className="bi bi-upload pe-2"></i>
                  Upload avatar
                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={handleUpload}
                  />
                </label>
              </li>

              {avatar?.url && (
                <li>
                  <button
                    type="button"
                    className="dropdown-item text-danger"
                    onClick={handleDelete}
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
  );
};

export default AvatarField;
