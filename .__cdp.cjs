const { spawn } = require('node:child_process')
const WebSocket = require('ws')

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const PORT = 9333

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

const chrome = spawn(CHROME, [
  `--remote-debugging-port=${PORT}`,
  '--headless=new',
  '--disable-gpu',
  '--no-first-run',
  '--user-data-dir=' + require('node:os').tmpdir() + '\\opencode\\cdp-profile',
  '--window-size=1400,900',
  'about:blank',
], { stdio: 'ignore' })

let ws
let id = 0
const pending = new Map()

function send(method, params = {}) {
  return new Promise((resolve, reject) => {
    const msgId = ++id
    pending.set(msgId, { resolve, reject })
    ws.send(JSON.stringify({ id: msgId, method, params }))
  })
}

async function evaluate(expression, awaitPromise = false) {
  const res = await send('Runtime.evaluate', {
    expression,
    returnByValue: true,
    awaitPromise,
  })
  if (res.exceptionDetails) throw new Error(res.exceptionDetails.text + ' :: ' + expression.slice(0, 80))
  return res.result.value
}

const READ_COUNTERS = `
(() => {
  const sec = document.querySelector('#milestones')
  if (!sec) return null
  const spans = [...sec.querySelectorAll('span')].filter(s =>
    s.className.includes('text-[56px]') || s.className.includes('text-[68px]') || s.className.includes('text-[76px]')
  )
  return spans.map(s => s.textContent)
})()
`

;(async () => {
  // Wait for the debugger endpoint.
  let targets
  for (let i = 0; i < 40; i++) {
    try {
      targets = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json()
      if (targets.some((t) => t.type === 'page')) break
    } catch {}
    await sleep(250)
  }
  const page = targets.find((t) => t.type === 'page')
  ws = new WebSocket(page.webSocketDebuggerUrl, { perMessageDeflate: false, maxPayload: 256 * 1024 * 1024 })
  ws.on('message', (raw) => {
    const m = JSON.parse(raw)
    if (m.id && pending.has(m.id)) {
      const { resolve, reject } = pending.get(m.id)
      pending.delete(m.id)
      m.error ? reject(new Error(JSON.stringify(m.error))) : resolve(m.result)
    }
  })
  await new Promise((r) => ws.on('open', r))

  await send('Page.enable')
  await send('Runtime.enable')

  console.log('--- 1. SSR / pre-hydration state ---')
  await send('Page.navigate', { url: 'http://localhost:3000/' })
  await sleep(4000)
  console.log('counters at load :', JSON.stringify(await evaluate(READ_COUNTERS)))

  console.log('\n--- 2. scroll to #milestones, sample the count-up ---')
  await evaluate(`document.querySelector('#milestones').scrollIntoView({behavior:'instant', block:'center'}); 1`)
  for (let i = 0; i < 14; i++) {
    console.log(`  t+${String(i * 150).padStart(4)}ms :`, JSON.stringify(await evaluate(READ_COUNTERS)))
    await sleep(150)
  }

  console.log('\n--- 3. settled value ---')
  await sleep(1200)
  console.log('counters settled :', JSON.stringify(await evaluate(READ_COUNTERS)))

  console.log('\n--- 4. console errors ---')
  console.log(await evaluate(`JSON.stringify(window.__errs||[])`))
  console.log('\n--- 5. devtools rendering mode is irrelevant headless; check LCP-ish ---')
  console.log('hydration marker present:', await evaluate(`!!document.querySelector('#hero')`))

  ws.close()
  chrome.kill()
  process.exit(0)
})().catch((e) => {
  console.error('FAILED:', e.message)
  try { chrome.kill() } catch {}
  process.exit(1)
})