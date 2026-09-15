#!/usr/bin/env python3
"""
Reanalysis of the Brain and Body Study public dataset.

Paper:    Paleczny SG, Wild CJ, Xue A, Highfield R, Owen AM (2025).
          "Characterizing the cognitive and mental health benefits of exercise
          and video game playing (The Brain and Body Study)."
          PLOS ONE 20(10): e0334924.
Data:     Borealis (Canadian Dataverse), "The Brain & Body Study, complete raw
          dataset", DOI 10.5683/SP3/WUYAGU, CC0 1.0.
File:     brainbodystudy-preprocessed-data-final.csv (N = 923).

Why this script exists
----------------------
A widely shared press figure says frequent gamers in this study "performed like
people 13.7 years younger". That figure is not in the peer-reviewed paper. The
paper reports group differences in standard-deviation units and reports no
age-equivalence conversion at all. This script does three things:

  1. Reproduces the group differences in SD units under the covariate set the
     paper's Methods specify, and under a reduced covariate set, so the reader
     can see how much the covariates move the answer.
  2. Fits the age curve, and tests whether a single linear age slope is
     defensible. It is not: the quadratic term is significant.
  3. Converts the gaming gap into years of age only at explicitly named anchor
     ages, from an explicitly named model. Because the age curve is curved, the
     same gap is worth very different numbers of years at different ages, so a
     bare "X years younger" figure is not a property of the data.

There is no IQ-point conversion anywhere in this script, and none should be
added. The composites are rescaled to mean 0 and SD 1 *within this 923-person
sample*, which is self-selected, older (mean age 55) and unusually educated
(83% post-secondary). Multiplying that within-sample SD by 15 does not produce
IQ points on any normed scale, and the paper makes no IQ claim.

Every years-equivalent figure printed below carries its anchor age and its
model. That is a hard rule in this script, not a stylistic preference.

Requires: pandas, numpy, statsmodels.
Usage:    python3 gaming-cognition-reanalysis.py
          (expects the CSV in the same directory, or pass a path as argv[1])
"""

import sys
import warnings

import numpy as np
import pandas as pd
import statsmodels.formula.api as smf
from scipy.stats import chi2

warnings.filterwarnings("ignore", category=FutureWarning)
# Cosmetic only: pandas warns about frame fragmentation as derived columns are
# added one at a time below. It has no effect on any result.
warnings.filterwarnings("ignore", category=pd.errors.PerformanceWarning)
pd.set_option("display.width", 200)

CSV = sys.argv[1] if len(sys.argv) > 1 else "brainbodystudy-preprocessed-data-final.csv"

COMPOSITES = ["STM", "reasoning", "verbal", "processing_speed", "overall"]
ANCHOR_AGES = [40, 55, 70]

# The eight base past-12-month genre items from the Bavelier Lab Video Game
# Questionnaire, as coded in the preprocessed file.
GENRES = ["fps", "rpg", "sports", "rts", "roleplay", "strategy", "music", "other"]

# Ordinal response scale for those items, verified against the raw Qualtrics
# export (VGQ_June_19_2024_08_22.csv.bz2):
#   -1 = no response, 0 = Never, 1 = Less than 1 hour, 2 = Between 1 and 3 hours,
#    3 = Between 3 and 5 hours, 4 = Between 5 and 10 hours, 5 = More than 10 hours
# The threshold "3 or more hours in a genre" is therefore code >= 3, and
# "5 or more hours in a single genre" is code >= 4.
CODE_3H_PLUS = 3
CODE_5H_PLUS = 4


def rule(char="=", n=78):
    print(char * n)


def ci_text(lo, hi, dp=3):
    """Format a confidence interval for the printed tables."""
    return f"[{lo:.{dp}f}, {hi:.{dp}f}]"


def header(title):
    print()
    rule()
    print(title)
    rule()


# ---------------------------------------------------------------------------
# 0. Load and construct variables
# ---------------------------------------------------------------------------

header("0. DATA, VARIABLES AND GROUP DEFINITIONS")

