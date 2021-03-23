const core = require('@actions/core');
const github = require('@actions/github');
const { Octokit } = require("@octokit/rest");


async function run() {
  const startCommit = core.getInput('start-commit');
  const endCommit = core.getInput('end-commit');
  const repo = core.getInput('repo');
  const token = core.getInput('github-token');
  const octokit = new Octokit({auth: token});

  try {
      var commits = await octokit.repos
      .listCommits({
        owner: "Grocerkey",
        repo: repo,
        sha: endCommit,      
        page: 1
      });

      for (var i = 0; i < commits.data.length; i++) {
        var commit = commits.data[i];
        console.log(commit.sha);
        if(commit.sha == startCommit)
            break;
      }
  }
  catch(err) {
    console.log(err);
  }
}

run();
