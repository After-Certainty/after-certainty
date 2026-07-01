#!/usr/bin/env python3
"""Normalize migrated footnote bodies to Chicago NB using a work-key lookup."""

from __future__ import annotations

import re
import sys
from pathlib import Path

# Short-form footnote text keyed by slug fragment (author-work prefix)
CHICAGO: dict[str, str] = {
    "arendt-responsibility": "Arendt, Hannah. *Responsibility and Judgment*. Edited by Jerome Kohn. New York: Schocken Books, 2003.",
    "arendt-between-past": "Arendt, Hannah. *Between Past and Future*. New York: Penguin Books, 2006.",
    "arendt-eichmann": "Arendt, Hannah. *Eichmann in Jerusalem: A Report on the Banality of Evil*. New York: Viking Press, 1963.",
    "arendt-on-revolution": "Arendt, Hannah. *On Revolution*. New York: Viking Press, 1963.",
    "arendt-responsibility-and-judgment": "Arendt, Hannah. *Responsibility and Judgment*. Edited by Jerome Kohn. New York: Schocken Books, 2003.; Arendt, Hannah. *The Life of the Mind*. New York: Harcourt Brace Jovanovich, 1978.",
    "bowen-family": "Bowen, Murray. *Family Therapy in Clinical Practice*. New York: Jason Aronson, 1978.",
    "dahl-polyarchy": "Dahl, Robert A. *Polyarchy: Participation and Opposition*. New Haven, CT: Yale University Press, 1971.",
    "edmondson-the-fearless": "Edmondson, Amy C. *The Fearless Organization: Creating Psychological Safety in the Workplace for Learning, Innovation, and Growth*. Hoboken, NJ: Wiley, 2018.",
    "heifetz-leadership": "Heifetz, Ronald A. *Leadership Without Easy Answers*. Cambridge, MA: Belknap Press of Harvard University Press, 1994.",
    "hirschman-exit": "Hirschman, Albert O. *Exit, Voice, and Loyalty: Responses to Decline in Firms, Organizations, and States*. Cambridge, MA: Harvard University Press, 1970.",
    "jervis-perception": "Jervis, Robert. *Perception and Misperception in International Politics*. Princeton, NJ: Princeton University Press, 1976.",
    "kahneman-thinking": "Kahneman, Daniel. *Thinking, Fast and Slow*. New York: Farrar, Straus and Giroux, 2011.",
    "merton-bureaucratic": 'Merton, Robert K. "Bureaucratic Structure and Personality." *Social Forces* 18, no. 4 (1940): 560–568.',
    "olsen-rediscovering": "March, James G., and Johan P. Olsen. *Rediscovering Institutions: The Organizational Basis of Politics*. New York: Free Press, 1989.",
    "olson-the-logic": "Olson, Mancur. *The Logic of Collective Action: Public Goods and the Theory of Groups*. Cambridge, MA: Harvard University Press, 1965.",
    "perrow-normal": "Perrow, Charles. *Normal Accidents: Living with High-Risk Technologies*. New York: Basic Books, 1984.",
    "rosa-social": "Rosa, Hartmut. *Social Acceleration: A New Theory of Modernity*. Translated by Jonathan Trejo-Mathys. New York: Columbia University Press, 2013.",
    "schein-organizational": "Schein, Edgar H. *Organizational Culture and Leadership*. 5th ed. Hoboken, NJ: Wiley, 2017.",
    "schelling-the-strategy": "Schelling, Thomas C. *The Strategy of Conflict*. Cambridge, MA: Harvard University Press, 1960.",
    "selznick-leadership": "Selznick, Philip. *Leadership in Administration: A Sociological Interpretation*. New York: Harper & Row, 1957.",
    "simon-organizations": "March, James G., and Herbert A. Simon. *Organizations*. New York: Wiley, 1958.",
    "weber-economy": "Weber, Max. *Economy and Society: An Outline of Interpretive Sociology*. Edited by Guenther Roth and Claus Wittich. Berkeley: University of California Press, 1978.",
    # when-authority-outlives-accountability
    "hershey-outcome": 'Baron, Jonathan, and John C. Hershey. "Outcome Bias in Decision Evaluation." *Journal of Personality and Social Psychology* 54, no. 4 (1988): 569–579.',
    "tetlock-expert": "Tetlock, Philip E. *Expert Political Judgment: How Good Is It? How Can We Know?* Princeton, NJ: Princeton University Press, 2005.",
    "hirschman-the-rhetoric": "Hirschman, Albert O. *The Rhetoric of Reaction: Perversity, Futility, Jeopardy*. Cambridge, MA: Belknap Press of Harvard University Press, 1991.",
    "ross-the-intuitive": 'Ross, Lee. "The Intuitive Psychologist and His Shortcomings: Distortions in the Attribution Process." In *Advances in Experimental Social Psychology*, edited by Leonard Berkowitz, vol. 10, 173–220. New York: Academic Press, 1977.',
    "shay-achilles": "Shay, Jonathan. *Achilles in Vietnam: Combat Trauma and the Undoing of Character*. New York: Atheneum, 1994.",
    "milgram-obedience": "Milgram, Stanley. *Obedience to Authority: An Experimental View*. New York: Harper & Row, 1974.",
    "zimbardo-the-lucifer": "Zimbardo, Philip. *The Lucifer Effect: Understanding How Good People Turn Evil*. New York: Random House, 2007.",
    "weber-politics": 'Weber, Max. "Politics as a Vocation." In *From Max Weber: Essays in Sociology*, edited by H. H. Gerth and C. Wright Mills, 77–128. New York: Oxford University Press, 1946.',
    "leiter-the-truth": "Maslach, Christina, and Michael P. Leiter. *The Truth About Burnout: How Organizations Cause Personal Stress and What to Do About It*. San Francisco: Jossey-Bass, 1997.",
    "goodhart-problems": 'Goodhart, Charles A. E. "Problems of Monetary Management: The U.K. Experience." In *Papers in Monetary Economics*, vol. 1. Sydney: Reserve Bank of Australia, 1975.',
    "campbell-assessing": 'Campbell, Donald T. "Assessing the Impact of Planned Social Change." *Evaluation and Program Planning* 2, no. 1 (1979): 67–90.',
    "fukuyama-trust": "Fukuyama, Francis. *Trust: The Social Virtues and the Creation of Prosperity*. New York: Free Press, 1995.",
    "arendt-on-violence": "Arendt, Hannah. *On Violence*. New York: Harcourt, Brace & World, 1970.",
    "michels-political": "Michels, Robert. *Political Parties: A Sociological Study of the Oligarchical Tendencies of Modern Democracy*. Translated by Eden and Cedar Paul. New York: Free Press, 1962.",
    "brown-dare": "Brown, Brené. *Dare to Lead: Brave Work. Tough Conversations. Whole Hearts.* New York: Random House, 2018.",
    "bauman-modernity": "Bauman, Zygmunt. *Modernity and the Holocaust*. Ithaca, NY: Cornell University Press, 1989.",
    "arendt-the-human": "Arendt, Hannah. *The Human Condition*. 2nd ed. Chicago: University of Chicago Press, 1998.; Arendt, Hannah. *Responsibility and Judgment*. Edited by Jerome Kohn. New York: Schocken Books, 2003.",
    "source-trauma": "Substance Abuse and Mental Health Services Administration. *SAMHSA's Concept of Trauma and Guidance for a Trauma-Informed Approach*. HHS Publication No. 14-4884. Rockville, MD: SAMHSA, 2014.",
    "g-samhsa": "Substance Abuse and Mental Health Services Administration. *SAMHSA's Concept of Trauma and Guidance for a Trauma-Informed Approach*. HHS Publication No. 14-4884. Rockville, MD: SAMHSA, 2014.",
}


