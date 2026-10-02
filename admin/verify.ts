/**
 * Sanity checks for the admin crypto. Run: npx tsx admin/verify.ts
 * Not a substitute for a real test runner — it proves the primitives work
 * under tsx/Node before they are depended on by the login path.
 */
import { hashPassword, verifyPassword } from './server/password.ts'
import {
  generateSessionToken,
  hashSessionToken,
  parseCookies,
} from './server/session-token.ts'

let failures = 0
function check(label: string, ok: boolean) {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}`)
  if (!ok) failures++
}

// --- password hashing ---
const pw = 'correct horse battery staple'
const hash = await hashPassword(pw)

check('hash is self-describing', hash.startsWith('pbkdf2-sha256$210000$'))
check('hash does not contain the plaintext', !hash.includes(pw))
check('correct password verifies', (await verifyPassword(pw, hash)) === true)
check('wrong password rejected', (await verifyPassword('wrong', hash)) === false)

const hash2 = await hashPassword(pw)
check('same password hashes differently (random salt)', hash !== hash2)
check('second hash still verifies', (await verifyPassword(pw, hash2)) === true)

check('malformed hash rejected', (await verifyPassword(pw, 'garbage')) === false)
check('empty hash rejected', (await verifyPassword(pw, '')) === false)
check(
  'unknown scheme rejected',
  (await verifyPassword(pw, 'bcrypt$210000$aaaa$bbbb')) === false,
)

// --- session tokens ---
const token = generateSessionToken()
check('token is 96 hex chars (48 bytes)', /^[0-9a-f]{96}$/.test(token))
check('tokens are unique', generateSessionToken() !== generateSessionToken())

const peppered = await hashSessionToken(token, 'pepper-a')
const differentPepper = await hashSessionToken(token, 'pepper-b')
check('pepper changes the hash', peppered !== differentPepper)
check('same token+pepper is stable', (await hashSessionToken(token, 'pepper-a')) === peppered)
check('hash is 64 hex chars (sha256)', /^[0-9a-f]{64}$/.test(peppered))
check('hash does not reveal the token', !peppered.includes(token))

// --- cookie parsing ---
const jar = parseCookies('admin_session=abc123; theme=dark; path=/')
check('parses cookie value', jar.admin_session === 'abc123')
check('parses other cookies', jar.theme === 'dark')
check('url-decodes values', parseCookies('a=hello%20world').a === 'hello world')
check('null header -> empty object', Object.keys(parseCookies(null)).length === 0)
check('malformed pairs ignored', parseCookies('=oops; ok=1').ok === '1')

console.log(`\n${failures === 0 ? 'ALL PASS' : `${failures} FAILURE(S)`}`)
if (failures > 0) process.exitCode = 1