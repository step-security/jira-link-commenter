[![StepSecurity Maintained Action](https://raw.githubusercontent.com/step-security/maintained-actions-assets/main/assets/maintained-action-banner.png)](https://docs.stepsecurity.io/actions/stepsecurity-maintained-actions)

# Jira link commenter

This action auto comments in pull request with Jira link to it.

> This tool can be used with other project tracking tools like ClickUp as well. Let's explore together!

## Settings

- `jira-project-url`

**Required** Add your jira link in ticket link format.
E.g:
`https://jira.atlassian.net/browse`

- `ticket-regex-title`

**Optional** You can add custom regex if your PR description seems to be different but I encourage to have same standard world wide.

#### PR summary example:

`XYZ-1234: This is an amazing feature`

## Outputs

Creates a comment in your PR:

Jira Link: https://jira.atlassian.net/browse/JPT-1571

## Example usage

`custom-comment` is (optional)

```yaml
uses: step-security/jira-link-commenter@v3
with:
  jira-project-url: "https://jira.atlassian.net/browse"
  custom-comment: "Thank you for your contribution! :confetti_ball:"
```

### Full example

```yaml
on: pull_request

jobs:
  example_comment_pr:
    runs-on: ubuntu-latest
    name: Auto jira link commenter
    steps:
      - name: Checkout
        uses: actions/checkout@v7

      - name: Comment PR
        uses: step-security/jira-link-commenter@v3

        with:
          jira-project-url: https://jira.atlassian.net/browse
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          custom-comment: "Thank you for your contribution! :confetti_ball:"
```

### Recommendations:

> Ticket link appender

This is more generic and has more flexibility on prefixes and tools you use. If you want to link the ticket link in the description itself, you can check this repository.

[Check repo.](https://github.com/step-security/ticket-link-appender)

