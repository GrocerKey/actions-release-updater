const core = require('@actions/core');
const github = require('@actions/github');
const { Octokit } = require("@octokit/rest");
const { WebClient } = require('@slack/web-api');

function extractURL(input) {
  var urlRegex = /(https?:\/\/[^ ][^)]+)/;
  var url = input.match(urlRegex);
  
  if(url.length == 0)
    return null;

  return url[0];
}

function extractPRNumber(input) {
  var prRegex = /\(#(\d+)\)/;
  var prNumber = input.match(prRegex);
  
  if(prNumber == null || prNumber.length == 0)
    return null;

  return prNumber[1];
  
}

async function postToSlack(prList) {
  const environment = core.getInput('environment');
  var slackToken = core.getInput('slack-token');
  if(slackToken == '')
      return;

  const slackClient = new WebClient(slackToken);

  var botMessage = `New Release For ${environment}`;
  
  prList.forEach(item => { 
    botMessage += '\n ' + item.storyLink
  });

  const result = await slackClient.chat.postMessage({
    text: botMessage,
    channel: 'releases',
  });
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
    
      var commits = await octokit.repos.compareCommits({
        owner: "Grocerkey",
        repo: repo,
        head:endCommit ,
        base:startCommit ,
      });
    
      var prList = [];

      for (var i = 0; i < commits.data.commits.length; i++) {        
        var commit = commits.data.commits[i];
        
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

      await postToSlack(prList);

  }
  catch(err) {
    console.log(err);
  }
}

run();
