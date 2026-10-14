# Season 01 ads: landing page for each ad

Hey Jamie, each ad gets a new link. The end of the link decides which landing page it opens. Please swap these into Meta and add the page letter to the end of each ad name (e.g. `-b`) so the reports show which page each result came from.

## Landing pages

| Letter | Page | `hero` value |
|---|---|---|
| A | The page that's live now (the ad, continued) | none |
| B | How much do they game? | `amount` |
| C | What do they play? | `games` |
| D | Which one do you hear the most? | `screentime` |
| E | They tried them all | `shortlist` |

## Ad → page

| Ad | Page | Ad name ends in |
|---|---|---|
| D01 · We've all said it | B | `-b` |
| D02 · Overheard | D | `-d` |
| D03 · Play to win | C | `-c` |
| D04 · Team card | E | `-e` |
| D05 · They'll actually show up | E | `-e` |
| D06 · The coach ends it | B | `-b` |
| D07 · Screen time, graded | A | `-a` |
| D08 · Screen time, team time | C | `-c` |
| D09 · Admit one player | E | `-e` |
| D10 · Screen time with a purpose | A/B test: B vs C | `-b` / `-c` |

## Links to paste into Meta

**D01 → B**
```
https://ekuzo.gg/season1?ad=d1&hero=amount&utm_source=meta&utm_medium=paid_social&utm_campaign=season1&utm_content={{ad.name}}
```

**D02 → D**
```
https://ekuzo.gg/season1?ad=d2&hero=screentime&utm_source=meta&utm_medium=paid_social&utm_campaign=season1&utm_content={{ad.name}}
```

**D03 → C**
```
https://ekuzo.gg/season1?ad=d3&hero=games&utm_source=meta&utm_medium=paid_social&utm_campaign=season1&utm_content={{ad.name}}
```

**D04 → E**
```
https://ekuzo.gg/season1?ad=d4&hero=shortlist&utm_source=meta&utm_medium=paid_social&utm_campaign=season1&utm_content={{ad.name}}
```

**D05 → E**
```
https://ekuzo.gg/season1?ad=d5&hero=shortlist&utm_source=meta&utm_medium=paid_social&utm_campaign=season1&utm_content={{ad.name}}
```

**D06 → B**
```
https://ekuzo.gg/season1?ad=d6&hero=amount&utm_source=meta&utm_medium=paid_social&utm_campaign=season1&utm_content={{ad.name}}
```

**D07 → A (page unchanged)**
```
https://ekuzo.gg/season1?ad=d7&utm_source=meta&utm_medium=paid_social&utm_campaign=season1&utm_content={{ad.name}}
```

**D08 → C**
```
https://ekuzo.gg/season1?ad=d8&hero=games&utm_source=meta&utm_medium=paid_social&utm_campaign=season1&utm_content={{ad.name}}
```

**D09 → E**
```
https://ekuzo.gg/season1?ad=d9&hero=shortlist&utm_source=meta&utm_medium=paid_social&utm_campaign=season1&utm_content={{ad.name}}
```

**D10 → A/B test.** Duplicate the ad in the same ad set and give each copy one link.

Copy 1 (`-b`)
```
https://ekuzo.gg/season1?ad=d10&hero=amount&utm_source=meta&utm_medium=paid_social&utm_campaign=season1&utm_content={{ad.name}}
```

Copy 2 (`-c`)
```
https://ekuzo.gg/season1?ad=d10&hero=games&utm_source=meta&utm_medium=paid_social&utm_campaign=season1&utm_content={{ad.name}}
```

## On the sign-up side

- Every sign-up from pages B–E also sends `hero` and `heroAnswer`. Please save both to the Klaviyo profile.
- Page C also sends `kid_games`.
- Preview any page by adding `&preview=done` to see the confirmation screen.
