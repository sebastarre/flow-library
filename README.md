# Flow Library

Our LearnWise flows, written down as plain text so the team can reuse them, copy them into LearnWise, and ask any LLM to draft new ones in the same format.

Every flow has the same three parts, exactly as in LearnWise (Tutor Assistant → Flujos):

1. **Activador**: what starts the flow (e.g. the user sends a message).
2. **Condiciones**: when the flow applies. A description of the conversation context, plus example user messages that should match and that should not.
3. **Respuesta**: what the assistant does, as one or more actions (a message, a button...).

Field names in the files are the same as in LearnWise, so you can copy a flow field by field.

## Flows

| Flow | Triggers when | Raw URL (give this to the LLM) |
|---|---|---|
| Human Help Needed | The user asks to talk to a person or to contact support | https://raw.githubusercontent.com/sebastarre/flow-library/main/flows/human-help-needed.md |

## Reuse a flow

Open the flow file and copy each field into LearnWise: Tutor Assistant → Flujos → new flow.

## Draft a new flow with an LLM

Paste this into any LLM chat (Claude, ChatGPT, Kimi):

> Read https://raw.githubusercontent.com/sebastarre/flow-library/main/README.md,
> then the template and the flows it links to. Write a new LearnWise flow in
> exactly the same format for this need: [when it should trigger and what the
> assistant should do].

Template, LearnWise options and writing rules: https://raw.githubusercontent.com/sebastarre/flow-library/main/CONTRIBUTING.md

If the LLM cannot open URLs, paste the contents of CONTRIBUTING.md and one flow file into the chat instead.

Check the draft before using it: same headings as the other flows, at least 5 matching and 3 non-matching examples, and only LearnWise options that exist (listed in CONTRIBUTING.md).

## Improve a flow

Editing a file here does **not** change LearnWise, and changing LearnWise does not change the file. When you change one, change the other the same way. See CONTRIBUTING.md.
