const core = require('@actions/core');
const github = require('@actions/github');
const { Octokit } = require("@octokit/rest");


async function run() {
  const octokit = new Octokit();
  const startCommit = core.getInput('start-commit');
  const endCommit = core.getInput('end-commit');
  const repo = core.getInput('repo');

  var commits = await octokit.repos
  .listCommits({
    owner: "Grocerkey",
    repo: repo,
    sha: startCommit
  });


  commits.forEach(item => {

      console.log(item); 

      if(item.sha == endCommit)
      break;
  });
}

run();
