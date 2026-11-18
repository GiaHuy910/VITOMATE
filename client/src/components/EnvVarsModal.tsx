import { type ChangeEvent, useRef, useState } from "react";

import { useTheme } from "../contexts/theme/useTheme";
import type { RowItem, RowError } from "../pages/create/CreateStatic";

type Props = {
  rows: RowItem[];
  setRows: React.Dispatch<React.SetStateAction<RowItem[]>>;
  errors: Record<string, RowError>;
  setErrors: React.Dispatch<React.SetStateAction<Record<string, RowError>>>;
};
const ENV_LINE_RE = /^\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=(.*)$/;

const MAX_SIZE = 1024 * 1024; // 1MB
const NAME_RE = /^(\.env(\..+)?|.+\.env|.+\.txt)$/i; // .env, .env.local, prod.env, notes.txt
type ReadResult = { ok: true; content: string } | { ok: false; reason: string };

async function readEnvFile(file: File): Promise<ReadResult> {
  if (!NAME_RE.test(file.name))
    return { ok: false, reason: "Only .env or .txt files are supported" };

  if (file.size === 0) return { ok: false, reason: "Empty File" };
  if (file.size > MAX_SIZE)
    return { ok: false, reason: "File too large (max 1MB)" };

  try {
    const buf = await file.arrayBuffer();
    const content = new TextDecoder("utf-8", { fatal: true }).decode(buf);
    if (content.includes("\0")) throw new Error("binary");
    return { ok: true, content };
  } catch {
    return { ok: false, reason: "Not a valid UTF-8 text file" };
  }
}

function generateSecret(bytes = 32) {
  const arr = crypto.getRandomValues(new Uint8Array(bytes));
  return btoa(String.fromCharCode(...arr));
}

