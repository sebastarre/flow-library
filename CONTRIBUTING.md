# Adding and improving flows

## Improve a flow
Open the flow file on GitHub → pencil icon → edit → "Commit changes". Write one line saying what you changed. It's live for everyone within about 5 minutes.

## Add a flow
1. Create `flows/<short-name>.md` (lowercase, hyphens, e.g. `email-rewrite.md`).
2. Use the same sections as the other flows: Purpose, Inputs, Steps, Output format, Rules, Example.
3. Add a row to the table in README.md with the flow's raw URL:
   `https://raw.githubusercontent.com/sebastarre/flow-library/main/flows/<short-name>.md`

## Writing a good flow
- Short numbered steps. One action per step.
- Say what NOT to do ("never invent emails").
- Require a source URL for any factual claim.
- One worked example, using a fictional company (Acme Rockets Ltd), so the LLM doesn't copy example names into real results.
- Refer to inputs by name in plain words. No special syntax.
