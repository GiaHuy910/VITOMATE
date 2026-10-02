const App = require("../models/App");
const Repo = require("../models/Repo");
const { getNextAppId } = require("../../utils/getNextAppId");

const { deployToPlatform } = require("../services/platformService");

class AppController {
  //[POST] /app/deploy
  async deploy(req, res) {
    try {
      const { repoId, owner, name, branch, envVars } = req.body;
      const repo = await Repo.findOne(
        { repo_id: repoId },
        { owner_name: 1, repo_name: 1, branch_default: 1 },
      );
      const env_vars = envVars;

      if (repo) {
        if (owner != repo.owner_name || name != repo.repo_name) {
          return res.status(401).json({ message: "Illegal injection" });
        }
        const app = await App.findOne({ repo_id: repoId });
        //In N deploy
        if (app) {
          const app_id = app.app_id;
          const last_deployment_order =
            app.deployments[app.deployments.length - 1].deployment_order;

          app.deployments.push({
            deployment_order: last_deployment_order + 1,
            env_vars: env_vars,
          });
          const deploy_data = await deployToPlatform(
            app_id,
            last_deployment_order,
            owner,
            name,
            branch,
            env_vars,
          );
          if (!deploy_data) {
            // error here
          }
          // must await app.save() in the end so that mongoose finally update the db
          // synchronize
          await app.save();
          return res.status(200).json({ deploy_data });
        } else {
          // In first deploy
          const app_id = await getNextAppId();
          const appCreated = await App.create({
            app_id,
            repo_id: repoId,
            deployments: [{}],
          });
          const deployment_order = appCreated.deployments[0]?.deployment_order;
          const deploy_data = await deployToPlatform(
            app_id,
            deployment_order,
            owner,
            name,
            branch,
            env_vars,
          );
          if (!deploy_data) {
            // error here
          }
          return res.status(201).json({ deploy_data });
        }
      } else {
        return res.status(404).json({
          message: "repo not found",
        });
      }
    } catch (error) {
      console.error("Deploy error:", error);
      return res.status(500).json({
        message: "Internal server error",
      });
    }
  }
}
module.exports = new AppController();
