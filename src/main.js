const core = require("@actions/core");
const github = require("@actions/github");
const { grabTicket, DEFAULT_TICKET_REGEX } = require("./ticket");
const fs = require('fs');
const axios = require('axios');

async function validateSubscription() {
  let repoPrivate;
  const eventPath = process.env.GITHUB_EVENT_PATH;
  if (eventPath && fs.existsSync(eventPath)) {
    const payload = JSON.parse(fs.readFileSync(eventPath, "utf8"));
    repoPrivate = payload?.repository?.private;
  }

  const upstream = 'sbimochan/jira-link-commenter';
  const action = process.env.GITHUB_ACTION_REPOSITORY;
  const docsUrl = 'https://docs.stepsecurity.io/actions/stepsecurity-maintained-actions';
  core.info('');
  core.info('\u001b[1;36mStepSecurity Maintained Action\u001b[0m');
  core.info(`Secure drop-in replacement for ${upstream}`);
  if (repoPrivate === false) core.info('\u001b[32m\u2713 Free for public repositories\u001b[0m');
  core.info(`\u001b[36mLearn more:\u001b[0m ${docsUrl}`);
  core.info('');
  if (repoPrivate === false) return;
  const serverUrl = process.env.GITHUB_SERVER_URL || 'https://github.com';
  const body = { action: action || '' };
  if (serverUrl !== 'https://github.com') body.ghes_server = serverUrl;
  try {
    await axios.post(
      `https://agent.api.stepsecurity.io/v1/github/${process.env.GITHUB_REPOSITORY}/actions/maintained-actions-subscription`,
      body, { timeout: 3000 }
    );
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 403) {
      core.error(`\u001b[1;31mThis action requires a StepSecurity subscription for private repositories.\u001b[0m`);
      core.error(`\u001b[31mLearn how to enable a subscription: ${docsUrl}\u001b[0m`);
      process.exit(1);
    }
    core.info('Timeout or API not reachable. Continuing to next step.');
  }
}

async function runMain() {
  try {
    await validateSubscription();
    const jirProjectUrl = core.getInput("jira-project-url");
    const githubToken = core.getInput("GITHUB_TOKEN");
    const customComment = core.getInput("custom-comment");
    const ticketRegexRaw = core.getInput("ticket-regex-title");
    const ticketRegex = ticketRegexRaw
      ? new RegExp(ticketRegexRaw, "g")
      : DEFAULT_TICKET_REGEX;

    const context = github.context;
    if (context.payload.pull_request == null) {
      core.setFailed("No pull request found.");

      return;
    }
    const octokit = new github.getOctokit(githubToken);
    const pullRequestNumber = context.payload.pull_request.number;
    const isPrevComment = await checkIfOldCommentExists(
      octokit,
      context,
      pullRequestNumber
    );
    if (isPrevComment) {
      console.log("Jira link bot comment already exists.");
      return;
    }
    const ticketNumber = grabTicket(
      context.payload.pull_request.title,
      ticketRegex
    );
    if (!ticketNumber) {
      return;
    }
    await octokit.rest.issues.createComment({
      ...context.repo,
      issue_number: pullRequestNumber,
      body: `${customComment} \n Jira link: ${
        jirProjectUrl + "/" + ticketNumber
      }`,
    });
  } catch (error) {
    core.setFailed(error.message);
  }
}

async function checkIfOldCommentExists(octokit, context, pullRequestNumber) {
  const commentsMeta = await octokit.rest.issues.listComments({
    ...context.repo,
    issue_number: pullRequestNumber,
  });
  const isPrevComment = commentsMeta.data.some(
    (el) => el.user.login === "github-actions[bot]"
  );
  return isPrevComment;
}

runMain();
module.exports = { runMain };
