type ProfileFieldProps = {
  label: string;
  value: string;
  editing: boolean;
  canSave: boolean;
  onChange: (value: string) => void;
  onEdit: () => void;
  onCancel: () => void;
  onSave: () => void;
};

const ProfileField = ({
  label,
  value,
  editing,
  canSave,
  onChange,
  onEdit,
  onCancel,
  onSave,
}: ProfileFieldProps) => {
  return (
    <div className="row align-items-start mb-4">
      <div className="col-md-4 pe-md-4">
        <div>{label}</div>
      </div>
      <div className="col-md-8">
        <input
          type="text"
          className="form-control"
          value={value}
          disabled={!editing}
          onChange={(e) => onChange(e.target.value)}
        />
        <div className="d-flex">
          {editing ? (
            <div className="ms-auto">
              <button
                type="button"
                className="btn btn-secondary me-1"
                onClick={onCancel}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-success"
                disabled={!canSave}
                onClick={onSave}
              >
                <i className="bi bi-check-lg pe-1"></i>
                Save
              </button>
            </div>
          ) : (
            <button
              type="button"
              className="btn btn-secondary ms-auto"
              onClick={onEdit}
            >
              <i className="bi bi-pencil-square pe-1"></i>
              Edit
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
export default ProfileField;
