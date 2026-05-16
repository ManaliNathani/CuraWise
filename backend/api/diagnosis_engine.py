import re
from dataclasses import dataclass
from typing import Dict, List, Set, Tuple


@dataclass(frozen=True)
class ConditionRule:
    name: str
    symptoms: Set[str]
    red_flags: Set[str]
    sources: Tuple[str, ...]


SYMPTOM_ALIASES = {
    "sob": "shortness of breath",
    "breathlessness": "shortness of breath",
    "dyspnea": "shortness of breath",
    "temp": "fever",
    "high temperature": "fever",
    "loose motions": "diarrhea",
    "loose motion": "diarrhea",
    "throwing up": "vomiting",
    "puking": "vomiting",
    "burning urine": "burning urination",
    "painful urination": "burning urination",
    "chest tightness": "chest pain",
    "runny nose": "rhinorrhea",
    "blocked nose": "nasal congestion",
    "stomach pain": "abdominal pain",
    "tummy pain": "abdominal pain",
    "body pain": "body ache",
    "weakness": "fatigue",
    "yellow eyes": "jaundice",
    "yellow eye": "jaundice",
    "yellow skin": "jaundice",
    "eyes turning yellow": "jaundice",
    "peeli aankhen": "jaundice",
    "peela pan": "jaundice",
}