df = pd.read_csv(CSV)
print(f"File: {CSV}")
print(f"Rows: {len(df)} (paper's analytic N = 923)")
print(f"Age: mean {df['age'].mean():.2f}, SD {df['age'].std():.2f}, "
      f"range {df['age'].min():.0f} to {df['age'].max():.0f}")

SAMPLE_MEAN_AGE = df["age"].mean()

# --- Covariates -----------------------------------------------------------
# The paper's Methods specify four covariates: age (linear, mean centred),
# gender, completion of post-secondary education as a BINARY variable, and
# presence of a pre-existing health condition as a BINARY variable.
#
# Education: we use the binary post-secondary indicator, not the 5-level
# categorical, because that is what the paper specifies ("completion of
# post-secondary education") and because the paper's own descriptive line
# ("83% completed post-secondary education") is reproduced only by the binary
# form. A 5-level version is reported later as a sensitivity check.
POST_SECONDARY = ["Graduate degree", "Undergraduate degree or college diploma"]
df["edu_post_secondary"] = df["education"].isin(POST_SECONDARY).astype(int)
pct_ps = 100 * df["edu_post_secondary"].mean()
print(f"\nEducation, binary post-secondary complete: {df['edu_post_secondary'].sum()} "
      f"of {len(df)} ({pct_ps:.1f}%). Paper's Table 1 reports 83%.")

# Gender: the `gender` column is the self-identified 3-level version
# (male / female / other) with no missing values. `gender_cat` is a 4-level
# version with 4 missing values, so `gender` is the safer column. Male is the
# reference level, matching the paper's description of male-baseline dummies.
df["gender"] = pd.Categorical(df["gender"], categories=["male", "female", "other"])
print("Gender (reference = male): "
      + ", ".join(f"{k} {v}" for k, v in df["gender"].value_counts().items()))

# Pre-existing health condition: the preprocessed file ships this covariate
# pre-built as `pre_existing_health_condition`. We verify it against the
# paper's stated component list rather than trusting the column name.
HEALTH_DX = ["dx_diabetes", "dx_obesity", "dx_hypertension", "dx_stroke",
             "dx_heart_attack", "dx_cardiac_problems", "dx_concussion"]
reconstructed = df[HEALTH_DX].any(axis=1).astype(int)
matches = bool((reconstructed == df["pre_existing_health_condition"]).all())
print(f"\nPre-existing health condition covariate FOUND in the preprocessed file "
      f"as 'pre_existing_health_condition'.")
print(f"  Positive: {int(df['pre_existing_health_condition'].sum())} of {len(df)}.")
print(f"  Reconstruction from {', '.join(HEALTH_DX)}")
print(f"  reproduces it exactly: {matches}")

# Mean-centred age, and its square. Centring means the linear age coefficient
# in the quadratic model is the slope at the sample mean age, not at age 0.
df["age_c"] = df["age"] - SAMPLE_MEAN_AGE
df["age_c_sq"] = df["age_c"] ** 2

# --- Group definitions ----------------------------------------------------
# Three definitions are carried through the whole script, because the press
# coverage and the paper do not use the same one.
genre_cols = [g + "_past_year" for g in GENRES]
max_genre = df[genre_cols].replace(-1, np.nan).max(axis=1)
df["max_genre_code"] = max_genre

ORDER = ["Non", "Infrequent", "Frequent"]

# (i) The paper's own group column, as deposited by the authors.
df["group_paper"] = pd.Categorical(
    df["gamer_type"].map({"Non_Gamer": "Non",
                          "Infrequent_Gamer": "Infrequent",
                          "Frequent_Gamer": "Frequent"}),
    categories=ORDER)

# (ii) The press-release definition: 5 or more hours per week on a SINGLE genre.
df["group_press"] = pd.Categorical(
    np.where(max_genre >= CODE_5H_PLUS, "Frequent",
             np.where(max_genre == 0, "Non", "Infrequent")),
    categories=ORDER)

# (iii) The paper's stated threshold, reconstructed literally from the eight
# genre items: 3 or more hours per week in at least one genre.
df["group_literal3h"] = pd.Categorical(
    np.where(max_genre >= CODE_3H_PLUS, "Frequent",
             np.where(max_genre == 0, "Non", "Infrequent")),
    categories=ORDER)

