const core = require('@actions/core');
const github = require('@actions/github');
const { Octokit } = require("@octokit/rest");

function extractURL(input) {
  var urlRegex = /(https?:\/\/[^ ]*)/;
  var url = input.match(urlRegex);
  
  if(url.length == 0)
    return null;

  return url[0];
}

function extractPRNumber(input) {
  var prRegex = /(\d+)/;
  var prNumber = input.match(prRegex);
  
  if(prNumber.length == 0)
    return null;

  return prNumber[0];
  
}

async function run() {
  const startCommit = core.getInput('start-commit');
  const endCommit = core.getInput('end-commit');
  const repo = core.getInput('repo');
  const token = core.getInput('github-token');
  const octokit = new Octokit({auth: token});

  if(startCommit == '' || endCommit == '') {
      console.log("No Release information Found");
      return;
  }

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
        
        if(commit.sha == startCommit)
            break;
        
        var pull_number = extractPRNumber(commit.commit.message);
        
        if(pull_number == null)
          continue;
         
        var pr = await octokit.pulls.get({
          owner: "GrocerKey",
          repo: repo,
          pull_number,
        });
        
        var comments = await octokit.issues.listComments({
          owner: "GrocerKey",
          repo: repo,
          issue_number : pr.data.number
        });

        for(var k = 0; k < comments.data.length; k++) {
            var comment = comments.data[k];
            if(comment.user.login == "clubhouse[bot]") {
              pr.data.storyLink = extractURL(comment.body)
              break;
            }
        }

        prList.push(pr.data)
      }
      

      console.log("******* PRs in Release******")
      prList.forEach(item => {
          console.log(item.html_url);
      });

      console.log("*******Stories in Release******")
      prList.forEach(item => {
          if(item.storyLink != null)
            console.log(item.storyLink);
      });

  }
  catch(err) {
    console.log(err);
  }
}

run();
