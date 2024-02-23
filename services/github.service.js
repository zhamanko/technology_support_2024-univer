class Github {
  async getTopRepositories() {
    // TODO add the feature in the future, maybe
    return { data: [], count: 0 };
  }
}

module.exports = { Github: new Github() };
