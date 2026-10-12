/**
 * International phone-number handling.
 *
 * Pure and dependency-free on purpose: this is imported by both the client form
 * and the server validator, and the obvious way to do this properly —
 * `libphonenumber-js` — is ~70 KB minified plus per-region metadata. That is a
 * poor trade for one optional field on a page whose Lighthouse score is a stated
 * concern.
 *
 * The philosophy is PERMISSIVE. This site expects international visitors, so the
 * job is not to decide what a valid number is — that requires knowing every
 * country's national numbering plan, which is exactly what we are deliberately
 * not shipping. The job is only to catch things that are obviously not phone
 * numbers ("abc", "12345", "9999999999999999999") while letting every real
 * format through, including ones this file has never seen.
 */

/**
 * Codepoint of "zero" for each script that has its own digits. Each is a run of
 * ten consecutive codepoints, so the offset from the base is the digit.
 */
const DIGIT_BASES = [
  0x0660, // Arabic-Indic        ٠١٢
  0x06f0, // Extended Arabic-Indic (Persian) ۰۱۲
  0x0966, // Devanagari          ०१२
  0x09e6, // Bengali             ০১২
  0x0a66, // Gurmukhi            ੦੧੨
  0x0ae6, // Gujarati            ૦૧૨
  0x0b66, // Oriya               ୦୧୨
  0x0be6, // Tamil               ௦௧௨
  0x0c66, // Telugu              ౦౧౨
  0x0ce6, // Kannada             ೦೧೨
  0x0d66, // Malayalam           ൦൧൨
  0x0e50, // Thai                ๐๑๒
  0x0ed0, // Lao                 ໐໑໒
  0x104a0, // Osmanya
  0x17e0, // Khmer               ០១២
  0x1810, // Mongolian
] as const

/**
 * Folds Unicode decimal digits to ASCII.
 *
 * A visitor on a device with a non-Latin keyboard layout can produce full-width
 * or Arabic-Indic digits from an IME, and those are perfectly legitimate input.
 * Rejecting them would be exactly the kind of narrow, home-market assumption
 * this module exists to avoid.
 *
 * `NFKC` handles full-width and the mathematical digits for free; the remaining
 * scripts need the base table, because `Number()` does NOT understand them —
 * `Number('٩')` is NaN, not 9. That is easy to assume otherwise and produces a
 * validator that silently mangles non-Latin input into "NaN".
 */
function toAsciiDigits(input: string): string {
  return input.normalize('NFKC').replace(/\p{Decimal_Number}/gu, (ch) => {
    const code = ch.codePointAt(0)
    if (code === undefined) return ch
    for (const base of DIGIT_BASES) {
      if (code >= base && code <= base + 9) return String(code - base)
    }
    return ch
  })
}

/**
 * Strips the separators people actually type, leaving digits and a leading `+`.
 *
 * Covers ASCII punctuation plus the Unicode dashes (U+2010–U+2015), full-width
 * forms and the minus sign that get pasted in from documents and chat apps —
 * none of which a `[\s-]` class would catch.
 */
function compactOf(input: string): string {
  return toAsciiDigits(input.trim())
    .normalize('NFKC')
    .replace(/[\s()./\\\-‐-―−-－]/g, '')
}

/**
 * True when the text is at least shaped like a dialable number.
 *
 * Retained as the pre-libphonenumber guard and as the fallback for values that
 * are not numbers at all. 7 to 15 digits is the ITU E.164 range — deliberately
 * the widest any country uses, not a guess at a "normal" length.
 */
export function isPlausiblePhone(input: string): boolean {
  const compact = compactOf(input)
  if (!compact) return false
  // A `+` is only ever valid as the very first character; anywhere else it is a
  // typo ("+44+1…" or "44+1…"), and the `+` count is what catches both.
  const plusCount = compact.split('+').length - 1
  if (plusCount > 1) return false
  if (plusCount === 1 && !compact.startsWith('+')) return false
  if (!/^\+?\d+$/.test(compact)) return false
  const digits = compact.length - plusCount
  return digits >= 7 && digits <= 15
}

