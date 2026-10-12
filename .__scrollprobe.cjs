const { spawn } = require('node:child_process')
const WebSocket = require('ws')
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const PORT = 9336
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

const chrome = spawn(CHROME, [
  `--remote-debugging-port=${PORT}`, '--headless=new', '--disable-gpu', '--no-first-run',
  '--user-data-dir=' + require('node:os').tmpdir() + '\\opencode\\cdp-profile4',
  '--window-size=1400,900', 'about:blank',
], { stdio: 'ignore' })

let ws, id = 0
const pending = new Map()
const send = (method, params = {}) => new Promise((res, rej) => {
  const i = ++id; pending.set(i, { res, rej }); ws.send(JSON.stringify({ id: i, method, params }))
})
const evaluate = async (expression) => {
  const r = await send('Runtime.evaluate', { expression, returnByValue: true })
  if (r.exceptionDetails) throw new Error(r.exceptionDetails.text)
  return r.result.value
}

const READ = `
(() => {
  const spans = [...document.querySelectorAll('#milestones span')]
    .filter(s => /text-\\\\[(56|68|76)px\\\\]/.test(s.className))
  return spans.map(s => {
    const r = s.getBoundingClientRect()
    const onScreen = r.top < window.innerHeight && r.bottom > 0
    const pending = s.className.includes('count-up-pending')
    const cs = getComputedStyle(s)
    if (pending && cs.opacity === '0') return onScreen ? 'HIDDEN-ON-SCREEN' : 'hidden'
    return onScreen ? '[' + s.textContent + ']' : 'off:' + s.textContent
  })
})()
`

;(async () => {
  let targets
  for (let i = 0; i < 40; i++) {
    try { targets = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json(); if (targets.some(t => t.type === 'page')) break } catch {}
    await sleep(250)
  }
  ws = new WebSocket(targets.find(t => t.type === 'page').webSocketDebuggerUrl, { perMessageDeflate: false })
  ws.on('message', (raw) => { const m = JSON.parse(raw); if (m.id && pending.has(m.id)) { const p = pending.get(m.id); pending.delete(m.id); m.error ? p.rej(new Error(JSON.stringify(m.error))) : p.res(m.result) } })
  await new Promise(r => ws.on('open', r))
  await send('Page.enable'); await send('Runtime.enable')
  await send('Page.navigate', { url: 'http://localhost:3000/' })
  await sleep(5000)

  console.log('AT LOAD (no scrolling yet):')
  console.log('  ', JSON.stringify(await evaluate(READ)))
  console.log('')
  console.log('SLOW SCROLL: 120px every 100ms')
  for (let step = 0; step < 16; step++) {
    await evaluate('window.scrollBy({top:120, behavior:"instant"}); 1')
    await sleep(100)
    const y = await evaluate('window.scrollY')
    console.log('   scrollY=' + String(y).padStart(4) + '  ' + JSON.stringify(await evaluate(READ)))
  }
  console.log('')
  console.log('AFTER SETTLING:')
  await sleep(1500)
  console.log('  ', JSON.stringify(await evaluate(READ)))

  ws.close(); chrome.kill(); process.exit(0)
})().catch(e => { console.error('FAILED:', e.message); try { chrome.kill() } catch {}; process.exit(1) })