const core = require('@actions/core');
const github = require('@actions/github');
const { Octokit } = require("@octokit/rest");


export function anAction() {

  return async (dispatch) => {
    try {
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


      dispatch({
        type: 'AN_ACTION',
        ...result.data
      });
    } catch (error) {
      console.error(error_;
      dispatch({
        type: 'AN_ACTION' // or, better, 'FAILED_ACTION' or something like that
      });
    }
  };
}
