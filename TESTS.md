# Test log

## The test

Paste this into a new chat in each LLM:

```
Read https://raw.githubusercontent.com/sebastarre/flow-library/main/README.md,
then the template and the flows it links to. Write a new LearnWise flow in
exactly the same format for this need: when a student asks for an extension on
an assignment deadline, explain that the assistant cannot grant extensions and
show a button to contact their instructor.
```

**Pass** = the draft:
- uses the same headings and field names as `flows/human-help-needed.md`;
- has at least 5 matching and 3 non-matching examples, each with an explanation;
- has non-matching examples that are close calls (e.g. "When is the deadline?");
- uses only options listed in CONTRIBUTING.md.

## Results

| Date | LLM | Opened the URLs | Draft passes | Notes |
|---|---|---|---|---|
