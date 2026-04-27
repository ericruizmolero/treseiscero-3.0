import { prepareWithSegments, layoutWithLines } from 'https://esm.sh/@chenglou/pretext'

// ══════════════════════════════════════════════════════════════════
//  CONFIG
// ══════════════════════════════════════════════════════════════════
const WORD    = 'A pixel boutique '
const PHRASE  = 'A pixel boutique'

// 🎨 Configuración de colores
const COLOR_MAIN = { r: 2, g: 45, b: 66 }
// Reemplaza estos valores RGB por tu color "urban-mist" real
const COLOR_MIST = { r: 153, g: 163, b: 164 } 

const PAUSE_MS   = 500
const SHRINK_MS  = 1500
const WAVE_MS    = 900
const FADE_IN_MS = 250
const FRICTION   = 0.75

const cfg = {
  fontSize:      8,     // Tamaño del texto del mosaico (según tu foto)
  fontWeight:    500,
  lineHeight:    1.25,  // Interlineado del mosaico (según tu foto)
  letterSpacing: 0,     // Letra (separación) del mosaico en 0
  alphaThresh:   8,
  bigFontPx:     60,    // Se sobreescribirá abajo
  cursorRadius:  150,
  cursorForce:   4,
  returnSpeed:   1,
  yOffsetDOM:    5,     // ¡El valor que te ha dejado la altura perfecta!
}

let FONT_FAMILY = 'Satoshi, Arial, sans-serif'

