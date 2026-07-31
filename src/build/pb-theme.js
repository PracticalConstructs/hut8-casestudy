/* Rousseau theme for Practical BIM: palette remap, italic editorial type,
   and 3D scene decoration (vegetation, architecture, site elements).
   Consumed by pb-build.js only; the Yurt 8 build never touches this. */

/* Every color in template.html and app.js, mapped from the flower palette
   (aubergine/navy/orange/gold) to the Rousseau palette: deep jungle greens,
   cream ink, red as the single contrast accent, sky blue for water/cooling. */
const HEX_MAP = {
  /* darks: aubergine and navy structure to forest greens */
  '0a0716': '0d1408', '070c18': '0f170a', '070d15': '0e160a', '081a32': '13200e',
  '0e1c33': '1a2611', '133050': '28371c', '152a44': '24311a', '182642': '25331b',
  '16384c': '2f3f26', '0f3a5c': '2c3b24', '0a1c2c': '16220f', '0c1424': '141d0e',
  '0d1526': '151e0f', '0e1728': '17220f', '101a2e': '17220f', '131c2c': '1a2412',
  '16223a': '1f2a15', '1e2c40': '27331a', '1a2b46': '25331b', '223655': '2c3a1f',
  '24363c': '2b3626', '27436a': '3a4c28', '2a4468': '3a4c28', '31435f': '42542f',
  '14294a': '22301c', '16324f': '2c3b24', '3a1a30': '2a3320', '1b2b44': '25331b',
  '101c30': '161f10', '111a2c': '161f10', '132036': '19240f', '161f30': '1c2513',
  '233246': '2c3a20', '0b1120': '0f150a', '0f1e33': '16220e', '10202f': '161f10',
  '12233c': '19240f', '1a3350': '2c3b24', '1c3a50': '2c3b24', '1d3a5c': '31422a',
  '26364e': '2b3822', '3c5070': '465830', '3d6f92': '5b8ca6',
  /* inks and greys to warm creams and green-greys */
  'f0f3f8': 'f6f4dd', 'a9b6c9': 'c3cbae', '67789a': '8b9678', 'b3bfd2': 'bcc4a9',
  '9fb0d0': 'adb896', '8b96a8': '939c85', 'b9c4c9': 'b7c0aa', 'bcc8de': 'c6d0b4',
  'b8c4da': 'c2ccae', 'dfe4ea': 'e6e8d8',
  /* accents: red is the contrast, gold becomes cream, blues become sky */
  'f9552f': 'ec5a20', 'e0561f': 'd14a15', 'f8c953': 'ece7ae', 'd6336c': 'e3c453',
  '780e36': '3c4a26', '9085e9': 'c2cf7a', '3987e5': '5b9cc4', '7fc8e0': '7fb6d6',
  '9cc4e0': 'a8d5ea', '4a90d9': 'a8d5ea', '2e6fb5': '5b9cc4', '5d55a8': '6a7a3e',
  'fce3a0': 'f2eec2', 'd8ab35': 'c9c162', 'e06a94': 'e07a50',
  /* button text darks */
  '2a0d04': '2a1206', '2e2306': '2a2e0a',
};

/* rgba() triplets used in template CSS scrims and glows */
const RGBA_MAP = [
  ['rgba(10,7,22,', 'rgba(13,20,8,'],
  ['rgba(8,16,32,', 'rgba(15,23,10,'],
  ['rgba(8,26,50,', 'rgba(19,32,14,'],
  ['rgba(5,4,12,', 'rgba(8,12,5,'],
  ['rgba(249,85,47,', 'rgba(236,90,32,'],
  ['rgba(248,201,83,', 'rgba(236,231,174,'],
];

function remapColors(s) {
  Object.keys(HEX_MAP).forEach(k => {
    const v = HEX_MAP[k];
    s = s.split('#' + k).join('#' + v).split('0x' + k).join('0x' + v);
  });
  RGBA_MAP.forEach(([from, to]) => { s = s.split(from).join(to); });
  return s;
}

/* Typography and button overrides: Instrument Serif italic display over
   Instrument Sans body. Appended after the main style block so it wins. */