CONDITIONS: Tuple[ConditionRule, ...] = (
    ConditionRule("Common cold", {"cough", "sore throat", "rhinorrhea", "sneezing", "nasal congestion"}, {"high fever", "shortness of breath", "chest pain"}, ("https://www.cdc.gov/common-cold/about/index.html",)),
    ConditionRule("Influenza (flu)", {"fever", "cough", "fatigue", "body ache", "chills", "headache", "sore throat"}, {"trouble breathing", "chest pain", "confusion"}, ("https://www.cdc.gov/flu/signs-symptoms/index.html",)),
    ConditionRule("COVID-19", {"fever", "cough", "fatigue", "loss of taste", "loss of smell", "sore throat", "shortness of breath"}, {"trouble breathing", "chest pain", "confusion", "blue lips"}, ("https://www.cdc.gov/covid/signs-symptoms/index.html",)),
    ConditionRule("Acute bronchitis", {"cough", "mucus", "fatigue", "shortness of breath", "mild fever"}, {"high fever", "chest pain", "worsening breathlessness"}, ("https://www.nhs.uk/conditions/bronchitis/",)),
    ConditionRule("Pneumonia", {"fever", "cough", "shortness of breath", "chest pain", "fatigue"}, {"trouble breathing", "blue lips", "confusion"}, ("https://www.nhs.uk/conditions/pneumonia/",)),
    ConditionRule("Asthma exacerbation", {"wheezing", "shortness of breath", "chest pain", "cough"}, {"severe breathlessness", "blue lips", "unable to speak"}, ("https://www.nhs.uk/conditions/asthma/asthma-attack/",)),
    ConditionRule("Possible cardiac concern", {"chest pain", "shortness of breath", "sweating", "nausea", "arm pain", "jaw pain"}, {"chest pain", "fainting", "left arm pain", "jaw pain"}, ("https://www.nhs.uk/conditions/heart-attack/", "https://www.cdc.gov/heartdisease/heart_attack.htm")),
    ConditionRule("Hypertensive urgency possibility", {"headache", "chest pain", "blurred vision", "dizziness"}, {"chest pain", "shortness of breath", "confusion"}, ("https://www.cdc.gov/high-blood-pressure/about/index.html",)),
    ConditionRule("Migraine", {"headache", "nausea", "light sensitivity", "vomiting", "throbbing pain"}, {"sudden severe headache", "weakness", "confusion"}, ("https://www.nhs.uk/conditions/migraine/",)),
    ConditionRule("Tension headache", {"headache", "neck pain", "stress", "scalp tenderness"}, {"sudden severe headache", "confusion"}, ("https://www.nhs.uk/conditions/headaches/",)),
    ConditionRule("Sinusitis", {"headache", "facial pain", "nasal congestion", "rhinorrhea", "fever"}, {"severe headache", "eye swelling", "confusion"}, ("https://www.nhs.uk/conditions/sinusitis-sinus-infection/",)),
    ConditionRule("Gastroenteritis", {"diarrhea", "vomiting", "nausea", "abdominal pain", "fever"}, {"blood in stool", "dehydration", "persistent vomiting"}, ("https://www.nhs.uk/conditions/diarrhoea-and-vomiting/",)),
    ConditionRule("Food poisoning", {"diarrhea", "vomiting", "abdominal pain", "fever", "nausea"}, {"blood in stool", "dehydration", "high fever"}, ("https://www.nhs.uk/conditions/food-poisoning/",)),
    ConditionRule("Acid reflux / GERD", {"heartburn", "chest pain", "bloating", "nausea", "sore throat"}, {"chest pain", "vomiting blood", "black stool"}, ("https://www.nhs.uk/conditions/heartburn-and-acid-reflux/",)),
    ConditionRule("Peptic ulcer possibility", {"abdominal pain", "bloating", "nausea", "heartburn"}, {"vomiting blood", "black stool", "fainting"}, ("https://www.nhs.uk/conditions/stomach-ulcer/",)),
    ConditionRule("Irritable bowel syndrome (IBS)", {"abdominal pain", "bloating", "diarrhea", "constipation"}, {"weight loss", "blood in stool", "persistent pain"}, ("https://www.nhs.uk/conditions/irritable-bowel-syndrome-ibs/",)),
    ConditionRule("Urinary tract infection", {"burning urination", "frequent urination", "lower abdominal pain", "cloudy urine", "fever"}, {"fever", "flank pain", "confusion"}, ("https://www.nhs.uk/conditions/urinary-tract-infections-utis/",)),
    ConditionRule("Kidney infection possibility", {"fever", "flank pain", "burning urination", "nausea"}, {"confusion", "persistent vomiting", "high fever"}, ("https://www.nhs.uk/conditions/kidney-infection/",)),
    ConditionRule("Jaundice / hepatitis possibility", {"jaundice", "fever", "fatigue", "nausea", "abdominal pain", "dark urine"}, {"confusion", "persistent vomiting", "bleeding"}, ("https://www.nhs.uk/conditions/jaundice/", "https://www.who.int/news-room/fact-sheets/detail/hepatitis-a")),
    ConditionRule("Dengue possibility", {"high fever", "headache", "body ache", "rash", "nausea"}, {"bleeding", "severe abdominal pain", "persistent vomiting"}, ("https://www.who.int/news-room/fact-sheets/detail/dengue-and-severe-dengue",)),
    ConditionRule("Malaria possibility", {"fever", "chills", "sweating", "headache", "nausea"}, {"confusion", "seizure", "breathing trouble"}, ("https://www.who.int/news-room/fact-sheets/detail/malaria",)),
    ConditionRule("Typhoid fever possibility", {"high fever", "abdominal pain", "headache", "fatigue", "constipation"}, {"persistent high fever", "confusion", "dehydration"}, ("https://www.who.int/news-room/fact-sheets/detail/typhoid",)),
    ConditionRule("Allergic rhinitis", {"sneezing", "rhinorrhea", "itchy eyes", "nasal congestion"}, {"wheezing", "shortness of breath"}, ("https://www.nhs.uk/conditions/allergic-rhinitis/",)),
    ConditionRule("Conjunctivitis", {"red eye", "itchy eyes", "watery eyes", "eye discharge"}, {"eye pain", "vision loss"}, ("https://www.nhs.uk/conditions/conjunctivitis/",)),
    ConditionRule("Otitis media possibility", {"ear pain", "fever", "hearing loss", "irritability"}, {"high fever", "neck stiffness", "swelling around ear"}, ("https://www.nhs.uk/conditions/ear-infections/",)),
    ConditionRule("Pharyngitis / tonsillitis", {"sore throat", "fever", "painful swallowing", "swollen glands"}, {"trouble breathing", "drooling", "dehydration"}, ("https://www.nhs.uk/conditions/tonsillitis/",)),
    ConditionRule("Anxiety-related episode possibility", {"palpitations", "chest pain", "sweating", "dizziness", "shortness of breath"}, {"chest pain", "fainting", "suicidal thoughts"}, ("https://www.nhs.uk/mental-health/conditions/panic-disorder/",)),
    ConditionRule("Diabetes hyperglycemia possibility", {"frequent urination", "excessive thirst", "fatigue", "blurred vision"}, {"vomiting", "confusion", "rapid breathing"}, ("https://www.cdc.gov/diabetes/about/index.html",)),
    ConditionRule("Dehydration", {"thirst", "dry mouth", "dizziness", "fatigue", "dark urine"}, {"confusion", "fainting", "no urination"}, ("https://www.nhs.uk/conditions/dehydration/",)),
)


