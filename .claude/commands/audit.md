Run the full EKUZO GEO audit suite. This is the monthly cadence defined in
CLAUDE.md — every URL below gets scored and saved into a dated reports
folder for trend tracking.

**Target URL:** default to https://ekuzo.gg (production). If the user passes
an argument like `/audit https://dev--ekuzo.netlify.app`, use that base URL
instead. This lets us audit dev before shipping.

BASE_URL = $ARGUMENTS (defaults to https://ekuzo.gg if empty)

**Step 1: Set up the dated folder.**

DATE = today's date in YYYY-MM-DD format
REPORT_DIR = reports/$DATE

Create the folder with Bash: `mkdir -p reports/$DATE`

**Step 2: Run schema audits on the 4 key URLs with JSON-LD.**

For each of these, invoke /geo schema and save the output to the listed file:

- `/geo schema $BASE_URL`
  → reports/$DATE/schema-home.md

- `/geo schema $BASE_URL/programs/ekuzo-camps`
  → reports/$DATE/schema-camps.md

- `/geo schema $BASE_URL/programs/ekuzo100`
  → reports/$DATE/schema-ekuzo100.md

- `/geo schema $BASE_URL/programs/ekuzo-teams`
  → reports/$DATE/schema-teams.md

**Step 3: Run citability audits on 6 content-heavy pages.**

- `/geo citability $BASE_URL`
  → reports/$DATE/citability-home.md

- `/geo citability $BASE_URL/methodology`
  → reports/$DATE/citability-methodology.md

- `/geo citability $BASE_URL/parents`
  → reports/$DATE/citability-parents.md

- `/geo citability $BASE_URL/schools`
  → reports/$DATE/citability-schools.md

- `/geo citability $BASE_URL/programs/ekuzo-camps`
  → reports/$DATE/citability-camps.md

- `/geo citability $BASE_URL/programs/ekuzo100`
  → reports/$DATE/citability-ekuzo100.md

- `/geo citability $BASE_URL/programs/ekuzo-teams`
  → reports/$DATE/citability-teams.md

**Step 4: Run the standalone audits (once, homepage-level).**

- `/geo crawlers $BASE_URL`
  → reports/$DATE/crawlers.md

- `/geo llmstxt $BASE_URL`
  → reports/$DATE/llmstxt.md

**Step 5: Generate a summary table.**

Create reports/$DATE/SUMMARY.md with a markdown table showing:

| URL / Page | Schema Score | Citability Score |
|------------|--------------|------------------|
| Homepage | XX/100 | XX/100 |
| /methodology | — | XX/100 |
| /parents | — | XX/100 |
| /schools | — | XX/100 |
| /programs/ekuzo-camps | XX/100 | XX/100 |
| /programs/ekuzo100 | XX/100 | XX/100 |
| /programs/ekuzo-teams | XX/100 | XX/100 |
| /faq | — | — |

Pull scores from each report file. Use em-dashes for cells that don't apply
(citability-only pages don't have schema scores; crawlers and llmstxt don't
fit this table).

Also add to SUMMARY.md:
- Crawlers status (all allowed / any blocked)
- llms.txt status (present / absent / generated)
- Comparison vs. previous month if reports/ contains an earlier dated folder
  (diff the scores; flag any regressions explicitly)
- Top 3 improvement opportunities across all reports (synthesize from the
  individual citability and schema findings)

**Step 6: Report back.**

Print the SUMMARY.md contents to the terminal at the end so I can scan it
without opening the file. Flag any regressions in red (use a ⚠️ emoji next
to dropped scores).
