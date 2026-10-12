const { spawn } = require('node:child_process')
const WebSocket = require('ws')
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const PORT = 9334
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

const chrome = spawn(CHROME, [
  `--remote-debugging-port=${PORT}`, '--headless=new', '--disable-gpu', '--no-first-run',
  '--user-data-dir=' + require('node:os').tmpdir() + '\\opencode\\cdp-profile2',
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

  const geom = await evaluate(`(() => {
    const spans = [...document.querySelectorAll('#milestones span')].filter(s => /text-\\[(56|68|76)px\\]/.test(s.className))
    return {
      innerHeight: window.innerHeight,
      scrollY: window.scrollY,
      counters: spans.map(s => { const r = s.getBoundingClientRect(); return { top: Math.round(r.top), bottom: Math.round(r.bottom), text: s.textContent } }),
    }
  })()`)

  console.log('innerHeight      :', geom.innerHeight)
  console.log('scrollY at load  :', geom.scrollY)
  console.log('counter rects at load (relative to viewport top):')
  for (const c of geom.counters) console.log(`   top=${c.top}  bottom=${c.bottom}  text=${c.text}  (px below fold: ${c.top - geom.innerHeight})`)
  console.log('\n=> a bottom rootMargin of N px triggers each counter when scrollY reaches', geom.counters.map(c => c.top - geom.innerHeight + 'N').join(', '))

  ws.close(); chrome.kill(); process.exit(0)
})().catch(e => { console.error('FAILED:', e.message); try { chrome.kill() } catch {}; process.exit(1) })