# (column, long label for section headings, short label for summary tables)
GROUP_DEFS = [
    ("group_paper",
     "authors' deposited gamer_type column (paper definition)",
     "paper (gamer_type)"),
    ("group_press",
     "press release: 5+ hrs/week on a single genre (code >= 4)",
     "press release (5+ hr)"),
    ("group_literal3h",
     "literal reconstruction: 3+ hrs/week in any genre (code >= 3)",
     "literal 3+ hr rebuild"),
]

print("\nGroup definitions and counts:")
for col, label, _short in GROUP_DEFS:
    counts = df[col].value_counts().reindex(ORDER)
    print(f"  {label}")
    print("    " + ", ".join(f"{k} {int(v)}" for k, v in counts.items()))

# Two caveats a reader should have before any coefficient is shown.
n_zero_hours_but_gamer = int(((max_genre == 0) &
                              (df["group_paper"] != "Non")).sum())
print(f"""
Caveats on the group variable:
  1. The authors' deposited gamer_type column cannot be reproduced from the
     eight genre items in this file. {n_zero_hours_but_gamer} participants report 0 hours across
     all eight past-year genre items yet are classified as gamers by
     gamer_type, so that column is derived partly from questionnaire items
     that were not deposited in the preprocessed file. Both the authors'
     column and the two reconstructions are therefore reported throughout.
  2. The paper's Table 2 text gives the frequent-gamer count as 239 (24.8%).
     24.8% of 923 is 229, which is exactly what the deposited column gives.
     The percentage and the deposited column agree with each other; the
     printed count of 239 does not agree with either.""")

# --- Covariate specifications --------------------------------------------
SPECS = [
    ("PAPER",
     "age_c + C(gender) + edu_post_secondary + pre_existing_health_condition",
     "paper's covariate set: age, gender, binary post-secondary education, "
     "binary pre-existing health condition"),
    ("NO_HEALTH",
     "age_c + C(gender) + edu_post_secondary",
     "age + gender + binary education only (health condition dropped)"),
    ("EDU5_NO_HEALTH",
     "age_c + C(gender) + C(education)",
     "age + gender + 5-level education factor, no health condition "
     "(sensitivity check only, not the paper's spec)"),
]


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def fit(outcome, group_col, covariates, quadratic=False):
    """OLS of one composite on group plus covariates. Returns the fitted model."""
    rhs = f"C({group_col}) + {covariates}"
    if quadratic:
        rhs += " + age_c_sq"
    return smf.ols(f"{outcome} ~ {rhs}", data=df).fit()


def contrast(model, group_col, level):
    """Beta, 95% CI and p for one group level against the Non reference."""
    key = f"C({group_col})[T.{level}]"
    lo, hi = model.conf_int().loc[key]
    return model.params[key], lo, hi, model.pvalues[key]


def ratio_delta_ci(model, num_key, den_key, z=1.959964):
    """
    Point estimate and 95% CI for beta_group / -beta_age by the delta method,
    using the model's own covariance between the two coefficients. Both terms
    come from the SAME regression, which is the only internally consistent way
    to divide an adjusted group gap by an age slope.
    """
    b_num = model.params[num_key]
    b_den = model.params[den_key]
    V = model.cov_params().loc[[num_key, den_key], [num_key, den_key]].values
    ratio = b_num / (-b_den)
    # d(ratio)/d(b_num) = -1/b_den ; d(ratio)/d(b_den) = b_num / b_den^2
    J = np.array([-1.0 / b_den, b_num / (b_den ** 2)])
    se = float(np.sqrt(J @ V @ J))
    return ratio, ratio - z * se, ratio + z * se, se


