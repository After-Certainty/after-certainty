#!/usr/bin/env python3
"""Normalize footnotes and rebuild bibliography for when-interpretation-no-longer-matters."""

from __future__ import annotations

import re
from pathlib import Path

BOOK = Path("books/when-interpretation-no-longer-matters")

# Chicago NB note forms (full and short)
CANON = {
    # Portfolio
    r"^\*How Meaning Moves\*\.?$": "Steffensen, *How Meaning Moves* (after-certainty.com, 2026).",
    r"^Steffensen, \*How Meaning Moves\*.*$": "Steffensen, *How Meaning Moves* (after-certainty.com, 2026).",
    r"^\*When Authority Outlives Accountability\*\.?$": "Steffensen, *When Authority Outlives Accountability* (after-certainty.com, 2026).",
    r"^\*When Authority Is Misread\*.*$": "Steffensen, *When Authority Is Misread* (after-certainty.com, 2026).",
    r"^Chapter 4, \*When Authority Is Misread\*.*$": "Steffensen, *When Authority Is Misread* (after-certainty.com, 2026).",
    r"^\*When Accountability No Longer Expires\*.*$": "Steffensen, *When Accountability No Longer Expires* (after-certainty.com, 2026).",
    # Arendt
    r"^Hannah Arendt, \*The Origins of Totalitarianism\* \(Harcourt, 1951\)\.?$": "Hannah Arendt, *The Origins of Totalitarianism* (New York: Harcourt, Brace, 1951).",
    r"^Arendt, \*Origins\*\.?$": "Arendt, *Origins*.",
    r"^Arendt, \*The Origins of Totalitarianism\*.*$": "Arendt, *Origins*.",
    r"^Arendt; Ellul\.?$": "Arendt, *Origins*; Jacques Ellul, *Propaganda*.",
    r"^Arendt, \*Origins\*; Fitzpatrick.*$": "Arendt, *Origins*; Fitzpatrick, *Everyday Stalinism*.",
    r"^Arendt, \*Origins\*; Kershaw.*$": "Arendt, *Origins*; Kershaw, *Hitler*.",
    r"^Weber; Arendt\.?$": "Weber, *Economy and Society*; Arendt, *Origins*.",
    # Weber
    r"^Max Weber, \*Economy and Society\* \(University of California Press, 1978\)\.?$": "Max Weber, *Economy and Society*, ed. Guenther Roth and Claus Wittich (Berkeley: University of California Press, 1978).",
    r"^Weber, \*Economy and Society\*\.?$": "Weber, *Economy and Society*.",
    r"^Weber \(charismatic legitimacy\), \*Economy and Society\*\.?$": "Weber, *Economy and Society*.",
    r"^Weber; see also authority reproduction in sociological theory\.?$": "Weber, *Economy and Society*.",
    # Berger & Luckmann
    r"^Peter Berger and Thomas Luckmann, \*The Social Construction of Reality\* \(Anchor, 1966\)\.?$": "Peter L. Berger and Thomas Luckmann, *The Social Construction of Reality* (New York: Anchor Books, 1966).",
    r"^Berger and Luckmann, \*Social Construction\*\.?$": "Berger and Luckmann, *Social Construction*.",
    r"^Berger and Luckmann; Jürgen Habermas.*$": "Berger and Luckmann, *Social Construction*; Habermas, *Theory of Communicative Action*, vol. 1.",
    # Habermas
    r"^Jürgen Habermas, \*The Theory of Communicative Action\*, Vol\. 1 \(Beacon, 1984\)\.?$": "Jürgen Habermas, *The Theory of Communicative Action*, vol. 1 (Boston: Beacon Press, 1984).",
    r"^Habermas, \*Theory of Communicative Action\*\.?$": "Habermas, *Theory of Communicative Action*, vol. 1.",
    r"^Habermas, \*Communicative Action\*\.?$": "Habermas, *Theory of Communicative Action*, vol. 1.",
    r"^Habermas\.?$": "Habermas, *Theory of Communicative Action*, vol. 1.",
    # Sunstein
    r"^Cass Sunstein, \*#Republic\* \(Princeton University Press, 2017\)\.?$": "Cass R. Sunstein, *#Republic* (Princeton, NJ: Princeton University Press, 2017).",
    r"^Cass Sunstein, \*\\#Republic\* \(Princeton University Press, 2017\)\.?$": "Cass R. Sunstein, *#Republic* (Princeton, NJ: Princeton University Press, 2017).",
    r"^Sunstein, \*#Republic\*\.?$": "Sunstein, *#Republic*.",
    r"^Sunstein, \*\\#Republic\*\.?$": "Sunstein, *#Republic*.",
    # Hirschman
    r"^Albert O\. Hirschman, \*Exit, Voice, and Loyalty\* \(Harvard University Press, 1970\)\.?$": "Albert O. Hirschman, *Exit, Voice, and Loyalty* (Cambridge, MA: Harvard University Press, 1970).",
    r"^Hirschman, \*Exit, Voice, and Loyalty\*\.?$": "Hirschman, *Exit, Voice, and Loyalty*.",
    # Goffman
    r"^Erving Goffman, \*The Presentation of Self in Everyday Life\* \(Anchor, 1959\)\.?$": "Erving Goffman, *The Presentation of Self in Everyday Life* (New York: Anchor Books, 1959).",
    r"^Goffman, \*Presentation of Self\*\.?$": "Goffman, *Presentation of Self*.",
    # Festinger
    r"^Leon Festinger et al\., \*When Prophecy Fails\* \(Harper & Row, 1956\)\.?$": "Leon Festinger, Henry W. Riecken, and Stanley Schachter, *When Prophecy Fails* (New York: Harper & Row, 1956).",
    # Bushman / Smith
    r"^\*Joseph Smith—History\* 1:5–26 \(Pearl of Great Price\); Richard Lyman Bushman, \*Joseph Smith: Rough Stone Rolling\* \(Knopf, 2005\)\.?$": "*Joseph Smith—History* 1:5–26 (Pearl of Great Price); Richard Lyman Bushman, *Joseph Smith: Rough Stone Rolling* (New York: Alfred A. Knopf, 2005).",
    r"^Bushman, \*Rough Stone Rolling\*; Jan Shipps.*$": "Bushman, *Rough Stone Rolling*; Shipps, *Mormonism*.",
    r"^Bushman, \*Rough Stone Rolling\*, chs\. 6–8; Shipps, \*Mormonism\*\.?$": "Bushman, *Rough Stone Rolling*, chs. 6–8; Shipps, *Mormonism*.",
    r"^Terryl L\. Givens, \*By the Hand of Mormon\* \(Oxford University Press, 2002\)\.?$": "Terryl L. Givens, *By the Hand of Mormon* (New York: Oxford University Press, 2002).",
    # Reiterman
    r"^Tim Reiterman, \*Raven: The Untold Story of the Rev\. Jim Jones\* \(E\. P\. Dutton, 1982\)\.?$": "Tim Reiterman, *Raven: The Untold Story of the Rev. Jim Jones* (New York: E. P. Dutton, 1982).",
    r"^Reiterman, \*Raven\*, chs\. 8–10\.?$": "Reiterman, *Raven*, chs. 8–10.",
    r"^Reiterman, \*Raven\*\.?$": "Reiterman, *Raven*.",
    # Havel
    r"^Václav Havel, “The Power of the Powerless\.”$": 'Václav Havel, "The Power of the Powerless," in *Living in Truth*, ed. Jan Vladislav (London: Faber and Faber, 1986).',
    r"^Havel, “The Power of the Powerless\.”$": 'Havel, "The Power of the Powerless."',
    # Ellul
    r"^Hannah Arendt, \*The Origins of Totalitarianism\* \(Harcourt, 1951\); Jacques Ellul, \*Propaganda: The Formation of Men’s Attitudes\* \(Vintage, 1965\)\.?$": "Arendt, *Origins*; Jacques Ellul, *Propaganda: The Formation of Men’s Attitudes* (New York: Vintage Books, 1965).",
    # Foucault
    r"^Michel Foucault, \*Power/Knowledge\* \(Pantheon, 1980\)\.?$": "Michel Foucault, *Power/Knowledge: Selected Interviews and Other Writings, 1972–1977* (New York: Pantheon Books, 1980).",
    r"^Michel Foucault, \*Discipline and Punish\* \(Vintage, 1977\)\.?$": "Michel Foucault, *Discipline and Punish: The Birth of the Prison*, trans. Alan Sheridan (New York: Vintage Books, 1977).",
    r"^Foucault, \*Discipline and Punish\*\.?$": "Foucault, *Discipline and Punish*.",
    r"^Michel Foucault, \*Society Must Be Defended\* \(Picador, 2003\)\.?$": "Michel Foucault, *“Society Must Be Defended”: Lectures at the Collège de France, 1975–76* (New York: Picador, 2003).",
    r"^Foucault, \*Society Must Be Defended\*\.?$": "Foucault, *Society Must Be Defended*.",
    # Kotkin / Stalin
    r"^Stephen Kotkin, \*Stalin: Paradoxes of Power\* \(Penguin, 2014\)\.?$": "Stephen Kotkin, *Stalin: Paradoxes of Power, 1878–1928* (New York: Penguin Press, 2014).",
    r"^Kotkin, \*Stalin\*\.?$": "Kotkin, *Stalin*.",
    r"^Sheila Fitzpatrick, \*Everyday Stalinism\* \(Oxford University Press, 1999\)\.?$": "Sheila Fitzpatrick, *Everyday Stalinism: Ordinary Life in Extraordinary Times* (New York: Oxford University Press, 1999).",
    r"^Fitzpatrick, \*Everyday Stalinism\*\.?$": "Fitzpatrick, *Everyday Stalinism*.",
    # Figes
    r"^Orlando Figes, \*The Whisperers\* \(Metropolitan Books, 2007\)\.?$": "Orlando Figes, *The Whisperers: Private Life in Stalin’s Russia* (New York: Metropolitan Books, 2007).",
    r"^Figes, \*The Whisperers\*\.?$": "Figes, *The Whisperers*.",
    # Kuran
    r"^Timur Kuran, \*Private Truths, Public Lies\* \(Harvard University Press, 1995\)\.?$": "Timur Kuran, *Private Truths, Public Lies: The Social Consequences of Preference Falsification* (Cambridge, MA: Harvard University Press, 1995).",
    r"^Kuran, \*Private Truths, Public Lies\*\.?$": "Kuran, *Private Truths, Public Lies*.",
    # Trump / polarization
    r"^Maggie Haberman, \*Confidence Man:.*$": "Maggie Haberman, *Confidence Man: The Making of Donald Trump and the Breaking of America* (New York: Penguin Press, 2022); Bob Woodward, *Fear: Trump in the White House* (New York: Simon & Schuster, 2018).",
    r"^Ashley Parker and Michael Scherer, “Donald Trump and His Assault on Truth,” \*The Atlantic\* \(2020\)\.?$": 'Ashley Parker and Michael Scherer, "Donald Trump and His Assault on Truth," *The Atlantic*, October 2020.',
    r"^Ezra Klein, \*Why We’re Polarized\* \(Avid Reader Press, 2020\)\.?$": "Ezra Klein, *Why We’re Polarized* (New York: Avid Reader Press, 2020).",
    r"^Klein, \*Why We’re Polarized\*\.?$": "Klein, *Why We’re Polarized*.",
    r"^Carl Schmitt, \*The Concept of the Political\* \(University of Chicago Press, 1996\)\.?$": "Carl Schmitt, *The Concept of the Political*, trans. George Schwab (Chicago: University of Chicago Press, 1996).",
    r"^Neil Postman, \*Amusing Ourselves to Death\* \(Penguin, 1985\); Klein, \*Why We’re Polarized\*\.?$": "Postman, *Amusing Ourselves to Death*; Klein, *Why We’re Polarized*.",
    r"^Neil Postman, \*Amusing Ourselves to Death\* \(Penguin, 1985\)\.?$": "Neil Postman, *Amusing Ourselves to Death* (New York: Penguin Books, 1985).",
    r"^Chantal Mouffe, \*The Democratic Paradox\* \(Verso, 2000\)\.?$": "Chantal Mouffe, *The Democratic Paradox* (London: Verso, 2000).",
    r"^Mouffe, \*The Democratic Paradox\*\.?$": "Mouffe, *The Democratic Paradox*.",
    # Perón
    r"^Carlos Escudé, \*Argentine Political Culture\* \(University of Pittsburgh Press, 1992\)\.?$": "Carlos Escudé, *Argentine Political Culture* (Pittsburgh: University of Pittsburgh Press, 1992).",
    r"^Escudé, \*Argentine Political Culture\*\.?$": "Escudé, *Argentine Political Culture*.",
    r"^Joseph A\. Page, \*Perón: A Biography\* \(Random House, 1983\)\.?$": "Joseph A. Page, *Perón: A Biography* (New York: Random House, 1983).",
    r"^Page, \*Perón\*\.?$": "Page, *Perón*.",
    r"^Ernesto Laclau, \*On Populist Reason\* \(Verso, 2005\)\.?$": "Ernesto Laclau, *On Populist Reason* (London: Verso, 2005).",
    r"^Laclau, \*On Populist Reason\*\.?$": "Laclau, *On Populist Reason*.",
    # Waco
    r"^Stuart A\. Wright, \*Armageddon in Waco\* \(University of Chicago Press, 1995\)\.?$": "Stuart A. Wright, ed., *Armageddon in Waco: Critical Perspectives on the Branch Davidian Conflict* (Chicago: University of Chicago Press, 1995).",
    r"^Wright, \*Armageddon in Waco\*\.?$": "Wright, *Armageddon in Waco*.",
    r"^James D\. Tabor and Eugene V\. Gallagher, \*Why Waco\?\* \(University of California Press, 1995\)\.?$": "James D. Tabor and Eugene V. Gallagher, *Why Waco? Cults and the Battle for Religious Freedom in America* (Berkeley: University of California Press, 1995).",
    r"^Tabor and Gallagher, \*Why Waco\?\*\.?$": "Tabor and Gallagher, *Why Waco?*",
    # Kuhn / Popper
    r"^Thomas Kuhn, \*The Structure of Scientific Revolutions\* \(University of Chicago Press, 1962\)\.?$": "Thomas S. Kuhn, *The Structure of Scientific Revolutions* (Chicago: University of Chicago Press, 1962).",
    r"^Karl Popper, \*The Open Society and Its Enemies\* \(Routledge, 1945\)\.?$": "Karl Popper, *The Open Society and Its Enemies* (London: Routledge, 1945).",
    # Moonies
    r"^George D\. Chryssides, \*The Advent of Sun Myung Moon\* \(Palgrave Macmillan, 1991\)\.?$": "George D. Chryssides, *The Advent of Sun Myung Moon: The Origins, Beliefs, and Practices of the Unification Church* (New York: St. Martin’s Press, 1991).",
    r"^Chryssides, \*Advent of Sun Myung Moon\*\.?$": "Chryssides, *Advent of Sun Myung Moon*.",
    r"^Eileen Barker, \*The Making of a Moonie\* \(Blackwell, 1984\)\.?$": "Eileen Barker, *The Making of a Moonie: Choice or Brainwashing?* (Oxford: Blackwell, 1984).",
    r"^Barker, \*The Making of a Moonie\*\.?$": "Barker, *The Making of a Moonie*.",
    # Venezuela
    r"^Richard Gott, \*Hugo Chávez and the Bolivarian Revolution\* \(Verso, 2005\)\.?$": "Richard Gott, *Hugo Chávez and the Bolivarian Revolution* (London: Verso, 2005).",
    r"^Javier Corrales and Michael Penfold, \*Dragon in the Tropics\* \(Brookings Institution Press, 2011\)\.?$": "Javier Corrales and Michael Penfold, *Dragon in the Tropics: Hugo Chávez and the Political Economy of Revolution in Venezuela* (Washington, DC: Brookings Institution Press, 2011).",
    r"^Corrales and Penfold, \*Dragon in the Tropics\*\.?$": "Corrales and Penfold, *Dragon in the Tropics*.",
    r"^Kirk A\. Hawkins, \*Venezuela’s Chavismo and Populism in Comparative Perspective\* \(Cambridge University Press, 2010\)\.?$": "Kirk A. Hawkins, *Venezuela’s Chavismo and Populism in Comparative Perspective* (Cambridge: Cambridge University Press, 2010).",
    r"^Hawkins, \*Venezuela’s Chavismo\*\.?$": "Hawkins, *Venezuela’s Chavismo*.",
    r"^Hawkins, \*Chavismo\*\.?$": "Hawkins, *Chavismo*.",
    # Hitler / Klemperer
    r"^Ian Kershaw, \*Hitler: Hubris\* \(W\. W\. Norton, 1998\)\.?$": "Ian Kershaw, *Hitler: 1889–1936 Hubris* (New York: W. W. Norton, 1998).",
    r"^Kershaw, \*Hitler\*\.?$": "Kershaw, *Hitler*.",
    r"^Victor Klemperer, \*I Will Bear Witness\* \(Modern Library, 1998\)\.?$": "Victor Klemperer, *I Will Bear Witness: A Diary of the Nazi Years, 1933–1941* (New York: Modern Library, 1998).",
    r"^Klemperer, \*I Will Bear Witness\*\.?$": "Klemperer, *I Will Bear Witness*.",
    # Theranos / WeWork
    r"^John Carreyrou, \*Bad Blood\* \(Knopf, 2018\)\.?$": "John Carreyrou, *Bad Blood: Secrets and Lies in a Silicon Valley Startup* (New York: Alfred A. Knopf, 2018).",
    r"^Carreyrou, \*Bad Blood\*\.?$": "Carreyrou, *Bad Blood*.",
    r"^Eliot Brown and Maureen Farrell, \*The Cult of We\* \(Crown, 2021\)\.?$": "Eliot Brown and Maureen Farrell, *The Cult of We: WeWork, Adam Neumann, and the Great Startup Delusion* (New York: Crown, 2021).",
    r"^Brown and Farrell, \*The Cult of We\*\.?$": "Brown and Farrell, *The Cult of We*.",
    # China / Cambodia
    r"^Roderick MacFarquhar and Michael Schoenhals, \*Mao’s Last Revolution\* \(Harvard University Press, 2006\)\.?$": "Roderick MacFarquhar and Michael Schoenhals, *Mao’s Last Revolution* (Cambridge, MA: Harvard University Press, 2006).",
    r"^MacFarquhar and Schoenhals, \*Mao’s Last Revolution\*\.?$": "MacFarquhar and Schoenhals, *Mao’s Last Revolution*.",
    r"^Frank Dikötter, \*The Cultural Revolution\* \(Bloomsbury, 2016\)\.?$": "Frank Dikötter, *The Cultural Revolution: A People’s History, 1962–1976* (New York: Bloomsbury Press, 2016).",
    r"^Dikötter, \*The Cultural Revolution\*\.?$": "Dikötter, *The Cultural Revolution*.",
    r"^Ben Kiernan, \*The Pol Pot Regime\* \(Yale University Press, 2008\)\.?$": "Ben Kiernan, *The Pol Pot Regime: Race, Power, and Genocide in Cambodia under the Khmer Rouge, 1975–79*, 3rd ed. (New Haven, CT: Yale University Press, 2008).",
    r"^Kiernan, \*The Pol Pot Regime\*\.?$": "Kiernan, *The Pol Pot Regime*.",
    r"^Kiernan, \*Pol Pot Regime\*\.?$": "Kiernan, *Pol Pot Regime*.",
    r"^David P\. Chandler, \*Voices from S-21\* \(University of California Press, 1999\)\.?$": "David P. Chandler, *Voices from S-21: Terror and History in Pol Pot’s Secret Prison* (Berkeley: University of California Press, 1999).",
    r"^Chandler, \*Voices from S-21\*\.?$": "Chandler, *Voices from S-21*.",
}

