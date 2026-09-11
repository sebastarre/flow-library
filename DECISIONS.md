# Decisions

| Date | Decision | Why |
|---|---|---|
| 2026-09-11 | List Cleanup, step 5: merge rows with the same email, or the same name and company, keeping every detail; keep rows with conflicting details and mark them "possible duplicate". | The original step removed only *exact* duplicates, which contradicts its own example and the README test (both expect a near-duplicate to be merged). An LLM following the steps exactly would fail the test. |
| 2026-09-11 | List Cleanup: added an "Output format" section, with the summary line defined there. | Same section headings in every flow, as CONTRIBUTING.md asks. |
| 2026-09-11 | List Cleanup example: emails use `acmerockets.example` instead of `acmerockets.com`, and Maria's company cell is blank. | `.example` domains can never belong to a real company. The input doesn't give Maria's company, and the flow says never to fill blanks by guessing. |
| 2026-09-11 | Files uploaded with the GitHub CLI instead of the website, committing with the GitHub no-reply email. | Same result, fewer clicks; the no-reply email keeps a personal address out of the public history. Editing on the website works exactly as described in CONTRIBUTING.md. |
