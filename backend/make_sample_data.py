"""
make_sample_data.py
-------------------
Generates a SYNTHETIC demo dataset (data/True.csv + data/Fake.csv) with the same
columns as the Kaggle "Fake and Real News" dataset (title, text, subject, date).

Why this exists: so the whole project (preprocess -> train -> API -> website)
runs immediately, without a Kaggle download. The articles are template-generated,
so accuracy on them is NOT representative of real-world performance.
For your final report, download the real dataset (see README) and re-run
preprocess.py + train.py -- nothing else needs to change.

    python make_sample_data.py            # 2500 articles per class
    python make_sample_data.py 5000       # custom size per class
"""

import os
import random
import sys

import pandas as pd

rng = random.Random(7)

PLACES = ["Washington", "London", "New Delhi", "Berlin", "Tokyo", "Ottawa", "Canberra", "Paris",
          "Brussels", "Nairobi", "Brasilia", "Seoul", "Madrid", "Rome", "Geneva", "Singapore"]
DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
AGENCIES = ["the finance ministry", "the central bank", "the health department", "the transport authority",
            "the national statistics office", "the election commission", "the energy regulator",
            "the education ministry", "the trade office", "the environment agency", "city officials",
            "the supreme court", "the parliamentary committee", "the competition watchdog"]
OFFICIALS = ["a ministry spokesperson", "the agency's director", "a senior official", "the committee chair",
             "a government statement", "the minister", "an official briefing", "the regulator's report"]
TOPICS = ["quarterly inflation figures", "a new road safety rule", "the annual budget proposal",
          "vaccination coverage data", "a bilateral trade agreement", "rail network upgrades",
          "unemployment statistics", "a draft climate policy", "school funding reforms",
          "port capacity expansion", "housing permit numbers", "a cybersecurity framework",
          "renewable energy auctions", "border customs procedures", "hospital staffing levels",
          "export figures for the last quarter", "water infrastructure repairs", "a pension reform bill"]
VERBS_REAL = ["said it would publish", "confirmed it will review", "announced a consultation on",
              "released a report on", "told reporters it is assessing", "approved a pilot scheme for",
              "will hold hearings on", "has begun a routine audit of", "presented preliminary findings on",
              "published guidance covering"]
DETAILS_REAL = [
    "The figures will be released next week following a routine review, officials said.",
    "Analysts surveyed by the news agency expected a modest change compared with the previous period.",
    "The move follows several months of talks between lawmakers and industry groups.",
    "A spokesperson declined to comment on the timetable beyond the published schedule.",
    "The proposal still requires approval from the upper house before it can take effect.",
    "Opposition lawmakers said they would study the document before responding.",
    "Data from the past three years show a gradual trend, according to the report.",
    "Local authorities will be consulted over the coming weeks, the statement added.",
    "The review is expected to conclude by the end of the financial year.",
    "Economists said the numbers were broadly in line with earlier forecasts.",
    "The agency said further details would be made available on its website.",
    "Representatives from several regional governments attended the meeting.",
]

FAKE_SUBJECTS = ["SHOCKING", "BREAKING", "EXPOSED", "BOMBSHELL", "LEAKED", "REVEALED", "WAKE UP"]
FAKE_ACTORS = ["Globalist elites", "The mainstream media", "Big Pharma", "Secret government insiders",
               "Corrupt politicians", "Liberal celebrities", "Anonymous whistleblowers", "The deep state",
               "A famous doctor", "Hollywood insiders", "Foreign agents", "Shadowy billionaires"]
FAKE_CLAIMS = ["are secretly poisoning the water supply", "just got caught hiding the truth about miracle cures",
               "want you to never find out about this banned discovery", "rigged the entire election overnight",
               "are putting mind control chips in free vaccines", "faked the whole thing and the proof is here",
               "do NOT want this video seen by anyone", "have been lying to you for decades",
               "planned the collapse months before it happened", "are furious about this one weird trick",
               "destroyed evidence that would prove everything", "are sending secret signals through TV ads"]
FAKE_HOOKS = [
    "You won't believe what happens next, share this before they delete it!",
    "Doctors hate this simple trick and the media refuses to cover it!!!",
    "Share this with everyone you know because they are trying to silence us!",
    "This is the shocking truth they never wanted you to see, and it is going viral!",
    "Wake up people, the proof is right here and nobody is talking about it!",
    "Insiders say the cover-up goes all the way to the top, and patriots are furious!",
    "Click here to see the unbelievable photos that mainstream outlets banned!",
    "Sources close to the matter claim everything is a hoax, and thousands are outraged!",
    "Totally unbelievable, absolutely disgusting, and the real story is being hidden from you!",
    "Forward this message immediately, the government does not want you reading it!",
]
FAKE_FILLER = [
    "A mysterious anonymous source told us everything, and honestly it is crazy.",
    "Experts, who cannot be named, say this changes everything forever.",
    "Nobody is reporting this because the whole system is rigged against ordinary people.",
    "Thousands of angry patriots are already demanding answers right now.",
    "This miracle discovery cures everything overnight with no side effects, apparently.",
    "The truth is out there, and they are terrified that you will find it.",
    "Our readers have been saying it for years and now they are finally proven right.",
    "Unbelievable scenes everywhere as the shocking footage spreads across the internet.",
]


