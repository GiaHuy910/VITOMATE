import { useState, type ChangeEvent } from "react";

import { useTheme } from "../contexts/theme/useTheme";

type RowItem = {
  id: string;
  key: string;
  value: string;
};
type RowError = {
  key?: string;
  value?: string;
};

type Props = {
  validateEnvVars: () => boolean;
  getEnvVars: () => Record<string, string>;
};
const EnvVarsModal = ({}: Props) => {
  const { theme } = useTheme();

  const [errors, setErrors] = useState<Record<string, RowError>>({});
  const [rows, setRows] = useState<RowItem[]>([
    { id: Date.now().toString(), key: "", value: "" },
  ]);
  const handleInputChange = (
    id: string,
    field: "key" | "value",
    value: string,
  ) => {
    const updatedRows = rows.map((row) => {
      if (row.id === id) {
        return { ...row, [field]: value };
      }
      return row;
    });
    setRows(updatedRows);
  };
  const handleAddRow = () => {
    const newRow: RowItem = { id: Date.now().toString(), key: "", value: "" };
    setRows([...rows, newRow]);
  };
  const handleRemoveRow = (id: string) => {
    setRows(rows.filter((row) => row.id !== id));
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[id];
      return newErrors;
    });
  };
  const getEnvVars = (): Record<string, string> | {} => {
    const envObject: Record<string, string> = {};
    rows.forEach((row) => {
      const trimmedKey = row.key.trim();
      const trimmedValue = row.value.trim();
      if (trimmedKey && trimmedValue) {
        envObject[trimmedKey] = trimmedValue;
      }
    });
    return envObject;
  };
  const validateEnvVars = (): boolean => {
    const newErrors: Record<string, RowError> = {};
    let isValid = true;
    rows.forEach((row) => {
      const trimmedKey = row.key.trim();
      const trimmedValue = row.value.trim();
      const rowErrors: RowError = {};
      if (trimmedKey && !trimmedValue) {
        rowErrors.value = "Required";
        isValid = false;
      }
      if (!trimmedKey && trimmedValue) {
        rowErrors.key = "Required";
        isValid = false;
      }
      if (Object.keys(rowErrors).length > 0) {
        newErrors[row.id] = rowErrors;
      }
    });
    setErrors(newErrors);
    return isValid;
  };
  return (
    <div
      className={`row my-4 border ${theme === "Dark" ? "border-light" : "border-dark"} `}
    >
      <div>
        <div className="col-12 col-md-4 p-3 w-75">
          <h5>ENVIRONMENTS VARIABLES</h5>
          <div className="d-grid gap-2 ">
            Set your environment variables (such as APIkey, Secrets,...) is
            recommended to config your service.
          </div>
        </div>
        <div className="col-12 col-md-4 pe-3 ps-3 pt-3 w-100">
          <table className="table border border-secondary">
            <thead
              className={`${theme === "Dark" ? "table-light" : "table-dark"}`}
            >
              <tr>
                <th scope="col">
                  <div className="p-2">KEY</div>
                </th>
                <th scope="col">
                  <div className="p-2">VALUE</div>
                </th>
                <th scope="col">
                  <div className=""></div>
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const rowError = errors[row.id];
                return (
                  <tr key={row.id}>
                    <th className="p-3 ">
                      <input
                        type="text"
                        placeholder="NAME_OF_VARIABLE"
                        className={`w-100 ps-2 border ${rowError?.key ? `${theme === "Dark" ? "bg-dark" : "bg-light"} border-danger` : `${theme === "Dark" ? "bg-dark border-light" : "bg-light border-dark"}`} d-flex align-items-center`}
                        style={{ minHeight: "40px" }}
                        value={row.key}
                        onChange={(e: ChangeEvent<HTMLInputElement>) =>
                          handleInputChange(row.id, "key", e.target.value)
                        }
                      />
                      {rowError?.key && (
                        <div className="text-danger-emphasis pt-2 fw-normal">
                          <i className="bi bi-x-circle"></i> {rowError.key}
                        </div>
                      )}
                    </th>
                    <td className="p-3">
                      <input
                        type="text"
                        placeholder="value"
                        className={`w-100 ps-2 border ${rowError?.value ? `${theme === "Dark" ? "bg-dark" : "bg-light"} border-danger` : `${theme === "Dark" ? "bg-dark border-light" : "bg-light border-dark"}`} d-flex align-items-center`}
                        style={{ minHeight: "40px" }}
                        value={row.value}
                        onChange={(e: ChangeEvent<HTMLInputElement>) =>
                          handleInputChange(row.id, "value", e.target.value)
                        }
                      />
                      {rowError?.value && (
                        <div className="text-danger-emphasis pt-2">
                          <i className="bi bi-x-circle"></i> {rowError.value}
                        </div>
                      )}
                    </td>
                    <td className="p-3">
                      <button
                        className="btn btn-dark text-danger rounded-0"
                        onClick={() => {
                          handleRemoveRow(row.id);
                        }}
                      >
                        <i className="bi bi-trash"></i>
                      </button>
                      <button className="btn btn-dark text-danger rounded-0">
                        <i className="bi bi-trash"></i>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="col-12 col-md-4 px-3 pb-3 w-100">
          <button
            className={`btn ${theme === "Dark" ? "btn-dark" : "btn-light"} border border-secondary rounded-0 me-3 mt-3`}
            onClick={handleAddRow}
          >
            + Add Environments Variables
          </button>
          <button
            className={`btn ${theme === "Dark" ? "btn-dark" : "btn-light"} border border-secondary rounded-0 mt-3`}
          >
            <i className="bi bi-file-earmark-richtext"></i> Add from .env
          </button>
        </div>
      </div>
    </div>
  );
};

export default EnvVarsModal;
