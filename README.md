# Flow Library

Reusable step-by-step prompts ("flows") for the team. Any LLM can read this file and the flows it links to.

## How to use a flow

Paste this into any LLM chat (Claude, ChatGPT, Kimi):

> Read https://raw.githubusercontent.com/sebastarre/flow-library/main/README.md
> and pick the best flow for the task below. Then fetch that flow's URL, follow
> its steps exactly, and produce the output in the format it specifies.
> Task: [describe what you need]
> Inputs: [give the inputs the flow asks for]

If the LLM cannot open URLs, open the flow file yourself, copy its contents, and paste them into the chat instead.

## Flows

| Flow | Use it when | Raw URL (give this to the LLM) |
|---|---|---|
| List Cleanup | You have a messy list (names, emails, companies) and want it normalized into a clean table | https://raw.githubusercontent.com/sebastarre/flow-library/main/flows/list-cleanup.md |
| People Search | You need to find people at a company matching a role, with sources | https://raw.githubusercontent.com/sebastarre/flow-library/main/flows/people-search.md |
| Company Enrichment | You have a company name and want a profile (size, HQ, industry, news) with sources | https://raw.githubusercontent.com/sebastarre/flow-library/main/flows/company-enrichment.md |

## How to improve a flow

Open the flow file on GitHub, click the pencil icon, edit, and commit. Everyone gets the new version on their next use (GitHub's raw URLs update within about 5 minutes). See CONTRIBUTING.md.
