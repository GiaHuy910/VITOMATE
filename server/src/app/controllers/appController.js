const App = require("../models/App");
const { getNextAppId } = require("../../utils/getNextAppId");

const { deployToPlatform } = require("../services/platformService");

class AppController {
  //[POST] /app/deploy
  //First time deploy*
  async deploy(req, res) {
    try {
      //thieu env
      const { repoId, owner, name, branch } = req.body;
      const app_id = await getNextAppId();
      const deploy_order = 1;
      const app = await App.create({
        app_id,
        repo_id: repoId,
        deployments: { deployment_order: deploy_order },
      });

      //thieu env
      const data = await deployToPlatform(
        app_id,
        deploy_order,
        owner,
        name,
        branch,
      );
      return res.status(200).json({ data });
    } catch (error) {
      console.error("Deploy error:", error);
      return res.status(500).json({
        message: "Internal server error",
      });
    }
  }
  //[POST] /app/deployN
  //Deploy N time*
}
module.exports = new AppController();
