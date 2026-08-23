import { useState } from "react";

import GitProvider from "../../components/GitProvider";
import PublicGitRepo from "../../components/PublicGitRepo";
import type { GithubRepository } from "../../types/repository";
import { deployRepository } from "../../api/repo";
import { useNavigate } from "react-router-dom";

type RepositoryForm = {
  name: string;
  defaultBranch: string;
  language: string;
};
const CreateStatic = () => {
  const navigate = useNavigate();
  type SourceType = "gitprovider" | "publicgitrepo";
  const [selected, setSelected] = useState<SourceType>("gitprovider");
  const [repository, setRepository] = useState<GithubRepository | null>(null);

  const [form, setForm] = useState<RepositoryForm>({
    name: "",
    defaultBranch: "",
    language: "",
  });

  const handleSetRepository = (repository: GithubRepository) => {
    setRepository(repository);
    setForm({
      name: repository.name,
      defaultBranch: repository.defaultBranch,
      language: repository.language ?? "",
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
    const body = {
      repositoryId: repository.id,
      name: form.name,
      owner: repository.owner,
      defaultBranch: form.defaultBranch,
      language: form.language,
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
          <div className="row my-4 ">
            <div className="col-12 col-md-4 ">
              <h5>Language</h5>
              <div className="d-grid gap-2 ">
                Detected programming language of the repository.
              </div>
            </div>
            <div className="col-12 col-md-8 ">
              <input
                value={form.language}
                placeholder="example-language"
                className="form-control rounded-0 border"
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, language: e.target.value }))
                }
              />
            </div>
          </div>
          <div className=" my-5 ">
            <button
              className="btn btn-secondary btn-lg rounded-0"
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