GLOBAL_RED_FLAGS = {
    "chest pain",
    "trouble breathing",
    "shortness of breath",
    "fainting",
    "seizure",
    "blood in vomit",
    "vomiting blood",
    "blood in stool",
    "black stool",
    "blue lips",
    "one-sided weakness",
    "confusion",
    "suicidal thoughts",
}


def _normalize(text: str) -> str:
    txt = text.lower().strip()
    txt = re.sub(r"[^a-z0-9,\s\.]+", " ", txt)
    txt = re.sub(r"\s+", " ", txt)
    return txt


def _normalize_aliases_in_text(text: str) -> str:
    result = f" {text} "
    for alias, canonical in SYMPTOM_ALIASES.items():
        # Whole-phrase replacement where possible to avoid partial-word collisions.
        pattern = rf"(?<![a-z0-9]){re.escape(alias)}(?![a-z0-9])"
        result = re.sub(pattern, canonical, result)
    return re.sub(r"\s+", " ", result).strip()


def _extract_terms(text: str) -> Tuple[Set[str], str]:
    normalized = _normalize_aliases_in_text(_normalize(text))
    chunks = [c.strip() for c in re.split(r"[,\n;]", normalized) if c.strip()]
    words = normalized.split()
    phrases = set(chunks)
    phrases.update(words)
    # Add n-grams for robust multi-word matching.
    for n in (2, 3, 4):
        for i in range(len(words) - n + 1):
            phrases.add(" ".join(words[i : i + n]))
    return phrases, normalized


def _symptom_matches(symptom: str, terms: Set[str], normalized_text: str) -> bool:
    if symptom in terms:
        return True
    if symptom in normalized_text:
        return True
    symptom_tokens = symptom.split()
    return all(token in terms for token in symptom_tokens)


def _score(terms: Set[str], normalized_text: str, rule: ConditionRule) -> Tuple[float, int]:
    matched = 0
    for symptom in rule.symptoms:
        if _symptom_matches(symptom, terms, normalized_text):
            matched += 1
    base = matched / max(1, len(rule.symptoms))
    # Penalize single-symptom matches to reduce false positives.
    if matched <= 1:
        base *= 0.55
    return base, matched


def infer_conditions(symptoms_text: str, limit: int = 5) -> Dict[str, object]:
    terms, normalized_text = _extract_terms(symptoms_text)
    global_flags = sorted({rf for rf in GLOBAL_RED_FLAGS if rf in terms})

    scored: List[Tuple[ConditionRule, float, int]] = []
    for rule in CONDITIONS:
        score_value, matched_count = _score(terms, normalized_text, rule)
        # Clinical boost: yellow eyes/skin strongly suggests jaundice spectrum.
        if rule.name == "Jaundice / hepatitis possibility" and "jaundice" in terms:
            score_value = min(1.0, score_value + 0.25)
        if score_value > 0:
            scored.append((rule, score_value, matched_count))
    scored.sort(key=lambda x: (x[1], x[2]), reverse=True)
    top = scored[:limit]

    if not top:
        return {
            "primary": "General medical consultation recommended",
            "confidence": 0.0,
            "triage": "non_urgent",
            "red_flags": global_flags,
            "suggestions": [],
            "sources": [],
        }

    primary, top_score, _top_matches_count = top[0]
    # Safety: do not over-assert a diagnosis when evidence is weak.
    if top_score < 0.25 and not global_flags:
        return {
            "primary": "Insufficient evidence for reliable condition match",
            "confidence": round(top_score * 100, 1),
            "triage": "routine",
            "red_flags": global_flags,
            "suggestions": [],
            "sources": [],
        }

    condition_flags = sorted({rf for rf in primary.red_flags if rf in terms})
    red_flags = sorted(set(global_flags + condition_flags))
    triage = "emergency" if red_flags else "routine"

    suggestions = [
        {"condition": rule.name, "confidence": round(score_value * 100, 1), "sources": list(rule.sources)}
        for rule, score_value, _matched_count in top
    ]
    unique_sources: List[str] = []
    for item in suggestions:
        for src in item["sources"]:
            if src not in unique_sources:
                unique_sources.append(src)

    return {
        "primary": primary.name,
        "confidence": round(top_score * 100, 1),
        "triage": triage,
        "red_flags": red_flags,
        "suggestions": suggestions,
        "sources": unique_sources,
    }