def years_from_quadratic(gap, b1, b2, anchor_age):
    """
    Years of age that the adjusted age curve needs in order to move by `gap`,
    measured going YOUNGER from `anchor_age`.

    The adjusted age curve from the fitted model is
        f(x) = b1 * x + b2 * x^2,    x = age - sample mean age.
    We solve f(x - D) - f(x) = gap for D > 0, which gives
        b2 * D^2 - (b1 + 2 * b2 * x) * D - gap = 0.
    Returns (exact_D, local_slope_D, local_slope, implied_age).

    `local_slope_D` is the first-order approximation gap / |slope at anchor|.
    It differs from the exact solution because the curve is curved: that
    difference is the whole point of section B.
    """
    x = anchor_age - SAMPLE_MEAN_AGE
    slope = b1 + 2.0 * b2 * x
    local_d = gap / (-slope)

    a, b, c = b2, -(b1 + 2.0 * b2 * x), -gap
    disc = b * b - 4 * a * c
    if disc < 0:
        exact_d = np.nan
    else:
        roots = [(-b + np.sqrt(disc)) / (2 * a), (-b - np.sqrt(disc)) / (2 * a)]
        positive = [r for r in roots if r > 0]
        # The relevant root is the smaller positive one. The larger root is the
        # far side of the parabola and has no interpretation here.
        exact_d = min(positive) if positive else np.nan
    return exact_d, local_d, slope, anchor_age - exact_d


# ---------------------------------------------------------------------------
# A. Group differences on the five composites
# ---------------------------------------------------------------------------

header("A. GROUP DIFFERENCES ON THE FIVE STANDARDIZED COMPOSITES")

print("""All composites are scaled to mean 0 and SD 1 within this 923-person
sample, so every beta below is in within-sample SD units. Reference group is
Non-gamer. p values are uncorrected; the paper judged significance against
p < 0.05 Bonferroni-corrected for 14 comparisons, i.e. alpha = 0.00357, which
is marked in the last column.""")

BONF_ALPHA = 0.05 / 14

for spec_name, covariates, spec_desc in SPECS:
    print()
    rule("-")
    print(f"Covariate spec {spec_name}: {spec_desc}")
    print(f"  formula RHS: group + {covariates}")
    rule("-")
    for group_col, group_label, group_short in GROUP_DEFS:
        print(f"\n  Group definition: {group_label}")
        print(f"  {'composite':<18}{'contrast':<22}{'beta':>8}{'95% CI':>20}"
              f"{'p':>12}  {'< .00357':>8}")
        for outcome in COMPOSITES:
            model = fit(outcome, group_col, covariates)
            for level in ["Frequent", "Infrequent"]:
                beta, lo, hi, p = contrast(model, group_col, level)
                flag = "yes" if p < BONF_ALPHA else "no"
                print(f"  {outcome:<18}{level + ' vs Non':<22}{beta:>8.4f}"
                      f"{ci_text(lo, hi):>20}"
                      f"{p:>12.2e}  {flag:>8}")

print("""
Reading of section A. The frequent-versus-non-gamer gap on the overall
composite sits between about +0.41 and +0.49 SD across these specifications.
Dropping the health-condition covariate moves it very little. Replacing the
binary education variable with the 5-level factor moves it a little more. The
group definition moves it more than the covariates do.""")


# ---------------------------------------------------------------------------
# B. The age curve on the overall composite
# ---------------------------------------------------------------------------

header("B. AGE CURVE ON THE OVERALL COMPOSITE: LINEAR VERSUS QUADRATIC")

print("""Any conversion of an SD gap into years of age assumes something about
the shape of the age curve. The simplest assumption, one constant slope for
every age, is testable. It is tested here two ways: with no covariates, and
inside the paper's covariate specification alongside the group term.""")

# (i) Unadjusted, no covariates, no group term.
lin_raw = smf.ols("overall ~ age_c", data=df).fit()
quad_raw = smf.ols("overall ~ age_c + age_c_sq", data=df).fit()
print(f"""
(i) No covariates, no group term
    linear     overall ~ age
               age slope = {lin_raw.params['age_c']:.5f} SD/year, p = {lin_raw.pvalues['age_c']:.3e}
               adj R2 = {lin_raw.rsquared_adj:.4f}
    quadratic  overall ~ age + age^2
               age slope at sample mean = {quad_raw.params['age_c']:.5f} SD/year
               age^2 term = {quad_raw.params['age_c_sq']:.6f}
               QUADRATIC TERM p = {quad_raw.pvalues['age_c_sq']:.4f}
               adj R2 = {quad_raw.rsquared_adj:.4f}""")