// ══════════════════════════════════════════════════════════════════
//  SVG MASK
// ══════════════════════════════════════════════════════════════════
const SVG_SRC = `<svg width="123" height="18" viewBox="0 0 123 18" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M109.082 11.0681C109.082 6.89596 111.757 4.14233 115.682 4.14233C119.607 4.14233 122.281 6.89596 122.281 11.0681C122.281 15.2403 119.601 17.9999 115.682 17.9999C111.757 17.9999 109.082 15.2403 109.082 11.0681ZM112.111 11.0681C112.111 13.7502 113.458 15.3535 115.688 15.3535C117.912 15.3535 119.252 13.7562 119.252 11.0681C119.252 8.38006 117.912 6.78868 115.688 6.78868C113.458 6.78868 112.111 8.38602 112.111 11.0681Z" fill="#022D42"/>
<path d="M103.625 11.3843V17.6426H100.607V4.50024H103.625V8.88102C104.172 6.16315 105.71 4.50024 108.409 4.50024H109.106V7.33136H108.109C104.695 7.33136 103.625 8.63069 103.625 11.3843Z" fill="#022D42"/>
<path d="M96.9155 13.2377H99.8246C99.1214 16.2058 96.7653 17.9999 93.6037 17.9999C89.6547 17.9999 86.998 15.2045 86.998 11.0562C86.998 6.9198 89.6247 4.14233 93.5316 4.14233C97.3843 4.14233 99.8847 6.84828 99.8847 11.0264C99.8847 11.3363 99.8727 11.6403 99.8367 11.98H89.9793C90.2317 14.1674 91.5961 15.4787 93.6818 15.4787C95.2626 15.4787 96.3265 14.7218 96.9155 13.2377ZM90.0214 9.83436H96.8975C96.5789 7.75424 95.4189 6.63967 93.5436 6.63967C91.6202 6.63967 90.352 7.8198 90.0214 9.83436Z" fill="#022D42"/>
<path d="M67.1078 4.14233C70.8644 4.14233 73.0162 5.85292 73.0162 8.59463H70.053C70.053 7.31318 69.0312 6.49067 67.1439 6.49067C65.4669 6.49067 64.3129 7.14033 64.3129 8.11185C64.3129 9.25025 65.8095 9.48866 67.2821 9.72707L68.1657 9.87012C70.3415 10.2218 73.461 10.7284 73.461 13.8933C73.461 16.5098 71.3092 17.9999 67.3723 17.9999C63.249 17.9999 61.1152 16.3668 61.1152 13.4403H64.0785C64.0785 14.8588 65.1303 15.6396 67.3542 15.6396C69.3317 15.6396 70.5038 15.0257 70.5038 13.9469C70.5038 12.6714 68.9711 12.3973 67.2641 12.1052L66.3745 11.9562C64.397 11.6105 61.3557 11.1039 61.3557 8.17145C61.3557 5.69795 63.5255 4.14233 67.1078 4.14233Z" fill="#022D42"/>
<path d="M76.7559 11.0681C76.7559 13.7502 78.1023 15.3535 80.3322 15.3535C82.2496 15.3535 83.2594 14.1496 83.5599 12.5701H86.5712C86.1685 15.6873 83.8784 17.9999 80.3262 17.9999C76.4073 17.9999 73.7266 15.2403 73.7266 11.0681C73.7266 6.89596 76.4013 4.14233 80.3262 4.14233C83.8784 4.14233 86.1685 6.44894 86.5712 9.57211H83.5599C83.2654 7.99265 82.2556 6.78868 80.3322 6.78868C78.1023 6.78868 76.7559 8.38602 76.7559 11.0681Z" fill="#022D42"/>
<path d="M60.5842 0V3.05164H57.4707V0H60.5842ZM60.5361 4.49998V17.6423H57.5188V4.49998H60.5361Z" fill="#022D42"/>
<path d="M53.8296 13.2377H56.7387C56.0355 16.2058 53.6793 17.9999 50.5177 17.9999C46.5688 17.9999 43.9121 15.2045 43.9121 11.0562C43.9121 6.9198 46.5387 4.14233 50.4456 4.14233C54.2984 4.14233 56.7988 6.84828 56.7988 11.0264C56.7988 11.3363 56.7868 11.6403 56.7507 11.98H46.8934C47.1458 14.1674 48.5102 15.4787 50.5959 15.4787C52.1767 15.4787 53.2405 14.7218 53.8296 13.2377ZM46.9354 9.83436H53.8115C53.493 7.75424 52.3329 6.63967 50.4576 6.63967C48.5343 6.63967 47.266 7.8198 46.9354 9.83436Z" fill="#022D42"/>
<path d="M37.2933 4.14233C41.05 4.14233 43.2017 5.85292 43.2017 8.59463H40.2385C40.2385 7.31318 39.2167 6.49067 37.3294 6.49067C35.6524 6.49067 34.4984 7.14033 34.4984 8.11185C34.4984 9.25025 35.995 9.48866 37.4676 9.72707L38.3512 9.87012C40.527 10.2218 43.6465 10.7284 43.6465 13.8933C43.6465 16.5098 41.4947 17.9999 37.5578 17.9999C33.4345 17.9999 31.3008 16.3668 31.3008 13.4403H34.264C34.264 14.8588 35.3159 15.6396 37.5398 15.6396C39.3317 15.6396 40.6893 15.0257 40.6893 13.9469C40.6893 12.6714 39.1566 12.3973 37.4496 12.1052L36.56 11.9562C34.5826 11.6105 31.5412 11.1039 31.5412 8.17145C31.5412 5.69795 33.711 4.14233 37.2933 4.14233Z" fill="#022D42"/>
<path d="M28.0366 13.2377H30.9457C30.2425 16.2058 27.8863 17.9999 24.7248 17.9999C20.7758 17.9999 18.1191 15.2045 18.1191 11.0562C18.1191 6.9198 20.7458 4.14233 24.6526 4.14233C28.5054 4.14233 31.0058 6.84828 31.0058 11.0264C31.0058 11.3363 30.9938 11.6403 30.9578 11.98H21.1004C21.3528 14.1674 22.7172 15.4787 24.8029 15.4787C26.3837 15.4787 27.4476 14.7218 28.0366 13.2377ZM21.1425 9.83436H28.0186C27.7 7.75424 26.54 6.63967 24.6647 6.63967C22.7413 6.63967 21.473 7.8198 21.1425 9.83436Z" fill="#022D42"/>
<path d="M12.6618 11.3843V17.6426H9.64453V4.50024H12.6618V8.88102C13.2088 6.16315 14.7475 4.50024 17.4463 4.50024H18.1435V7.33136H17.1457C13.7317 7.33136 12.6618 8.63069 12.6618 11.3843Z" fill="#022D42"/>
<path d="M8.84758 17.5412C7.77169 17.8452 6.82202 17.9942 5.99256 17.9942C3.20965 17.9942 1.73105 16.3313 1.73105 13.1127V6.93199H0V4.50021H1.73105V1.47241H4.74836V4.50021H8.84758V6.93199H4.74836V13.1187C4.74836 14.7459 5.33139 15.4849 6.65372 15.4849C7.17664 15.4849 7.88589 15.3717 8.84758 15.1213V17.5412Z" fill="#022D42"/>
</svg>`

// ══════════════════════════════════════════════════════════════════
//  CANVAS SETUP
// ══════════════════════════════════════════════════════════════════
const wrap   = document.getElementById('tsc-logo-wrap')
const canvas = document.getElementById('tsc-canvas')
const ctx    = canvas.getContext('2d')
const DPR    = Math.min(window.devicePixelRatio || 1, 3)

