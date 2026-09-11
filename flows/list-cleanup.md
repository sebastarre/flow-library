# List Cleanup

## Purpose
Turn a messy pasted list (people, emails, companies — any mix, any format) into a clean, deduplicated markdown table.

## Inputs
- **list** (required): the raw text to clean. Can be lines, commas, copied from a spreadsheet, anything.
- **columns** (optional): which columns you want. Default: Name | Email | Company | Title | Notes.

## Steps
1. Read the whole input before doing anything. Identify what kind of items it contains.
2. Split it into one item per row. An item is one person or one company, never a line.
3. For each row, extract the fields into the requested columns. Leave a cell blank if the information is not in the input — never guess.
4. Normalize: proper capitalization for names and companies ("acme corp" → "Acme Corp"), emails in lowercase, remove stray punctuation, trim spaces.
5. Merge duplicates. After step 4, two rows are duplicates if they have the same email, or the same name and the same company. Merge them into one row that keeps every detail from both. If two rows look like the same person but a field conflicts (for example, two different emails), keep both and write "possible duplicate of row N" in Notes.
6. Output the result in the format below.

## Output format
The markdown table with the requested columns, then exactly one line:
`X rows in, Y rows out, Z duplicates removed.`
X is the number of items in the input, Y the number of rows in the table, Z = X − Y.

## Rules
- Never invent data to fill blank cells.
- Never drop an item because it's unclear — keep it and put a note.
- Do not add commentary before or after the output beyond the one summary line.

## Example
Input:
```
john smith - jsmith@ACMEROCKETS.example, Acme rockets, cto
Maria López, maria.lopez@acmerockets.example
JOHN SMITH, jsmith@acmerockets.example
```
Output:

| Name | Email | Company | Title | Notes |
|---|---|---|---|---|
| John Smith | jsmith@acmerockets.example | Acme Rockets | CTO | |
| Maria López | maria.lopez@acmerockets.example | | | |

3 rows in, 2 rows out, 1 duplicate removed.