lr_stat = 2 * (quad_raw.llf - lin_raw.llf)
lr_p = float(chi2.sf(lr_stat, 1))
print(f"    likelihood-ratio test of the quadratic term: LR(1) = {lr_stat:.3f}, "
      f"p = {lr_p:.4f}")

print("\n    Local slope of the fitted curve, in SD per year of age:")
for a in ANCHOR_AGES:
    x = a - SAMPLE_MEAN_AGE
    s = quad_raw.params["age_c"] + 2 * quad_raw.params["age_c_sq"] * x
    print(f"      at age {a}: {s:.5f}")

# (ii) Inside the paper's covariate spec, with the group term present.
PAPER_COVS = SPECS[0][1]
quad_adj = fit("overall", "group_paper", PAPER_COVS, quadratic=True)


def raw_slope_at(age):
    x = age - SAMPLE_MEAN_AGE
    return quad_raw.params["age_c"] + 2 * quad_raw.params["age_c_sq"] * x


steepness = abs(raw_slope_at(70)) / abs(raw_slope_at(40))
print(f"""
(ii) Paper's covariate set, group term present (authors' gamer_type)
     age slope at sample mean = {quad_adj.params['age_c']:.5f} SD/year
     age^2 term = {quad_adj.params['age_c_sq']:.6f}
     QUADRATIC TERM p = {quad_adj.pvalues['age_c_sq']:.4f}

Conclusion of section B. The quadratic term is significant in both forms. The
decline in the overall composite accelerates with age: it is roughly
{steepness:.1f} times as steep at age 70 as at age 40. A single linear age slope
is therefore not a defensible basis for a single years-equivalent figure, and
any such figure has to name the age it is anchored at.""")


# ---------------------------------------------------------------------------
# C and D. Years-equivalent conversions, by anchor age and by group definition
# ---------------------------------------------------------------------------

header("C / D. YEARS-EQUIVALENT CONVERSIONS, BY ANCHOR AGE AND DEFINITION")

print("""WARNING, and it applies to every number in this section.

  1. The published paper reports NO years-equivalent figure. It reports group
     differences in SD units. Every figure in this section is our arithmetic
     on the paper's data, not a finding of the paper.
  2. A years-equivalent figure is ANCHOR DEPENDENT. Because the age curve is
     significantly quadratic (section B), the same gap buys many more years of
     age at 40 than at 70. No figure here should ever be quoted without both
     its anchor age and its model.
  3. These are cross-sectional between-person differences in a self-selected,
     older, unusually educated sample. Converting them into years of ageing is
     an illustrative rescaling, not a measure of how much anyone's ageing was
     slowed.
  4. All conversions divide the group gap by an age slope taken from the SAME
     regression that produced the gap. Mixing an adjusted gap with an
     unadjusted marginal age slope gives a different and internally
     inconsistent answer.""")

rng = np.random.default_rng(20250914)
N_BOOT = 20000
summary_rows = []