/**
 * Best-effort canonical form, for de-duplicating and searching.
 *
 * Only ever used where a comparison is wanted. The value STORED and emailed is
 * the one the visitor typed — reformatting someone's number before they get a
 * reply from a human is presumptuous, and it destroys formatting they may rely
 * on when dialling from another country.
 */
export function toComparablePhone(input: string): string {
  return compactOf(input).replace(/^\+/, '')
}

/**
 * True when the entry is a company name rather than a number.
 *
 * The letter requirement is load-bearing, not decoration. "Contains no digits"
 * alone also matches `+`, `---` and `...`, which a visitor types while fumbling
 * at a phone field — treating those as company names would wave through every
 * malformed number, defeating the point of validating. Requiring at least one
 * letter separates a real name ("Infosys Limited") from keyboard noise.
 *
 * A value like "abc" is still accepted as a name. Distinguishing a plausible
 * company from a plausible typo needs a word list, and refusing to record an
 * enquiry over an unrecognised word is a far worse failure than storing one.
 */
export function isCompanyName(input: string): boolean {
  const value = input.trim()
  if (!value) return false
  if (/\d/.test(toAsciiDigits(value))) return false
  return /\p{L}/u.test(value)
}

/**
 * Authoritative check, using libphonenumber's per-country numbering plans.
 *
 * Imported DYNAMICALLY and only after a `+` has been found. Two consequences,
 * both deliberate:
 *
 * - **It stays out of the initial bundle.** `libphonenumber-js/min` is ~70 KB
 *   minified; a static import would land it in the entry chunk and cost every
 *   visitor that weight for a field most of them never touch. Dynamically
 *   imported, it becomes its own chunk fetched only when someone actually types
 *   an international number — the Lighthouse score is unaffected.
 *
 * - **A leading `+` is REQUIRED.** This is the whole point of the function, and
 *   it is stricter than the first version, which merely *recommended* a country
 *   code and quietly fell back to a shape check without one.
 *
 *   Without a `+` the string is not merely unverified, it is uninterpretable.
 *   Fed to a default region, libphonenumber does not reject a foreign local
 *   format so much as silently RELABEL it: `(415) 555-0132` parsed against `IN`
 *   comes back as a *valid Indian* number, and whether any given US or UK local
 *   number survives that reading is effectively a coin flip. So a number without
 *   a country code is refused rather than guessed at.
 *
 *   The cost is real and deliberate: a visitor who types `020 7946 0958` is
 *   turned away until they add `+44`. Both prompts and the contact-form
 *   placeholder show a worked example, the field is optional, and a company
 *   name is still accepted — so the visitor has a way forward other than
 *   retyping. What it buys is that EVERY number in the table is one that
 *   libphonenumber confirmed exists in its country's numbering plan, and is
 *   comparable across countries (the same person always produces the same
 *   digits) instead of being an uncheckable string.
 */
export async function isValidInternationalNumber(input: string): Promise<boolean> {
  const compact = compactOf(input)
  // No country code => no verdict. Refused, not guessed.
  if (!compact.startsWith('+')) return false
  const { parsePhoneNumberFromString } = await import('libphonenumber-js/min')
  const parsed = parsePhoneNumberFromString(compact)
  // `?? false`: an unparseable string is not a valid number, and this is the
  // branch that is allowed to say so.
  return parsed?.isValid() ?? false
}

/**
 * The full check for this field: a company name, or a fully-qualified
 * international number.
 *
 * Resolves rather than throws so both call sites — the chatbot's client-side
 * step and the server function — can share one definition of "acceptable".
 */
export async function isAcceptablePhoneOrCompanyStrict(
  input: string,
): Promise<boolean> {
  const value = input.trim()
  if (!value) return true
  // Checked before the number branch: a company name legitimately has no `+`,
  // and must not be sent to libphonenumber to be judged as a number.
  if (isCompanyName(value)) return true
  return isValidInternationalNumber(value)
}