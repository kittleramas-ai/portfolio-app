/**
 * Small text predicates shared by the chatbot UI and the server validators.
 *
 * The rule these exist for: a field asking a person to type something should
 * refuse input that contains no letters at all. Without it, "555" is a perfectly
 * good "name" and a perfectly good "what would you like to discuss", which is
 * how test rows and key-mashes end up in the lead table and eventually in the
 * CEO's inbox.
 */

/**
 * True when the value contains at least one Unicode letter.
 *
 * `\p{L}` rather than `[a-zA-Z]`, deliberately. This site expects international
 * visitors, and a name written as 李明, मीरा or Γιώργος contains no Latin letters
 * at all — an ASCII check would reject exactly the people the field is for, which
 * is the same home-market assumption that made the original phone placeholder
 * read "+91 00000 00000".
 *
 * Digits and symbols deliberately do not count: "555", "---", "100%" and "$$$"
 * all fail this, which is the intent.
 */
export function hasLetter(value: string): boolean {
  return /\p{L}/u.test(value)
}

export function isValidName(value: string): boolean {
  const trimmed = value.trim()
  if (trimmed.length < 2 || trimmed.length > 70) return false

  // Only letters, spaces, hyphens, periods, and apostrophes allowed
  if (!/^[\p{L}][\p{L}\s.'-]*$/u.test(trimmed)) return false

  // Reject 3+ identical consecutive characters (e.g., "aaa", "xxx", "hhhh")
  if (/(.)\1{2,}/iu.test(trimmed)) return false

  // Common QWERTY keyboard smash substrings
  const lower = trimmed.toLowerCase()
  const keyboardMashes = ['qwer', 'asdf', 'zxcv', 'hjkl', 'tyui', 'ghjk', 'bnmk']
  if (keyboardMashes.some((mash) => lower.includes(mash))) return false

  const words = trimmed.split(/\s+/)
  for (const word of words) {
    const clean = word.replace(/[.'-]/g, '')
    // Allow single initial like "R." or honorific like "Dr."
    if (word.endsWith('.') && clean.length <= 2) continue

    // For Latin-script names:
    if (/^[a-zA-Z]+$/.test(clean)) {
      // Any Latin name word of 2+ chars MUST have at least one vowel (a, e, i, o, u, y)
      // Rejects "qw", "zx", "df", "xcx", "fgthhg", etc.
      if (!/[aeiouyAEIOUY]/.test(clean)) return false

      // Reject consonant spam (4+ consecutive consonants in a row, e.g. "xcxf", "fgthhg")
      if (/[bcdfghjklmnpqrstvwxyzBCDFGHJKLMNPQRSTVWXYZ]{4,}/.test(clean)) return false
    }
  }

  return true
}
