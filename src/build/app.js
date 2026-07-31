/* Yurt 8 demo application v3. Three views: landing, detailed summary, demo tool. Offline. */
(function () {
  'use strict';
  var THREE = window.THREE;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var MONEY = {{MONEY_JSON}};

  /* palette */
  var C = {
    orange: 0xf9552f, orangeDeep: 0xe0561f, gold: 0xf8c953, berry: 0x780e36, berryBright: 0xd6336c,
    steel: 0x0f3a5c, navy: 0x16384c, blue: 0x3987e5, blueLight: 0x7fc8e0, skylt: 0x9cc4e0,
    violet: 0x9085e9, trayGray: 0x9aa8b5, concrete: 0x8a9088, water: 0x2e6fb5,
    frame: 0x1b2b44, panelDark: 0x101c30
  };

  /* ============================================================
     ROUTER: '', '#summary', '#demo'
     ============================================================ */
  var views = {
    landing: document.getElementById('view-landing'),
    summary: document.getElementById('view-summary'),
    demo: document.getElementById('view-demo'),
  };
  var demoStarted = false, demoActive = false;
  function setView(name) {
    demoActive = name === 'demo';
    Object.keys(views).forEach(function (k) { views[k].classList.toggle('active', k === name); });
    document.body.style.overflow = demoActive ? 'hidden' : '';
    if (demoActive && !demoStarted) { demoStarted = true; initDemo(); }
    if (demoActive && window.__demoResize) window.__demoResize();
    if (name !== 'demo' && window.__tutStop) window.__tutStop();
    if (name === 'summary') window.scrollTo(0, 0);
  }
  function route() {
    setView(location.hash === '#demo' ? 'demo' : location.hash === '#summary' ? 'summary' : 'landing');
  }
  window.addEventListener('hashchange', route);
  document.getElementById('btn-back').addEventListener('click', function () { location.hash = ''; });
  document.getElementById('btn-back-sum').addEventListener('click', function () { location.hash = ''; });
  /* NOTE: the initial route() call happens at the very END of this file.
     Landing directly on #demo (a reload, or the PDF's demo link) must not
     initialize the demo before the site data and GL helpers below exist. */

  /* ============================================================
     GL HELPERS
     ============================================================ */
  function webglOK() {
    try {
      var c = document.createElement('canvas');
      return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl')));
    } catch (e) { return false; }
  }
  var canRender = !!THREE && webglOK();

  function makeRenderer(canvas) {
    var r = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
    r.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    return r;
  }
  function fitRenderer(renderer, camera, el) {
    var w = el.clientWidth, h = el.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  function addOrbit(el, state) {
    var down = false, px = 0, py = 0, pinch = 0;
    el.addEventListener('pointerdown', function (e) { down = true; px = e.clientX; py = e.clientY; });
    window.addEventListener('pointermove', function (e) {
      if (!down) return;
      state.theta -= (e.clientX - px) * 0.005;
      state.phi = Math.max(0.12, Math.min(1.4, state.phi + (e.clientY - py) * 0.003));
      px = e.clientX; py = e.clientY;
      state.user = true;
    });
    window.addEventListener('pointerup', function () { down = false; });
    el.addEventListener('wheel', function (e) {
      e.preventDefault();
      state.radius = Math.max(state.rMin, Math.min(state.rMax, state.radius * (1 + e.deltaY * 0.0011)));
      state.user = true;
    }, { passive: false });
    el.addEventListener('touchstart', function (e) {
      if (e.touches.length === 2) pinch = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
    }, { passive: true });
    el.addEventListener('touchmove', function (e) {
      if (e.touches.length === 2 && pinch) {
        var d = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
        state.radius = Math.max(state.rMin, Math.min(state.rMax, state.radius * (pinch / d)));
        pinch = d; state.user = true;
      }
    }, { passive: true });
    el.style.touchAction = 'none';
  }
  function camFromOrbit(camera, o, target) {
    camera.position.set(
      target.x + Math.sin(o.theta) * Math.sin(o.phi) * o.radius,
      target.y + Math.cos(o.phi) * o.radius * 0.62,
      target.z + Math.cos(o.theta) * Math.sin(o.phi) * o.radius
    );
    camera.lookAt(target.x, target.y, target.z);
  }
  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }
  function labelSprite(text, color, scale) {
    var cv = document.createElement('canvas');
    cv.width = 160; cv.height = 64;
    var ctx = cv.getContext('2d');
    ctx.fillStyle = 'rgba(8,16,32,0.85)';
    roundRect(ctx, 6, 10, 148, 44, 10); ctx.fill();
    ctx.strokeStyle = color; ctx.lineWidth = 3;
    roundRect(ctx, 6, 10, 148, 44, 10); ctx.stroke();
    ctx.fillStyle = '#f0f3f8';
    ctx.font = 'bold 24px system-ui, sans-serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(text, 80, 33);
    var tex = new THREE.CanvasTexture(cv);
    var sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false }));
    var s = scale || 1;
    sp.scale.set(0.9 * s, 0.36 * s, 1);
    return sp;
  }
  function perfTexture(density, tint) {
    var cv = document.createElement('canvas');
    cv.width = 64; cv.height = 128;
    var ctx = cv.getContext('2d');
    ctx.fillStyle = tint; ctx.fillRect(0, 0, 64, 128);
    ctx.fillStyle = 'rgba(0,0,0,0.55)';
    for (var y = 4; y < 124; y += density) for (var x = 4; x < 60; x += density) {
      ctx.beginPath(); ctx.arc(x, y, density * 0.26, 0, 6.3); ctx.fill();
    }
    var tex = new THREE.CanvasTexture(cv);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    return tex;
  }
  function ribTexture(tint, ribColor) {
    var cv = document.createElement('canvas');
    cv.width = 64; cv.height = 64;
    var ctx = cv.getContext('2d');
    ctx.fillStyle = tint; ctx.fillRect(0, 0, 64, 64);
    ctx.fillStyle = ribColor;
    for (var x = 0; x < 64; x += 16) ctx.fillRect(x, 0, 3, 64);
    var tex = new THREE.CanvasTexture(cv);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    return tex;
  }
  function onVisible(el, cb) {
    if (!('IntersectionObserver' in window)) { cb(true); return; }
    new IntersectionObserver(function (es) { es.forEach(function (e) { cb(e.isIntersecting); }); }, { threshold: 0.05 }).observe(el);
  }
  function mat(color, opts) {
    var o = opts || {};
    return new THREE.MeshStandardMaterial({
      color: color, roughness: o.rough != null ? o.rough : 0.55, metalness: o.metal != null ? o.metal : 0.35,
      transparent: !!o.opacity, opacity: o.opacity || 1,
      emissive: o.emissive || 0x000000, emissiveIntensity: o.ei || 0,
      side: o.double ? THREE.DoubleSide : THREE.FrontSide
    });
  }
  function box(w, h, d, material) { return new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material); }
  function tube(pts, r, material, seg) {
    return new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), seg || 32, r, 8, false), material);
  }

  /* ============================================================
     LANDING HERO: brighter, walls + columns, palette pop
     ============================================================ */
  if (canRender) (function heroScene() {
    var canvas = document.getElementById('hero-canvas');
    var hero = document.getElementById('hero');
    var renderer = makeRenderer(canvas);
    var scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x0a0716, 34, 95);
    var camera = new THREE.PerspectiveCamera(42, 2, 0.1, 200);
    var orbit = { theta: 0.7, phi: 0.42, radius: 33, rMin: 16, rMax: 60, user: false };
    addOrbit(canvas, orbit);

    scene.add(new THREE.AmbientLight(0xbcc8de, 1.0));
    var key = new THREE.DirectionalLight(0xfff2e0, 1.7);
    key.position.set(14, 22, 8); scene.add(key);
    var warm = new THREE.PointLight(C.orange, 90, 55); warm.position.set(2, 6, 0); scene.add(warm);
    var cool = new THREE.PointLight(C.blue, 45, 45); cool.position.set(-10, 5, 8); scene.add(cool);
    var goldPt = new THREE.PointLight(C.gold, 40, 40); goldPt.position.set(10, 4, -6); scene.add(goldPt);

    var grid = new THREE.GridHelper(120, 60, 0x1d3a5c, 0x101a2e);
    grid.position.y = -0.01; scene.add(grid);
    var slab = box(27, 0.3, 17, mat(0x0d1526, { rough: 0.85, metal: 0.1 }));
    slab.position.y = -0.15; scene.add(slab);

    var buildGroups = [];
    function addTimed(group, t0, t1) { scene.add(group); buildGroups.push({ g: group, t0: t0, t1: t1 }); }

    /* structural columns + beams: thicker, brighter steel */
    var frame = new THREE.Group();
    var colMat = mat(0x2a4468, { rough: 0.42, metal: 0.7 });
    for (var cx = -12; cx <= 12; cx += 6) for (var cz = -7; cz <= 7; cz += 7) {
      var col = box(0.5, 7, 0.5, colMat);
      col.position.set(cx, 3.5, cz); frame.add(col);
      var cap = box(0.8, 0.18, 0.8, mat(C.gold, { emissive: C.gold, ei: 0.25, metal: 0.6 }));
      cap.position.set(cx, 7.05, cz); frame.add(cap);
    }
    for (var bz = -7; bz <= 7; bz += 7) {
      var beam = box(24.7, 0.35, 0.35, colMat); beam.position.set(0, 7, bz); frame.add(beam);
    }
    for (var bx = -12; bx <= 12; bx += 6) {
      var beam2 = box(0.35, 0.35, 14.3, colMat); beam2.position.set(bx, 7, 0); frame.add(beam2);
    }
    addTimed(frame, 0.04, 0.2);

    /* perimeter walls with ribbed panels, one long side left open to see inside */
    var wallGroup = new THREE.Group();
    var wallMat = new THREE.MeshStandardMaterial({ map: ribTexture('#12233c', '#1d3a5c'), roughness: 0.6, metalness: 0.35 });
    var wallBack = box(25.6, 6.6, 0.25, wallMat); wallBack.position.set(0, 3.3, -7.4);
    wallBack.material.map.repeat.set(8, 1); wallGroup.add(wallBack);
    var wallL = box(0.25, 6.6, 14.6, wallMat.clone()); wallL.position.set(-12.7, 3.3, 0);
    wallL.material.map = ribTexture('#12233c', '#1d3a5c'); wallL.material.map.repeat.set(5, 1); wallGroup.add(wallL);
    var wallR = box(0.25, 6.6, 14.6, wallL.material); wallR.position.set(12.7, 3.3, 0); wallGroup.add(wallR);
    /* front side: low glass-like parapet so the hall stays visible */
    var parapet = box(25.6, 1.6, 0.2, new THREE.MeshStandardMaterial({ color: 0x16324f, transparent: true, opacity: 0.5, roughness: 0.2, metalness: 0.4 }));
    parapet.position.set(0, 0.8, 7.4); wallGroup.add(parapet);
    addTimed(wallGroup, 0.16, 0.32);

    /* racks: bright palette faces */
    var rackGeo = new THREE.BoxGeometry(0.9, 2.1, 1.1);
    var rackMat = mat(0x223655, { rough: 0.45, metal: 0.4 });
    var faceGeo = new THREE.PlaneGeometry(0.78, 1.9);
    var rows = 4, per = 16, rackCount = rows * per;
    var racks = new THREE.InstancedMesh(rackGeo, rackMat, rackCount);
    var faces = new THREE.InstancedMesh(faceGeo, new THREE.MeshBasicMaterial({ color: 0xffffff }), rackCount);
    var m4 = new THREE.Matrix4();
    var faceColor = new THREE.Color();
    var idx = 0;
    var palette = [0xf9552f, 0xf8c953, 0x3987e5, 0xd6336c, 0x7fc8e0];
    for (var r = 0; r < rows; r++) for (var i = 0; i < per; i++) {
      var x = -9 + i * 1.2, z = -5.25 + r * 3.5;
      m4.makeTranslation(x, 1.05, z); racks.setMatrixAt(idx, m4);
      m4.makeTranslation(x, 1.05, z + 0.56); faces.setMatrixAt(idx, m4);
      faceColor.setHex(palette[Math.floor(Math.random() * palette.length)]);
      faceColor.offsetHSL(0, 0, (Math.random() - 0.5) * 0.12);
      faces.setColorAt(idx, faceColor);
      idx++;
    }
    var rackGroup = new THREE.Group();
    rackGroup.add(racks); rackGroup.add(faces);
    addTimed(rackGroup, 0.3, 0.62);

    /* CRAC unit rows in berry */
    var cracGroup = new THREE.Group();
    var cracMat = mat(0x3a1a30, { rough: 0.4, metal: 0.5, emissive: C.berryBright, ei: 0.28 });
    for (var ci = 0; ci < 5; ci++) {
      var cA = box(1.6, 2.5, 1.0, cracMat); cA.position.set(-10 + ci * 5, 1.25, -6.6); cracGroup.add(cA);
      var cB = box(1.6, 2.5, 1.0, cracMat); cB.position.set(-10 + ci * 5, 1.25, 6.6); cracGroup.add(cB);
    }
    addTimed(cracGroup, 0.58, 0.74);

    /* overhead gold trays + blue pipes */
    var trayGroup = new THREE.Group();
    var trayMat = mat(C.gold, { rough: 0.5, metal: 0.5, emissive: C.gold, ei: 0.35 });
    for (var tr = 0; tr < rows; tr++) {
      var tray = box(19.6, 0.12, 0.5, trayMat);
      tray.position.set(0, 3.15, -5.25 + tr * 3.5); trayGroup.add(tray);
    }
    var pipe1 = tube([new THREE.Vector3(-10, 3.7, 0), new THREE.Vector3(10, 3.7, 0)], 0.1, mat(C.blue, { emissive: C.blue, ei: 0.5 }), 8);
    var pipe2 = tube([new THREE.Vector3(-10, 3.95, 0.35), new THREE.Vector3(10, 3.95, 0.35)], 0.08, mat(C.blueLight, { emissive: C.blueLight, ei: 0.5 }), 8);
    trayGroup.add(pipe1); trayGroup.add(pipe2);
    addTimed(trayGroup, 0.7, 0.88);

    var CYCLE = reduceMotion ? 0 : 22000;
    var t0 = performance.now() - CYCLE * 0.55;
    var visible = true;
    onVisible(hero, function (v) { visible = v; });

    function heroTick(now) {
      requestAnimationFrame(heroTick);
      if (!visible || demoActive) return;
      fitRenderer(renderer, camera, hero);
      var t = reduceMotion ? 1 : ((now - t0) % CYCLE) / CYCLE;
      var bt = Math.min(t / 0.92, 1);
      buildGroups.forEach(function (bg) {
        var k = Math.max(0, Math.min(1, (bt - bg.t0) / (bg.t1 - bg.t0)));
        var e = 1 - Math.pow(1 - k, 3);
        bg.g.visible = k > 0;
        bg.g.scale.y = Math.max(0.001, e);
      });
      if (!orbit.user && !reduceMotion) orbit.theta += 0.0011;
      camFromOrbit(camera, orbit, { x: 0, y: 2.2, z: 0 });
      renderer.render(scene, camera);
    }
    requestAnimationFrame(heroTick);
  })();
  else {
    var heroCv = document.getElementById('hero-canvas');
    if (heroCv) heroCv.style.display = 'none';
  }

  /* ============================================================
     DEMO DATA
     ============================================================ */
  var TRACKER_STAGES = ['Site Selection', 'Preconstruction', 'Design', 'Construction', 'Procurement', 'Fit-out', 'Operations'];
  var FITOUT_INDEX = 5;

  var DISCIPLINES = [
    { key: 'clash', name: 'Clash Detection', icon: '<rect x="4" y="4" width="10" height="10" rx="2"/><rect x="10" y="10" width="10" height="10" rx="2"/><path d="M12 2v2M2 12h2"/>', text: 'Find the pipe hitting the beam on a screen, months before it costs real money in the field. Clashes surface the day they are drawn, priced against the change order they would have become.' },
    { key: 'bim', name: 'BIM', icon: '<path d="M12 2 21 7v10l-9 5-9-5V7z"/><path d="M12 12 21 7M12 12v10M12 12 3 7"/>', text: 'Models that carry real information, not just pretty geometry. Every element knows what it is, what it costs, and what it connects to.' },
    { key: 'info', name: 'Information Mgmt', icon: '<path d="M4 4h9l7 7v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"/><path d="M13 4v7h7"/>', text: 'The right file, the right version, the right person. Every time. Four folders, one gate per move, nothing lost.' },
    { key: 'model', name: 'Model Mgmt', icon: '<path d="M2 7l10-5 10 5-10 5z"/><path d="M2 12l10 5 10-5"/><path d="M2 17l10 5 10-5"/>', text: 'Live model health: who touched what, what changed, what broke. The demo you are looking at reads the same feed.' },
    { key: 'user', name: 'User Mgmt', icon: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6"/><circle cx="17.5" cy="9" r="2.5"/><path d="M15.5 14.5c3 0 6 2 6 5.5"/>', text: 'Internal people see everything they need. External vendors see exactly what they need and nothing else. Simple permissions, no fights.' },
    { key: 'pm', name: 'Project Mgmt', icon: '<path d="M3 5h12M3 10h18M3 15h8M3 20h14"/>', text: 'Scope, schedule, and risk in one place, in plain language. The tracker at the top of this screen is the status meeting.' },
    { key: 'delivery', name: 'Project Delivery', icon: '<path d="M4 21V4"/><path d="M4 5h13l-2.5 3.5L17 12H4"/>', text: 'The handoffs between design, construction, and operations, made boring on purpose. Operations gets a working digital asset on day one, not a box of PDFs.' },
  ];

  var VENDORS = {
    vertiv: { name: 'Vertiv VR', w: 0.6, d: 1.2, h: 2.0, u: 48, gap: 0.5, frame: 0x1e2c40, door: '#26364e', perf: 6 },
    rittal: { name: 'Rittal TS IT', w: 0.8, d: 1.2, h: 2.2, u: 42, gap: 0.42, frame: 0x31435f, door: '#3c5070', perf: 8 },
  };
  var GPUS = {
    h100: { name: 'NVIDIA HGX H100', color: 0x3fd08a },
    gb200: { name: 'NVIDIA GB200 NVL', color: 0x9085e9 },
  };
  var TURBINES = { francis: 'Francis runner', kaplan: 'Kaplan runner' };
  var HYDRO_OEMS = { voith: { name: 'Voith', color: 0xf8c953 }, andritz: { name: 'Andritz', color: 0x9cc4e0 } };

  var MEP_LEGEND_DC = [
    { c: '#d6336c', t: 'Power feed A (busway + drops)' },
    { c: '#9085e9', t: 'Power feed B (busway + drops)' },
    { c: '#3987e5', t: 'Chilled water supply' },
    { c: '#7fc8e0', t: 'Chilled water return' },
    { c: '#9aa8b5', t: 'Cable tray' },
    { c: '#f9552f', t: 'Hot aisle containment' },
    { c: '#4a90d9', t: 'Cold aisle' },
  ];
  var MEP_LEGEND_HYDRO = [
    { c: '#3987e5', t: 'Water path (penstock, draft tube)' },
    { c: '#f8c953', t: 'Generation (turbine + generator)' },
    { c: '#d6336c', t: 'Transmission (transformer, switchyard)' },
    { c: '#8a9088', t: 'Civil structure' },
  ];

  var SITES = [
    {
      id: 'vega', name: 'Vega Campus', loc: 'Texas Panhandle', type: 'dc', tag: 'Operating',
      desc: 'Compute campus, liquid cooling, racks to 180 kW',
      finance: [
        ['IT capacity', '205 MW'],
        ['Colocation revenue', '$110M to $120M / yr'],
        ['Build cost', '~$400K / MW'],
        ['Greenfield to energized', 'Under 12 months'],
        ['Status', 'Operating since June 2025'],
      ],
      clashes: [
        { open: true, text: 'CRAH return duct clips cable tray, row 2 east. Re-route drawn, awaiting sign off.', cost: '$48K change order avoided if closed this week' },
        { open: false, text: 'Busway B drop landed inside containment door swing, cabinets C07 to C09.', cost: 'Closed on screen. $31K and 6 field days saved' },
        { open: false, text: 'CHW supply hanger conflict with structural brace, gridline 4.', cost: 'Closed in design. $12K saved' },
      ],
      extra: [
        ['Open RFIs', '4 (median 2.1 days)'],
        ['Model version', 'v418, synced 22 min ago'],
        ['Sensors reporting', '1,912 of 1,920'],
      ],
      note: 'Clash feed and operations data are illustrative examples. Financial figures are public.',
    },
    {
      id: 'beacon', name: 'Beacon Point', loc: 'Nueces County, Texas', type: 'dc2', tag: 'Under construction',
      desc: 'AI campus to NVIDIA DSX reference design',
      finance: [
        ['First lease', '352 MW IT, $9.8B base term'],
        ['Full campus', '704 MW, $19.6B contracted'],
        ['Construction cost', '$9M to $11M / MW'],
        ['DSX redesign gain', '+57% IT capacity, same land'],
        ['First hall delivery', 'Q2 2027'],
      ],
      clashes: [
        { open: true, text: 'Liquid cooling manifold crosses busway A at hall entry, rows 1 to 3. Two routings generated, one clears.', cost: '$210K exposure if it reaches the field' },
        { open: true, text: 'GB200 rack depth exceeds containment envelope on vendor swap. Containment re-size generated in 4 seconds.', cost: 'Zero cost if accepted in design' },
        { open: false, text: 'Tray stack over cold aisle blocked maintenance clearance.', cost: 'Closed on screen. $54K saved' },
      ],
      extra: [
        ['Open RFIs', '11 (median 3.4 days)'],
        ['Model version', 'v122, synced 4 min ago'],
        ['Long lead watch', 'Switchgear 41 weeks'],
      ],
      note: 'Clash feed and schedule data are illustrative examples. Financial figures are public.',
    },
    {
      id: 'hydro', name: 'Hydro Station', loc: 'Portfolio concept', type: 'hydro', tag: 'Concept',
      desc: 'Power first: same loop, pointed at generation',
      finance: [
        ['Nameplate', '3 units x 54 MW (162 MW)'],
        ['Gross head', '88 ft'],
        ['Concept capex', '$2.4M to $3.1M / MW'],
        ['Refurb window', 'Unit 2, 14 weeks'],
        ['Status', 'Concept example'],
      ],
      clashes: [
        { open: true, text: 'Penstock N+1 tie-in conflicts with existing thrust block, unit 3. Generated route clears by 14 inches.', cost: '$95K exposure if poured as drawn' },
        { open: false, text: 'Transformer fire wall footing clipped buried tailrace conduit.', cost: 'Closed in design. $38K saved' },
        { open: false, text: 'Crane hook path blocked by new HVAC duct in turbine hall.', cost: 'Closed on screen. 3 outage days protected' },
      ],
      extra: [
        ['Outage risk', '$310K per protected day'],
        ['Model version', 'v37, synced 1 hr ago'],
        ['Sensors reporting', '402 of 406'],
      ],
      note: 'This site is a concept example: every number here is illustrative, showing the same loop on a generation asset.',
    },
  ];

  var demoState = {
    site: 'vega',
    vendor: 'vertiv', gpu: 'h100', n2: false,
    turbine: 'francis', oem: 'voith', n1: false,
  };

  /* ============================================================
     DEMO UI
     ============================================================ */
  function initDemo() {
    buildMiniTracker();
    buildRibbon();
    buildHud();
    buildSiteRail();
    selectSite('vega');
    if (canRender) {
      initDemoGL();
      makeThumbnails();
    } else {
      document.getElementById('demo-fallback').style.display = 'flex';
      document.getElementById('demo-canvas').style.display = 'none';
    }
    initTutorial();
  }

  function buildMiniTracker() {
    var bar = document.getElementById('mini-tracker');
    TRACKER_STAGES.forEach(function (name, i) {
      var d = document.createElement('div');
      d.className = 'mt-stage' + (i < FITOUT_INDEX ? ' done' : i === FITOUT_INDEX ? ' active' : '');
      d.innerHTML = '<span class="mt-dot">' + (i + 1) + '</span><span class="mt-label">' + name + '</span>';
      bar.appendChild(d);
    });
    document.getElementById('mini-fill').style.width = 'calc((100% - 8%) * ' + (FITOUT_INDEX / 6).toFixed(3) + ')';
  }

  function buildRibbon() {
    var ribbon = document.getElementById('demo-ribbon');
    var sheet = document.getElementById('rib-sheet');
    var openKey = null;
    DISCIPLINES.forEach(function (d) {
      var b = document.createElement('button');
      b.className = 'rib-btn';
      b.type = 'button';
      b.setAttribute('aria-label', d.name);
      b.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true">' + d.icon + '</svg><span>' + d.name + '</span>';
      b.addEventListener('click', function (e) {
        e.stopPropagation();
        if (openKey === d.key) { sheet.classList.remove('open'); openKey = null; setActive(null); return; }
        openKey = d.key;
        sheet.innerHTML = '<h4>' + d.name + '</h4><p>' + d.text + '</p>';
        sheet.classList.add('open');
        setActive(b);
      });
      ribbon.insertBefore(b, sheet);
    });
    function setActive(btn) {
      ribbon.querySelectorAll('.rib-btn').forEach(function (x) { x.classList.toggle('active', x === btn); });
    }
    document.addEventListener('click', function (e) {
      if (!ribbon.contains(e.target)) { sheet.classList.remove('open'); openKey = null; setActive(null); }
    });
  }

  /* drawers + popovers behind burger buttons */
  var panels = {};
  function buildHud() {
    panels = {
      sites: { btn: document.getElementById('hud-sites'), el: document.getElementById('drawer-sites') },
      data: { btn: document.getElementById('hud-data'), el: document.getElementById('drawer-data') },
      legend: { btn: document.getElementById('hud-legend'), el: document.getElementById('pop-legend') },
      generate: { btn: document.getElementById('hud-generate'), el: document.getElementById('pop-generate') },
    };
    Object.keys(panels).forEach(function (k) {
      panels[k].btn.addEventListener('click', function () { togglePanel(k); });
    });
  }
  function togglePanel(key, force) {
    Object.keys(panels).forEach(function (k) {
      var on = k === key ? (force != null ? force : !panels[k].el.classList.contains('open')) : false;
      panels[k].el.classList.toggle('open', on);
      panels[k].btn.classList.toggle('open', on);
    });
  }

  function buildSiteRail() {
    var rail = document.getElementById('drawer-sites');
    SITES.forEach(function (s) {
      var b = document.createElement('button');
      b.className = 'site-btn';
      b.type = 'button';
      b.id = 'site-' + s.id;
      b.innerHTML = '<img id="thumb-' + s.id + '" alt="" aria-hidden="true"><span class="sb-txt"><b>' + s.name + '</b><span>' + s.loc + ' · ' + s.desc + '</span><span class="tag">' + s.tag + '</span></span>';
      b.addEventListener('click', function () { selectSite(s.id); });
      rail.appendChild(b);
    });
  }

  function siteById(id) { return SITES.filter(function (s) { return s.id === id; })[0]; }

  function selectSite(id) {
    demoState.site = id;
    var site = siteById(id);
    document.querySelectorAll('.site-btn').forEach(function (b) { b.classList.toggle('active', b.id === 'site-' + id); });
    document.getElementById('site-title').innerHTML = '<b>' + site.name + '</b><span>' + site.loc + '</span>';
    var legend = site.type === 'hydro' ? MEP_LEGEND_HYDRO : MEP_LEGEND_DC;
    document.getElementById('pop-legend').innerHTML =
      '<div class="lt">' + (site.type === 'hydro' ? 'Systems' : 'MEP color code') + '</div>' +
      legend.map(function (l) { return '<div class="row"><i style="background:' + l.c + '"></i>' + l.t + '</div>'; }).join('');
    renderActions(site);
    renderDataPanel(site);
    if (window.__setScene) window.__setScene(id);
    refreshDemoJson('site: ' + site.name);
  }

  function renderActions(site) {
    var el = document.getElementById('gen-btns');
    var html;
    if (site.type === 'hydro') {
      html =
        '<button class="act-btn" id="act-1" type="button"><b>Swap turbine runner</b><span>Francis to Kaplan and back. Draft tube and shaft re-check automatically.</span></button>' +
        '<button class="act-btn" id="act-2" type="button"><b>Swap generator OEM</b><span>Voith to Andritz. Numbering of every unit and breaker preserved.</span></button>' +
        '<button class="act-btn" id="act-3" type="button"><b>Toggle N+1 penstock</b><span>Add the redundant water path. Thrust blocks re-check.</span></button>';
    } else {
      html =
        '<button class="act-btn" id="act-1" type="button"><b>Swap cabinet vendor</b><span>Vertiv VR to Rittal TS IT. Containment and busway re-fit, aisles hold clearance.</span></button>' +
        '<button class="act-btn" id="act-2" type="button"><b>Swap the GPUs</b><span>HGX H100 to GB200 NVL. Numbering of every CPU, switch, and GPU preserved.</span></button>' +
        '<button class="act-btn" id="act-3" type="button"><b>Toggle 2N cooling</b><span>Re-wire redundant power to the cooling units. A and B paths, live.</span></button>';
    }
    el.innerHTML = html;
    var a1 = document.getElementById('act-1'), a2 = document.getElementById('act-2'), a3 = document.getElementById('act-3');
    function arm(b) { b.classList.add('armed'); setTimeout(function () { b.classList.remove('armed'); }, 700); }
    if (site.type === 'hydro') {
      a1.onclick = function () { demoState.turbine = demoState.turbine === 'francis' ? 'kaplan' : 'francis'; applyScene(); refreshDemoJson('runner swap: ' + TURBINES[demoState.turbine] + ', draft tube re-checked'); arm(a1); };
      a2.onclick = function () { demoState.oem = demoState.oem === 'voith' ? 'andritz' : 'voith'; applyScene(); refreshDemoJson('generator swap: ' + HYDRO_OEMS[demoState.oem].name + ', unit numbering preserved'); arm(a2); };
      a3.onclick = function () { demoState.n1 = !demoState.n1; applyScene(); refreshDemoJson(demoState.n1 ? 'N+1 penstock on: redundant water path added' : 'N+1 penstock off'); arm(a3); };
    } else {
      a1.onclick = function () { demoState.vendor = demoState.vendor === 'vertiv' ? 'rittal' : 'vertiv'; applyScene(); refreshDemoJson('vendor swap: ' + VENDORS[demoState.vendor].name + ', containment and busway re-sized'); arm(a1); };
      a2.onclick = function () { demoState.gpu = demoState.gpu === 'h100' ? 'gb200' : 'h100'; applyScene(); refreshDemoJson('gpu swap: ' + GPUS[demoState.gpu].name + ', all asset numbering preserved'); arm(a2); };
      a3.onclick = function () { demoState.n2 = !demoState.n2; applyScene(); refreshDemoJson(demoState.n2 ? 'redundant cooling on: B path wired' : 'redundant cooling off: single path'); arm(a3); };
    }
  }

  function renderDataPanel(site) {
    var el = document.getElementById('drawer-data');
    var html = '<div class="rail-title">' + site.name + '</div>';
    html += '<div class="dd-block"><div class="dd-title">Financials</div>' +
      site.finance.map(function (f) { return '<div class="dd-stat"><span>' + f[0] + '</span><b>' + f[1] + '</b></div>'; }).join('') + '</div>';
    html += '<div class="dd-block"><div class="dd-title">Clash feed (sample)</div>' +
      site.clashes.map(function (c) {
        return '<div class="clash' + (c.open ? '' : ' res') + '"><span class="st ' + (c.open ? 'open' : '') + '">' + (c.open ? 'Open' : 'Resolved') + '</span><p>' + c.text + '</p><div class="cost">' + c.cost + '</div></div>';
      }).join('') + '</div>';
    html += '<div class="dd-block"><div class="dd-title">Live data</div>' +
      site.extra.map(function (f) { return '<div class="dd-stat"><span>' + f[0] + '</span><b>' + f[1] + '</b></div>'; }).join('') + '</div>';
    html += '<div class="dd-block"><div class="dd-title">Shared schema, written by your clicks</div><div id="demo-json">loading...</div></div>';
    html += '<p class="small" style="line-height:1.5">' + site.note + '</p>';
    el.innerHTML = html;
  }

  function refreshDemoJson(changed) {
    var el = document.getElementById('demo-json');
    if (!el) return;
    var site = siteById(demoState.site);
    var obj;
    if (site.type === 'hydro') {
      obj = {
        asset: 'HYD-U2-GEN',
        coordinates: [88.4, 12.0, -6.5],
        parameters: {
          oem: HYDRO_OEMS[demoState.oem].name,
          runner: TURBINES[demoState.turbine],
          rating_mw: 54,
          numbering: 'U1..U3, breakers 52-1..52-6 preserved'
        },
        relationships: [
          { to: 'HYD-PEN-2', type: 'fed_by', distance_ft: 141.0 },
          demoState.n1 ? { to: 'HYD-PEN-4', type: 'fed_by_redundant', distance_ft: 168.5 } : null
        ].filter(Boolean),
        pattern: demoState.n1 ? 'n-plus-1-water-path' : 'n-water-path',
        stage: 'fit-out', written_by: 'generate',
        last_change: changed || 'none yet'
      };
    } else {
      var v = VENDORS[demoState.vendor];
      obj = {
        asset: site.id === 'beacon' ? 'CAB-BP1-POD2' : 'CAB-VG3-POD1',
        coordinates: [412.5, 96.0, 14.2],
        parameters: {
          make: v.name,
          cabinet_w_mm: Math.round(v.w * 1000),
          cabinet_h_u: v.u,
          gpu: GPUS[demoState.gpu].name,
          numbering: 'C01..C12 preserved'
        },
        relationships: [
          { to: 'CRAH-A-01', type: 'cooled_by', distance_ft: 18.5 },
          demoState.n2 ? { to: 'CRAH-B-01', type: 'cooled_by_redundant', distance_ft: 21.0 } : null
        ].filter(Boolean),
        pattern: demoState.n2 ? '2N-cooling-loop' : 'N-cooling-loop',
        stage: 'fit-out', written_by: 'generate',
        last_change: changed || 'none yet'
      };
    }
    el.textContent = JSON.stringify(obj, null, 2);
  }

  /* ============================================================
     DEMO 3D
     ============================================================ */
  var applyScene = function () { refreshDemoJson(); };
  var getSceneRef = null;

  function initDemoGL() {
    var stage = document.getElementById('demo-stage');
    var canvas = document.getElementById('demo-canvas');
    var renderer = makeRenderer(canvas);
    var camera = new THREE.PerspectiveCamera(45, 2, 0.1, 300);
    var orbit = { theta: 0.85, phi: 0.62, radius: 17, rMin: 6, rMax: 60, user: false };
    addOrbit(canvas, orbit);

    var scenes = {};
    var current = null;

    function baseScene(bg) {
      var scene = new THREE.Scene();
      scene.background = new THREE.Color(bg || 0x070c18);
      scene.add(new THREE.AmbientLight(0xb8c4da, 0.85));
      var key = new THREE.DirectionalLight(0xffffff, 1.15); key.position.set(8, 14, 5); scene.add(key);
      var fill = new THREE.PointLight(C.gold, 20, 45); fill.position.set(-6, 7, -6); scene.add(fill);
      var fill2 = new THREE.PointLight(C.blue, 14, 40); fill2.position.set(6, 5, 6); scene.add(fill2);
      return scene;
    }

    function makeCabinet(num, podColor) {
      var g = new THREE.Group();
      var parts = { plinth: null, frame: null, door: null, sides: [], top: null, shelves: [], modules: [], pduA: null, pduB: null, dropA: null, dropB: null, sprite: null };
      parts.plinth = box(1, 1, 1, mat(0x0d1626, { rough: 0.7 })); g.add(parts.plinth);
      parts.frame = box(1, 1, 1, mat(0x1e2c40, { rough: 0.5, metal: 0.5 })); g.add(parts.frame);
      var doorMat = new THREE.MeshStandardMaterial({ map: perfTexture(6, '#26364e'), roughness: 0.6, metalness: 0.4 });
      parts.door = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), doorMat); g.add(parts.door);
      for (var s = 0; s < 2; s++) {
        var side = box(1, 1, 1, mat(0x16223a, { rough: 0.6 })); g.add(side); parts.sides.push(side);
      }
      parts.top = box(1, 1, 1, mat(0x27395a, { rough: 0.5, metal: 0.5 })); g.add(parts.top);
      for (var u = 0; u < 4; u++) {
        var shelf = box(1, 1, 1, mat(0x0b1322, { rough: 0.7 })); g.add(shelf); parts.shelves.push(shelf);
        var rowMods = [];
        for (var m = 0; m < 4; m++) {
          var mod = box(1, 1, 1, mat(0x3fd08a, { rough: 0.35, metal: 0.2, emissive: 0x3fd08a, ei: 0.55 }));
          g.add(mod); rowMods.push(mod);
        }
        parts.modules.push(rowMods);
      }
      parts.pduA = box(1, 1, 1, mat(C.berryBright, { emissive: C.berryBright, ei: 0.4 })); g.add(parts.pduA);
      parts.pduB = box(1, 1, 1, mat(C.violet, { emissive: C.violet, ei: 0.4 })); g.add(parts.pduB);
      parts.dropA = box(1, 1, 1, mat(C.berryBright, { emissive: C.berryBright, ei: 0.5 })); g.add(parts.dropA);
      parts.dropB = box(1, 1, 1, mat(C.violet, { emissive: C.violet, ei: 0.5 })); g.add(parts.dropB);
      parts.sprite = labelSprite(num, podColor, 0.8); g.add(parts.sprite);
      g.userData = parts;
      return g;
    }

    function layoutCabinet(g, v, gpu, n2, buswayY) {
      var p = g.userData;
      var w = v.w, h = v.h, d = v.d;
      p.plinth.scale.set(w, 0.09, d); p.plinth.position.y = 0.045;
      p.frame.scale.set(w, h, d); p.frame.position.y = 0.09 + h / 2;
      p.frame.material.color.setHex(v.frame);
      p.door.scale.set(w * 0.94, h * 0.94, 1); p.door.position.set(0, 0.09 + h / 2, d / 2 + 0.006);
      p.door.material.map = perfTexture(v.perf, v.door);
      p.door.material.needsUpdate = true;
      p.sides.forEach(function (s, i) {
        s.scale.set(0.02, h * 0.96, d * 0.96);
        s.position.set((i ? 1 : -1) * (w / 2 + 0.011), 0.09 + h / 2, 0);
      });
      p.top.scale.set(w * 0.9, 0.06, d * 0.5); p.top.position.set(0, 0.09 + h + 0.03, -d * 0.15);
      var gpuCol = GPUS[gpu].color;
      p.shelves.forEach(function (s, u) {
        s.scale.set(w * 0.82, 0.05, d * 0.7);
        var y = 0.32 + u * h * 0.2;
        s.position.set(0, y, d * 0.08);
        p.modules[u].forEach(function (m, k) {
          m.scale.set(w * 0.17, h * 0.1, 0.05);
          m.position.set(-w * 0.31 + k * w * 0.207, y + h * 0.075, d / 2 + 0.035);
          m.material.color.setHex(gpuCol); m.material.emissive.setHex(gpuCol);
        });
      });
      p.pduA.scale.set(0.05, h * 0.85, 0.05); p.pduA.position.set(-w * 0.32, 0.09 + h / 2, -d / 2 + 0.05);
      p.pduB.scale.set(0.05, h * 0.85, 0.05); p.pduB.position.set(w * 0.32, 0.09 + h / 2, -d / 2 + 0.05);
      p.pduB.visible = n2;
      /* busway drops from overhead feed down to cabinet top */
      var dropH = Math.max(0.15, buswayY - (h + 0.12));
      p.dropA.scale.set(0.045, dropH, 0.045); p.dropA.position.set(-w * 0.25, h + 0.12 + dropH / 2, -d * 0.2);
      p.dropB.scale.set(0.045, dropH, 0.045); p.dropB.position.set(w * 0.25, h + 0.12 + dropH / 2, -d * 0.2);
      p.dropB.visible = n2;
      p.sprite.position.set(0, h + 0.55, 0);
    }

    /* -------- data center scene: hall + pods + aisles + connected MEP -------- */
    function buildDC(cfg) {
      var scene = baseScene();
      var hallW = cfg.span * 2 + 9, hallD = (cfg.rowsZ[cfg.rowsZ.length - 1] - cfg.rowsZ[0]) + 10;
      var grid = new THREE.GridHelper(60, 60, 0x1d3a5c, 0x0e1728); scene.add(grid);

      /* hall slab, walls, columns */
      var slab = box(hallW, 0.18, hallD, mat(0x0c1424, { rough: 0.85, metal: 0.1 }));
      slab.position.y = -0.09; scene.add(slab);
      var wallMat = new THREE.MeshStandardMaterial({ map: ribTexture('#0f1e33', '#1a3350'), roughness: 0.6, metalness: 0.3, transparent: true, opacity: 0.92 });
      var wBack = box(hallW, 4.6, 0.2, wallMat); wBack.position.set(0, 2.3, -hallD / 2);
      wBack.material.map.repeat.set(10, 1); scene.add(wBack);
      var wallMatSide = wallMat.clone(); wallMatSide.map = ribTexture('#0f1e33', '#1a3350'); wallMatSide.map.repeat.set(6, 1);
      var wL = box(0.2, 4.6, hallD, wallMatSide); wL.position.set(-hallW / 2, 2.3, 0); scene.add(wL);
      var wR = box(0.2, 4.6, hallD, wallMatSide); wR.position.set(hallW / 2, 2.3, 0); scene.add(wR);
      var paraF = box(hallW, 1.1, 0.15, new THREE.MeshStandardMaterial({ color: 0x14294a, transparent: true, opacity: 0.45, roughness: 0.25, metalness: 0.4 }));
      paraF.position.set(0, 0.55, hallD / 2); scene.add(paraF);
      var colMat = mat(0x27436a, { rough: 0.45, metal: 0.65 });
      for (var kx = -1; kx <= 1; kx++) for (var kz = 0; kz < 2; kz++) {
        var colm = box(0.35, 4.6, 0.35, colMat);
        colm.position.set(kx * (hallW / 2 - 1.6), 2.3, (kz ? 1 : -1) * (hallD / 2 - 1.4));
        scene.add(colm);
      }
      /* roof edge beams */
      var rb1 = box(hallW, 0.25, 0.25, colMat); rb1.position.set(0, 4.6, -hallD / 2 + 0.1); scene.add(rb1);
      var rb2 = box(hallW, 0.25, 0.25, colMat); rb2.position.set(0, 4.6, hallD / 2 - 0.1); scene.add(rb2);

      var rowsZ = cfg.rowsZ, N = cfg.perRow;
      var podSize = 3; /* cabinets per pod */
      var cabs = [];
      rowsZ.forEach(function (rz, ri) {
        for (var i = 0; i < N; i++) {
          var num = 'C' + ((ri * N + i + 1) < 10 ? '0' : '') + (ri * N + i + 1);
          var podColor = (Math.floor(i / podSize) % 2 === 0) ? '#f8c953' : '#9cc4e0';
          var cab = makeCabinet(num, podColor);
          scene.add(cab);
          cabs.push({ g: cab, row: ri, i: i });
        }
      });

      /* pod portal frames + labels (per pod, per row) */
      var podFrames = [];
      var nPods = Math.ceil(N / podSize);
      rowsZ.forEach(function (rz, ri) {
        for (var pp = 0; pp < nPods; pp++) {
          var pf = new THREE.Group();
          var fm = mat(C.gold, { rough: 0.5, metal: 0.5, emissive: C.gold, ei: 0.18 });
          var l1 = box(1, 1, 1, fm), l2 = box(1, 1, 1, fm), l3 = box(1, 1, 1, fm);
          pf.add(l1); pf.add(l2); pf.add(l3);
          var sp = labelSprite('POD ' + (ri * nPods + pp + 1), '#f8c953', 0.7);
          pf.add(sp);
          scene.add(pf);
          podFrames.push({ g: pf, posts: [l1, l2], header: l3, sprite: sp, row: ri, pod: pp });
        }
      });

      /* hot aisle containment (orange) between row pairs + cold aisle strips (blue) outside */
      var hotVols = [];
      for (var cp = 0; cp < rowsZ.length - 1; cp++) {
        var hv = box(1, 1, 1, new THREE.MeshStandardMaterial({ color: C.orange, transparent: true, opacity: 0.16, roughness: 0.5 }));
        scene.add(hv); hotVols.push(hv);
      }
      var coldStrips = [];
      rowsZ.forEach(function (rz, ri) {
        var cs = box(1, 0.04, 1, new THREE.MeshStandardMaterial({ color: 0x4a90d9, transparent: true, opacity: 0.30, roughness: 0.4 }));
        scene.add(cs); coldStrips.push(cs);
      });

      /* overhead systems, continuous to the walls */
      function runX(y, z, r, color, ei) {
        var m = tube([new THREE.Vector3(-hallW / 2 + 0.3, y, z), new THREE.Vector3(hallW / 2 - 0.3, y, z)], r, mat(color, { emissive: color, ei: ei != null ? ei : 0.45, rough: 0.35 }), 8);
        scene.add(m); return m;
      }
      var sys = {
        chwS: runX(3.5, 0, 0.075, C.blue),
        chwR: runX(3.5, 0.32, 0.06, C.blueLight),
        buswayA: box(hallW - 0.6, 0.12, 0.2, mat(C.berryBright, { emissive: C.berryBright, ei: 0.4 })),
        buswayB: box(hallW - 0.6, 0.12, 0.2, mat(C.violet, { emissive: C.violet, ei: 0.4 })),
      };
      scene.add(sys.buswayA); scene.add(sys.buswayB);
      /* cable trays: full width + vertical wall drops at both ends */
      rowsZ.forEach(function (rz) {
        var tm = mat(C.trayGray, { rough: 0.4, metal: 0.7 });
        var rail1 = box(hallW - 0.6, 0.04, 0.04, tm), rail2 = box(hallW - 0.6, 0.04, 0.04, tm);
        rail1.position.set(0, 3.0, rz - 0.2); rail2.position.set(0, 3.0, rz + 0.2);
        scene.add(rail1); scene.add(rail2);
        for (var x = -hallW / 2 + 0.7; x < hallW / 2 - 0.4; x += 0.55) {
          var rung = box(0.04, 0.03, 0.44, tm);
          rung.position.set(x, 3.0, rz); scene.add(rung);
        }
        [-1, 1].forEach(function (side) {
          var drop = box(0.04, 3.0, 0.44, tm);
          drop.position.set(side * (hallW / 2 - 0.32), 1.5, rz);
          scene.add(drop);
        });
      });

      /* CRAH units with CHW connections */
      function crah(x, z, col) {
        var g = new THREE.Group();
        var body = box(1.3, 2.2, 0.9, mat(0x1a2b46, { rough: 0.4, metal: 0.5, emissive: col, ei: 0.15 }));
        body.position.y = 1.1; g.add(body);
        var grille = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 1.6), new THREE.MeshStandardMaterial({ map: perfTexture(5, '#132036'), roughness: 0.7 }));
        grille.position.set(0, 1.15, 0.46); g.add(grille);
        g.position.set(x, 0, z);
        scene.add(g); return g;
      }
      var crahA = [], crahB = [], chwDrops = [];
      [rowsZ[0], rowsZ[rowsZ.length - 1]].forEach(function (rz) {
        crahA.push(crah(-cfg.span - 1.6, rz, C.berryBright));
        crahB.push(crah(cfg.span + 1.6, rz, C.violet));
        /* CHW elbow drops from mains to each CRAH */
        var dA = tube([new THREE.Vector3(-cfg.span - 1.6, 3.5, 0), new THREE.Vector3(-cfg.span - 1.6, 3.5, rz * 0.6), new THREE.Vector3(-cfg.span - 1.6, 2.3, rz)], 0.06, mat(C.blue, { emissive: C.blue, ei: 0.5 }), 16);
        var dB = tube([new THREE.Vector3(cfg.span + 1.6, 3.5, 0.32), new THREE.Vector3(cfg.span + 1.6, 3.5, rz * 0.6), new THREE.Vector3(cfg.span + 1.6, 2.3, rz)], 0.05, mat(C.blueLight, { emissive: C.blueLight, ei: 0.5 }), 16);
        scene.add(dA); scene.add(dB);
        chwDrops.push({ a: dA, b: dB });
      });

      var manifolds = new THREE.Group();
      if (cfg.liquid) {
        rowsZ.forEach(function (rz) {
          manifolds.add(tube([new THREE.Vector3(-cfg.span, 0.35, rz + 0.78), new THREE.Vector3(cfg.span, 0.35, rz + 0.78)], 0.05, mat(C.blue, { emissive: C.blue, ei: 0.5 }), 8));
          manifolds.add(tube([new THREE.Vector3(-cfg.span, 0.2, rz + 0.78), new THREE.Vector3(cfg.span, 0.2, rz + 0.78)], 0.04, mat(C.blueLight, { emissive: C.blueLight, ei: 0.5 }), 8));
        });
        scene.add(manifolds);
      }

      function layout(vendorKey, gpuKey, n2) {
        var v = VENDORS[vendorKey];
        var pitch = v.w + v.gap;
        var span = (N - 1) * pitch;
        var buswayY = v.h + 1.0;
        cabs.forEach(function (c) {
          c.g.position.set(-span / 2 + c.i * pitch, 0, rowsZ[c.row]);
          layoutCabinet(c.g, v, gpuKey, n2, buswayY);
        });
        podFrames.forEach(function (pf) {
          var startI = pf.pod * podSize;
          var endI = Math.min(startI + podSize - 1, N - 1);
          var x0 = -span / 2 + startI * pitch - v.w / 2 - 0.12;
          var x1 = -span / 2 + endI * pitch + v.w / 2 + 0.12;
          var z = rowsZ[pf.row];
          pf.posts[0].scale.set(0.09, v.h + 0.5, 0.09); pf.posts[0].position.set(x0, (v.h + 0.5) / 2, z);
          pf.posts[1].scale.set(0.09, v.h + 0.5, 0.09); pf.posts[1].position.set(x1, (v.h + 0.5) / 2, z);
          pf.header.scale.set(x1 - x0, 0.09, 0.09); pf.header.position.set((x0 + x1) / 2, v.h + 0.5, z);
          pf.sprite.position.set((x0 + x1) / 2, v.h + 0.95, z);
        });
        hotVols.forEach(function (hv, k) {
          hv.scale.set(span + v.w + 0.8, 0.72, Math.abs(rowsZ[k + 1] - rowsZ[k]) - v.d - 0.15);
          hv.position.set(0, v.h + 0.78, (rowsZ[k] + rowsZ[k + 1]) / 2);
        });
        coldStrips.forEach(function (cs, ri) {
          /* cold aisles exist only on the outer faces; inner aisles are contained hot aisles */
          var outer = ri === 0 || ri === rowsZ.length - 1;
          cs.visible = outer;
          if (!outer) return;
          cs.scale.set(span + v.w + 1.2, 1, 0.9);
          var z = rowsZ[ri] + (ri === 0 ? -1 : 1) * (v.d / 2 + 0.6);
          cs.position.set(0, 0.03, z);
        });
        sys.buswayA.position.set(0, buswayY, rowsZ[0] - 0.4);
        sys.buswayB.position.set(0, buswayY, rowsZ[rowsZ.length - 1] + 0.4);
        sys.buswayB.visible = n2;
        crahB.forEach(function (u) { u.visible = n2; });
        chwDrops.forEach(function (d) { d.b.visible = n2; });
      }

      return {
        scene: scene, layout: layout,
        target: { x: 0, y: 1.2, z: 0 }, radius: cfg.radius,
        theta: 0.85, phi: 0.62,
        apply: function (st) { layout(st.vendor, st.gpu, st.n2); },
        tick: function () {},
      };
    }

    /* -------- hydro scene with hall columns + walls -------- */
    function buildHydro() {
      var scene = baseScene(0x070d15);
      var grid = new THREE.GridHelper(60, 30, 0x1d3a5c, 0x0e1728); grid.position.y = -2.05; scene.add(grid);

      var conc = mat(C.concrete, { rough: 0.85, metal: 0.05 });
      var concDark = mat(0x6d736c, { rough: 0.85, metal: 0.05 });

      var upper = box(22, 0.25, 16, new THREE.MeshStandardMaterial({ color: C.water, transparent: true, opacity: 0.75, roughness: 0.15, metalness: 0.1 }));
      upper.position.set(-14, 5.1, 0); scene.add(upper);
      var dam = new THREE.Group();
      for (var i = 0; i < 9; i++) {
        var seg = box(2.6, 9 - Math.abs(i - 4) * 0.35, 1.8, conc);
        var ang = (i - 4) * 0.09;
        seg.position.set(-3.2 + Math.cos(ang) * 0.9 - 0.9, (9 - Math.abs(i - 4) * 0.35) / 2 - 2, (i - 4) * 1.75);
        seg.rotation.y = ang;
        dam.add(seg);
      }
      scene.add(dam);
      var bankMat = mat(0x24363c, { rough: 0.95, metal: 0 });
      var bank1 = box(26, 8, 6, bankMat); bank1.position.set(-10, 2, -11); scene.add(bank1);
      var bank2 = box(26, 8, 6, bankMat); bank2.position.set(-10, 2, 11); scene.add(bank2);

      var penMat = mat(C.blue, { emissive: C.blue, ei: 0.25, rough: 0.35, metal: 0.5 });
      var pens = [];
      function penstock(z, ghost) {
        var m = tube([
          new THREE.Vector3(-6.5, 4.4, z),
          new THREE.Vector3(-2.5, 1.4, z),
          new THREE.Vector3(1.2, -0.9, z),
          new THREE.Vector3(4.0, -1.4, z),
        ], 0.55, ghost ? mat(C.blue, { emissive: C.blue, ei: 0.5, rough: 0.3, opacity: 0.9 }) : penMat, 40);
        scene.add(m); return m;
      }
      pens.push(penstock(-4), penstock(0), penstock(4));
      var penN1 = penstock(7.2, true); penN1.visible = false;

      /* powerhouse: slab, columns, low ribbed walls, translucent upper */
      var slab2 = box(10.5, 0.4, 16, concDark); slab2.position.set(7.5, -2.1, 0); scene.add(slab2);
      var phWallMat = new THREE.MeshStandardMaterial({ map: ribTexture('#10202f', '#1c3a50'), roughness: 0.6, metalness: 0.3 });
      var phBack = box(0.22, 2.4, 15.6, phWallMat); phBack.position.set(12.4, -0.7, 0); phBack.material.map.repeat.set(6, 1); scene.add(phBack);
      var phFront = box(0.22, 2.4, 15.6, phWallMat.clone()); phFront.material.map = ribTexture('#10202f', '#1c3a50'); phFront.material.map.repeat.set(6, 1);
      phFront.position.set(2.6, -0.7, 0); scene.add(phFront);
      var house = box(10, 6.4, 15.5, new THREE.MeshStandardMaterial({ color: 0x122336, transparent: true, opacity: 0.14, roughness: 0.3, side: THREE.DoubleSide }));
      house.position.set(7.5, 1.2, 0); scene.add(house);
      var hColMat = mat(0x27436a, { rough: 0.45, metal: 0.65 });
      for (var hc = -1; hc <= 1; hc++) {
        [-7.2, 7.2].forEach(function (z) {
          var colm = box(0.3, 6.2, 0.3, hColMat);
          colm.position.set(7.5 + hc * 4.4, 1.1, z);
          scene.add(colm);
        });
      }
      var crane = box(9.6, 0.25, 0.5, mat(C.berryBright, { emissive: C.berryBright, ei: 0.2 })); crane.position.set(7.5, 4.1, 0); scene.add(crane);

      var units = [];
      [-4, 0, 4].forEach(function (z, ui) {
        var u = new THREE.Group();
        var volute = new THREE.Mesh(new THREE.TorusGeometry(0.95, 0.34, 10, 24), mat(0xd8ab35, { rough: 0.4, metal: 0.5 }));
        volute.rotation.x = Math.PI / 2; volute.position.y = -0.9; u.add(volute);
        var runnerF = new THREE.Mesh(new THREE.ConeGeometry(0.45, 0.8, 12), mat(C.gold, { emissive: C.gold, ei: 0.4 }));
        runnerF.position.y = -0.55; u.add(runnerF);
        var runnerK = new THREE.Group();
        for (var b = 0; b < 4; b++) {
          var blade = box(0.72, 0.06, 0.26, mat(C.gold, { emissive: C.gold, ei: 0.4 }));
          blade.rotation.y = b * Math.PI / 2; blade.rotation.z = 0.5;
          blade.position.y = -0.55; runnerK.add(blade);
        }
        u.add(runnerK);
        var shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 2.2, 10), mat(0xb9c4c9, { metal: 0.8, rough: 0.3 }));
        shaft.position.y = 0.4; u.add(shaft);
        var gen = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 0.85, 1.1, 20), mat(C.gold, { rough: 0.4, metal: 0.5 }));
        gen.position.y = 1.6; u.add(gen);
        var cap = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.25, 12), mat(0xfce3a0, { emissive: 0xfce3a0, ei: 0.5 }));
        cap.position.y = 2.3; u.add(cap);
        var spinner = box(0.55, 0.06, 0.08, mat(0x0b1322)); spinner.position.y = 2.45; u.add(spinner);
        var draft = tube([new THREE.Vector3(0.4, -1.5, 0), new THREE.Vector3(2.6, -1.9, 0)], 0.42, penMat, 12);
        u.add(draft);
        var sp = labelSprite('U' + (ui + 1), '#f8c953', 0.8); sp.position.set(0, 3.1, 0); u.add(sp);
        u.position.set(6.2, 0, z);
        scene.add(u);
        units.push({ g: u, gen: gen, spinner: spinner, runnerF: runnerF, runnerK: runnerK });
      });

      var tail = box(9, 0.2, 15, new THREE.MeshStandardMaterial({ color: C.water, transparent: true, opacity: 0.6, roughness: 0.2 }));
      tail.position.set(14.5, -1.95, 0); scene.add(tail);

      [-4, 0, 4].forEach(function (z) {
        var t = new THREE.Group();
        var body = box(1.3, 1.15, 0.95, mat(C.berryBright, { rough: 0.5, metal: 0.4 })); body.position.y = 0.58; t.add(body);
        for (var f = 0; f < 4; f++) {
          var fin = box(0.06, 0.9, 0.8, mat(0xe06a94, { rough: 0.5 }));
          fin.position.set(-0.75 - f * 0.09, 0.58, 0); t.add(fin);
        }
        for (var bsh = 0; bsh < 3; bsh++) {
          var b2 = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.07, 0.5, 8), mat(0xdfe4ea, { rough: 0.4 }));
          b2.position.set(-0.25 + bsh * 0.35, 1.4, 0); t.add(b2);
        }
        t.scale.set(1.4, 1.4, 1.4);
        t.position.set(12.6, -2, z); scene.add(t);
      });
      for (var py = 0; py < 2; py++) {
        var pylon = new THREE.Group();
        var mast = box(0.16, 4.2, 0.16, mat(0x9aa8b5, { metal: 0.7, rough: 0.4 })); mast.position.y = 2.1; pylon.add(mast);
        var arm = box(2.6, 0.12, 0.12, mast.material); arm.position.y = 3.7; pylon.add(arm);
        pylon.position.set(15.6 + py * 2.8, -2, -5.6); scene.add(pylon);
        var line = tube([new THREE.Vector3(12.8, -0.2, -4), new THREE.Vector3(15.6 + py * 2.8, 1.7, -5.6)], 0.025, mat(C.berryBright, { emissive: C.berryBright, ei: 0.4 }), 10);
        scene.add(line);
      }

      function apply(st) {
        var oem = HYDRO_OEMS[st.oem];
        units.forEach(function (u) {
          u.gen.material = mat(oem.color, { rough: 0.4, metal: 0.5 });
          u.runnerF.visible = st.turbine === 'francis';
          u.runnerK.visible = st.turbine === 'kaplan';
        });
        penN1.visible = st.n1;
      }

      return {
        scene: scene, target: { x: 2, y: 0.8, z: 0 }, radius: 32,
        theta: 1.3, phi: 0.95,
        apply: apply,
        tick: function (dt) {
          if (reduceMotion) return;
          units.forEach(function (u) { u.spinner.rotation.y += dt * 2.2; });
          upper.position.y = 5.1 + Math.sin(performance.now() / 1400) * 0.03;
        },
      };
    }

    function getScene(id) {
      if (scenes[id]) return scenes[id];
      var s;
      if (id === 'vega') s = buildDC({ rowsZ: [-1.9, 1.9], perRow: 6, span: 4.6, radius: 17, liquid: false });
      else if (id === 'beacon') s = buildDC({ rowsZ: [-3.4, 0, 3.4], perRow: 7, span: 5.2, radius: 21, liquid: true });
      else s = buildHydro();
      scenes[id] = s;
      return s;
    }
    getSceneRef = getScene;

    window.__setScene = function (id) {
      current = getScene(id);
      current.apply(demoState);
      orbit.radius = current.radius;
      orbit.theta = current.theta != null ? current.theta : 0.85;
      orbit.phi = current.phi != null ? current.phi : 0.62;
      orbit.rMax = current.radius * 2.5;
      orbit.user = false;
    };
    applyScene = function () { if (current) current.apply(demoState); refreshDemoJson(); };
    window.__demoResize = function () { fitRenderer(renderer, camera, stage); };
    window.__setScene(demoState.site);

    var last = performance.now();
    function tick(now) {
      requestAnimationFrame(tick);
      if (!demoActive || !current) return;
      fitRenderer(renderer, camera, stage);
      var dt = Math.min(0.05, (now - last) / 1000); last = now;
      if (!orbit.user && !reduceMotion) orbit.theta += 0.0012;
      current.tick(dt);
      camFromOrbit(camera, orbit, current.target);
      renderer.render(current.scene, camera);
    }
    requestAnimationFrame(tick);
  }

  /* site thumbnails for the portfolio menu: real renders of each scene */
  function makeThumbnails() {
    if (!getSceneRef) return;
    try {
      var tr = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
      tr.setSize(148, 96);
      var tc = new THREE.PerspectiveCamera(45, 148 / 96, 0.1, 300);
      SITES.forEach(function (s) {
        var sc = getSceneRef(s.id);
        sc.apply(demoState);
        var o = { theta: sc.theta || 0.85, phi: sc.phi || 0.62, radius: sc.radius };
        camFromOrbit(tc, o, sc.target);
        tc.aspect = 148 / 96; tc.updateProjectionMatrix();
        tr.render(sc.scene, tc);
        var img = document.getElementById('thumb-' + s.id);
        if (img) img.src = tr.domElement.toDataURL('image/jpeg', 0.82);
      });
      tr.dispose();
    } catch (e) { /* thumbnails are decorative; never break the demo */ }
  }

  /* ============================================================
     TUTORIAL: game-style guided tour
     ============================================================ */
  function initTutorial() {
    var tut = document.getElementById('tut');
    var dim = document.getElementById('tut-dim');
    var spot = document.getElementById('tut-spot');
    var card = document.getElementById('tut-card');
    var stepLabel = document.getElementById('tut-step-label');
    var title = document.getElementById('tut-title');
    var text = document.getElementById('tut-text');
    var dots = document.getElementById('tut-dots');
    var btnNext = document.getElementById('tut-next');
    var btnSkip = document.getElementById('tut-skip');

    var STEPS = [
      { target: '#demo-stage', title: 'Welcome to Yurt 8', text: 'This is the live demo of the tool. Sixty seconds, six stops, and then it is all yours. Hit Next.', full: true },
      { target: '#demo-stage', title: 'The site, in 3D', text: 'Drag anywhere to orbit the site. Scroll or pinch to zoom. The model keeps moving on its own until you grab it.', full: true },
      { target: '.mini-tracker', title: 'The pizza tracker', text: 'Every project moves along this tracker, stage by stage, like a pizza order. This one is parked at Fit-out: racks, power, and cooling going in.' },
      { target: '#hud-sites', title: 'The portfolio', text: 'This menu holds the sites. Two data centers and a hydro station. Pick one and the whole scene, the money, and the clash feed swap with it.', open: 'sites' },
      { target: '#hud-generate', title: 'Generate, live', text: 'These buttons run real design moves: swap cabinet vendors, swap GPUs, toggle redundant cooling. Watch the model re-fit itself and keep every asset number.', open: 'generate' },
      { target: '#hud-data', title: 'The site data', text: 'Financials, a sample clash feed with dollars attached, and the JSON schema every click writes. This is the language the whole system speaks.', open: 'data' },
      { target: '#demo-ribbon', title: 'Seven disciplines', text: 'These run under every stage, from the first land scan to year twenty of operations. Tap any icon for the plain language version.' },
      { target: '#demo-stage', title: 'That is the tool', text: 'Poke around. If you want the story and the numbers behind it, the Detailed Summary and the PDF are one click from the start page.', full: true },
    ];
    var idx = 0, active = false;

    dots.innerHTML = STEPS.map(function () { return '<i></i>'; }).join('');

    function place() {
      var st = STEPS[idx];
      var t = document.querySelector(st.target);
      var r = t.getBoundingClientRect();
      if (st.full) {
        var stg = document.getElementById('demo-stage').getBoundingClientRect();
        var w = Math.min(420, stg.width * 0.5), h = Math.min(260, stg.height * 0.45);
        spot.style.left = (stg.left + stg.width / 2 - w / 2) + 'px';
        spot.style.top = (stg.top + stg.height / 2 - h / 2 - 30) + 'px';
        spot.style.width = w + 'px'; spot.style.height = h + 'px';
        card.style.left = (stg.left + stg.width / 2 - Math.min(340, window.innerWidth * 0.86) / 2) + 'px';
        card.style.top = (stg.top + stg.height / 2 + h / 2 - 10) + 'px';
      } else {
        spot.style.left = (r.left - 8) + 'px';
        spot.style.top = (r.top - 8) + 'px';
        spot.style.width = (r.width + 16) + 'px';
        spot.style.height = (r.height + 16) + 'px';
        var cw = Math.min(340, window.innerWidth * 0.86);
        var cx = Math.max(12, Math.min(window.innerWidth - cw - 12, r.left + r.width / 2 - cw / 2));
        var below = r.bottom + 14;
        var cy = below + 230 < window.innerHeight ? below : Math.max(12, r.top - 240);
        card.style.left = cx + 'px';
        card.style.top = cy + 'px';
      }
      stepLabel.textContent = 'Step ' + (idx + 1) + ' of ' + STEPS.length;
      title.textContent = st.title;
      text.textContent = st.text;
      btnNext.textContent = idx === STEPS.length - 1 ? 'Finish' : 'Next';
      Array.prototype.forEach.call(dots.children, function (d, i) { d.className = i <= idx ? 'on' : ''; });
      if (st.open) togglePanel(st.open, true);
      else togglePanel('none', false);
    }
    function start() {
      idx = 0; active = true;
      tut.classList.add('on');
      place();
    }
    function stop() {
      active = false;
      tut.classList.remove('on');
      togglePanel('none', false);
      try { localStorage.setItem('yurt8TutorialDone', '1'); } catch (e) {}
    }
    btnNext.addEventListener('click', function () {
      if (idx >= STEPS.length - 1) { stop(); return; }
      idx++; place();
    });
    btnSkip.addEventListener('click', stop);
    dim.addEventListener('click', stop);
    window.addEventListener('resize', function () { if (active) place(); });
    document.getElementById('btn-tutorial').addEventListener('click', start);
    window.__tutStop = stop;

    var seen = false;
    try { seen = localStorage.getItem('yurt8TutorialDone') === '1'; } catch (e) {}
    if (!seen) setTimeout(start, 600);
  }

  /* ============================================================
     MONEY CHART (summary view)
     ============================================================ */
  (function moneyChart() {
    var root = document.getElementById('money-chart');
    if (!root || !MONEY || !MONEY.chart) return;
    var data = MONEY.chart;
    var W = 460, H = 300, padL = 46, padR = 10, padT = 26, padB = 34;
    var max = 0;
    data.forEach(function (d) { max = Math.max(max, d.cost, d.savings); });
    max = Math.ceil(max / 5) * 5;
    var iw = W - padL - padR, ih = H - padT - padB;
    function y(v) { return padT + ih - (v / max) * ih; }
    var svg = ['<svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Program cost versus savings, year one and year two" style="width:100%;height:auto;display:block">'];
    for (var gv = 0; gv <= max; gv += max / 4) {
      svg.push('<line x1="' + padL + '" x2="' + (W - padR) + '" y1="' + y(gv) + '" y2="' + y(gv) + '" stroke="#1d3a5c" stroke-width="1"/>');
      svg.push('<text x="' + (padL - 8) + '" y="' + (y(gv) + 4) + '" text-anchor="end" font-size="11" fill="#67789a">$' + gv + 'M</text>');
    }
    var groupW = iw / data.length, barW = 34, gap2 = 2;
    function roundTopBar(x, yBase, w, h, r) {
      var yTop = yBase - h; r = Math.min(r, h);
      return 'M' + x + ',' + yBase + ' L' + x + ',' + (yTop + r) + ' Q' + x + ',' + yTop + ' ' + (x + r) + ',' + yTop +
        ' L' + (x + w - r) + ',' + yTop + ' Q' + (x + w) + ',' + yTop + ' ' + (x + w) + ',' + (yTop + r) +
        ' L' + (x + w) + ',' + yBase + ' Z';
    }
    data.forEach(function (d, i) {
      var cx = padL + groupW * i + groupW / 2;
      var x1 = cx - barW - gap2 / 2, x2 = cx + gap2 / 2;
      var yc = y(d.cost), ys = y(d.savings);
      var hc = Math.max(3, padT + ih - yc), hs = Math.max(3, padT + ih - ys);
      svg.push('<path class="bar" data-tip="' + d.label + ' program cost: $' + d.cost.toFixed(2) + 'M" d="' + roundTopBar(x1, padT + ih, barW, hc, 4) + '" fill="#3987e5"/>');
      svg.push('<path class="bar" data-tip="' + d.label + ' savings, conservative case: $' + d.savings.toFixed(1) + 'M" d="' + roundTopBar(x2, padT + ih, barW, hs, 4) + '" fill="#e0561f"/>');
      svg.push('<text x="' + (x1 + barW / 2) + '" y="' + (yc - 6) + '" text-anchor="middle" font-size="11.5" font-weight="600" fill="#f0f3f8">$' + (d.cost < 1 ? d.cost.toFixed(2) : d.cost.toFixed(1)) + 'M</text>');
      svg.push('<text x="' + (x2 + barW / 2) + '" y="' + (ys - 6) + '" text-anchor="middle" font-size="11.5" font-weight="600" fill="#f0f3f8">$' + d.savings.toFixed(1) + 'M</text>');
      svg.push('<text x="' + cx + '" y="' + (H - 10) + '" text-anchor="middle" font-size="12.5" fill="#a9b6c9">' + d.label + '</text>');
    });
    svg.push('<line x1="' + padL + '" x2="' + (W - padR) + '" y1="' + (padT + ih) + '" y2="' + (padT + ih) + '" stroke="#2c4a72" stroke-width="1.5"/>');
    svg.push('</svg>');
    root.innerHTML = svg.join('');
    var tip = document.getElementById('chart-tip');
    root.addEventListener('mousemove', function (e) {
      var t = e.target.closest('.bar');
      if (t) {
        tip.style.display = 'block';
        tip.textContent = t.getAttribute('data-tip');
        tip.style.left = (e.clientX + 14) + 'px';
        tip.style.top = (e.clientY - 12) + 'px';
      } else tip.style.display = 'none';
    });
    root.addEventListener('mouseleave', function () { tip.style.display = 'none'; });
  })();

  /* stat tile count-up (summary view) */
  if (!reduceMotion && 'IntersectionObserver' in window) {
    var tiles = document.querySelectorAll('.tile .v[data-count]');
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (en) {
        if (!en.isIntersecting) return;
        io.unobserve(en.target);
        var el = en.target;
        var final = el.getAttribute('data-final');
        var num = parseFloat(el.getAttribute('data-count'));
        var pre = el.getAttribute('data-pre') || '';
        var post = el.getAttribute('data-post') || '';
        var t0 = performance.now(), dur = 1100;
        (function step(now) {
          var k = Math.min(1, (now - t0) / dur);
          var e = 1 - Math.pow(1 - k, 3);
          var v = num * e;
          el.innerHTML = pre + (num >= 100 ? Math.round(v).toLocaleString('en-US') : (Math.round(v * 10) / 10)) + post;
          if (k < 1) requestAnimationFrame(step);
          else if (final) el.innerHTML = final;
        })(t0);
      });
    }, { threshold: 0.4 });
    tiles.forEach(function (t) { io.observe(t); });
  }

  /* initial route, now that every definition above exists */
  route();
})();