for group_col, group_label, group_short in GROUP_DEFS:
    print()
    rule()
    print(f"Group definition: {group_label}")
    print(f"Covariate set:    {SPECS[0][2]}")
    rule()

    # --- Linear model: a single figure, with a confidence interval. --------
    m_lin = fit("overall", group_col, PAPER_COVS)
    key = f"C({group_col})[T.Frequent]"
    gap_lin, lo_g, hi_g, p_g = contrast(m_lin, group_col, "Frequent")
    yrs, yl, yh, yse = ratio_delta_ci(m_lin, key, "age_c")

    print(f"""
LINEAR AGE MODEL (one constant slope at every age)
  frequent vs non-gamer gap on overall : {gap_lin:.4f} SD, 95% CI [{lo_g:.3f}, {hi_g:.3f}], p = {p_g:.2e}
  age slope, same model                : {m_lin.params['age_c']:.5f} SD per year
  years-equivalent                     : {yrs:.2f} years
  95% CI (delta method)                : [{yl:.2f}, {yh:.2f}] years
  MODEL AND ANCHOR: linear age model, which has NO anchor age. This single
  figure is what you get only if you assume the decline rate is the same at
  every age, and section B rejects that assumption at p < 0.01.""")

    # --- Quadratic model: one figure per named anchor age. -----------------
    m_quad = fit("overall", group_col, PAPER_COVS, quadratic=True)
    gap_q = m_quad.params[key]
    b1, b2 = m_quad.params["age_c"], m_quad.params["age_c_sq"]
    p_quad = m_quad.pvalues["age_c_sq"]

    # Parametric bootstrap on (gap, b1, b2) for an interval on the anchored
    # figures. This interval is ours; the source specs give no target for it.
    idx = [key, "age_c", "age_c_sq"]
    mu = m_quad.params[idx].values
    cov = m_quad.cov_params().loc[idx, idx].values
    draws = rng.multivariate_normal(mu, cov, size=N_BOOT)

    print(f"""
QUADRATIC AGE MODEL (decline accelerates with age; age^2 p = {p_quad:.4f})
  frequent vs non-gamer gap on overall : {gap_q:.4f} SD
  age slope at sample mean age {SAMPLE_MEAN_AGE:.1f} : {b1:.5f} SD per year
  age^2 coefficient                    : {b2:.6f}""")
    print(f"\n  {'anchor age':>10}  {'local slope':>12}  {'years (exact':>14}"
          f"  {'95% CI':>18}  {'years (local':>13}  {'implied':>8}")
    print(f"  {'':>10}  {'SD/year':>12}  {'curve solve)':>14}"
          f"  {'(bootstrap)':>18}  {'slope approx)':>13}  {'age':>8}")
    anchored = {}
    for a in ANCHOR_AGES:
        exact_d, local_d, slope, implied = years_from_quadratic(gap_q, b1, b2, a)
        boot = np.array([years_from_quadratic(g, c1, c2, a)[0]
                         for g, c1, c2 in draws])
        boot = boot[np.isfinite(boot)]
        blo, bhi = np.percentile(boot, [2.5, 97.5])
        anchored[a] = (exact_d, local_d, blo, bhi)
        print(f"  {a:>10}  {slope:>12.5f}  {exact_d:>14.2f}"
              f"  {ci_text(blo, bhi, 1):>18}"
              f"  {local_d:>13.2f}  {implied:>8.1f}")

    summary_rows.append({
        "label": group_short,
        "gap_lin": gap_lin, "yrs_lin": yrs, "yrs_lin_lo": yl, "yrs_lin_hi": yh,
        "gap_quad": gap_q, "anchored": anchored,
    })

    outside = [a for a in ANCHOR_AGES
               if years_from_quadratic(gap_q, b1, b2, a)[3] < df["age"].min()]
    print(f"""
  "years (exact curve solve)" solves the fitted age curve for the number of
  years younger at which normal age-related performance rises by the size of
  the gaming gap, starting from the named anchor age. "years (local slope
  approx)" is the first-order shortcut, gap divided by the slope at the anchor.
  The two differ because the curve is curved, and the gap is large enough to
  travel a long way along it.""")
    if outside:
        ages_txt = ", ".join(str(a) for a in outside)
        print(f"""  EXTRAPOLATION NOTE: at anchor age(s) {ages_txt} the implied age falls below
  {df['age'].min():.0f}, the youngest person in this sample. The curve is being read
  outside the data there, which is a further reason the large figures at young
  anchor ages should not be quoted as findings.""")

print()
rule()
print("SUMMARY OF SECTION C / D: every years figure with its anchor and model")
rule()
print("All rows use the paper's covariate set. Years figures are never")
print("comparable across rows unless the anchor age and model match.\n")
print(f"  {'group definition':<24}{'gap SD':>8}  {'model':<24}"
      f"{'anchor':>7}{'years':>8}{'95% CI':>16}")
for row in summary_rows:
    short = row["label"]
    lin_ci = ci_text(row['yrs_lin_lo'], row['yrs_lin_hi'], 1)
    print(f"  {short:<24}{row['gap_lin']:>8.4f}  {'linear (no anchor)':<24}"
          f"{'none':>7}{row['yrs_lin']:>8.2f}{lin_ci:>16}")
    for a in ANCHOR_AGES:
        exact_d, local_d, blo, bhi = row["anchored"][a]
        print(f"  {'':<24}{row['gap_quad']:>8.4f}  {'quadratic, exact solve':<24}"
              f"{a:>7}{exact_d:>8.2f}{ci_text(blo, bhi, 1):>16}")
    for a in ANCHOR_AGES:
        exact_d, local_d, blo, bhi = row["anchored"][a]
        print(f"  {'':<24}{row['gap_quad']:>8.4f}  {'quadratic, local slope':<24}"
              f"{a:>7}{local_d:>8.2f}{'not computed':>16}")
    print()