const DISPLAY_W = wrap.offsetWidth || Math.min(window.innerWidth * 0.9, 1000)
const RENDER_W  = Math.round(DISPLAY_W * DPR)
const RENDER_H  = Math.round(RENDER_W * (18 / 123))
canvas.width  = RENDER_W
canvas.height = RENDER_H

// ── SVG → máscara ────────────────────────────────────────────────
const mask = await new Promise((resolve, reject) => {
  const blob = new Blob([SVG_SRC], { type: 'image/svg+xml' })
  const url  = URL.createObjectURL(blob)
  const img  = new Image()
  img.onload = () => {
    const off = document.createElement('canvas')
    off.width = RENDER_W; off.height = RENDER_H
    const oc = off.getContext('2d')
    oc.drawImage(img, 0, 0, RENDER_W, RENDER_H)
    URL.revokeObjectURL(url)
    resolve(oc.getImageData(0, 0, RENDER_W, RENDER_H))
  }
  img.onerror = () => { URL.revokeObjectURL(url); reject() }
  img.src = url
})

function maskAlpha(x, y) {
  const px = Math.round(x), py = Math.round(y)
  if (px < 0 || px >= RENDER_W || py < 0 || py >= RENDER_H) return 0
  return mask.data[(py * RENDER_W + px) * 4 + 3]
}

// ══════════════════════════════════════════════════════════════════
//  LAYOUT
// ══════════════════════════════════════════════════════════════════
let particles   = []
let layoutCache = null

function computeLayout() {
  const fontSizePx = cfg.fontSize * DPR
  const font       = `${cfg.fontWeight} ${fontSizePx}px ${FONT_FAMILY}`
  const lineH      = Math.round(cfg.fontSize * cfg.lineHeight * DPR)
  const pixelMode  = cfg.fontSize <= 4
  const fixedCellW = cfg.fontSize * 0.62 * DPR

  ctx.font = font

  const rows     = Math.ceil(RENDER_H / lineH) + 2
  const estCols  = Math.ceil(RENDER_W / (cfg.fontSize * DPR * 0.55))
  const longText = WORD.repeat(Math.ceil((rows * estCols * 2) / WORD.length) + 4)

  const prepared  = prepareWithSegments(longText, font)
  const { lines } = layoutWithLines(prepared, RENDER_W, lineH)

  const lineCharX = lines.map(line => {
    const xs = [0]; let cum = 0
    for (let i = 0; i < line.text.length; i++) {
      cum += pixelMode
        ? fixedCellW
        : ctx.measureText(line.text[i]).width + cfg.letterSpacing * DPR
      xs.push(cum)
    }
    return xs
  })

  layoutCache = { lines, lineCharX, lineH, fontSizePx, font, pixelMode }
}

function findCenterPhrase() {
  const { lines, lineCharX, lineH, fontSizePx } = layoutCache
  let best = null, bestDist = Infinity

  for (let li = 0; li < lines.length; li++) {
    const text = lines[li].text
    const xs   = lineCharX[li]
    let from = 0
    
    while (true) {
      const idx = text.indexOf(PHRASE, from)
      if (idx === -1) break
      const oy = li * lineH
      
      // Calculamos el centro horizontal y vertical de esta frase en concreto
      const cx = (xs[idx] + xs[idx+PHRASE.length]) / 2
      const cy = oy + fontSizePx / 2
      
      // Medimos la distancia matemática de esta frase hasta el centro exacto del canvas
      const d  = Math.hypot(cx - RENDER_W/2, cy - RENDER_H/2)
      
      // Nos quedamos siempre con la que esté más cerca del centro, ignorando la máscara
      if (d < bestDist) {
        bestDist = d
        best = {
          x: xs[idx], y: oy,
          w: xs[idx+PHRASE.length] - xs[idx],
          h: lineH, rowIdx: li,
          charStart: idx, charEnd: idx+PHRASE.length
        }
      }
      from = idx + 1
    }
  }
  return best
}