def lookup_chicago(footnote_id: str) -> str | None:
    for key, text in CHICAGO.items():
        if key in footnote_id:
            return text
    return None


def normalize_file(path: Path) -> bool:
    text = path.read_text(encoding="utf-8")
    lines = text.splitlines()
    out: list[str] = []
    changed = False
    i = 0
    while i < len(lines):
        line = lines[i]
        m = re.match(r"^(\[\^[^\]]+\]:)\s*(.+)$", line)
        if m:
            fid = m.group(1)
            body = m.group(2)
            chicago = lookup_chicago(fid)
            if chicago:
                if out and out[-1].strip():
                    out.append("")
                out.append(f"{fid} {chicago}")
                changed = True
                i += 1
                continue
            if out and out[-1].strip():
                out.append("")
        out.append(line)
        i += 1
    new_text = "\n".join(out) + ("\n" if text.endswith("\n") else "")
    if changed:
        path.write_text(new_text, encoding="utf-8")
    return changed


def main(argv: list[str]) -> int:
    roots = [Path(a) for a in argv if not a.startswith("-")]
    if not roots:
        print("Usage: normalize_chicago_footnotes.py <book-dir> ...", file=sys.stderr)
        return 1
    n = 0
    for root in roots:
        for path in sorted(root.rglob("*.md")):
            if "docs" in path.parts or path.name == "bibliography.md":
                continue
            if normalize_file(path):
                print(path)
                n += 1
    print(f"Normalized {n} files")
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
