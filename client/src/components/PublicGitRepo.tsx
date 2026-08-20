import { useState } from "react";

const PublicGitRepo = () => {
  const [value, setValue] = useState("");
  const handleConnect = () => {};
  const handleChangeUrl = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
    //xu li tim url
  };
  return (
    <div>
      <div className="fs-6">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec porta ex
        sit amet bibendum suscipit. Praesent ultrices est at maximus sodales.
        Fusce vitae ante efficitur,
      </div>
      <div className="d-flex border">
        <i className="bi bi-globe d-flex align-items-center mx-2"></i>
        <input
          type="text"
          value={value}
          placeholder="https://github.com/Your-name-example/repo-example"
          className="form-control border-0"
          onChange={handleChangeUrl}
        />
      </div>
      <div className="d-flex justify-content-end mt-2">
        <button
          type="button"
          disabled={!value.trim()}
          className="btn btn-secondary"
          onClick={handleConnect}
        >
          Connect
        </button>
      </div>
    </div>
  );
};

export default PublicGitRepo;