function buildParticles(phraseRect) {
  const { lines, lineCharX, lineH, fontSizePx } = layoutCache
  const raw = []

  for (let li = 0; li < lines.length; li++) {
    const text = lines[li].text
    const xs   = lineCharX[li]
    const oy   = li * lineH
    for (let ci = 0; ci < text.length; ci++) {
      const x  = xs[ci], cw = xs[ci+1] - xs[ci]
      const sx = x + cw*0.5, sy = oy + fontSizePx*0.5
      const alpha = maskAlpha(sx, sy)
      const isCentral = !!(phraseRect && li === phraseRect.rowIdx
        && ci >= phraseRect.charStart && ci < phraseRect.charEnd)
      
      // Chequeo de color dinámico para la palabra "pixel"
      let isMistChar = false
      for (let s = Math.max(0, ci - 4); s <= ci; s++) {
        if (text.substring(s, s + 5) === 'pixel') {
          isMistChar = true; break;
        }
      }
      const particleColor = isMistChar ? COLOR_MIST : COLOR_MAIN;

      if (alpha >= cfg.alphaThresh) {
        raw.push({
          ox: x, oy, x, y: oy, vx: 0, vy: 0,
          ch: text[ci], cw, lineH, color: particleColor,
          cx: sx, rawA: alpha/255, isCentral
        })
      }
      if (x > RENDER_W + cfg.fontSize*2) break
    }
  }

  const phraseCx = phraseRect.x + phraseRect.w/2
  let maxDx = 0
  for (const p of raw) { const d=Math.abs(p.cx-phraseCx); if(d>maxDx) maxDx=d }
  for (const p of raw) {
    const dx = Math.abs(p.cx - phraseCx)
    p.revealDelay = p.isCentral ? -FADE_IN_MS : (maxDx>0 ? dx/maxDx : 0) * WAVE_MS
  }
  particles = raw
}

let bigPhrase = null
function setupBigPhrase(phraseRect, bigFontPx, startX, startY) {
  const smallFontPx = cfg.fontSize * DPR
  ctx.font = `${cfg.fontWeight} ${smallFontPx}px ${FONT_FAMILY}`
  const scale  = (bigFontPx * DPR) / smallFontPx
  
  bigPhrase = {
    startTx: startX,
    startTy: startY,
    startScale: scale,
    finalTx: phraseRect.x,
    finalTy: phraseRect.y,
    finalScale: 1,
  }
}

// ══════════════════════════════════════════════════════════════════
//  MOUSE
// ══════════════════════════════════════════════════════════════════
const mouse = { x: -9999, y: -9999, active: false }
window.addEventListener('mousemove', e => {
  const r  = canvas.getBoundingClientRect()
  const cx = (e.clientX - r.left) * (RENDER_W / r.width)
  const cy = (e.clientY - r.top)  * (RENDER_H / r.height)
  if (cx>=0 && cx<=RENDER_W && cy>=0 && cy<=RENDER_H) {
    mouse.x=cx; mouse.y=cy; mouse.active=true
  } else {
    mouse.active=false
  }
})
window.addEventListener('mouseleave', () => { mouse.active=false })

// ══════════════════════════════════════════════════════════════════
//  RENDER LOOP
// ══════════════════════════════════════════════════════════════════
const lerp         = (a, b, t) => a + (b-a)*t
const easeOutCubic = t => 1 - Math.pow(1-t, 3)
let animating=false, startTime=0

