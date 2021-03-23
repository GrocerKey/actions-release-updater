const core = require('@actions/core');
const github = require('@actions/github');
const { Octokit } = require("@octokit/rest");


function extractURL(input) {
  var urlRegex = /(https?:\/\/[^ ]*)/;
  var url = input.match(urlRegex)[1];
  return url;
}

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

      var prList = [];

      for (var i = 0; i < commits.data.length; i++) {        
        var commit = commits.data[i];
        
        var prs = await octokit.request('GET /repos/{owner}/{repo}/commits/{commit_sha}/pulls', {
          owner: 'GrocerKey',
          repo: repo,
          commit_sha: commit.sha,
          mediaType: {
            previews: [
              'groot'
            ]
          }
        });

        for (var j = 0; j < prs.data.length; j++) { 
          prList.push(prs.data[j])
        }       

        if(commit.sha == startCommit)
            break;
      }

      console.log("******* PRs in Release******")
      prList.forEach(item => {
          console.log(item.html_url);
      });

      console.log("*******Stories in Release******")
      prList.forEach(item => {
          console.log(extractURL(item.body));
      });

  }
  catch(err) {
    console.log(err);
  }
}

run();