const PB_TYPE_CSS = `
:root{--font-head:"Instrument Serif",Georgia,serif;--font-body:"Instrument Sans","Segoe UI",system-ui,sans-serif}
h1,h2,h3{font-style:italic;font-weight:400;letter-spacing:0}
#hero h1{font-style:italic;font-weight:400;letter-spacing:-.01em}
.kicker{font-family:var(--font-body);font-style:normal;font-weight:600;letter-spacing:.18em}
.btn{font-family:var(--font-head);font-style:italic;font-weight:400;font-size:17.5px;border-radius:999px;padding:14px 28px}
.hero-badge{font-style:italic;font-size:13.5px}
.bar-logo{font-family:var(--font-head);font-style:italic;font-weight:400}
.tile .v{font-style:italic}
`;

/* Scene decoration, inserted inside the app IIFE (function declarations
   hoist, so the hero hook can call these before this text position runs). */
const PB_JS = `
  /* ---- Rousseau landscape kit ----
     NOTE: this block sits at the end of the IIFE but is called from code that
     runs earlier (the hero scene builds during initial execution). Function
     declarations hoist; var initializers do not. All shared state therefore
     lives in PB_KIT, created lazily inside pbGeo(). */
  var PB_KIT;
  function pbGeo() {
    if (!PB_KIT) {
      PB_KIT = {
        sphere: new THREE.SphereGeometry(1, 7, 5),
        cyl: new THREE.CylinderGeometry(1, 1, 1, 8),
        cone: new THREE.ConeGeometry(1, 1, 6),
        mats: {},
        greens: [0x3f512e, 0x556b38, 0x64744a, 0x97a649],
      };
    }
    return PB_KIT;
  }
  function pbMat(hex, opts) {
    var K = pbGeo();
    var key = hex + JSON.stringify(opts || {});
    if (!K.mats[key]) K.mats[key] = mat(hex, opts || { rough: 0.9, metal: 0 });
    return K.mats[key];
  }
  function pbRand(seed) {
    return function () { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };
  }
  function pbMesh(geo, m, sx, sy, sz, x, y, z) {
    var o = new THREE.Mesh(geo, m);
    o.scale.set(sx, sy, sz); o.position.set(x, y, z);
    return o;
  }
    function pbTree(rnd, h) {
    var K = pbGeo();
    var g = new THREE.Group();
    var trunk = pbMesh(K.cyl, pbMat(0x4a4028), 0.1, h * 0.5, 0.1, 0, h * 0.25, 0);
    g.add(trunk);
    var levels = 2 + Math.floor(rnd() * 2);
    for (var i = 0; i < levels; i++) {
      var r = h * (0.4 - i * 0.09) * (0.85 + rnd() * 0.3);
      var c = K.greens[Math.floor(rnd() * K.greens.length)];
      g.add(pbMesh(K.sphere, pbMat(c), r, r * 0.55, r,
        (rnd() - 0.5) * 0.4, h * (0.5 + i * 0.22), (rnd() - 0.5) * 0.4));
    }
    if (rnd() < 0.38) {
      for (var b = 0; b < 3; b++) {
        g.add(pbMesh(K.sphere, pbMat(0xec5a20, { rough: 0.6, metal: 0, emissive: 0xec5a20, ei: 0.25 }),
          0.08, 0.08, 0.08, (rnd() - 0.5) * h * 0.6, h * (0.55 + rnd() * 0.3), (rnd() - 0.5) * h * 0.6));
      }
    }
    return g;
  }
  function pbPalm(rnd, h) {
    var K = pbGeo();
    var g = new THREE.Group();
    var trunk = pbMesh(K.cyl, pbMat(0x55503a), 0.07, h * 0.5, 0.07, 0, h * 0.25, 0);
    trunk.rotation.z = (rnd() - 0.5) * 0.2; g.add(trunk);
    var fronds = 6 + Math.floor(rnd() * 3);
    for (var i = 0; i < fronds; i++) {
      var f = pbMesh(new THREE.BoxGeometry(1, 1, 1), pbMat(0x6b8140), h * 0.5, 0.03, 0.2, 0, 0, 0);
      f.position.set(Math.cos(i / fronds * Math.PI * 2) * h * 0.22, h * 0.52, Math.sin(i / fronds * Math.PI * 2) * h * 0.22);
      f.rotation.y = -i / fronds * Math.PI * 2;
      f.rotation.z = -0.45 - rnd() * 0.2;
      g.add(f);
    }
    return g;
  }
  function pbReeds(rnd) {
    var K = pbGeo();
    var g = new THREE.Group();
    var n = 5 + Math.floor(rnd() * 5);
    for (var i = 0; i < n; i++) {
      var h = 0.5 + rnd() * 0.7;
      var c = rnd() < 0.4 ? 0xb7c25e : 0x97a649;
      g.add(pbMesh(K.cone, pbMat(c), 0.05, h, 0.05, (rnd() - 0.5) * 0.9, h / 2, (rnd() - 0.5) * 0.9));
    }
    return g;
  }
  function pbShrub(rnd) {
    var K = pbGeo();
    var r = 0.3 + rnd() * 0.3;
    return pbMesh(K.sphere, pbMat(0x44582f), r, r * 0.6, r, 0, r * 0.4, 0);
  }
  function pbScatterRect(scene, rnd, x0, x1, z0, z1, n, y) {
    for (var i = 0; i < n; i++) {
      var x = x0 + rnd() * (x1 - x0), z = z0 + rnd() * (z1 - z0);
      var t = rnd(), o;
      if (t < 0.5) o = pbTree(rnd, 1.4 + rnd() * 1.6);
      else if (t < 0.7) o = pbPalm(rnd, 1.6 + rnd() * 1.2);
      else if (t < 0.86) o = pbShrub(rnd);
      else o = pbReeds(rnd);
      o.position.set(x, y, z);
      o.rotation.y = rnd() * Math.PI * 2;
      scene.add(o);
    }
  }
  function pbScatter(scene, rnd, cx, cz, r0, r1, n, y) {
    for (var i = 0; i < n; i++) {
      var a = rnd() * Math.PI * 2, rr = r0 + rnd() * (r1 - r0);
      var x = cx + Math.cos(a) * rr, z = cz + Math.sin(a) * rr;
      var t = rnd(), o;
      if (t < 0.5) o = pbTree(rnd, 1.6 + rnd() * 1.8);
      else if (t < 0.7) o = pbPalm(rnd, 1.8 + rnd() * 1.4);
      else if (t < 0.86) o = pbShrub(rnd);
      else o = pbReeds(rnd);
      o.position.set(x, y, z);
      o.rotation.y = rnd() * Math.PI * 2;
      scene.add(o);
    }
  }
  function pbGround(scene, R, y) {
    var K = pbGeo();
    var g = pbMesh(K.cyl, pbMat(0x141d0e, { rough: 1, metal: 0 }), R, 0.04, R, 0, y, 0);
    scene.add(g);
    scene.fog = new THREE.Fog(0x0f170a, R * 0.95, R * 3.4);
  }
  function pbFence(scene, hw, hd) {
    var K = pbGeo();
    var post = pbMat(0x39422c, { rough: 0.7, metal: 0.3 });
    var rail = pbMat(0x39422c, { rough: 0.7, metal: 0.3 });
    function run(x0, z0, x1, z1) {
      var dx = x1 - x0, dz = z1 - z0, len = Math.hypot(dx, dz);
      var n = Math.max(2, Math.round(len / 2.2));
      for (var i = 0; i <= n; i++) {
        scene.add(pbMesh(K.cyl, post, 0.035, 0.55, 0.035, x0 + dx * i / n, 0.55, z0 + dz * i / n));
      }
      for (var rr = 0; rr < 2; rr++) {
        var b = pbMesh(new THREE.BoxGeometry(1, 1, 1), rail, len, 0.035, 0.035, x0 + dx / 2, 0.5 + rr * 0.45, z0 + dz / 2);
        b.rotation.y = -Math.atan2(dz, dx);
        scene.add(b);
      }
    }
    run(-hw, -hd, hw, -hd); run(-hw, hd, hw, hd);
    run(-hw, -hd, -hw, hd); run(hw, -hd, hw, hd);
  }
  function pbTransformers(scene, x, z) {
    var K = pbGeo();
    var g = new THREE.Group();
    g.add(pbMesh(new THREE.BoxGeometry(1, 1, 1), pbMat(0x8a9088, { rough: 0.9, metal: 0 }), 5.0, 0.14, 2.8, 0, 0.07, 0));
    for (var i = 0; i < 2; i++) {
      var bx = -1.2 + i * 2.4;
      g.add(pbMesh(new THREE.BoxGeometry(1, 1, 1), pbMat(0x55604a, { rough: 0.5, metal: 0.45 }), 1.5, 1.25, 1.1, bx, 0.76, 0));
      for (var f = 0; f < 3; f++) {
        g.add(pbMesh(new THREE.BoxGeometry(1, 1, 1), pbMat(0x49543e, { rough: 0.6, metal: 0.4 }), 0.06, 1.0, 1.3, bx - 0.82, 0.76, 0));
        g.add(pbMesh(new THREE.BoxGeometry(1, 1, 1), pbMat(0x49543e, { rough: 0.6, metal: 0.4 }), 0.06, 1.0, 1.3, bx + 0.82, 0.76, 0));
      }
      for (var bu = 0; bu < 3; bu++) {
        g.add(pbMesh(K.cyl, pbMat(0xece7ae, { rough: 0.4, metal: 0.2 }), 0.05, 0.2, 0.05, bx - 0.35 + bu * 0.35, 1.55, 0));
        g.add(pbMesh(K.sphere, pbMat(0xec5a20, { emissive: 0xec5a20, ei: 0.4 }), 0.07, 0.07, 0.07, bx - 0.35 + bu * 0.35, 1.78, 0));
      }
    }
    g.position.set(x, 0, z);
    scene.add(g);
  }
  function pbChillers(scene, x, z, n) {
    var K = pbGeo();
    var g = new THREE.Group();
    for (var i = 0; i < n; i++) {
      var cx = i * 2.7;
      g.add(pbMesh(new THREE.BoxGeometry(1, 1, 1), pbMat(0x3f4d2c, { rough: 0.55, metal: 0.4 }), 2.3, 1.1, 1.05, cx, 0.62, 0));
      for (var f = 0; f < 2; f++) {
        g.add(pbMesh(K.cyl, pbMat(0x5b9cc4, { rough: 0.4, metal: 0.5, emissive: 0x5b9cc4, ei: 0.18 }), 0.36, 0.04, 0.36, cx - 0.55 + f * 1.1, 1.2, 0));
        g.add(pbMesh(K.cyl, pbMat(0xece7ae, { rough: 0.4, metal: 0.3 }), 0.08, 0.06, 0.08, cx - 0.55 + f * 1.1, 1.23, 0));
      }
      g.add(pbMesh(new THREE.BoxGeometry(1, 1, 1), pbMat(0xd8d4a8, { rough: 0.7, metal: 0.1 }), 2.0, 0.5, 0.03, cx, 0.55, 0.55));
    }
    g.position.set(x, 0, z);
    scene.add(g);
  }
  function pbPavilion(scene, x, z) {
    var K = pbGeo();
    var g = new THREE.Group();
    var frame = pbMat(0xd8d4a8, { rough: 0.5, metal: 0.2 });
    for (var i = 0; i < 4; i++) {
      g.add(pbMesh(new THREE.BoxGeometry(1, 1, 1), frame, 0.12, 2.4, 0.12,
        (i % 2 ? 1.6 : -1.6), 1.2, (i < 2 ? 1.1 : -1.1)));
    }
    g.add(pbMesh(new THREE.BoxGeometry(1, 1, 1), frame, 3.6, 0.14, 2.6, 0, 2.48, 0));
    g.add(pbMesh(new THREE.BoxGeometry(1, 1, 1), pbMat(0xec5a20, { rough: 0.5, metal: 0.2, emissive: 0xec5a20, ei: 0.15 }), 3.6, 0.12, 0.08, 0, 2.42, 1.32));
    var glass = new THREE.MeshStandardMaterial({ color: 0x5b9cc4, transparent: true, opacity: 0.22, roughness: 0.15, metalness: 0.3 });
    g.add(pbMesh(new THREE.BoxGeometry(1, 1, 1), glass, 3.2, 2.2, 0.05, 0, 1.2, -1.05));
    g.add(pbMesh(new THREE.BoxGeometry(1, 1, 1), glass, 0.05, 2.2, 2.0, -1.58, 1.2, 0));
    g.add(pbMesh(new THREE.BoxGeometry(1, 1, 1), glass, 0.05, 2.2, 2.0, 1.58, 1.2, 0));
    g.add(pbMesh(new THREE.BoxGeometry(1, 1, 1), pbMat(0xec5a20, { rough: 0.5, emissive: 0xec5a20, ei: 0.2 }), 0.9, 2.0, 0.06, 0, 1.0, 1.1));
    g.add(pbMesh(new THREE.BoxGeometry(1, 1, 1), pbMat(0xd8d4a8, { rough: 0.85, metal: 0 }), 1.6, 0.05, 3.5, 0, 0.03, 2.9));
    g.position.set(x, 0, z);
    scene.add(g);
  }
  function pbPoles(scene, list) {
    var K = pbGeo();
    list.forEach(function (p) {
      scene.add(pbMesh(K.cyl, pbMat(0x39422c, { rough: 0.6, metal: 0.4 }), 0.05, 1.5, 0.05, p[0], 1.5, p[1]));
      scene.add(pbMesh(K.sphere, pbMat(0xf2eec2, { emissive: 0xf2eec2, ei: 0.85 }), 0.13, 0.13, 0.13, p[0], 3.05, p[1]));
    });
  }
  function pbPond(scene, rnd, x, z, r, y) {
    var K = pbGeo();
    scene.add(pbMesh(K.cyl, pbMat(0x5b9cc4, { rough: 0.15, metal: 0.1, emissive: 0x5b9cc4, ei: 0.12 }), r, 0.03, r, x, y + 0.03, z));
    for (var i = 0; i < 6; i++) {
      var a = rnd() * Math.PI * 2;
      var o = pbReeds(rnd);
      o.position.set(x + Math.cos(a) * (r + 0.4), y, z + Math.sin(a) * (r + 0.4));
      scene.add(o);
    }
    var palm = pbPalm(rnd, 2.2);
    palm.position.set(x + r * 0.9, y, z - r * 0.9);
    scene.add(palm);
  }
  function pbMasts(scene, hw, hd) {
    var K = pbGeo();
    [[-(hw - 0.4), -(hd - 0.4)], [hw - 0.4, hd - 0.4]].forEach(function (p) {
      scene.add(pbMesh(K.cyl, pbMat(0x39422c, { rough: 0.6, metal: 0.5 }), 0.035, 0.5, 0.035, p[0], 4.85, p[1]));
      scene.add(pbMesh(K.sphere, pbMat(0xec5a20, { emissive: 0xec5a20, ei: 0.9 }), 0.09, 0.09, 0.09, p[0], 5.4, p[1]));
    });
  }
  function pbDecorate(s, id) {
    try {
    if (!s || !s.scene || s.pbDone) return;
    s.pbDone = true;
    var scene = s.scene;
    if (id === 'hydro') {
      var rnd = pbRand(77);
      pbGround(scene, 40, -2.32);
      pbScatterRect(scene, rnd, -22, 2, -13.6, -8.6, 14, 6.0);
      pbScatterRect(scene, rnd, -22, 2, 8.6, 13.6, 14, 6.0);
      pbScatter(scene, rnd, 16, 0, 9, 16, 12, -2.1);
      for (var i = 0; i < 5; i++) {
        var o = pbReeds(rnd);
        o.position.set(14 + rnd() * 5, -2.1, (rnd() - 0.5) * 12);
        scene.add(o);
      }
      return;
    }
    var cfg = id === 'dc2'
      ? { hw: 9.7, hd: 8.4, R: 31 }
      : { hw: 9.1, hd: 6.9, R: 27 };
    var rnd2 = pbRand(id === 'dc2' ? 41 : 13);
    pbGround(scene, cfg.R, -0.24);
    var fw = cfg.hw + 5.5, fd = cfg.hd + 4.5;
    pbFence(scene, fw, fd);
    pbScatter(scene, rnd2, 0, 0, Math.max(fw, fd) + 1.5, cfg.R - 1.5, 30, 0);
    pbTransformers(scene, -fw + 3.2, -fd + 1.8);
    pbChillers(scene, fw - 8.2, -fd + 1.6, 3);
    pbPavilion(scene, cfg.hw * 0.4, cfg.hd + 2.2);
    pbPoles(scene, [[-fw + 1, fd - 1], [fw - 1, fd - 1], [-fw + 1, -fd + 4.5], [fw - 1, -fd + 4.5]]);
    pbPond(scene, rnd2, cfg.R * 0.62, cfg.R * 0.52, 3.2, -0.2);
    pbMasts(scene, cfg.hw, cfg.hd);
    } catch (e) { if (window.console) console.error('decor', e); }
  }
  function pbHeroDecorate(scene) {
    try {
    var rnd = pbRand(29);
    pbGround(scene, 58, -0.3);
    pbScatter(scene, rnd, 0, 0, 19, 40, 44, 0);
    pbPond(scene, rnd, 21, 13, 4.2, -0.25);
    pbFence(scene, 16.5, 10.5);
    var moon = new THREE.Mesh(new THREE.SphereGeometry(2.6, 16, 12),
      new THREE.MeshBasicMaterial({ color: 0xf2eec2, fog: false }));
    moon.position.set(-30, 16, -44);
    scene.add(moon);
    } catch (e) { if (window.console) console.error('decor', e); }
  }
`;

module.exports = { remapColors, PB_TYPE_CSS, PB_JS };
