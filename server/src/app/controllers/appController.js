const App = require("../models/App");
const { getNextAppId } = require("../../utils/getNextAppId");

class AppController {
  //[POST] /app/deploy
  //First time deploy*
  async deploy(req, res) {
    try {
      const { repoId, owner, name, branch } = req.body;
      const app_id = await getNextAppId();
      const app = await App.create({
        app_id,
        repo_id: repoId,
        deployments: { deployment_order: 1 },
      });

      return res.status(200).json({ app });
    } catch (error) {
      console.error("Deploy error:", error);
      return res.status(500).json({
        message: "Internal server error",
      });
    }
  }
}
module.exports = new AppController();
