/* American Pizza & Grill — 3D dish renderer for the menu.
   Each menu photo becomes a live 2.5D scene. A depth map is estimated from the photo
   itself (sharp subject = near, soft background = far, plus a focus prior), then a
   WebGL shader re-projects the photo from a moving camera, relights it, and adds steam,
   embers, bubbles or drifting motes. A dish arrives with an orange depth scan.
   One shared canvas moves between menu panels. Falls back to the plain photo. */
window.Dish3D = (() => {
  'use strict';

  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const mouse = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const smooth = (a, b, v) => { const t = clamp((v - a) / (b - a)); return t * t * (3 - 2 * t); };

  /* Atmosphere per dish: steam, plus one particle system (dir is screen space, y down) */
  const FX = {
    steam: { steam: 1, amt: 0 },
    grill: { steam: .7, amt: 1, dir: [.12, -1], spd: .3, col: [1, .5, .16], size: .8, glow: 1, ring: 0 },
    fresh: { steam: 0, amt: .8, dir: [.25, -1], spd: .045, col: [1, .96, .86], size: 1.5, glow: .35, ring: 0 },
    cocoa: { steam: .3, amt: .9, dir: [.08, 1], spd: .05, col: [1, .86, .66], size: 1.05, glow: .55, ring: 0 },
    fizz: { steam: 0, amt: 1, dir: [0, -1], spd: .13, col: [1, .98, .95], size: 1, glow: .55, ring: 1 }
  };

  const VERT = `attribute vec2 aPos; varying vec2 vUv;
    void main() { vUv = vec2(aPos.x * .5 + .5, .5 - aPos.y * .5); gl_Position = vec4(aPos, 0., 1.); }`;

  const FRAG = `precision highp float;
    varying vec2 vUv;
    uniform sampler2D uImg, uDep;
    uniform vec2 uRes, uImgSz, uDepSz, uFocus, uCam, uLight, uPDir;
    uniform float uZoom, uStr, uTime, uIn, uSteam, uPAmt, uPSpd, uPSize, uGlow, uRing, uBump;
    uniform vec3 uPCol, uBg;

    float hash(vec2 p) { vec3 p3 = fract(vec3(p.xyx) * .1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
    float noise(vec2 p) {
      vec2 i = floor(p), f = fract(p); vec2 u = f * f * (3. - 2. * f);
      return mix(mix(hash(i), hash(i + vec2(1., 0.)), u.x), mix(hash(i + vec2(0., 1.)), hash(i + vec2(1., 1.)), u.x), u.y);
    }
    float fbm(vec2 p) { float v = 0., a = .5; for (int i = 0; i < 4; i++) { v += a * noise(p); p = p * 2.03 + vec2(17.1, 9.2); a *= .5; } return v; }

    float dots(vec2 q, float sc, float seed, float size) {
      vec2 g = q * sc; vec2 id = floor(g); vec2 f = fract(g) - .5;
      float h = hash(id + seed);
      if (h > uPAmt * .5) return 0.;
      vec2 o = (vec2(hash(id + seed + 3.7), hash(id + seed + 9.1)) - .5) * .56;
      o += .14 * vec2(sin(uTime * (.5 + h) + h * 40.), cos(uTime * (.45 + h) + h * 23.));
      float d = length(f - o);
      float r = size * (.05 + .07 * hash(id + seed + 1.3));
      float tw = .5 + .5 * sin(uTime * (1.2 + 2.5 * h) + h * 60.);
      float core = smoothstep(r, r * .15, d);
      float ring = smoothstep(r, r * .8, d) * smoothstep(r * .5, r * .8, d);
      return mix(core, ring + core * .12, uRing) * (.35 + .65 * tw);
    }

    void main() {
      vec2 p = vUv;
      float ie = 1. - pow(1. - clamp(uIn, 0., 1.), 3.);
      float zoom = uZoom + (1. - ie) * .14;
      float str = uStr * (1. + (1. - ie) * 2.2);
      float fa = uRes.x / uRes.y, ia = uImgSz.x / uImgSz.y;

      /* cover-fit the photo around its focal point */
      vec2 s = (fa > ia ? vec2(1., ia / fa) : vec2(fa / ia, 1.)) / zoom;
      vec2 c = clamp(uFocus, s * .5, 1. - s * .5);
      vec2 uv0 = c + (p - .5) * s;

      /* re-project from the moving camera: near pixels shift more than far ones */
      vec2 off = vec2(uCam.x / fa, uCam.y) * str * s;
      vec2 uv = uv0;
      for (int i = 0; i < 5; i++) uv = uv0 + off * (texture2D(uDep, uv).r - .45);
      uv = clamp(uv, vec2(.001), vec2(.999));
      float d = texture2D(uDep, uv).r;
      vec3 col = texture2D(uImg, uv).rgb;

      /* relight with normals from fine detail + coarse depth */
      vec2 tx = 1. / uDepSz;
      float hl = texture2D(uDep, uv - vec2(tx.x, 0.)).g, hr = texture2D(uDep, uv + vec2(tx.x, 0.)).g;
      float hu = texture2D(uDep, uv - vec2(0., tx.y)).g, hd = texture2D(uDep, uv + vec2(0., tx.y)).g;
      float dl = texture2D(uDep, uv - vec2(tx.x * 2., 0.)).r, dr = texture2D(uDep, uv + vec2(tx.x * 2., 0.)).r;
      float du = texture2D(uDep, uv - vec2(0., tx.y * 2.)).r, dd = texture2D(uDep, uv + vec2(0., tx.y * 2.)).r;
      vec3 n = normalize(vec3((hl - hr) * uBump * .18 + (dl - dr) * uBump, (hu - hd) * uBump * .18 + (du - dd) * uBump, 1.));
      vec3 L = normalize(vec3(uLight, 1.1));
      float lum = dot(col, vec3(.299, .587, .114));
      col *= 1. + (dot(n, L) - L.z) * .55;
      float sp = pow(max(dot(n, normalize(L + vec3(0., 0., 1.))), 0.), 80.);
      col += sp * smoothstep(.45, .95, lum) * .16 * vec3(1., .94, .84);
      col *= mix(.84, 1.03, smoothstep(.05, .6, d));

      /* steam rising off the dish */
      if (uSteam > 0.) {
        vec2 q = vec2((p.x - .5) * fa, p.y) + uCam * str * 1.2;
        float t = uTime;
        vec2 w = vec2(fbm(q * 1.7 + vec2(0., t * .18)), fbm(q * 1.7 + vec2(4.3, t * .18)));
        float st = smoothstep(.52, .86, fbm(vec2(q.x * 2.6, q.y * 1.5 + t * .32) + w * 1.6));
        st *= smoothstep(.98, .3, p.y) * smoothstep(0., .3, p.y) * smoothstep(.62, .12, abs(p.x - .5));
        st *= uSteam * (.6 + .4 * ie);
        col = 1. - (1. - col) * (1. - st * .42 * vec3(1., .97, .93));
      }

      /* particles in three depth layers, nearer ones bigger and with more parallax */
      if (uPAmt > 0.) {
        vec2 q = vec2(p.x * fa, p.y);
        float acc = 0.;
        for (int i = 0; i < 3; i++) {
          float fi = float(i);
          vec2 qq = q - uPDir * uTime * uPSpd * (.7 + fi * .4) + uCam * str * (.6 + fi * .7) * 1.2;
          acc += dots(qq, 9. - fi * 2.6, fi * 17.3, uPSize * (1. + fi * .25)) * (.55 + fi * .25);
        }
        float fade = uPDir.y < 0. ? smoothstep(0., .75, p.y) : smoothstep(1., .25, p.y);
        col += uPCol * acc * mix(1., fade, .7) * ie * (.35 + uGlow * .65);
      }

      /* arrival: an orange depth scan sweeps from the nearest point to the back */
      float k = 1. - d + (noise(p * 38.) - .5) * .05;
      float front = ie * 1.3 - .18;
      float cl = fract(d * 14.);
      float topo = 1. - smoothstep(0., .09, min(cl, 1. - cl));
      vec3 orange = vec3(.91, .47, .23);
      float edge = 1. - smoothstep(0., .07, abs(k - front));
      col = mix(uBg + orange * topo * .28, col, smoothstep(front + .015, front - .05, k));
      col += orange * (edge * .55 + edge * topo * .9) * (1. - smoothstep(.82, 1., ie));

      vec2 v = p - .5;
      col *= 1. - dot(v, v) * .42;
      gl_FragColor = vec4(col, 1.);
    }`;

  let gl = null, cv = null, prog = null, failed = reduce;
  const U = {};
  const cpu = new Map();   // img path -> Promise<{ px, w, h, dep }>
  const gpu = new Map();   // img path -> { tex, dtx } (small LRU)
  let host = null, cur = null, token = 0;
  let inStart = 0, hold = true, readyAt = 0;
  const cam = { x: 0, y: 0 }, lgt = { x: -.45, y: -.55 }, ptr = { x: 0, y: 0, on: false };
  let hov = 0;
  const t0 = performance.now();

  /* ---------- depth estimation ---------- */
  function boxBlur(a, w, h, r) {
    const tmp = new Float32Array(a.length), out = new Float32Array(a.length), n = 2 * r + 1;
    for (let y = 0; y < h; y++) {
      const o = y * w;
      let s = 0;
      for (let x = -r; x <= r; x++) s += a[o + clamp(x, 0, w - 1)];
      for (let x = 0; x < w; x++) { tmp[o + x] = s / n; s += a[o + Math.min(w - 1, x + r + 1)] - a[o + Math.max(0, x - r)]; }
    }
    for (let x = 0; x < w; x++) {
      let s = 0;
      for (let y = -r; y <= r; y++) s += tmp[clamp(y, 0, h - 1) * w + x];
      for (let y = 0; y < h; y++) { out[y * w + x] = s / n; s += tmp[Math.min(h - 1, y + r + 1) * w + x] - tmp[Math.max(0, y - r) * w + x]; }
    }
    return out;
  }
  function blur(a, w, h, r, passes) { for (let i = 0; i < passes; i++) a = boxBlur(a, w, h, Math.max(1, r)); return a; }
  function normalize(a, lo, hi) {
    const s = Float32Array.from(a).sort();
    const a0 = s[Math.floor(lo * (s.length - 1))], a1 = s[Math.floor(hi * (s.length - 1))];
    const k = a1 - a0 > 1e-6 ? 1 / (a1 - a0) : 0;
    return a.map(v => clamp((v - a0) * k));
  }

  function depthMap(im, f) {
    const w = 200, h = Math.max(2, Math.round(w * im.naturalHeight / im.naturalWidth));
    const c = document.createElement('canvas');
    c.width = w; c.height = h;
    const g = c.getContext('2d', { willReadFrequently: true });
    g.drawImage(im, 0, 0, w, h);
    const px = g.getImageData(0, 0, w, h).data;   // throws if the photo can't be read (file://)
    const N = w * h, Y = new Float32Array(N);
    for (let i = 0; i < N; i++) Y[i] = (px[i * 4] * .299 + px[i * 4 + 1] * .587 + px[i * 4 + 2] * .114) / 255;

    let S = new Float32Array(N);   // local sharpness: in-focus subject reads as near
    for (let y = 1; y < h - 1; y++) for (let x = 1; x < w - 1; x++) {
      const i = y * w + x;
      S[i] = Math.abs(4 * Y[i] - Y[i - 1] - Y[i + 1] - Y[i - w] - Y[i + w]);
    }
    S = normalize(blur(S, w, h, Math.round(w * .045), 3), .02, .97);

    const [fx, fy] = f.focus || [.5, .5];
    const [ws, wc, wv] = f.depth || [.5, .35, .15];
    const rad = f.radius || .62, asp = w / h;
    let Dp = new Float32Array(N);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const i = y * w + x;
      const r = Math.hypot((x / w - fx) * asp, y / h - fy);
      Dp[i] = ws * S[i] + wc * (1 - smooth(.12, rad, r)) + wv * (y / h);
    }
    Dp = normalize(blur(Dp, w, h, Math.round(w * .02), 2), .01, .99);
    const detail = blur(Y, w, h, 1, 1);

    const dep = new Uint8Array(N * 4);
    for (let i = 0; i < N; i++) {
      dep[i * 4] = Dp[i] * 255;
      dep[i * 4 + 1] = detail[i] * 255;
      dep[i * 4 + 3] = 255;
    }
    return { dep, dw: w, dh: h };
  }

  /* ---------- loading ---------- */
  let mediaP = null;
  function media() {   // inlined copies of the menu photos, so 3D also works from file://
    if (location.protocol !== 'file:') return Promise.resolve({});
    if (!mediaP) mediaP = new Promise(res => {
      const s = document.createElement('script');
      s.src = 'js/menu-media.js';
      s.onload = () => res(window.APG_MEDIA || {});
      s.onerror = () => res({});
      document.head.appendChild(s);
    });
    return mediaP;
  }
  function loadImg(src) {
    return new Promise((res, rej) => { const im = new Image(); im.onload = () => res(im); im.onerror = rej; im.src = src; });
  }
  function prepare(f) {
    if (!cpu.has(f.img)) {
      cpu.set(f.img, (async () => {
        const m = await media();
        const im = await loadImg(m[f.img] || f.img);
        const max = mouse ? 1400 : 1024;
        const sc = Math.min(1, max / Math.max(im.naturalWidth, im.naturalHeight));
        const c = document.createElement('canvas');
        c.width = Math.round(im.naturalWidth * sc);
        c.height = Math.round(im.naturalHeight * sc);
        c.getContext('2d').drawImage(im, 0, 0, c.width, c.height);
        return { px: c, w: c.width, h: c.height, ...depthMap(im, f) };
      })());
    }
    return cpu.get(f.img);
  }

  /* ---------- WebGL ---------- */
  function shader(type, src) {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
    return s;
  }
  function setup() {
    if (gl || failed) return !!gl;
    try {
      cv = document.createElement('canvas');
      cv.className = 'feat__gl';
      cv.setAttribute('aria-hidden', 'true');
      gl = cv.getContext('webgl', { alpha: false, antialias: false, depth: false, powerPreference: 'high-performance' });
      if (!gl) throw new Error('no webgl');
      prog = gl.createProgram();
      gl.attachShader(prog, shader(gl.VERTEX_SHADER, VERT));
      gl.attachShader(prog, shader(gl.FRAGMENT_SHADER, FRAG));
      gl.linkProgram(prog);
      if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog));
      gl.useProgram(prog);
      const buf = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
      const loc = gl.getAttribLocation(prog, 'aPos');
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
      ['uImg', 'uDep', 'uRes', 'uImgSz', 'uDepSz', 'uFocus', 'uCam', 'uLight', 'uPDir', 'uZoom', 'uStr', 'uTime', 'uIn',
        'uSteam', 'uPAmt', 'uPSpd', 'uPSize', 'uGlow', 'uRing', 'uBump', 'uPCol', 'uBg']
        .forEach(n => { U[n] = gl.getUniformLocation(prog, n); });
      gl.uniform1i(U.uImg, 0);
      gl.uniform1i(U.uDep, 1);
      gl.uniform3f(U.uBg, .078, .067, .063);
      cv.addEventListener('webglcontextlost', e => {
        e.preventDefault();
        failed = true;
        if (host) host.classList.remove('is-3d');
      });
      if (mouse) addEventListener('pointermove', onPointer, { passive: true });
      return true;
    } catch (err) {
      console.warn('Dish3D disabled:', err.message);
      failed = true;
      gl = null;
      return false;
    }
  }
  function texture(src, w, h) {
    const t = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, t);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
    if (src instanceof Uint8Array) gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, src);
    else gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, src);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    return t;
  }
  function upload(key, e) {
    if (gpu.has(key)) {   // refresh LRU order
      const v = gpu.get(key);
      gpu.delete(key);
      gpu.set(key, v);
      return v;
    }
    const v = { tex: texture(e.px), dtx: texture(e.dep, e.dw, e.dh) };
    gpu.set(key, v);
    while (gpu.size > 4) {
      const [k, old] = gpu.entries().next().value;
      gl.deleteTexture(old.tex);
      gl.deleteTexture(old.dtx);
      gpu.delete(k);
    }
    return v;
  }

  function onPointer(e) {
    if (!host) return;
    const r = host.getBoundingClientRect();
    const nx = (e.clientX - r.left) / r.width * 2 - 1;
    const ny = (e.clientY - r.top) / r.height * 2 - 1;
    ptr.on = Math.abs(nx) < 1.35 && Math.abs(ny) < 1.2;
    ptr.x = clamp(nx, -1, 1);
    ptr.y = clamp(ny, -1, 1);
  }

  /* ---------- public ---------- */
  /* Mount the 3D view into a menu frame. The scan waits for play(). */
  function show(frame, f) {
    if (!f || !f.img || !setup()) return;
    const my = ++token;
    host = frame;
    cur = null;
    hold = true;
    prepare(f).then(e => {
      if (my !== token || failed) return;
      cur = { e, f, gl: upload(f.img, e), fx: Object.assign({ steam: 0, amt: 0, dir: [0, -1], spd: 0, col: [1, 1, 1], size: 1, glow: 0, ring: 0 }, FX[f.fx] || FX.steam) };
      readyAt = performance.now();
      frame.appendChild(cv);
      frame.classList.add('is-3d');
    }).catch(err => { console.warn('Dish3D fallback for', f.img, err && err.message); });
  }
  function play() { hold = false; inStart = performance.now(); }
  const active = () => !failed && !!gl;

  function preload(list) {
    if (!active()) return;
    let i = 0;
    const next = () => {
      if (i >= list.length) return;
      const f = list[i++];
      prepare(f).catch(() => {}).then(() => setTimeout(next, 120));
    };
    next();
  }

  function frame(now, dt) {
    if (!cur || !host || failed || !host.isConnected) return;
    const r = host.getBoundingClientRect();
    const vh = innerHeight;
    if (r.bottom < 0 || r.top > vh || r.width < 2) return;

    const dpr = Math.min(devicePixelRatio || 1, mouse ? 2 : 1.5);
    const W = Math.round(r.width * dpr), H = Math.round(r.height * dpr);
    if (cv.width !== W || cv.height !== H) { cv.width = W; cv.height = H; }

    const t = (now - t0) / 1000;
    const k = 1 - Math.pow(1 - .055, dt * 60);
    hov += ((ptr.on ? 1 : 0) - hov) * k;
    /* camera: slow idle orbit, scroll position, and the pointer when it's over the dish */
    const scroll = clamp(((r.top + r.height / 2) / vh - .5) * 1.5, -1, 1);
    const ix = Math.sin(t * .42) * .55, iy = Math.sin(t * .31 + 1.3) * .3 + scroll * .6;
    const tx = ix + (ptr.x - ix) * hov, ty = iy + (ptr.y - iy) * hov;
    cam.x += (tx - cam.x) * k;
    cam.y += (ty - cam.y) * k;
    const lx = Math.cos(t * .3) * .45 - .1, ly = -.5 + Math.sin(t * .3) * .2;
    lgt.x += ((lx + (ptr.x * .9 - lx) * hov) - lgt.x) * k;
    lgt.y += ((ly + (ptr.y * .9 - ly) * hov) - lgt.y) * k;

    const tilt = mouse ? 1 : .6;
    host.style.transform = `perspective(1200px) rotateY(${(cam.x * 4.5 * tilt).toFixed(2)}deg) rotateX(${(-cam.y * 3.5 * tilt).toFixed(2)}deg)`;
    host.style.setProperty('--tx', cam.x.toFixed(3));
    host.style.setProperty('--ty', cam.y.toFixed(3));

    const intro = hold ? 0 : clamp((now - Math.max(inStart, readyAt)) / 1900);
    const fx = cur.fx;
    gl.viewport(0, 0, W, H);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, cur.gl.tex);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, cur.gl.dtx);
    gl.uniform2f(U.uRes, W, H);
    gl.uniform2f(U.uImgSz, cur.e.w, cur.e.h);
    gl.uniform2f(U.uDepSz, cur.e.dw, cur.e.dh);
    gl.uniform2fv(U.uFocus, cur.f.focus || [.5, .5]);
    gl.uniform2f(U.uCam, cam.x, cam.y);
    gl.uniform2f(U.uLight, lgt.x, lgt.y);
    gl.uniform2fv(U.uPDir, fx.dir);
    gl.uniform1f(U.uZoom, 1.07);
    gl.uniform1f(U.uStr, cur.f.str || .06);
    gl.uniform1f(U.uTime, t % 1000);
    gl.uniform1f(U.uIn, intro);
    gl.uniform1f(U.uSteam, fx.steam);
    gl.uniform1f(U.uPAmt, fx.amt);
    gl.uniform1f(U.uPSpd, fx.spd);
    gl.uniform1f(U.uPSize, fx.size);
    gl.uniform1f(U.uGlow, fx.glow);
    gl.uniform1f(U.uRing, fx.ring);
    gl.uniform1f(U.uBump, 7);
    gl.uniform3fv(U.uPCol, fx.col);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  return { show, play, frame, preload, active };
})();