BLEED_PATTERN = re.compile(
    r"(\[\^[^\]]+\]: [^\n]+)\.?\s*\\?\s*=\s*#.*$",
    re.MULTILINE,
)

FOOTNOTE_LINE = re.compile(r"^(\[\^[^\]]+\]:)(.*)$", re.MULTILINE)


def normalize_content(text: str) -> str:
    body = text.strip()
    for pattern, replacement in CANON.items():
        if re.match(pattern, body, flags=re.IGNORECASE):
            return replacement
    return text.strip()


def clean_file(path: Path) -> int:
    original = path.read_text(encoding="utf-8")
    changed = 0

    def repl_bleed(m: re.Match[str]) -> str:
        nonlocal changed
        changed += 1
        return m.group(1).rstrip() + "."

    text = BLEED_PATTERN.sub(repl_bleed, original)

    def repl_line(m: re.Match[str]) -> str:
        nonlocal changed
        prefix, body = m.group(1), m.group(2)
        new_body = normalize_content(body)
        if new_body != body.strip():
            changed += 1
            return f"{prefix} {new_body}"
        return m.group(0)

    text = FOOTNOTE_LINE.sub(repl_line, text)
    if text != original:
        path.write_text(text, encoding="utf-8")
    return changed


def main() -> None:
    files_touched = 0
    replacements = 0
    for path in sorted(BOOK.rglob("*.md")):
        if "docs/agents" in str(path):
            continue
        if path.name == "bibliography.md":
            continue
        if "[^" not in path.read_text(encoding="utf-8"):
            continue
        n = clean_file(path)
        if n:
            files_touched += 1
            replacements += n
    print(f"Normalized {replacements} footnote(s) across {files_touched} file(s)")


if __name__ == "__main__":
    main()