print("""What the table shows. Within a single group definition and a single
covariate set, the years-equivalent figure moves by roughly a factor of two
across the three anchor ages, and by a further one to two years depending on
whether the curve is solved exactly or approximated by its local slope. The
linear-model figure has no anchor age at all, so it cannot correctly be
described as applying "at the sample's mean age"; the figure that does apply at
the mean age comes from the quadratic model and is a different number. Any
sentence that attaches a linear-model estimate to an anchored phrase is
combining two different models.

The spread across anchor ages is larger than the difference between any two
covariate specifications in section A, and comparable to the width of the
confidence interval. The years framing is not a stable quantity.""")


# ---------------------------------------------------------------------------
# E. The verbal composite
# ---------------------------------------------------------------------------

header("E. THE VERBAL COMPOSITE: NO GAMER ADVANTAGE")

print("""The paper reports a significant gaming association on four of five
composites and explicitly not on verbal. This section checks that under every
combination of covariate set and group definition used above, because it is
the caveat most often dropped when this study is summarised as "gamers have
better cognition".
""")
print(f"  {'covariate spec':<18}{'group definition':<20}{'beta':>8}"
      f"{'95% CI':>20}{'p':>12}")
for spec_name, covariates, _ in SPECS:
    for group_col, _, _short in GROUP_DEFS:
        model = fit("verbal", group_col, covariates)
        beta, lo, hi, p = contrast(model, group_col, "Frequent")
        print(f"  {spec_name:<18}{group_col:<20}{beta:>8.4f}"
              f"{ci_text(lo, hi):>20}{p:>12.3f}")

vm = fit("verbal", "group_paper", PAPER_COVS)
vb, vlo, vhi, vp = contrast(vm, "group_paper", "Frequent")
print(f"""
Under the paper's covariate set and the authors' own group column, the
frequent-versus-non-gamer difference on verbal is {vb:+.4f} SD, 95% CI
[{vlo:.3f}, {vhi:.3f}], p = {vp:.3f}. The interval includes zero, and it
includes it under every specification above. "Cognition" in this study means
short-term memory, reasoning and processing speed. It does not mean language,
and nothing in this dataset measures school performance.""")


# ---------------------------------------------------------------------------
# Closing notes
# ---------------------------------------------------------------------------

header("CLOSING NOTES FOR ANYONE CITING THESE NUMBERS")

print("""1. The "13.7 years younger" figure is not in PLOS ONE 20(10): e0334924.
   Searching the published article for "13.7", "years younger" and "5.2"
   returns nothing. The figure comes from the October 2024 press cycle around
   an earlier preprint with roughly 1,000 completers, not from the 923-person
   published analysis. Exact reproduction from this file should not be
   expected, and a residual difference is not evidence of an error by anyone.

2. The press release and the paper do not use the same group definition. The
   release's frequent gamer is 5 or more hours a week on a single type of
   game; the paper's is 3 or more hours a week in one or more genres. The
   figures above are reported under both, and they differ.

3. There is no IQ conversion in this script. The composites are standardised
   within a 923-person, 83%-post-secondary, mean-age-55 self-selected sample.
   A within-sample SD is not an IQ SD, and the paper makes no IQ claim.

4. Never quote a years-equivalent figure without its anchor age and model.
   Section C shows the same gap is worth roughly twice as many years at age 40
   as at age 70. A figure derived from a sample whose mean age is 55 carries
   no implication at all for children.

5. This is cross-sectional. People with better cognition may play more games.
   The authors state this limitation themselves, along with self-reported
   gaming hours, two-item mental-health screeners, a sample skewed older,
   more educated and more active than the population, and too few action-game
   players to test any genre effect.""")
print()
rule()
print("END OF OUTPUT")
rule()