function tick(now) {
  if (!animating) return
  const elapsed   = now - startTime
  const shrinkEnd = PAUSE_MS + SHRINK_MS
  const shrinkT   = Math.max(0, Math.min(1, (elapsed - PAUSE_MS) / SHRINK_MS))

  ctx.clearRect(0, 0, RENDER_W, RENDER_H)
  ctx.font = `${cfg.fontWeight} ${cfg.fontSize*DPR}px ${FONT_FAMILY}`
  ctx.textBaseline = 'top'

  // ── Fase A: big phrase shrink (con 2 colores) ──────────────────
  if (shrinkT < 1) {
    const e  = easeOutCubic(shrinkT)
    const tx = lerp(bigPhrase.startTx, bigPhrase.finalTx, e)
    const ty = lerp(bigPhrase.startTy, bigPhrase.finalTy, e)
    const s  = lerp(bigPhrase.startScale, bigPhrase.finalScale, e)
    
    ctx.save()
    ctx.translate(tx, ty)
    ctx.scale(s, s)
    
    // 🔥 ESTA ES LA MAGIA: Aplicamos el espaciado de Webflow SÓLO a este texto
    ctx.letterSpacing = -0.96;

    const part1 = "A "
    const part2 = "pixel"
    const part3 = " boutique"
    
    ctx.fillStyle = `rgba(${COLOR_MAIN.r},${COLOR_MAIN.g},${COLOR_MAIN.b},1)`
    ctx.fillText(part1, 0, 0)
    let offset = ctx.measureText(part1).width
    
    ctx.fillStyle = `rgba(${COLOR_MIST.r},${COLOR_MIST.g},${COLOR_MIST.b},1)`
    ctx.fillText(part2, offset, 0)
    offset += ctx.measureText(part2).width
    
    ctx.fillStyle = `rgba(${COLOR_MAIN.r},${COLOR_MAIN.g},${COLOR_MAIN.b},1)`
    ctx.fillText(part3, offset, 0)
    
    ctx.restore()
  }

  // ── Fase B: mosaico con física + ola de fade ───────────────────
  if (elapsed >= shrinkEnd) {
    ctx.letterSpacing = "0px"
    const waveElapsed = elapsed - shrinkEnd
    const cursorR  = cfg.cursorRadius * DPR
    const cursorR2 = cursorR * cursorR
    const retSpeed = cfg.returnSpeed / 100

    for (const p of particles) {
      const localT = waveElapsed - p.revealDelay
      if (localT <= 0) continue
      const alpha = p.rawA * easeOutCubic(Math.min(localT/FADE_IN_MS, 1))

      if (mouse.active) {
        const dx=p.x-mouse.x, dy=p.y-mouse.y, d2=dx*dx+dy*dy
        if (d2 < cursorR2 && d2 > 0) {
          const d = Math.sqrt(d2)
          const f = ((cursorR-d)/cursorR)**2 * cfg.cursorForce * 0.5
          const a = Math.atan2(dy, dx)
          p.vx += Math.cos(a)*f
          p.vy += Math.sin(a)*f
        }
      }
      p.vx += (p.ox-p.x)*retSpeed; p.vy += (p.oy-p.y)*retSpeed
      p.vx *= FRICTION;             p.vy *= FRICTION
      p.x  += p.vx;                 p.y  += p.vy

      // Color dinámico almacenado en la partícula
      ctx.fillStyle = `rgba(${p.color.r},${p.color.g},${p.color.b},${alpha})`
      
      layoutCache.pixelMode
        ? ctx.fillRect(Math.round(p.x), Math.round(p.y), Math.ceil(p.cw), Math.ceil(p.lineH))
        : ctx.fillText(p.ch, p.x, p.y)
    }
  }

  requestAnimationFrame(tick)
}

// ══════════════════════════════════════════════════════════════════
//  API PÚBLICA
// ══════════════════════════════════════════════════════════════════

window.startLogoAnimation = async function() {
  const container = document.querySelector('.load_container')
  const headingEl = document.querySelector('.load_container .heading-style-h4')
  const tinyEl    = document.querySelector('.heading-style-h4.is-tiny')

  if (headingEl) {
    const csBig  = getComputedStyle(headingEl)
    
    // Leemos el tamaño del H1 de Webflow (tus 2rem, que serán unos 32px)
    cfg.bigFontPx = parseFloat(csBig.fontSize); 
    
    // NO tocamos cfg.letterSpacing, lo dejamos en 0 para el mosaico
  }

  await document.fonts.ready
  await Promise.all([
    document.fonts.load(`${cfg.fontWeight} ${cfg.fontSize}px Satoshi`),
    document.fonts.load(`${cfg.fontWeight} ${cfg.bigFontPx}px Satoshi`),
  ])

  // Capturar coordenadas dinámicamente del HTML
  let startX = 0
  let startY = 0
  
  if (headingEl) {
    const headingRect = headingEl.getBoundingClientRect()
    const canvasRect  = canvas.getBoundingClientRect()
    
    startX = (headingRect.left - canvasRect.left) * DPR
    startY = (headingRect.top - canvasRect.top + cfg.yOffsetDOM) * DPR
    
    // Ocultamos el DOM real justo en este milisegundo
    if (container) container.style.opacity = 0
  }

  animating=false; particles=[]; bigPhrase=null; layoutCache=null
  ctx.clearRect(0, 0, RENDER_W, RENDER_H)
  document.getElementById('tsc-logo-wrap').classList.remove('svg-mode')

  computeLayout()
  const phrase = findCenterPhrase()
  if (!phrase) { console.warn('[tsc] frase no encontrada'); return }

  buildParticles(phrase)
  setupBigPhrase(phrase, cfg.bigFontPx, startX, startY)
  
  startTime=performance.now(); animating=true
  requestAnimationFrame(tick)
}

window.showLogoSVG = function() {
  document.getElementById('tsc-logo-wrap').classList.add('svg-mode')
}
