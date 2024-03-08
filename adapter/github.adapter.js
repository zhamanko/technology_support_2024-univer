const got = require('got');

const { GITHUB_PERSONAL_TOKEN } = require('../config');
const { logger } = require('../utils/logger.utils');

const RETRY_STATUS_CODES = [403, 500, 503];

const gotClient = got.extend({
  prefixUrl: 'https://api.github.com/',
  headers: {
    accept: 'application/vnd.github+json',
    'User-Agent': 'Awesome-Octocat-App-TOP-Contributor',
    Authorization: `Bearer ${GITHUB_PERSONAL_TOKEN}`,
  },
  retry: {
    limit: 3,
    methods: ['GET', 'POST'],
    statusCodes: RETRY_STATUS_CODES,
    calculateDelay: (response) => {
      if (RETRY_STATUS_CODES.includes(response.statusCode)) {
        return 20000 * response.attemptCount;
      } else {
        return 0;
      }
    },
  },
});

class Github {
  constructor() {
    this.client = gotClient;
  }

  async getContributors({ owner, repo, page = 1, perPage = 100, type }) {
    try {
      const response = await this.client.get(`repos/${owner}/${repo}/contributors`, {
        searchParams: { per_page: perPage, page, type },
        method: 'GET',
        responseType: 'json',
      });

      const data = response.body;
      return data;
    } catch (error) {
      logger.error(error);

      throw new Error('Service is temporarily unavailable, please try again later');
    }
  }

  async postGraphQLQuery({ query }) {
    try {
      const response = await this.client.post('graphql', {
        json: {
          query,
        },
        responseType: 'json',
      });

      return response.body;
    } catch (error) {
      logger.error(error);

      throw new Error('Service is temporarily unavailable, please try again later');
    }
  }
}

module.exports = { Github: new Github() };
