// eslint-disable-next-line import/no-extraneous-dependencies
const Fastq = require('fastq');

const { Github: GithubAdapter } = require('../adapter/github.adapter');

// TODO refactor add constants
const STATISTICS_TYPE = { year: 'year', all: 'all' };

class Github {
 async getTopRepositories({ repo, owner, type }) {
  // TODO refactor
  let response;
  if (type === STATISTICS_TYPE.year) {
   response = await this.getTopRepositoriesLastYear({ owner, repo });
  } else if (type === STATISTICS_TYPE.all) {
   response = await this.getTopRepositoriesAll({ owner, repo });
  }
  return { data: response, count: response.length };
 }

 // recently = ~1year, check documentation Github api
 async getTopRepositoriesLastYear({ repo, owner }) {
  const userContributors = await this.#getUserContributors({ repo, owner });

  return this.#getRepoContributedToLastYear({ repo, owner, userContributors });
 }

 async getTopRepositoriesAll({ repo, owner }) {
  const contributors = await this.#getUserContributors({ repo, owner });

  const topDuplicates = await this.#getRepoContributedToLastYear({
   repo,
   owner,
   count: 20,
   userContributors: contributors,
  });

  const countContributors = {};
  const queueGetuserRepoUniq = Fastq.promise(async (task) => {
   const { contributors: localContributors, owner: _owner, repo: _repo, url } = await task();

   const fullName = `${_owner}_${_repo}`;

   localContributors.forEach((obj) => {
    const { login } = obj;
    if (contributors.some((objData) => objData.login === login)) {
     if (countContributors[fullName]) {
      countContributors[fullName].count += 1;
     } else {
      countContributors[fullName] = {
       count: 1,
       url,
       owner: _owner,
       name: _repo,
      };
     }
    }
   });
  }, 20);

  for (const repositoryTop of topDuplicates) {
   queueGetuserRepoUniq.push(async () => {
    const { owner: _owner, name } = repositoryTop;

    const localContributors = await this.#getUserContributors({ repo: name, owner: _owner });

    return { contributors: localContributors, owner: _owner, repo: name, url: repositoryTop.url };
   });
  }

  await new Promise((resolve) => {
   queueGetuserRepoUniq.drain = resolve;
  });

  const countsArrayUser = Object.keys(countContributors).map((name) => ({ ...countContributors[name] }));

  countsArrayUser.sort((a, b) => b.count - a.count);

  const topDuplicatesUSerinRepo = countsArrayUser.slice(0, 5);

  return topDuplicatesUSerinRepo;
 }

 async #getRepoContributedToLastYear({ repo, count = 5, userContributors }) {
  const countsRepository = {};
  const queueGetuserRepo = Fastq.promise(async (task) => {
   const repos = await task();

   repos.forEach((obj) => {
    const url = new URL(obj.url);

    const owner = url.pathname.split('/')[1];
    const repositoryName = url.pathname.split('/')[2];
    // TODO refactor
    if (repositoryName !== repo) {
     const fullName = `${owner}_${repositoryName}`;

     if (countsRepository[fullName]) {
      countsRepository[fullName].count += 1;
     } else {
      countsRepository[fullName] = {
       count: 1,
       url,
       owner,
       name: repositoryName,
      };
     }
    }
   });

   return true;
  }, 20);

  for (const contributor of userContributors) {
   queueGetuserRepo.push(async () => {
    return this.#getUserRepo(contributor.login);
   });
  }

  await new Promise((resolve) => {
   queueGetuserRepo.drain = resolve;
  });

  const countsArray = Object.keys(countsRepository).map((name) => ({
   ...countsRepository[name],
  }));
  countsArray.sort((a, b) => b.count - a.count);
  const topDuplicates = countsArray.slice(0, count);

  return topDuplicates;
 }

 async #getUserRepo(username) {
  try {
   const query = `
      {
        user(login: "${username}") {
          repositoriesContributedTo(first: 99) {
            nodes {
              name
              url
            }
          }
        }
      }
    `;

   const data = await GithubAdapter.postGraphQLQuery({ query });
   return data.data?.user.repositoriesContributedTo.nodes || [];
  } catch (error) {
   throw new Error(`Failed to fetch repositories for ${username}: ${error.message}`);
  }
 }

 async #getUserContributors({ repo, owner }) {
  let page = 1;
  const contributors = [];

  while (true) {
   const data = await GithubAdapter.getContributors({ page, repo, owner, type: 'all' });
   contributors.push(...data);
   if (data.length === 0 || data.length < 100) break;
   page += 1;
  }

  return contributors.filter((_user) => {
   return _user.type === 'User';
  });
 }
}

module.exports = { Github: new Github() };
