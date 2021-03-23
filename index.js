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

        console.log("****PR's Included in this Release*****")

        for (var j = 0; j < prs.data.length; j++) { 
          var pr = prs.data[j];
          console.log(pr.html_url);         
        }

        console.log("*****Stories Included in this Release*****")

        for (var j = 0; j < prs.data.length; j++) { 
          var pr = prs.data[j];
          console.log(pr.body);       
        }

       

        if(commit.sha == startCommit)
            break;
      }
  }
  catch(err) {
    console.log(err);
  }
}

run();
