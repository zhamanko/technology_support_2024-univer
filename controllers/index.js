const { Github: GithubService } = require('../services/github.service');

class Github {
  static async getTopRepositories(req, res) {
    try {
      const { owner, repo, type } = req.query;

      if (!owner || !repo || !type) {
        return res.status(400).json({ error: 'owner, repo , type request field' });
      }

      const response = await GithubService.getTopRepositories({ owner, repo, type });

      return res.send(response);
    } catch (error) {
      return res.status(500).json(error.message);
    }
  }
}

module.exports = { Github };
