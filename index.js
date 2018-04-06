const merge = require("./lib/merge");

const defaults = {
  success: {
    state: "success",
    description: "None of the commits in this branch are merge commits"
  },
  failure: {
    state: "failure",
    description: "Merge commits are not allowed in this repository",
    target_url: ""
  }
};

module.exports = robot => {
  robot.on(["pull_request.opened", "pull_request.synchronize"], check);

  async function check(context) {
    const github = await robot.auth(context.payload.installation.id);
    const pr = context.payload.pull_request;

    const commits = await github.pullRequests.getCommits(
      context.repo({
        number: pr.number
      })
    );

    const mergers = commits.data.some(merge);

    const params = Object.assign(
      {
        sha: pr.head.sha,
        context: "No Merge Commits"
      },
      !mergers ? defaults.success : defaults.failure
    );

    return github.repos.createStatus(context.repo(params));
  }
};
