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
  robot.on("pull_request.opened", check);
  robot.on("pull_request.synchronize", check);

  async function check(event, context) {
    const github = await robot.auth(event.payload.installation.id);
    const pr = event.payload.pull_request;

    const compare = await github.repos.compareCommits(
      context.repo({
        base: pr.base.sha,
        head: pr.head.sha
      })
    );

    const mergers = compare.commits.every(merge);

    const params = Object.assign(
      {
        sha: pr.head.sha,
        context: "No Merge Commits"
      },
      mergers ? defaults.success : defaults.failure
    );

    return github.repos.createStatus(context.repo(params));
  }
};