EMOTIVE_REAL = [
    "Residents called the decision shocking and demanded answers, local media reported.",
    "The announcement sparked outrage among some lawmakers, who called it unbelievable.",
    "Critics said the plan was a disaster, while supporters hailed it as a breakthrough.",
]
SUBTLE_FAKE_OPEN = ["Reportedly", "According to unverified claims,", "Allegedly,", "Unconfirmed reports suggest that"]
SUBTLE_FAKE_BODY = [
    "No documents were provided and the claim could not be independently confirmed.",
    "Sources familiar with the matter, who asked not to be identified, described the plan as already approved.",
    "The statement circulated widely on social media before any official reaction.",
    "Several posts said the figures had been hidden from the public for months.",
]


def real_article():
    place, day = rng.choice(PLACES), rng.choice(DAYS)
    agency, topic = rng.choice(AGENCIES), rng.choice(TOPICS)
    verb, official = rng.choice(VERBS_REAL), rng.choice(OFFICIALS)
    title = f"{agency.capitalize()} {verb} {topic}"
    body = [
        f"{place} - {agency.capitalize()} {verb} {topic} on {day}, {official} said.",
        *rng.sample(DETAILS_REAL, k=rng.randint(2, 4)),
    ]
    if rng.random() < 0.25:
        body.insert(rng.randint(1, len(body)), rng.choice(EMOTIVE_REAL))
    return title, " ".join(body), rng.choice(["politicsNews", "worldnews"])


def subtle_fake_article():
    place, day = rng.choice(PLACES), rng.choice(DAYS)
    agency, topic = rng.choice(AGENCIES), rng.choice(TOPICS)
    opener = rng.choice(SUBTLE_FAKE_OPEN)
    title = f"{opener} {agency} hid {topic}"
    body = [f"{place} - {opener} {agency} concealed {topic}, {rng.choice(OFFICIALS)} said on {day}.",
            *rng.sample(SUBTLE_FAKE_BODY, k=rng.randint(2, 3)),
            *rng.sample(DETAILS_REAL, k=rng.randint(0, 2))]
    return title, " ".join(body), rng.choice(["News", "politics"])


def fake_article():
    if rng.random() < 0.3:
        return subtle_fake_article()
    sub, actor, claim = rng.choice(FAKE_SUBJECTS), rng.choice(FAKE_ACTORS), rng.choice(FAKE_CLAIMS)
    title = f"{sub}: {actor} {claim}!!!"
    if rng.random() < 0.5:
        title = title.upper()
    body = [f"{sub}! {actor} {claim}.", *rng.sample(FAKE_FILLER, k=rng.randint(1, 3)),
            *rng.sample(FAKE_HOOKS, k=rng.randint(1, 3))]
    rng.shuffle(body)
    return title, " ".join(body), rng.choice(["News", "politics", "left-news", "Government News"])


def build(n, maker):
    rows = []
    for _ in range(n):
        title, text, subject = maker()
        rows.append({"title": title, "text": text, "subject": subject,
                     "date": f"{rng.choice(['January','March','June','September'])} {rng.randint(1, 28)}, 2017"})
    return pd.DataFrame(rows)


if __name__ == "__main__":
    n = int(sys.argv[1]) if len(sys.argv) > 1 else 2500
    os.makedirs("data", exist_ok=True)
    real_df, fake_df = build(n, real_article), build(n, fake_article)
    # Real-world labels are never perfect: swap ~6% of articles between the two files
    k = int(n * 0.06)
    swap_r, swap_f = real_df.sample(k, random_state=1), fake_df.sample(k, random_state=2)
    real_df = pd.concat([real_df.drop(swap_r.index), swap_f], ignore_index=True)
    fake_df = pd.concat([fake_df.drop(swap_f.index), swap_r], ignore_index=True)
    real_df.to_csv(os.path.join("data", "True.csv"), index=False)
    fake_df.to_csv(os.path.join("data", "Fake.csv"), index=False)
    print(f"Wrote {n} synthetic REAL rows to data/True.csv and {n} FAKE rows to data/Fake.csv")
    print("NOTE: this is demo data. Use the Kaggle dataset for real evaluation (see README).")