const EnvVarsModal = ({ rows, setRows, errors, setErrors }: Props) => {
  const { theme } = useTheme();
  const [openEnvString, setOpenEnvString] = useState(false);
  const [envString, setEnvString] = useState("");
  const [error, setError] = useState("");
  const [visibleValueIds, setVisibleValueIds] = useState<Set<string>>(
    () => new Set(),
  );
  const inputRef = useRef<HTMLInputElement>(null);

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
  const ToggleEnvString = () => {
    setError("");
    setOpenEnvString((prev) => !prev);
  };
  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setEnvString(e.target.value);
    if (error) setError("");
  };
  const handleValidateEnvString = () => {
    const parsedRows: RowItem[] = [];
    const lines = envString.split(/\r?\n/);

    for (const [index, line] of lines.entries()) {
      const trimmedLine = line.trim();
      if (!trimmedLine || trimmedLine.startsWith("#")) continue;

      const match = ENV_LINE_RE.exec(line);
      if (!match) {
        setError(`Invalid .env file`);
        return;
      }

      const key = match[1];
      let value = match[2].trim();
      const quote = value[0];
      if (
        value.length >= 2 &&
        (quote === '"' || quote === "'" || quote === "`") &&
        value[value.length - 1] === quote
      ) {
        value = value.slice(1, -1);
      }

      parsedRows.push({
        id: `${Date.now()}-${index}`,
        key,
        value,
      });
    }

    if (parsedRows.length > 0) {
      setRows((currentRows) => [...currentRows, ...parsedRows]);
      setEnvString("");
      setError("");
      setOpenEnvString(false);
    } else {
      setError("No environment variables found.");
    }
  };
  const onPickFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    const result = await readEnvFile(file);
    if (!result.ok) return setError(result.reason);
    setEnvString(result.content);
  };
  const handleImportFile = () => {
    inputRef.current?.click();
  };
  const handleHideValue = (id: string) => {
    setVisibleValueIds((currentIds) => {
      const nextIds = new Set(currentIds);
      if (nextIds.has(id)) {
        nextIds.delete(id);
      } else {
        nextIds.add(id);
      }
      return nextIds;
    });
  };
  const handleGenerateRow = (id: string) => {
    const generatedValue = generateSecret();
    setRows(
      rows.map((r) => (r.id === id ? { ...r, value: generatedValue } : r)),
    );
  };
  const handleRemoveRow = (id: string) => {
    setRows(rows.filter((row) => row.id !== id));
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[id];
      return newErrors;
    });
  };
  return (
    <div
      className={`row my-4 border position-relative ${theme === "Dark" ? "border-light" : "border-dark"} `}
    >
      <div>
        {openEnvString && (
          <div
            className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-3"
            style={{
              zIndex: 3,
            }}
          >
            <div
              className="position-absolute top-0 start-0 w-100 h-100 bg-dark opacity-50"
              onClick={() => setOpenEnvString(false)}
            />
            <div
              className={`position-relative w-100 p-3 border ${theme === "Dark" ? "bg-dark text-light border-light" : "bg-light text-dark border-dark"}`}
              style={{
                maxWidth: "720px",
                maxHeight: "100%",
                overflowY: "auto",
              }}
              role="dialog"
              aria-modal="true"
              aria-labelledby="env-string-title"
            >
              <h5 id="env-string-title">ADD FROM .ENV</h5>
              <p>please paste your .env file content below.</p>
              <textarea
                className={`rounded-0 form-control ${theme === "Dark" ? "bg-dark text-light" : "bg-light text-dark"}`}
                placeholder={`Key1=Value1\nKey2=Value2\nKey3=Value3`}
                value={envString}
                onChange={handleChange}
                rows={5}
              />
              {error && (
                <div className="text-danger-emphasis pt-2 fw-normal">
                  <i className="bi bi-x-circle"></i> {error}
                </div>
              )}
              <div className="d-flex">
                <button
                  type="button"
                  className={`btn ${envString ? `${theme === "Dark" ? "btn-light" : "btn-dark"}` : `${theme === "Dark" ? "btn-light" : "btn-dark"} disabled`} border border-secondary rounded-0 me-3 mt-3`}
                  onClick={handleValidateEnvString}
                >
                  Add Variables
                </button>
                <button
                  type="button"
                  className={`btn ${theme === "Dark" ? "btn-dark" : "btn-light"} border border-secondary rounded-0 me-3 mt-3`}
                  onClick={() => {
                    setEnvString("");
                    ToggleEnvString();
                  }}
                >
                  Cancel
                </button>
                <div className="ms-auto">
                  <input
                    type="file"
                    multiple
                    hidden
                    ref={inputRef}
                    onChange={onPickFile}
                  />
                  <button
                    style={{
                      color: "orange",
                    }}
                    className="btn btn-outline-secondary rounded-0 me-3 mt-3"
                    onClick={handleImportFile}
                  >
                    <i className="bi bi-upload" aria-hidden="true"></i> Import
                    file
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
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
                        type={visibleValueIds.has(row.id) ? "text" : "password"}
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
                    <td className="p-3 align-middle">
                      <div className="d-flex align-items-center justify-content-between">
                        {row.value ? (
                          <button
                            style={{
                              backgroundColor: "white",
                            }}
                            type="button"
                            className={`btn ${theme === "Dark" ? "btn-dark" : "btn-light"} text-info rounded-0`}
                            onClick={() => {
                              handleHideValue(row.id);
                            }}
                            aria-label={
                              visibleValueIds.has(row.id)
                                ? "Hide value"
                                : "Show value"
                            }
                            title={
                              visibleValueIds.has(row.id)
                                ? "Hide value"
                                : "Show value"
                            }
                          >
                            <i
                              className={`bi ${visibleValueIds.has(row.id) ? "bi-eye" : "bi-eye-slash"}`}
                            ></i>
                          </button>
                        ) : (
                          <button
                            style={{
                              backgroundColor: "white",
                            }}
                            className={`btn ${theme === "Dark" ? "btn-dark" : "btn-light"} text-info rounded-0`}
                            onClick={() => {
                              handleGenerateRow(row.id);
                            }}
                          >
                            <i className="bi bi-magic"> Generate</i>
                          </button>
                        )}
                        <button
                          style={{
                            backgroundColor: "white",
                          }}
                          className={`btn ${theme === "Dark" ? "btn-dark" : "btn-light"} text-danger rounded-0 me-3`}
                          onClick={() => {
                            handleRemoveRow(row.id);
                          }}
                        >
                          <i className="bi bi-trash"></i>
                        </button>
                      </div>
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
            onClick={ToggleEnvString}
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
