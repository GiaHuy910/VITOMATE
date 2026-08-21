import { useState } from "react";

import { checkGithubRepo } from "../api/repo";
import type { GithubRepository } from "../types/repository";

type Props = {
  onRepositoryConnected?: (repository: GithubRepository) => void;
};

const PublicGitRepo = ({ onRepositoryConnected }: Props) => {
  const [repoUrl, setRepoUrl] = useState("");
  const [error, setError] = useState("");
  //
  const [loading, setLoading] = useState(false);

  const validateGitUrl = (value: string) => {
    if (!value.trim()) {
      return "Github repository url is required";
    }
    try {
      const Url = new URL(value);
      if (Url.protocol !== "https:") {
        return "URL must use Https protocol";
      }
      if (Url.hostname !== "github.com") {
        return "URL must be a Github repository URL";
      }
      const parts = Url.pathname.split("/").filter(Boolean);
      if (parts.length !== 2) {
        return "Invalid Github repository URL";
      }
      return "";
    } catch (error) {
      return "Invalid URL";
    }
  };
  const handleConnect = async () => {
    setError("");
    setLoading(true);
    try {
      const data = await checkGithubRepo(repoUrl);
      onRepositoryConnected?.(data.repository);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };
  const handleChangeUrl = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valueUrl = e.target.value;
    setRepoUrl(valueUrl);
    setError(validateGitUrl(valueUrl));
  };
  return (
    <div>
      <div className="fs-6">Only public Github repository can be access.</div>
      <div className="d-flex border">
        <i className="bi bi-globe d-flex align-items-center mx-2"></i>
        <input
          type="url"
          value={repoUrl}
          placeholder="https://github.com/Your-name-example/repo-example"
          className="form-control border-0"
          onChange={handleChangeUrl}
        />
      </div>
      <div>
        {error && (
          <div className="d-flex align-items-center">
            <i className="bi bi-x-circle mx-1"></i>
            <div className="invalid-feedback d-block mb-1">{error}</div>
          </div>
        )}
      </div>
      <div className="d-flex justify-content-end mt-2">
        <button
          type="button"
          disabled={!!error || !repoUrl.trim() || loading}
          className="btn btn-secondary"
          hidden={!onRepositoryConnected}
          onClick={handleConnect}
        >
          {loading ? "Checking..." : "Connect"}
        </button>
      </div>
    </div>
  );
};

export default PublicGitRepo;
