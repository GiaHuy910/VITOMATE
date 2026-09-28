import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { ChangeEvent } from "react";

import GitProvider from "../../components/GitProvider";
import PublicGitRepo from "../../components/PublicGitRepo";
import type { GithubRepository } from "../../types/repository";
import { deployRepository } from "../../api/repo";
import { useTheme } from "../../contexts/theme/useTheme";

type RepositoryForm = {
  name: string;
  defaultBranch: string;
};

type RowItem = {
  id: string;
  key: string;
  value: string;
};
type RowError = {
  key?: string;
  value?: string;
};

const CreateStatic = () => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  type SourceType = "gitprovider" | "publicgitrepo";
  const [selected, setSelected] = useState<SourceType>("gitprovider");
  const [repository, setRepository] = useState<GithubRepository | null>(null);

  const [form, setForm] = useState<RepositoryForm>({
    name: "",
    defaultBranch: "",
  });

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

  const handleSetRepository = (repository: GithubRepository) => {
    setRepository(repository);
    setForm({
      name: repository.name,
      defaultBranch: repository.defaultBranch,
    });
  };
  const components = {
    gitprovider: <GitProvider />,
    publicgitrepo: (
      <PublicGitRepo onRepositoryConnected={handleSetRepository} />
    ),
  };

  const handleGitProvider = () => {
    setSelected("gitprovider");
  };
  const handlePublicGitRepo = () => {
    setSelected("publicgitrepo");
  };

  const handleDeploy = async () => {
    if (!repository) {
      return;
    }
    const isValid = validateEnvVars();
    if (!isValid) {
      return;
    }
    const envVars = getEnvVars();
    const body = {
      githubRepoId: repository.id,
      name: form.name,
      owner: repository.owner,
      defaultBranch: form.defaultBranch,
      envVars: envVars,
    };
    await deployRepository(body);
    navigate("/dashboard");
  };

  return (
    <div className="container-fluid mt-3 px-5 border">
      <div className="row text-dark">
        <h1>Create Static Site</h1>
      </div>
      <div className="row mt-4 " style={{ marginBottom: "80px" }}>
        <div className="col-12 col-md-4 text-dark">
          <h5>Source code</h5>
        </div>
        <div className="col-12 col-md-8 ">
          <div className="d-flex flex-column" style={{ height: "230px" }}>
            <div style={{ flex: 2 }} className="mb-2 ">
              <button
                type="button"
                onClick={handleGitProvider}
                className={`h-100 btn ${selected === "gitprovider" ? "btn-dark" : " btn btn-light"} border rounded-0`}
              >
                Git Provider
              </button>
              <button
                type="button"
                onClick={handlePublicGitRepo}
                className={`h-100 btn ${selected === "publicgitrepo" ? "btn-dark" : " btn btn-light"} border rounded-0`}
              >
                Public Git Repository
              </button>
            </div>
            <div style={{ flex: 8.5 }} className="">
              {components[selected]}
            </div>
          </div>
        </div>
      </div>
      {repository && (
        <div>
          <div className="row my-4 ">
            <div className="col-12 col-md-4 ">
              <h5>Name</h5>
              <div className="d-grid gap-2 ">
                Set a unique name for your static site.
              </div>
            </div>
            <div className="col-12 col-md-8 ">
              <input
                value={form.name}
                placeholder="example-unique-name"
                className="form-control rounded-0 border"
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, name: e.target.value }))
                }
              />
            </div>
          </div>
          <div className="row my-4 ">
            <div className="col-12 col-md-4 ">
              <h5>Branch</h5>
              <div className="d-grid gap-2 ">
                Choose the Git branch ready to build and deploy.
              </div>
            </div>
            <div className="col-12 col-md-8 ">
              <input
                value={form.defaultBranch}
                className="form-control rounded-0 border"
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    defaultBranch: e.target.value,
                  }))
                }
              />
            </div>
          </div>
          <div
            className={`row my-4 border ${theme === "Dark" ? "border-light" : "border-dark"} `}
          >
            <div>
              <div className="col-12 col-md-4 p-3 w-75">
                <h5>ENVIRONMENTS VARIABLES</h5>
                <div className="d-grid gap-2 ">
                  Set your environment variables (such as APIkey, Secrets,...)
                  is recommended to config your service.
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
                                <i className="bi bi-x-circle"></i>{" "}
                                {rowError.key}
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
                                handleInputChange(
                                  row.id,
                                  "value",
                                  e.target.value,
                                )
                              }
                            />
                            {rowError?.value && (
                              <div className="text-danger-emphasis pt-2">
                                <i className="bi bi-x-circle"></i>{" "}
                                {rowError.value}
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
          <div className="my-5">
            <button
              className={`btn ${theme === "Dark" ? "btn-light" : "btn-dark"} btn-lg rounded-0`}
              onClick={handleDeploy}
            >
              Deploy
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateStatic;
