import { useState } from "react";
import { useAuth } from "../../contexts/useAuth";
import GitProvider from "../../components/GitProvider";
import PublicGitRepo from "../../components/PublicGitRepo";

const CreateStatic = () => {
  const { user } = useAuth();
  type SourceType = "gitprovider" | "publicgitrepo";
  const [selected, setSelected] = useState<SourceType>("gitprovider");
  const components = {
    gitprovider: <GitProvider />,
    publicgitrepo: <PublicGitRepo />,
  };

  const handleGitProvider = () => {
    setSelected("gitprovider");
  };
  const handlePublicGitRepo = () => {
    setSelected("publicgitrepo");
  };

  return (
    <div className="container-fluid mt-3 px-5">
      <div className="row border">
        <h1>Create Static Site</h1>
      </div>
      <div className="row mt-4 border" style={{ marginBottom: "80px" }}>
        <div className="col-12 col-md-4 border">
          <h5>Source code</h5>
        </div>
        <div className="col-12 col-md-8 border">
          <div className="d-flex flex-column" style={{ height: "230px" }}>
            <div style={{ flex: 2 }} className="mb-2 border">
              <button
                type="button"
                onClick={handleGitProvider}
                className="h-100 btn btn-light border rounded-0"
              >
                Git Provider
              </button>
              <button
                type="button"
                onClick={handlePublicGitRepo}
                className="h-100 btn btn-light border rounded-0"
              >
                Public Git Repository
              </button>
            </div>
            <div style={{ flex: 8.5 }} className="border">
              {components[selected]}
            </div>
          </div>
        </div>
      </div>
      <div className="row my-4 border">
        <div className="col-12 col-md-4 border">
          <h5>Source code</h5>
          <div className="d-grid gap-2 border">
            ThIDFEJGIEJGIENGJPGINRP GNRGNRINGPRNGJ IRGJRIGJRIPfefefefefefwe
            sfsefefrgrgrgrggdgrgrgrgrg
          </div>
        </div>
        <div className="col-12 col-md-8 border">
          <input type="text" className="form-control" />
        </div>
      </div>
      <div className="row my-4 border">
        <div className="col-12 col-md-4 border">
          <h5>Public directory</h5>
          <div className="d-grid gap-2 border">
            The relative path of the directory containing built assets to
            publish. Examples: ./, ./build, dist and frontend/build.
          </div>
        </div>
        <div className="col-12 col-md-8 border">
          <input type="text" className="form-control" />
        </div>
      </div>
      <div className="row my-4 border">
        <div className="col-12 col-md-4 border">
          <h5>Smth</h5>
          <div className="d-grid gap-2 border">
            Unique name for your static website
          </div>
        </div>
        <div className="col-12 col-md-8 border">
          <input type="text" className="form-control" />
        </div>
      </div>
    </div>
  );
};

export default CreateStatic;
