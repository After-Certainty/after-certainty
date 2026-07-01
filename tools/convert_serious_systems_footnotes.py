#!/usr/bin/env python3
"""Convert Author. Title. Year. Publisher. footnotes to Chicago NB."""

from __future__ import annotations

import re
import sys
from pathlib import Path

FOOTNOTE = re.compile(r"^(\[\^[^\]]+\]:)\s*(.+)$")

# Known multi-author / special cases
SPECIAL: dict[str, str] = {
    "Andrew S. Grove. High Output Management. 1983. Random House.": "Grove, Andrew S. *High Output Management*. New York: Random House, 1983.",
    "Donella H. Meadows. Thinking in Systems. 2008. Chelsea Green Publishing.": "Meadows, Donella H. *Thinking in Systems: A Primer*. White River Junction, VT: Chelsea Green Publishing, 2008.",
    "Dietrich Dörner. The Logic of Failure. 1996. Basic Books.": "Dörner, Dietrich. *The Logic of Failure: Recognizing and Avoiding Error in Complex Situations*. New York: Basic Books, 1996.",
    "Gary Klein. Sources of Power. 1998. MIT Press.": "Klein, Gary. *Sources of Power: How People Make Decisions*. Cambridge, MA: MIT Press, 1998.",
    "Amy C. Edmondson. The Fearless Organization. 2018. Wiley.": "Edmondson, Amy C. *The Fearless Organization: Creating Psychological Safety in the Workplace for Learning, Innovation, and Growth*. Hoboken, NJ: Wiley, 2018.",
    "Diane Vaughan. The Challenger Launch Decision. 1996. University of Chicago Press.": "Vaughan, Diane. *The Challenger Launch Decision: Risky Technology, Culture, and Deviance at NASA*. Chicago: University of Chicago Press, 1996.",
    "James C. Scott. Seeing Like a State. 1998. Yale University Press.": "Scott, James C. *Seeing Like a State: How Certain Schemes to Improve the Human Condition Have Failed*. New Haven, CT: Yale University Press, 1998.",
    "Charles Perrow. Normal Accidents. 1984. Princeton University Press.": "Perrow, Charles. *Normal Accidents: Living with High-Risk Technologies*. New York: Basic Books, 1984.",
    "Daniel Kahneman. Thinking, Fast and Slow. 2011. Farrar, Straus and Giroux.": "Kahneman, Daniel. *Thinking, Fast and Slow*. New York: Farrar, Straus and Giroux, 2011.",
    "Peter M. Senge. The Fifth Discipline. 1990. Doubleday/Currency.": "Senge, Peter M. *The Fifth Discipline: The Art and Practice of the Learning Organization*. New York: Doubleday/Currency, 1990.",
    "Hannah Arendt. Responsibility and Judgment. 2003. Schocken Books.": "Arendt, Hannah. *Responsibility and Judgment*. Edited by Jerome Kohn. New York: Schocken Books, 2003.",
    "Karl E. Weick and Kathleen M. Sutcliffe. Managing the Unexpected. 2015. Jossey-Bass.": "Weick, Karl E., and Kathleen M. Sutcliffe. *Managing the Unexpected: Sustained Performance in a Complex World*. 3rd ed. Hoboken, NJ: Jossey-Bass, 2015.",
    "Karl E. Weick. Sensemaking in Organizations. 1995. SAGE Publications.": "Weick, Karl E. *Sensemaking in Organizations*. Thousand Oaks, CA: SAGE Publications, 1995.",
    "Institute of Medicine. To Err Is Human. 1999. National Academies Press. https://doi.org/10.17226/9728.": "Institute of Medicine. *To Err Is Human: Building a Safer Health System*. Washington, DC: National Academies Press, 1999. https://doi.org/10.17226/9728.",
    "Erik Hollnagel. Safety-I and Safety-II. 2014. Ashgate.": "Hollnagel, Erik. *Safety-I and Safety-II: The Past and Future of Safety Management*. Farnham, UK: Ashgate, 2014.",
    "Sidney Dekker. The Field Guide to Understanding Human Error. 2006. Ashgate.": "Dekker, Sidney. *The Field Guide to Understanding Human Error*. 2nd ed. Farnham, UK: Ashgate, 2006.",
    "Sidney Dekker. Drift into Failure. 2011. Ashgate.": "Dekker, Sidney. *Drift into Failure: From Hunting Broken Components to Understanding Complex Systems*. Farnham, UK: Ashgate, 2011.",
    "Atul Gawande. The Checklist Manifesto. 2009. Metropolitan Books.": "Gawande, Atul. *The Checklist Manifesto: How to Get Things Right*. New York: Metropolitan Books, 2009.",
    "Nancy Leveson. Engineering a Safer World. 2011. MIT Press.": "Leveson, Nancy G. *Engineering a Safer World: Systems Thinking Applied to Safety*. Cambridge, MA: MIT Press, 2011.",
    "Nate Silver. The Signal and the Noise. 2012. Penguin Press.": "Silver, Nate. *The Signal and the Noise: Why So Many Predictions Fail—but Some Don't*. New York: Penguin Press, 2012.",
    "Philip E. Tetlock and Dan Gardner. Superforecasting. 2015. Crown.": "Tetlock, Philip E., and Dan Gardner. *Superforecasting: The Art and Science of Prediction*. New York: Crown, 2015.",
    "Eric Ries. The Lean Startup. 2011. Crown Business.": "Ries, Eric. *The Lean Startup: How Today's Entrepreneurs Use Continuous Innovation to Create Radically Successful Businesses*. New York: Crown Business, 2011.",
    "Nassim Nicholas Taleb. Antifragile. 2012. Random House.": "Taleb, Nassim Nicholas. *Antifragile: Things That Gain from Disorder*. New York: Random House, 2012.",
    "Eliyahu M. Goldratt and Jeff Cox. The Goal. 1984. North River Press.": "Goldratt, Eliyahu M., and Jeff Cox. *The Goal: A Process of Ongoing Improvement*. Great Barrington, MA: North River Press, 1984.",
    "Nicole Forsgren, Jez Humble, and Gene Kim. Accelerate. 2018. IT Revolution Press.": "Forsgren, Nicole, Jez Humble, and Gene Kim. *Accelerate: The Science of Lean Software and DevOps*. Portland, OR: IT Revolution Press, 2018.",
    "Karl Popper. The Logic of Scientific Discovery. 1959. Hutchinson.": "Popper, Karl R. *The Logic of Scientific Discovery*. London: Hutchinson, 1959.",
    "Carol Tavris and Elliot Aronson. Mistakes Were Made (But Not by Me). 2007. Harcourt.": "Tavris, Carol, and Elliot Aronson. *Mistakes Were Made (But Not by Me): Why We Justify Foolish Beliefs, Bad Decisions, and Hurtful Acts*. Orlando, FL: Harcourt, 2007.",
    "Jerry Z. Muller. The Tyranny of Metrics. 2018. Princeton University Press.": "Muller, Jerry Z. *The Tyranny of Metrics*. Princeton, NJ: Princeton University Press, 2018.",
    "Donald A. Schon. The Reflective Practitioner. 1983. Basic Books.": "Schön, Donald A. *The Reflective Practitioner: How Professionals Think in Action*. New York: Basic Books, 1983.",
    "Philip Selznick. Leadership in Administration. 1957. Harper & Row.": "Selznick, Philip. *Leadership in Administration: A Sociological Interpretation*. New York: Harper & Row, 1957.",
    "David Graeber. On the Phenomenon of Bullshit Jobs. 2013. Strike! Magazine.": 'Graeber, David. "On the Phenomenon of Bullshit Jobs." *Strike! Magazine*, August 17, 2013.',
    "Peter L. Berger and Thomas Luckmann. The Social Construction of Reality. 1966. Anchor Books.": "Berger, Peter L., and Thomas Luckmann. *The Social Construction of Reality: A Treatise in the Sociology of Knowledge*. New York: Anchor Books, 1966.",
    "Jim Collins. Good to Great. 2001. HarperBusiness.": "Collins, Jim. *Good to Great: Why Some Companies Make the Leap... and Others Don't*. New York: HarperBusiness, 2001.",
    "Phil Rosenzweig. The Halo Effect. 2007. Free Press.": "Rosenzweig, Phil. *The Halo Effect: ... and the Eight Other Business Delusions That Deceive Managers*. New York: Free Press, 2007.",
    "Tom DeMarco and Timothy R. Lister. Peopleware. 1987. Dorset House.": "DeMarco, Tom, and Timothy R. Lister. *Peopleware: Productive Projects and Teams*. New York: Dorset House, 1987.",
    "Liam Fahey and Robert M. Randall. Learning from the Future. 1998. Wiley.": "Fahey, Liam, and Robert M. Randall, eds. *Learning from the Future: Competitive Foresight Scenarios*. New York: Wiley, 1998.",
    "Stefan H. Thomke. Experimentation Works. 2020. Harvard Business Review Press.": "Thomke, Stefan H. *Experimentation Works: The Surprising Power of Business Experiments*. Boston: Harvard Business Review Press, 2020.",
    "Betsy Beyer, Chris Jones, Jennifer Petoff, and Niall Richard Murphy. Site Reliability Engineering. 2016. O'Reilly Media.": "Beyer, Betsy, Chris Jones, Jennifer Petoff, and Niall Richard Murphy, eds. *Site Reliability Engineering: How Google Runs Production Systems*. Sebastopol, CA: O'Reilly Media, 2016.",
}


def convert_body(body: str) -> str | None:
    body = body.strip()
    if body in SPECIAL:
        return SPECIAL[body]
    return None


def process_file(path: Path) -> bool:
    text = path.read_text(encoding="utf-8")
    lines = text.splitlines()
    out: list[str] = []
    changed = False
    for line in lines:
        m = FOOTNOTE.match(line)
        if m:
            chicago = convert_body(m.group(2))
            if chicago:
                if out and out[-1].strip():
                    out.append("")
                out.append(f"{m.group(1)} {chicago}")
                changed = True
                continue
            if out and out[-1].strip():
                out.append("")
        out.append(line)
    if changed:
        path.write_text("\n".join(out) + ("\n" if text.endswith("\n") else ""), encoding="utf-8")
    return changed


def main(argv: list[str]) -> int:
    root = Path(argv[0]) if argv else Path("books/how-serious-systems-learn")
    n = sum(
        process_file(p)
        for p in root.rglob("*.md")
        if "docs" not in p.parts and p.name != "bibliography.md"
    )
    print(f"Updated {n} files")
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
