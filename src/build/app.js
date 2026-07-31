/* Yurt 8 demo application. Runs entirely offline; THREE is embedded above. */
(function () {
  'use strict';
  var THREE = window.THREE;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Injected at assembly time */
  var MONEY = {{MONEY_JSON}};

  /* ============================================================
     TRACKER
     ============================================================ */
  var STAGES = [
    {
      name: 'Site Selection', short: '1',
      what: 'Score the land, the power, the fiber, the water, and the tax picture before anyone commits a dollar. Yurt 8 turns site selection from a gut call into a ranked list with reasons.',
      data: ['GIS and utility power data', 'Land and power pipeline status', 'Energy pricing and interconnect queues', 'Zoning and entitlement records', 'Early massing models'],
      focus: ['Information Management', 'Project Management', 'BIM']
    },
    {
      name: 'Preconstruction', short: '2',
      what: 'Budgets, schedules, contracts, and risk lined up before mobilization. The tracker starts here for real: every commitment becomes a line the system can watch.',
      data: ['Cost models and estimates', 'Microsoft Project schedules', 'Contractor bids and contracts', 'Permit status feeds'],
      focus: ['Project Management', 'Information Management', 'User Management']
    },
    {
      name: 'Design', short: '3',
      what: 'Architects and engineers produce the models. Generate produces test fits and sizing in seconds beside them. Review watches both, and clashes surface the day they are drawn, not the month they are built.',
      data: ['Live Revit model feeds via ACC', 'CAD files', 'Clash detection results', 'Standardized design spreadsheets'],
      focus: ['BIM', 'Clash Detection', 'Model Management']
    },
    {
      name: 'Construction', short: '4',
      what: 'The field builds while the system watches for the issues that become change orders. RFIs and submittals arrive translated into plain English, with the dollars and days they put at risk.',
      data: ['ACC as the primary CDE', 'Contractor Procore feeds', 'RFIs and submittals, plain English', 'Cost and schedule actuals', 'Clashes as they occur'],
      focus: ['Clash Detection', 'Project Delivery', 'Project Management']
    },
    {
      name: 'Procurement', short: '5',
      what: 'Long lead equipment tracked like packages: transformers, generators, switchgear, cabinets, GPUs. Every order tied to the schedule activity it can delay.',
      data: ['Vendor delivery schedules', 'Lead time telemetry', 'Cabinet and GPU order status', 'Logistics milestones'],
      focus: ['Information Management', 'Project Management', 'Project Delivery']
    },
    {
      name: 'Fit-out', short: '6',
      what: 'Racks, containment, power chains, and cooling come together. Every asset gets its lifetime ID here. Generate re-sizes MEP and containment on demand as vendors and hardware shift.',
      data: ['Cabinet libraries', 'MEP and containment models', 'Commissioning checklists', 'Asset ID registry'],
      focus: ['BIM', 'Model Management', 'Clash Detection']
    },
    {
      name: 'Operations', short: '7',
      what: 'The building starts reporting to you. IoT sensors feed the same schema the design carried, so the digital asset never goes stale. Learning from operations flows back into the next design.',
      data: ['IoT and CSSM sensor feeds', 'Asset registry with lifetime IDs', 'Maintenance and work orders', 'Energy telemetry'],
      focus: ['Information Management', 'User Management', 'Project Delivery']
    }
  ];

  var trackerBar = document.querySelector('.tracker-bar');
  var trackerDetail = document.getElementById('tracker-detail');
  var trackerFill = document.getElementById('tracker-fill');
  var activeStage = 3; /* Construction: mid-flight feels alive */
  var userTouchedTracker = false;

  STAGES.forEach(function (s, i) {
    var b = document.createElement('button');
    b.className = 't-stage';
    b.type = 'button';
    b.setAttribute('role', 'tab');
    b.setAttribute('aria-label', s.name);
    b.innerHTML = '<span class="t-dot">' + s.short + '</span><span class="t-label">' + s.name + '</span>';
    b.addEventListener('click', function () { userTouchedTracker = true; setStage(i); });
    trackerBar.appendChild(b);
  });

  function setStage(i) {
    activeStage = i;
    var btns = trackerBar.querySelectorAll('.t-stage');
    btns.forEach(function (b, j) {
      b.classList.toggle('active', j === i);
      b.classList.toggle('done', j < i);
      b.setAttribute('aria-selected', j === i ? 'true' : 'false');
    });
    trackerFill.style.width = 'calc((100% - 100%/7) * ' + (i / 6).toFixed(4) + ')';
    var s = STAGES[i];
    trackerDetail.innerHTML =
      '<h3>' + (i + 1) + '. ' + s.name + '</h3>' +
      '<p class="muted" style="font-size:15px">' + s.what + '</p>' +
      '<div class="td-cols"><div><h4>Data wired into this stage</h4><ul>' +
      s.data.map(function (d) { return '<li>' + d + '</li>'; }).join('') +
      '</ul></div><div><h4>Disciplines doing the heavy lifting</h4><ul>' +
      s.focus.map(function (d) { return '<li>' + d + '</li>'; }).join('') +
      '</ul></div></div>';
  }
  setStage(activeStage);

  if (!reduceMotion) {
    var cycle = setInterval(function () {
      if (userTouchedTracker) { clearInterval(cycle); return; }
      setStage((activeStage + 1) % STAGES.length);
    }, 5000);
  }

  /* ============================================================
     WEBGL SUPPORT
     ============================================================ */
  function webglOK() {
    try {
      var c = document.createElement('canvas');
      return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl')));
    } catch (e) { return false; }
  }
  var canRender = !!THREE && webglOK();

  /* ============================================================
     SHARED 3D HELPERS
     ============================================================ */
  function makeRenderer(canvas) {
    var r = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
    r.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    return r;
  }
  function fitRenderer(renderer, camera, el) {
    var w = el.clientWidth, h = el.clientHeight;
    if (w === 0 || h === 0) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  function labelSprite(text, color) {
    var cv = document.createElement('canvas');
    cv.width = 128; cv.height = 64;
    var ctx = cv.getContext('2d');
    ctx.fillStyle = 'rgba(11,14,20,0.85)';
    roundRect(ctx, 6, 10, 116, 44, 10); ctx.fill();
    ctx.strokeStyle = color; ctx.lineWidth = 3;
    roundRect(ctx, 6, 10, 116, 44, 10); ctx.stroke();
    ctx.fillStyle = '#e8ecf4';
    ctx.font = 'bold 26px system-ui, sans-serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(text, 64, 33);
    var tex = new THREE.CanvasTexture(cv);
    var mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false });
    var sp = new THREE.Sprite(mat);
    sp.scale.set(0.72, 0.36, 1);
    return sp;
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
  /* simple drag orbit */
  function addOrbit(el, state) {
    var down = false, px = 0, py = 0;
    el.addEventListener('pointerdown', function (e) { down = true; px = e.clientX; py = e.clientY; });
    window.addEventListener('pointermove', function (e) {
      if (!down) return;
      state.theta -= (e.clientX - px) * 0.005;
      state.phi = Math.max(0.15, Math.min(1.35, state.phi + (e.clientY - py) * 0.003));
      px = e.clientX; py = e.clientY;
      state.user = true;
    });
    window.addEventListener('pointerup', function () { down = false; });
    el.style.touchAction = 'pan-y';
  }
  function onVisible(el, cb) {
    if (!('IntersectionObserver' in window)) { cb(true); return; }
    new IntersectionObserver(function (es) {
      es.forEach(function (e) { cb(e.isIntersecting); });
    }, { threshold: 0.05 }).observe(el);
  }

  var AMBER = 0xf0a028, CYAN = 0x35c3d4, STEEL = 0x3a4356, DARKPANEL = 0x171c28;

  /* ============================================================
     HERO SCENE: a data hall assembles itself
     ============================================================ */
  if (canRender) (function heroScene() {
    var canvas = document.getElementById('hero-canvas');
    var hero = document.getElementById('hero');
    var renderer = makeRenderer(canvas);
    var scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x0b0e14, 30, 90);
    var camera = new THREE.PerspectiveCamera(42, 2, 0.1, 200);
    var orbit = { theta: 0.7, phi: 0.42, radius: 34, user: false };
    addOrbit(canvas, orbit);

    scene.add(new THREE.AmbientLight(0x8899bb, 0.85));
    var key = new THREE.DirectionalLight(0xffeecc, 1.4);
    key.position.set(14, 22, 8); scene.add(key);
    var amberPt = new THREE.PointLight(AMBER, 60, 50); amberPt.position.set(0, 6, 0); scene.add(amberPt);
    var cyanPt = new THREE.PointLight(CYAN, 25, 40); cyanPt.position.set(-8, 4, 8); scene.add(cyanPt);

    /* ground grid */
    var grid = new THREE.GridHelper(120, 60, 0x232a3a, 0x161b26);
    grid.position.y = -0.01; scene.add(grid);
    var slab = new THREE.Mesh(new THREE.BoxGeometry(26, 0.3, 16),
      new THREE.MeshStandardMaterial({ color: 0x11151d, roughness: 0.9 }));
    slab.position.y = -0.15; scene.add(slab);

    var buildGroups = []; /* {group, t0, t1} appear window in cycle 0..1 */
    function addTimed(group, t0, t1) { scene.add(group); buildGroups.push({ g: group, t0: t0, t1: t1 }); }

    /* structural frame */
    var frame = new THREE.Group();
    var colGeo = new THREE.BoxGeometry(0.35, 7, 0.35);
    var colMat = new THREE.MeshStandardMaterial({ color: STEEL, roughness: 0.5, metalness: 0.6 });
    for (var cx = -12; cx <= 12; cx += 6) for (var cz = -7; cz <= 7; cz += 7) {
      var col = new THREE.Mesh(colGeo, colMat);
      col.position.set(cx, 3.5, cz); frame.add(col);
    }
    var beamMatX = new THREE.MeshStandardMaterial({ color: STEEL, roughness: 0.5, metalness: 0.6 });
    for (var bz = -7; bz <= 7; bz += 7) {
      var beam = new THREE.Mesh(new THREE.BoxGeometry(24.7, 0.3, 0.3), beamMatX);
      beam.position.set(0, 7, bz); frame.add(beam);
    }
    for (var bx = -12; bx <= 12; bx += 6) {
      var beam2 = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.3, 14.3), beamMatX);
      beam2.position.set(bx, 7, 0); frame.add(beam2);
    }
    addTimed(frame, 0.04, 0.22);

    /* translucent shell */
    var shell = new THREE.Mesh(new THREE.BoxGeometry(25.4, 7.2, 14.8),
      new THREE.MeshStandardMaterial({ color: 0x1a2130, transparent: true, opacity: 0.16, roughness: 0.3, metalness: 0.2, side: THREE.DoubleSide }));
    shell.position.y = 3.6;
    addTimed(shell, 0.2, 0.34);

    /* rack rows (instanced) */
    var rackGeo = new THREE.BoxGeometry(0.9, 2.1, 1.1);
    var rackMat = new THREE.MeshStandardMaterial({ color: DARKPANEL, roughness: 0.55, metalness: 0.35 });
    var faceGeo = new THREE.PlaneGeometry(0.78, 1.9);
    var rows = 4, per = 16;
    var rackCount = rows * per;
    var racks = new THREE.InstancedMesh(rackGeo, rackMat, rackCount);
    var faces = new THREE.InstancedMesh(faceGeo, new THREE.MeshBasicMaterial({ color: CYAN }), rackCount);
    var m4 = new THREE.Matrix4();
    var faceColor = new THREE.Color();
    var idx = 0;
    var rackPos = [];
    for (var r = 0; r < rows; r++) for (var i = 0; i < per; i++) {
      var x = -9 + i * 1.2, z = -5.25 + r * 3.5;
      m4.makeTranslation(x, 1.05, z);
      racks.setMatrixAt(idx, m4);
      m4.makeTranslation(x, 1.05, z + 0.56);
      faces.setMatrixAt(idx, m4);
      faceColor.setHSL(0.52 + Math.random() * 0.06, 0.75, 0.42 + Math.random() * 0.25);
      faces.setColorAt(idx, faceColor);
      rackPos.push({ x: x, z: z });
      idx++;
    }
    var rackGroup = new THREE.Group();
    rackGroup.add(racks); rackGroup.add(faces);
    addTimed(rackGroup, 0.34, 0.66);

    /* CRAC units along the long walls */
    var cracGroup = new THREE.Group();
    var cracGeo = new THREE.BoxGeometry(1.6, 2.5, 1.0);
    var cracMat = new THREE.MeshStandardMaterial({ color: 0x222a3d, roughness: 0.4, metalness: 0.5, emissive: AMBER, emissiveIntensity: 0.12 });
    for (var ci = 0; ci < 5; ci++) {
      var cA = new THREE.Mesh(cracGeo, cracMat); cA.position.set(-10 + ci * 5, 1.25, -6.9); cracGroup.add(cA);
      var cB = new THREE.Mesh(cracGeo, cracMat); cB.position.set(-10 + ci * 5, 1.25, 6.9); cracGroup.add(cB);
    }
    addTimed(cracGroup, 0.6, 0.78);

    /* overhead containment / trays */
    var trayGroup = new THREE.Group();
    var trayMat = new THREE.MeshStandardMaterial({ color: AMBER, roughness: 0.6, metalness: 0.4, emissive: AMBER, emissiveIntensity: 0.25 });
    for (var tr = 0; tr < rows; tr++) {
      var tray = new THREE.Mesh(new THREE.BoxGeometry(19.6, 0.12, 0.5), trayMat);
      tray.position.set(0, 3.1, -5.25 + tr * 3.5); trayGroup.add(tray);
    }
    addTimed(trayGroup, 0.74, 0.9);

    var CYCLE = reduceMotion ? 0 : 22000;
    /* start mid-cycle so first-time viewers land on a mostly built hall */
    var t0 = performance.now() - CYCLE * 0.52;
    var visible = true;
    onVisible(hero, function (v) { visible = v; });

    function heroTick(now) {
      requestAnimationFrame(heroTick);
      if (!visible) return;
      fitRenderer(renderer, camera, hero);
      var t = reduceMotion ? 1 : ((now - t0) % CYCLE) / CYCLE;
      /* build phase 0..0.92, hold to 1 */
      var bt = Math.min(t / 0.92, 1);
      buildGroups.forEach(function (bg) {
        var k = (bt - bg.t0) / (bg.t1 - bg.t0);
        k = Math.max(0, Math.min(1, k));
        var e = 1 - Math.pow(1 - k, 3);
        bg.g.visible = k > 0;
        bg.g.scale.y = Math.max(0.001, e);
        bg.g.position.y = 0;
      });
      if (!orbit.user && !reduceMotion) orbit.theta += 0.0011;
      var cy = Math.cos(orbit.phi) * orbit.radius;
      camera.position.set(
        Math.sin(orbit.theta) * Math.sin(orbit.phi) * orbit.radius,
        cy * 0.55 + 4,
        Math.cos(orbit.theta) * Math.sin(orbit.phi) * orbit.radius
      );
      camera.lookAt(0, 2.2, 0);
      renderer.render(scene, camera);
    }
    requestAnimationFrame(heroTick);
  })();
  else {
    var heroCv = document.getElementById('hero-canvas');
    if (heroCv) heroCv.style.display = 'none';
  }

  /* ============================================================
     PLAYGROUND SCENE: swap vendors, GPUs, 2N cooling
     ============================================================ */
  var playState = {
    vendor: 'VendorA',
    gpu: 'Gen1',
    n2: false
  };
  var VENDORS = {
    VendorA: { w: 0.62, d: 1.07, h: 2.0, gap: 0.55, color: 0x1d2434, containH: 0.5 },
    VendorB: { w: 0.84, d: 1.25, h: 2.3, gap: 0.42, color: 0x232c42, containH: 0.62 }
  };
  var GPUS = { Gen1: 0x199e70, Gen2: 0x9085e9 };

  if (canRender) (function playScene() {
    var wrap = document.getElementById('play-canvas-wrap');
    var canvas = document.getElementById('play-canvas');
    var renderer = makeRenderer(canvas);
    var scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0d1119);
    var camera = new THREE.PerspectiveCamera(45, 2, 0.1, 100);
    var orbit = { theta: 0.85, phi: 0.62, radius: 16.5, user: false };
    addOrbit(canvas, orbit);

    scene.add(new THREE.AmbientLight(0x9aa8cc, 0.6));
    var key = new THREE.DirectionalLight(0xffffff, 0.9); key.position.set(6, 10, 4); scene.add(key);
    var fill = new THREE.PointLight(CYAN, 12, 30); fill.position.set(-4, 5, -4); scene.add(fill);

    var grid = new THREE.GridHelper(40, 40, 0x232a3a, 0x141926); scene.add(grid);

    var N = 6; /* cabinets per row */
    var rowsZ = [-1.9, 1.9];
    var cabs = []; /* {group, frame, gpus:[], sprite, row, i} */
    var cabMatA = new THREE.MeshStandardMaterial({ color: VENDORS.VendorA.color, roughness: 0.5, metalness: 0.4 });

    rowsZ.forEach(function (rz, ri) {
      for (var i = 0; i < N; i++) {
        var g = new THREE.Group();
        var frame = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), cabMatA.clone());
        g.add(frame);
        var gpus = [];
        for (var u = 0; u < 4; u++) {
          var mod = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1),
            new THREE.MeshStandardMaterial({ color: GPUS.Gen1, roughness: 0.35, metalness: 0.2, emissive: GPUS.Gen1, emissiveIntensity: 0.35 }));
          g.add(mod); gpus.push(mod);
        }
        var num = 'C' + (ri * N + i + 1 < 10 ? '0' : '') + (ri * N + i + 1);
        var sp = labelSprite(num, ri === 0 ? '#f0a028' : '#35c3d4');
        g.add(sp);
        scene.add(g);
        cabs.push({ group: g, frame: frame, gpus: gpus, sprite: sp, row: ri, i: i, num: num });
      }
    });

    /* containment above each row */
    var containMat = new THREE.MeshStandardMaterial({ color: 0x2a3348, roughness: 0.6, metalness: 0.3, transparent: true, opacity: 0.85 });
    var contains = rowsZ.map(function (rz) {
      var m = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), containMat.clone());
      scene.add(m); return m;
    });

    /* CRAC units: A side always, B side when 2N */
    function crac(x, z, col) {
      var m = new THREE.Mesh(new THREE.BoxGeometry(1.3, 2.2, 0.9),
        new THREE.MeshStandardMaterial({ color: 0x222a3d, roughness: 0.4, metalness: 0.5, emissive: col, emissiveIntensity: 0.4 }));
      m.position.set(x, 1.1, z); scene.add(m); return m;
    }
    var cracA = [crac(-5.4, -1.9, AMBER), crac(-5.4, 1.9, AMBER)];
    var cracB = [crac(5.4, -1.9, CYAN), crac(5.4, 1.9, CYAN)];

    /* power/cooling paths as tubes */
    function path(x0, x1, z, y, col) {
      var pts = [];
      for (var k = 0; k <= 20; k++) {
        var x = x0 + (x1 - x0) * (k / 20);
        pts.push(new THREE.Vector3(x, y + Math.sin(k / 20 * Math.PI) * 0.12, z));
      }
      var curve = new THREE.CatmullRomCurve3(pts);
      var tube = new THREE.Mesh(new THREE.TubeGeometry(curve, 40, 0.05, 8, false),
        new THREE.MeshStandardMaterial({ color: col, emissive: col, emissiveIntensity: 0.8, roughness: 0.3 }));
      scene.add(tube); return tube;
    }
    var pathsA = rowsZ.map(function (z) { return path(-5.4, 4.6, z - 0.0, 3.05, AMBER); });
    var pathsB = rowsZ.map(function (z) { return path(5.4, -4.6, z - 0.0, 3.35, CYAN); });

    /* animated layout targets */
    var anim = { k: 1, from: 'VendorA', to: 'VendorA' };
    function layout(vk, t) {
      var A = VENDORS[anim.from], B = VENDORS[vk];
      function L(a, b) { return a + (b - a) * t; }
      var w = L(A.w, B.w), d = L(A.d, B.d), h = L(A.h, B.h), gap = L(A.gap, B.gap), ch = L(A.containH, B.containH);
      var pitch = w + gap;
      var span = (N - 1) * pitch;
      cabs.forEach(function (c) {
        var x = -span / 2 + c.i * pitch;
        var z = rowsZ[c.row];
        c.group.position.set(x, 0, z);
        c.frame.scale.set(w, h, d);
        c.frame.position.y = h / 2;
        c.gpus.forEach(function (mod, u) {
          mod.scale.set(w * 0.8, h * 0.16, 0.06);
          mod.position.set(0, h * 0.22 + u * h * 0.19, d / 2 + 0.03);
        });
        c.sprite.position.set(0, h + 0.42, 0);
        var col = new THREE.Color(A.color).lerp(new THREE.Color(B.color), t);
        c.frame.material.color.copy(col);
      });
      contains.forEach(function (m, ri) {
        m.scale.set(span + w + 0.6, ch, d * 0.75);
        m.position.set(0, h + 0.75 + ch / 2, rowsZ[ri]);
      });
    }
    layout('VendorA', 1);

    function set2N(on) {
      cracB.forEach(function (m) { m.visible = on; });
      pathsB.forEach(function (m) { m.visible = on; });
    }
    set2N(false);

    function setGpu(gen) {
      var col = new THREE.Color(GPUS[gen]);
      cabs.forEach(function (c) {
        c.gpus.forEach(function (mod) {
          mod.material.color.copy(col);
          mod.material.emissive.copy(col);
        });
      });
    }

    var visible = true;
    onVisible(wrap, function (v) { visible = v; });
    var last = performance.now();
    function tick(now) {
      requestAnimationFrame(tick);
      if (!visible) return;
      fitRenderer(renderer, camera, wrap);
      var dt = Math.min(0.05, (now - last) / 1000); last = now;
      if (anim.k < 1) {
        anim.k = Math.min(1, anim.k + dt / 0.8);
        var e = 1 - Math.pow(1 - anim.k, 3);
        layout(anim.to, e);
        if (anim.k >= 1) anim.from = anim.to;
      }
      if (!orbit.user && !reduceMotion) orbit.theta += 0.0014;
      camera.position.set(
        Math.sin(orbit.theta) * Math.sin(orbit.phi) * orbit.radius,
        Math.cos(orbit.phi) * orbit.radius * 0.62 + 1.5,
        Math.cos(orbit.theta) * Math.sin(orbit.phi) * orbit.radius
      );
      camera.lookAt(0, 1.0, 0);
      renderer.render(scene, camera);
    }
    requestAnimationFrame(tick);

    window.__playApply = function () {
      if (playState.vendor !== anim.to) { anim.to = playState.vendor; anim.k = reduceMotion ? 1 : 0; if (reduceMotion) layout(anim.to, 1); }
      setGpu(playState.gpu);
      set2N(playState.n2);
    };
  })();
  else {
    var fb = document.getElementById('play-fallback');
    if (fb) fb.style.display = 'flex';
    var pc = document.getElementById('play-canvas');
    if (pc) pc.style.display = 'none';
  }

  /* playground buttons + live JSON (work with or without WebGL) */
  var jsonPanel = document.getElementById('play-json');
  function refreshJson(changed) {
    var v = VENDORS[playState.vendor];
    var obj = {
      asset: 'CAB-B2-ROW1',
      coordinates: [412.5, 96.0, 14.2],
      parameters: {
        make: playState.vendor,
        cabinet_w_mm: Math.round(v.w * 1000),
        cabinet_h_u: playState.vendor === 'VendorA' ? 42 : 48,
        gpu: playState.gpu === 'Gen1' ? 'GPU-GN1' : 'GPU-GN2',
        numbering: 'C01..C12 preserved'
      },
      relationships: [
        { to: 'CRAC-A-01', type: 'cooled_by', distance_ft: 18.5 },
        playState.n2 ? { to: 'CRAC-B-01', type: 'cooled_by_redundant', distance_ft: 21.0 } : null
      ].filter(Boolean),
      pattern: playState.n2 ? '2N-cooling-loop' : 'N-cooling-loop',
      stage: 'fit-out',
      written_by: 'generate',
      last_change: changed || 'none yet'
    };
    jsonPanel.textContent = JSON.stringify(obj, null, 2);
  }
  refreshJson();

  function arm(btn) {
    btn.classList.add('armed');
    setTimeout(function () { btn.classList.remove('armed'); }, 700);
  }
  var bV = document.getElementById('btn-vendor');
  var bG = document.getElementById('btn-gpu');
  var bN = document.getElementById('btn-2n');
  bV.addEventListener('click', function () {
    playState.vendor = playState.vendor === 'VendorA' ? 'VendorB' : 'VendorA';
    if (window.__playApply) window.__playApply();
    refreshJson('vendor swap: containment and MEP re-sized, aisle clearance held');
    arm(bV);
  });
  bG.addEventListener('click', function () {
    playState.gpu = playState.gpu === 'Gen1' ? 'Gen2' : 'Gen1';
    if (window.__playApply) window.__playApply();
    refreshJson('gpu swap: hardware changed, all asset numbering preserved');
    arm(bG);
  });
  bN.addEventListener('click', function () {
    playState.n2 = !playState.n2;
    if (window.__playApply) window.__playApply();
    refreshJson(playState.n2 ? 'redundant cooling on: B path wired to CRAC units' : 'redundant cooling off: single path');
    arm(bN);
  });

  /* ============================================================
     MONEY CHART: paired bars, SVG, tooltips
     ============================================================ */
  (function moneyChart() {
    var root = document.getElementById('money-chart');
    if (!root || !MONEY || !MONEY.chart) return;
    var data = MONEY.chart; /* [{label, cost, savings}] */
    var W = 460, H = 300, padL = 46, padR = 10, padT = 26, padB = 34;
    var max = 0;
    data.forEach(function (d) { max = Math.max(max, d.cost, d.savings); });
    max = Math.ceil(max / 5) * 5;
    var iw = W - padL - padR, ih = H - padT - padB;
    function y(v) { return padT + ih - (v / max) * ih; }
    var svg = ['<svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Program cost versus savings, year one and year two" style="width:100%;height:auto;display:block">'];
    /* gridlines */
    for (var gv = 0; gv <= max; gv += max / 4) {
      svg.push('<line x1="' + padL + '" x2="' + (W - padR) + '" y1="' + y(gv) + '" y2="' + y(gv) + '" stroke="#232a3a" stroke-width="1"/>');
      svg.push('<text x="' + (padL - 8) + '" y="' + (y(gv) + 4) + '" text-anchor="end" font-size="11" fill="#6b7488">$' + gv + 'M</text>');
    }
    var groupW = iw / data.length;
    var barW = 34, gap2 = 2;
    data.forEach(function (d, i) {
      var cx = padL + groupW * i + groupW / 2;
      var x1 = cx - barW - gap2 / 2, x2 = cx + gap2 / 2;
      var yc = y(d.cost), ys = y(d.savings);
      var hc = Math.max(3, padT + ih - yc), hs = Math.max(3, padT + ih - ys);
      svg.push('<path class="bar" data-tip="' + d.label + ' program cost: $' + d.cost.toFixed(2) + 'M" d="' + roundTopBar(x1, padT + ih, barW, hc, 4) + '" fill="#c98500"/>');
      svg.push('<path class="bar" data-tip="' + d.label + ' savings, base case: $' + d.savings.toFixed(1) + 'M" d="' + roundTopBar(x2, padT + ih, barW, hs, 4) + '" fill="#199e70"/>');
      svg.push('<text x="' + (x1 + barW / 2) + '" y="' + (yc - 6) + '" text-anchor="middle" font-size="11.5" font-weight="600" fill="#e8ecf4">$' + (d.cost < 1 ? d.cost.toFixed(2) : d.cost.toFixed(1)) + 'M</text>');
      svg.push('<text x="' + (x2 + barW / 2) + '" y="' + (ys - 6) + '" text-anchor="middle" font-size="11.5" font-weight="600" fill="#e8ecf4">$' + d.savings.toFixed(1) + 'M</text>');
      svg.push('<text x="' + cx + '" y="' + (H - 10) + '" text-anchor="middle" font-size="12.5" fill="#9aa3b5">' + d.label + '</text>');
    });
    svg.push('<line x1="' + padL + '" x2="' + (W - padR) + '" y1="' + (padT + ih) + '" y2="' + (padT + ih) + '" stroke="#383f52" stroke-width="1.5"/>');
    svg.push('</svg>');
    root.innerHTML = svg.join('');
    function roundTopBar(x, yBase, w, h, r) {
      var yTop = yBase - h;
      r = Math.min(r, h);
      return 'M' + x + ',' + yBase +
        ' L' + x + ',' + (yTop + r) +
        ' Q' + x + ',' + yTop + ' ' + (x + r) + ',' + yTop +
        ' L' + (x + w - r) + ',' + yTop +
        ' Q' + (x + w) + ',' + yTop + ' ' + (x + w) + ',' + (yTop + r) +
        ' L' + (x + w) + ',' + yBase + ' Z';
    }
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

  /* ============================================================
     STAT TILE COUNT-UP
     ============================================================ */
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
})();
