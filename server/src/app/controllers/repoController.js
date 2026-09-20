const Repo = require("../models/Repo");
const User = require("../models/User");
const { validateGithubRepo } = require("../services/githubService");
const { getNextRepoId } = require("../../utils/getNextRepoId");

class RepoController {
  //[POST] /repo/check
  async check(req, res) {
    try {
      const { repoUrl } = req.body;
      const repository = await validateGithubRepo(repoUrl);
      //github returns a lot properties, looks for to choose what to keep

      return res.status(200).json({
        message: "Repository is valid",
        repository: {
          id: repository.id,
          name: repository.name,
          owner: repository.owner.login,
          defaultBranch: repository.default_branch,
        },
      });
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  }
  //[POST] /repo/store
  async store(req, res) {
    try {
      const { repositoryId, name, owner, defaultBranch } = req.body;
      const user_id = req.user.user_id;
      const user = await User.findOne({ user_id });
      if (!user) {
        return res.status(401).json({ message: "Unauthorized!" });
      }
      const repo_id = await getNextRepoId();

      const repo = await Repo.create({
        user_id: user.user_id,
        repo_id,
        github_repo_id: repositoryId,
        owner_name: owner,
        repo_name: name,
        branch_default: defaultBranch,
      });

      return res.status(201).json({
        message: "Account created successfully",
        repository: {
          name: repo.repo_name,
          owner: repo.owner_name,
          repo_id: repo_id,
          branch: repo.branch_default,
        },
      });
    } catch (error) {
      console.error("Deploy error:", error);
      return res.status(500).json({
        message: "Internal server error",
      });
    }
  }
  //[GET] /repo/getrepo
  async getrepo(req, res) {
    try {
      const { repo_id } = req.body;
      const repo = await Repo.findOne({ repo_id });
      if (!repo) {
        return "VITOMATE Repository not found";
      }
      return res.status(200).json({ repo });
    } catch (error) {
      console.error("Deploy error:", error);
      return res.status(500).json({
        message: "Internal server error",
      });
    }
  }
}
module.exports = new RepoController();
