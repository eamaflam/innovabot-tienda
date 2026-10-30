/* =========================================================
   InnovaBot · Landing 3D
   Three.js (robot + rayos + bloques) · GSAP ScrollTrigger
   ========================================================= */
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { Line2 } from 'three/addons/lines/Line2.js';
import { LineMaterial } from 'three/addons/lines/LineMaterial.js';
import { LineGeometry } from 'three/addons/lines/LineGeometry.js';

const gsap = window.gsap;
const ScrollTrigger = window.ScrollTrigger;
gsap.registerPlugin(ScrollTrigger);

// ---------- utilidades ----------
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const lerp = (a, b, t) => a + (b - a) * t;
const rand = (a, b) => a + Math.random() * (b - a);
const smooth = (a, b, v) => { const t = clamp((v - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
const easeOut = (t) => 1 - Math.pow(1 - t, 3);
const V3 = THREE.Vector3;

// Estado compartido controlado por el scroll
const state = { p: 0, shop: 0 };
const fx = { jump: 0, surge: 0 };

initUI();
initWebGL();

/* =========================================================
   1. ANIMACIONES DE INTERFAZ (GSAP)
   ========================================================= */
function initUI() {
    // Dividir primera línea del titular en letras
    const firstLine = document.querySelector('.hero-title .line:not(.line--electric)');
    if (firstLine) {
        const text = firstLine.textContent.trim();
        firstLine.textContent = '';
        [...text].forEach(ch => {
            const s = document.createElement('span');
            s.className = 'char';
            s.textContent = ch === ' ' ? '\u00A0' : ch;
            firstLine.appendChild(s);
        });
    }

    // Intro del hero
    gsap.timeline({ delay: 0.15 })
        .from('.hero-title .char', { yPercent: 115, rotate: 10, duration: 1, ease: 'power4.out', stagger: 0.045 })
        .from('.hero-title .line--electric', { y: 60, opacity: 0, filter: 'blur(14px)', duration: 1.1, ease: 'power4.out' }, '-=0.7')
        .from(['.hero-landing .code-chip', '.hero-sub', '.hero-ctas'], { y: 26, opacity: 0, duration: 0.7, stagger: 0.1, ease: 'power3.out' }, '-=0.7')
        .from('.scroll-hint span, .scroll-hint i', { opacity: 0, y: 10, duration: 0.6 }, '-=0.3');

    // El titular se aleja al hacer scroll
    gsap.to('.hero-inner', {
        yPercent: -35, opacity: 0, scale: 0.9, ease: 'none',
        scrollTrigger: { trigger: '.hero-landing', start: 'top top', end: 'bottom 25%', scrub: true }
    });
    gsap.to('.scroll-hint', {
        opacity: 0, ease: 'none',
        scrollTrigger: { trigger: '.hero-landing', start: 'top top', end: '25% top', scrub: true }
    });

    // Tarjetas de cada paso
    document.querySelectorAll('.step').forEach(sec => {
        const card = sec.querySelector('.step-card');
        const dir = sec.classList.contains('step--right') ? 1 : sec.classList.contains('step--left') ? -1 : 0;
        gsap.timeline({
            scrollTrigger: { trigger: sec, start: 'top 70%', end: 'bottom 30%', toggleActions: 'play reverse play reverse' }
        })
            .fromTo(card, { opacity: 0, x: dir * 90, y: dir ? 0 : 60 }, { opacity: 1, x: 0, y: 0, duration: 0.8, ease: 'power3.out' })
            .from(card.querySelectorAll('.step-tag, h3, p, .step-code, .btn-block'),
                { y: 20, opacity: 0, stagger: 0.07, duration: 0.5, ease: 'power2.out' }, '-=0.5');
    });

    // Encabezado de la tienda
    gsap.from(['.shop-section .code-chip', '.shop-section .section-title', '.section-sub', '.search-container'], {
        y: 40, opacity: 0, duration: 0.8, stagger: 0.1, ease: 'power3.out',
        scrollTrigger: { trigger: '.shop-section', start: 'top 65%' }
    });

    // Entrada escalonada de productos
    ScrollTrigger.batch('.product-card', {
        start: 'top 92%',
        once: true,
        onEnter: batch => gsap.fromTo(batch,
            { y: 50, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.7, stagger: 0.07, ease: 'power3.out', clearProps: 'transform,opacity' })
    });

    // Efecto "chispazo" al agregar al carrito
    document.addEventListener('click', (e) => {
        const btn = e.target.closest('.product-card .btn');
        if (!btn) return;
        retrigger(btn, 'zap');
        retrigger(document.querySelector('.cart-float'), 'zap');
        window.dispatchEvent(new CustomEvent('innova:zap'));
    });

    // Scroll suave para anclas
    document.querySelectorAll('a[href^="#"]').forEach(a => {
        a.addEventListener('click', (e) => {
            const target = document.querySelector(a.getAttribute('href'));
            if (!target) return;
            e.preventDefault();
            target.scrollIntoView({ behavior: 'smooth' });
        });
    });
}

function retrigger(el, cls) {
    if (!el) return;
    el.classList.remove(cls);
    void el.offsetWidth;
    el.classList.add(cls);
}

/* =========================================================
   2. ESCENA 3D
   ========================================================= */
function initWebGL() {
    const canvas = document.getElementById('webgl');
    let renderer;
    try {
        renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
    } catch (err) {
        document.body.classList.add('no-webgl');
        return;
    }

    let W = window.innerWidth, H = window.innerHeight;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    renderer.setSize(W, H, false);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;

    const BG = 0x060a18;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(BG);
    scene.fog = new THREE.FogExp2(BG, 0.03);

    const camera = new THREE.PerspectiveCamera(40, W / H, 0.1, 200);
    camera.position.set(0, 1.2, 14);

    // ---------- Postproceso (bloom para la electricidad) ----------
    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    const bloom = new UnrealBloomPass(new THREE.Vector2(W, H), 0.95, 0.55, 0.78);
    composer.addPass(bloom);
    composer.addPass(new OutputPass());

    // ---------- Luces ----------
    scene.add(new THREE.HemisphereLight(0x9fc8ff, 0x0a0f20, 0.9));
    const key = new THREE.DirectionalLight(0xffffff, 2.2);
    key.position.set(4, 8, 6);
    scene.add(key);
    const rim = new THREE.PointLight(0x00e5ff, 25, 22, 2);
    rim.position.set(-4, 3, -3);
    scene.add(rim);
    const rim2 = new THREE.PointLight(0xff8c1a, 16, 22, 2);
    rim2.position.set(4, -1, -3);
    scene.add(rim2);
    const flash = new THREE.PointLight(0x9ff6ff, 0, 10, 2);
    scene.add(flash);

    // ---------- Materiales ----------
    const M = {
        body: new THREE.MeshStandardMaterial({ color: 0xe9eef8, metalness: 0.25, roughness: 0.35 }),
        accent: new THREE.MeshStandardMaterial({ color: 0x2f7dff, metalness: 0.45, roughness: 0.3 }),
        orange: new THREE.MeshStandardMaterial({ color: 0xff8c1a, metalness: 0.3, roughness: 0.4 }),
        dark: new THREE.MeshStandardMaterial({ color: 0x151c33, metalness: 0.6, roughness: 0.35 }),
        joint: new THREE.MeshStandardMaterial({ color: 0x1b2440, metalness: 0.5, roughness: 0.3, emissive: 0x00e5ff, emissiveIntensity: 0 }),
        eye: new THREE.MeshStandardMaterial({ color: 0x0a2a33, emissive: 0x00e5ff, emissiveIntensity: 0 }),
        tip: new THREE.MeshStandardMaterial({ color: 0x332200, emissive: 0xffd60a, emissiveIntensity: 0 }),
        ledOn: new THREE.MeshStandardMaterial({ color: 0x220008, emissive: 0xff3355, emissiveIntensity: 0 }),
        ledOff: new THREE.MeshStandardMaterial({ color: 0x2a0d14, emissive: 0xff3355, emissiveIntensity: 0 }),
    };

    /* ---------- ROBOT (geometría simple) ---------- */
    const robot = new THREE.Group();
    robot.position.y = -0.6;
    scene.add(robot);

    const parts = [];
    const rb = (w, h, d, r = 0.08) => new RoundedBoxGeometry(w, h, d, 4, r);
    const cyl = (r1, r2, h, seg = 24) => new THREE.CylinderGeometry(r1, r2, h, seg);
    const sph = (r) => new THREE.SphereGeometry(r, 24, 16);

    function part(geoOrObj, mat, parent, pos, rot = [0, 0, 0]) {
        const mesh = geoOrObj.isObject3D ? geoOrObj : new THREE.Mesh(geoOrObj, mat);
        parent.add(mesh);
        const final = new V3(...pos);
        const dir = new V3().randomDirection();
        dir.y *= 0.7;
        const start = final.clone().add(dir.multiplyScalar(rand(4.5, 8.5)));
        start.z = Math.min(start.z, 3);
        const p = {
            mesh, final, start,
            finalRot: new THREE.Euler(...rot),
            startRot: new THREE.Euler(rand(-3, 3), rand(-3, 3), rand(-3, 3)),
            phase: Math.random() * Math.PI * 2,
            s: 0, e: 1, t: 0, arrived: false,
        };
        mesh.position.copy(start);
        parts.push(p);
        return p;
    }

    // Grupo 1 · Piernas
    const G1 = [], G2 = [], G3 = [];
    for (const sx of [-1, 1]) G1.push(part(rb(0.62, 0.26, 0.95, 0.08), M.accent, robot, [sx * 0.42, -2.05, 0.12]));
    for (const sx of [-1, 1]) G1.push(part(cyl(0.17, 0.2, 0.85), M.body, robot, [sx * 0.42, -1.5, 0]));
    for (const sx of [-1, 1]) G1.push(part(sph(0.21), M.joint, robot, [sx * 0.42, -1.02, 0]));
    for (const sx of [-1, 1]) G1.push(part(cyl(0.2, 0.18, 0.75), M.body, robot, [sx * 0.42, -0.58, 0]));
    G1.push(part(rb(1.35, 0.38, 0.8, 0.1), M.dark, robot, [0, -0.08, 0]));

    // Grupo 2 · Torso, pecho (matriz LED tipo micro:bit) y brazos
    G2.push(part(rb(1.8, 1.55, 1.0, 0.16), M.body, robot, [0, 0.92, 0]));

    const chest = new THREE.Group();
    chest.add(new THREE.Mesh(rb(1.0, 0.95, 0.08, 0.03), M.dark));
    const heart = ['01010', '11111', '11111', '01110', '00100'];
    const ledGeo = new THREE.BoxGeometry(0.11, 0.11, 0.04);
    for (let r = 0; r < 5; r++) {
        for (let c = 0; c < 5; c++) {
            const led = new THREE.Mesh(ledGeo, heart[r][c] === '1' ? M.ledOn : M.ledOff);
            led.position.set((c - 2) * 0.17, (2 - r) * 0.15, 0.05);
            chest.add(led);
        }
    }
    G2.push(part(chest, null, robot, [0, 1.0, 0.52]));
    for (const sx of [-1, 1]) G2.push(part(cyl(0.08, 0.08, 0.06), M.orange, robot, [sx * 0.7, 1.0, 0.52], [Math.PI / 2, 0, 0]));

    const armL = new THREE.Group(); armL.position.set(-1.12, 1.45, 0); robot.add(armL);
    const armR = new THREE.Group(); armR.position.set(1.12, 1.45, 0); robot.add(armR);
    const armSpecs = [
        (sx) => [sph(0.27), M.accent, [0, 0, 0]],
        (sx) => [cyl(0.15, 0.15, 0.75), M.body, [sx * 0.08, -0.45, 0]],
        (sx) => [sph(0.17), M.joint, [sx * 0.08, -0.88, 0]],
        (sx) => [cyl(0.14, 0.12, 0.65), M.body, [sx * 0.08, -1.25, 0]],
        (sx) => [new THREE.TorusGeometry(0.17, 0.06, 12, 24, Math.PI * 1.4), M.orange, [sx * 0.08, -1.68, 0], [0, 0, -Math.PI * 0.2]],
    ];
    for (const spec of armSpecs) {
        for (const [arm, sx] of [[armL, -1], [armR, 1]]) {
            const [g, m, pos, rot] = spec(sx);
            G2.push(part(g, m, arm, pos, rot));
        }
    }

    // Grupo 3 · Cuello, cabeza, ojos, antena
    G3.push(part(cyl(0.16, 0.2, 0.3), M.dark, robot, [0, 1.82, 0]));
    const head = new THREE.Group(); head.position.set(0, 1.95, 0); robot.add(head);
    G3.push(part(rb(1.3, 0.95, 1.0, 0.2), M.body, head, [0, 0.52, 0]));
    G3.push(part(rb(1.05, 0.46, 0.06, 0.025), M.dark, head, [0, 0.56, 0.5]));
    const eyes = [];
    for (const sx of [-1, 1]) { const p = part(sph(0.1), M.eye, head, [sx * 0.24, 0.56, 0.54]); eyes.push(p.mesh); G3.push(p); }
    for (const sx of [-1, 1]) G3.push(part(cyl(0.17, 0.17, 0.14), M.accent, head, [sx * 0.72, 0.52, 0], [0, 0, Math.PI / 2]));
    G3.push(part(cyl(0.025, 0.025, 0.5, 8), M.dark, head, [0, 1.24, 0]));
    const tipPart = part(sph(0.09), M.tip, head, [0, 1.52, 0]);
    G3.push(tipPart);

    // Ventanas de ensamblaje según el progreso del scroll (0 → 1)
    const spread = (list, a, b) => {
        const step = (b - a) / list.length;
        list.forEach((p, i) => { p.s = a + i * step; p.e = Math.min(b, p.s + step * 2.5); });
    };
    spread(G1, 0.03, 0.28);
    spread(G2, 0.30, 0.55);
    spread(G3, 0.57, 0.76);

    // Plataforma y suelo
    const platform = new THREE.Mesh(cyl(1.6, 1.75, 0.14, 48), M.dark);
    platform.position.y = -2.25;
    robot.add(platform);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x00e5ff, toneMapped: false });
    const ring = new THREE.Mesh(new THREE.TorusGeometry(1.66, 0.035, 8, 96), ringMat);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = -2.18;
    robot.add(ring);
    const grid = new THREE.GridHelper(60, 60, 0x00e5ff, 0x1a2a55);
    grid.position.y = -2.33;
    grid.material.transparent = true;
    grid.material.opacity = 0.22;
    robot.add(grid);

    /* ---------- RAYOS (Line2 con grosor real) ---------- */
    const SEG = 16, POOL = 48;
    const bolts = [];
    const lineMats = [];
    const tmpPts = new Float32Array((SEG + 1) * 3);
    for (let i = 0; i < POOL; i++) {
        const geo = new LineGeometry();
        geo.setPositions(new Float32Array((SEG + 1) * 3));
        const mat = new LineMaterial({
            color: 0xbff8ff, linewidth: 2.5, transparent: true, opacity: 0,
            depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false,
        });
        mat.resolution.set(W, H);
        lineMats.push(mat);
        const line = new Line2(geo, mat);
        line.frustumCulled = false;
        line.visible = false;
        scene.add(line);
        bolts.push({ line, geo, mat, a: new V3(), b: new V3(), life: 0, age: 0, active: false, amp: 0.18 });
    }

    function setBoltPath(bolt) {
        const { a, b, amp } = bolt;
        const len = a.distanceTo(b);
        for (let i = 0; i <= SEG; i++) {
            const t = i / SEG;
            let x = lerp(a.x, b.x, t), y = lerp(a.y, b.y, t), z = lerp(a.z, b.z, t);
            if (i > 0 && i < SEG) {
                const j = amp * len * Math.sin(Math.PI * t);
                x += (Math.random() - 0.5) * j;
                y += (Math.random() - 0.5) * j;
                z += (Math.random() - 0.5) * j;
            }
            tmpPts[i * 3] = x; tmpPts[i * 3 + 1] = y; tmpPts[i * 3 + 2] = z;
        }
        const data = bolt.geo.attributes.instanceStart.data;
        const arr = data.array;
        for (let i = 0; i < SEG; i++) {
            arr[i * 6] = tmpPts[i * 3]; arr[i * 6 + 1] = tmpPts[i * 3 + 1]; arr[i * 6 + 2] = tmpPts[i * 3 + 2];
            arr[i * 6 + 3] = tmpPts[i * 3 + 3]; arr[i * 6 + 4] = tmpPts[i * 3 + 4]; arr[i * 6 + 5] = tmpPts[i * 3 + 5];
        }
        data.needsUpdate = true;
    }

    function spawnBolt(a, b, o = {}) {
        let bolt = bolts.find(x => !x.active);
        if (!bolt) bolt = bolts.reduce((m, x) => (x.age / x.life > m.age / m.life ? x : m));
        const width = o.width ?? 2.5;
        bolt.a.copy(a); bolt.b.copy(b);
        bolt.life = o.life ?? 0.3;
        bolt.age = 0;
        bolt.active = true;
        bolt.amp = o.amp ?? 0.18;
        bolt.mat.linewidth = width;
        bolt.mat.color.set(o.color ?? 0xbff8ff);
        bolt.mat.opacity = 1;
        bolt.line.visible = true;
        setBoltPath(bolt);
        if (o.branch !== false && Math.random() < 0.7) {
            const m = a.clone().lerp(b, rand(0.3, 0.7));
            const end = m.clone().add(new V3().randomDirection().multiplyScalar(a.distanceTo(b) * 0.3));
            spawnBolt(m, end, { life: bolt.life * 0.8, width: width * 0.5, branch: false, color: o.color, amp: 0.25 });
        }
    }

    function updateBolts(dt) {
        for (const bolt of bolts) {
            if (!bolt.active) continue;
            bolt.age += dt;
            if (bolt.age >= bolt.life) {
                bolt.active = false;
                bolt.line.visible = false;
                continue;
            }
            if (Math.random() < 0.6) setBoltPath(bolt);
            bolt.mat.opacity = (1 - bolt.age / bolt.life) * (0.55 + 0.45 * Math.random());
        }
    }

    /* ---------- CHISPAS ---------- */
    const SP = 700;
    const spPos = new Float32Array(SP * 3);
    const spCol = new Float32Array(SP * 3);
    const spVel = new Float32Array(SP * 3);
    const spLife = new Float32Array(SP);
    const spMax = new Float32Array(SP).fill(1);
    for (let i = 0; i < SP; i++) spPos[i * 3 + 1] = -999;
    let spIdx = 0;
    const spGeo = new THREE.BufferGeometry();
    spGeo.setAttribute('position', new THREE.BufferAttribute(spPos, 3));
    spGeo.setAttribute('color', new THREE.BufferAttribute(spCol, 3));
    const sparks = new THREE.Points(spGeo, new THREE.PointsMaterial({
        size: 0.09, map: makeDotTexture(), vertexColors: true, transparent: true,
        depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false,
    }));
    sparks.frustumCulled = false;
    scene.add(sparks);

    const tmpDir = new V3();
    function burst(p, n = 24, speed = 4) {
        for (let k = 0; k < n; k++) {
            const i = spIdx++ % SP;
            spPos[i * 3] = p.x; spPos[i * 3 + 1] = p.y; spPos[i * 3 + 2] = p.z;
            tmpDir.randomDirection().multiplyScalar(rand(1, speed));
            spVel[i * 3] = tmpDir.x; spVel[i * 3 + 1] = tmpDir.y + 1.5; spVel[i * 3 + 2] = tmpDir.z;
            spLife[i] = spMax[i] = rand(0.4, 0.9);
        }
    }

    function updateSparks(dt) {
        for (let i = 0; i < SP; i++) {
            if (spLife[i] <= 0) { spPos[i * 3 + 1] = -999; continue; }
            spLife[i] -= dt;
            spVel[i * 3 + 1] -= 7 * dt;
            spPos[i * 3] += spVel[i * 3] * dt;
            spPos[i * 3 + 1] += spVel[i * 3 + 1] * dt;
            spPos[i * 3 + 2] += spVel[i * 3 + 2] * dt;
            const c = Math.max(0, spLife[i] / spMax[i]) * 1.6;
            spCol[i * 3] = c; spCol[i * 3 + 1] = c * 0.85; spCol[i * 3 + 2] = c * 0.45;
        }
        spGeo.attributes.position.needsUpdate = true;
        spGeo.attributes.color.needsUpdate = true;
    }

    function flashAt(p, intensity = 20) {
        flash.position.copy(p);
        flash.intensity = Math.max(flash.intensity, intensity);
    }

    /* ---------- FONDO: BLOQUES DE PROGRAMACIÓN EN 3D ---------- */
    const blocksGroup = new THREE.Group();
    scene.add(blocksGroup);
    const blocks = [];
    buildBlocks();

    async function buildBlocks() {
        if (document.fonts && document.fonts.ready) {
            await Promise.race([document.fonts.ready, new Promise(r => setTimeout(r, 1500))]);
        }
        const DEFS = [
            ['al iniciar', 'event', true], ['por siempre', 'loop'], ['mover [10] pasos', 'motion'],
            ['girar ↻ [15] grados', 'motion'], ['si distancia < [10] cm', 'sensor'], ['esperar [1] segundo', 'loop'],
            ['mostrar ícono ♥', 'led'], ['encender LED x:[2] y:[2]', 'led'], ['leer temperatura', 'sensor'],
            ['repetir [4] veces', 'loop'], ['reproducir tono Do', 'sound'], ['motor A a [100] %', 'action'],
            ['al presionar botón A', 'event', true], ['fijar velocidad a [50]', 'action'], ['enviar por radio [1]', 'green'],
            ['si humedad < [30] %', 'sensor'], ['servo a [90]°', 'action'], ['mostrar número [7]', 'led'],
            ['al agitar', 'event', true], ['bomba de agua ON', 'green'], ['leer pH del agua', 'sensor'],
        ];
        const COUNT = 48;
        for (let i = 0; i < COUNT; i++) {
            const [text, type, hat] = DEFS[i % DEFS.length];
            const { tex, w, h } = makeBlockTexture(text, type, hat);
            tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
            const scale = 0.011;
            const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false, opacity: 0 });
            mat.color.setScalar(0.72);
            const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w * scale, h * scale), mat);
            let x = rand(-24, 24), y = rand(-12, 15), z = rand(-28, -7);
            if (Math.abs(x) < 5 && z > -12) x += Math.sign(x || 1) * 6;
            mesh.position.set(x, y, z);
            const rz = rand(-0.15, 0.15);
            mesh.rotation.set(0, rand(-0.25, 0.25), rz);
            blocksGroup.add(mesh);
            blocks.push({ mesh, mat, base: mesh.position.clone(), rz, ph: Math.random() * 6.28, flash: 0 });
            gsap.to(mat, { opacity: rand(0.55, 0.85), duration: 1.5, delay: 0.3 + i * 0.03 });
        }
    }

    /* ---------- CÁMARA: recorrido sincronizado con el ensamblaje ---------- */
    const camPath = new THREE.CatmullRomCurve3([
        new V3(0, 1.2, 14),       // hero: piezas dispersas
        new V3(5.2, -0.6, 7.5),   // paso 1: piernas
        new V3(-5.5, 1.2, 7),     // paso 2: torso y brazos
        new V3(2.6, 2.6, 4.6),    // paso 3: cabeza
        new V3(0, 0.6, 10),       // paso 4: plano heroico
    ]);
    const lookPath = new THREE.CatmullRomCurve3([
        new V3(0, 0.5, 0),
        new V3(0, -1.6, 0),
        new V3(0, 0.4, 0),
        new V3(0, 1.8, 0),
        new V3(0, 0.5, 0),
    ]);
    // Desplaza el robot al lado contrario de la tarjeta de texto (solo escritorio)
    const sideKeys = [[0, 0], [0.25, 1], [0.5, -1], [0.75, 1], [1, 0]];
    const sideAt = (p) => {
        for (let i = 0; i < sideKeys.length - 1; i++) {
            const [p0, v0] = sideKeys[i], [p1, v1] = sideKeys[i + 1];
            if (p <= p1) return lerp(v0, v1, smooth(p0, p1, p));
        }
        return 0;
    };

    /* ---------- SCROLL (GSAP ScrollTrigger) ---------- */
    gsap.to(state, {
        p: 1, ease: 'none',
        scrollTrigger: { trigger: '#experience', start: 'top top', end: 'bottom bottom', scrub: 1.2 }
    });
    gsap.to(state, {
        shop: 1, ease: 'none',
        scrollTrigger: { trigger: '#productos', start: 'top bottom', end: 'top 15%', scrub: 1 }
    });

    // Interacción
    const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
    window.addEventListener('pointermove', (e) => {
        mouse.tx = (e.clientX / window.innerWidth) * 2 - 1;
        mouse.ty = -((e.clientY / window.innerHeight) * 2 - 1);
    });

    let ready = false;
    setTimeout(() => { ready = true; }, 1600);

    window.addEventListener('innova:zap', () => {
        const tip = tipPart.mesh.getWorldPosition(new V3());
        for (let i = 0; i < 6; i++) {
            const target = parts[(Math.random() * parts.length) | 0].mesh.getWorldPosition(new V3());
            spawnBolt(tip.clone().add(new V3(rand(-2, 2), rand(2, 4), rand(-1, 1))), target, { life: 0.4, width: 3, color: 0xffe066 });
        }
        burst(tip, 30, 5);
        flashAt(tip, 30);
        fx.surge = 1;
        gsap.fromTo(fx, { jump: 0.35 }, { jump: 0, duration: 0.9, ease: 'bounce.out' });
    });

    function onArrive(p) {
        if (!ready) return;
        const wp = p.mesh.getWorldPosition(new V3());
        for (let i = 0; i < 3; i++) {
            spawnBolt(wp.clone().add(new V3().randomDirection().multiplyScalar(rand(1.5, 3))), wp, { life: 0.35 });
        }
        burst(wp, 28, 4);
        flashAt(wp, 22);
        // Un bloque de código del fondo "energiza" la pieza
        if (blocks.length && Math.random() < 0.6) {
            const b = blocks[(Math.random() * blocks.length) | 0];
            b.flash = 1;
            spawnBolt(b.mesh.getWorldPosition(new V3()), wp, { life: 0.45, width: 1.6, amp: 0.08, branch: false, color: 0xffd60a });
        }
    }

    /* ---------- BUCLE DE ANIMACIÓN ---------- */
    const clock = new THREE.Clock();
    let time = 0;
    const vA = new V3(), vB = new V3(), vLook = new V3(), vRight = new V3();

    function updateParts(P, dt) {
        for (const p of parts) {
            const t = clamp((P - p.s) / (p.e - p.s), 0, 1);
            const k = easeOut(t);
            const m = p.mesh;
            const free = 1 - k;
            m.position.lerpVectors(p.start, p.final, k);
            m.position.y += Math.sin(time * 1.2 + p.phase) * 0.3 * free;
            m.position.x += Math.cos(time * 0.8 + p.phase) * 0.2 * free;
            m.rotation.set(
                lerp(p.startRot.x + time * 0.3 * free, p.finalRot.x, k),
                lerp(p.startRot.y + time * 0.2 * free, p.finalRot.y, k),
                lerp(p.startRot.z, p.finalRot.z, k)
            );
            m.scale.setScalar(0.55 + 0.45 * k);

            if (t >= 0.999 && !p.arrived) { p.arrived = true; onArrive(p); }
            else if (t < 0.97) p.arrived = false;

            // Arco de "soldadura" mientras la pieza se acerca a su sitio
            if (ready && t > 0.5 && t < 0.999 && Math.random() < 6 * dt) {
                m.getWorldPosition(vA);
                vB.copy(p.final);
                m.parent.localToWorld(vB);
                vB.add(new V3(rand(-0.3, 0.3), rand(-0.3, 0.3), rand(-0.3, 0.3)));
                spawnBolt(vA, vB, { life: 0.18, width: 1.8, branch: false, amp: 0.3 });
            }
            p.t = t;
        }

        // Electricidad ambiental entre piezas dispersas (hero)
        if (ready && P < 0.2 && Math.random() < 1.5 * dt) {
            const a = parts[(Math.random() * parts.length) | 0];
            const b = parts[(Math.random() * parts.length) | 0];
            if (a !== b && a.t < 0.5 && b.t < 0.5) {
                a.mesh.getWorldPosition(vA); b.mesh.getWorldPosition(vB);
                if (vA.distanceTo(vB) < 6) spawnBolt(vA, vB, { life: 0.22, width: 1.4, color: 0x7fd8ff });
            }
        }
    }

    function updatePower(P, dt) {
        const pw = smooth(0.78, 0.94, P);
        const storm = Math.max(0, 1 - Math.abs(P - 0.86) / 0.09);
        fx.surge = Math.max(0, fx.surge - dt * 1.5);

        M.joint.emissiveIntensity = pw * 2.2 + storm * Math.random() * 2 + fx.surge * 3;
        M.eye.emissiveIntensity = pw * 5 + fx.surge * 4;
        M.tip.emissiveIntensity = pw * (3 + 2 * Math.sin(time * 4));
        const beat = Math.pow(Math.max(0, Math.sin(time * 3.2)), 8);
        M.ledOn.emissiveIntensity = pw * (2 + 2.5 * beat) + fx.surge * 3;
        M.ledOff.emissiveIntensity = pw * 0.12;
        ringMat.color.setRGB(0, 0.9, 1).multiplyScalar(0.15 + pw * 2.4 + storm * 2 + fx.surge * 2);
        rim.intensity = 20 + pw * 40;

        // Parpadeo de ojos
        const blink = (Math.sin(time * 0.9) > 0.985) ? 0.15 : 1;
        eyes.forEach(e => { e.scale.y = e.scale.x * blink; });

        // Tormenta eléctrica de encendido
        if (ready && Math.random() < storm * 18 * dt) {
            const ang = Math.random() * Math.PI * 2;
            robot.localToWorld(vA.set(Math.cos(ang) * 1.66, -2.18, Math.sin(ang) * 1.66));
            parts[(Math.random() * parts.length) | 0].mesh.getWorldPosition(vB);
            spawnBolt(vA, vB, { life: 0.25, width: 3 });
            if (Math.random() < 0.3) burst(vB, 12, 3);
            flashAt(vB, 18);
        }
        if (ready && Math.random() < storm * 6 * dt) {
            tipPart.mesh.getWorldPosition(vA);
            spawnBolt(vA, vA.clone().add(new V3(rand(-3, 3), rand(4, 7), rand(-2, 1))), { life: 0.3, width: 3.2, color: 0xfff3b0 });
        }
        // Chispa ocasional en la antena con el robot encendido
        if (ready && pw > 0.99 && Math.random() < 0.6 * dt) {
            tipPart.mesh.getWorldPosition(vA);
            spawnBolt(vA, vA.clone().add(new V3().randomDirection().multiplyScalar(0.7)), { life: 0.15, width: 1.5, branch: false });
        }

        // Saludo, respiración y mirada
        const wave = smooth(0.92, 1.0, P);
        armR.rotation.z = wave * (2.5 + Math.sin(time * 7) * 0.3);
        armL.rotation.z = -pw * 0.08 * Math.sin(time * 1.4);
        head.rotation.y = lerp(head.rotation.y, (mouse.x * 0.5 + Math.sin(time * 0.5) * 0.15) * pw, 0.08);
        head.rotation.x = lerp(head.rotation.x, -mouse.y * 0.2 * pw, 0.08);
        robot.position.y = -0.6 + Math.sin(time * 1.6) * 0.05 * pw + fx.jump;
        robot.rotation.y = lerp(robot.rotation.y, mouse.x * 0.25 + state.shop * 0.6, 0.05);
    }

    function updateCamera(P) {
        camPath.getPoint(P, vA);
        lookPath.getPoint(P, vLook);
        vA.z += state.shop * 3;
        vA.y += state.shop * 1.5;

        const aspect = camera.aspect;
        const f = aspect < 1 ? clamp(1.25 / aspect, 1, 2) : 1;
        vA.sub(vLook).multiplyScalar(f).add(vLook);

        if (aspect >= 1) {
            vRight.subVectors(vLook, vA).cross(camera.up).normalize();
            const off = -sideAt(P) * 1.5;
            vA.addScaledVector(vRight, off);
            vLook.addScaledVector(vRight, off);
        }

        camera.position.set(vA.x + mouse.x * 0.6, vA.y + mouse.y * 0.4, vA.z);
        camera.lookAt(vLook);
    }

    function updateBlocks(P, dt) {
        blocksGroup.position.y = -3 + P * 9 + state.shop * 4;
        blocksGroup.rotation.y = mouse.x * 0.05;
        for (const b of blocks) {
            b.mesh.position.y = b.base.y + Math.sin(time * 0.5 + b.ph) * 0.3;
            b.mesh.rotation.z = b.rz + Math.sin(time * 0.3 + b.ph) * 0.05;
            if (b.flash > 0.001) {
                b.flash = Math.max(0, b.flash - dt * 1.8);
                b.mat.color.setScalar(0.72 + b.flash * 1.2);
            }
        }
    }

    function tick() {
        const dt = Math.min(clock.getDelta(), 0.05);
        time += dt;
        mouse.x += (mouse.tx - mouse.x) * 0.05;
        mouse.y += (mouse.ty - mouse.y) * 0.05;

        const P = state.p;
        updateParts(P, dt);
        updatePower(P, dt);
        updateCamera(P);
        updateBlocks(P, dt);
        updateBolts(dt);
        updateSparks(dt);
        flash.intensity = Math.max(0, flash.intensity - dt * 90);

        composer.render();
        requestAnimationFrame(tick);
    }
    tick();

    // Redimensionar
    function resize() {
        W = window.innerWidth; H = window.innerHeight;
        camera.aspect = W / H;
        camera.updateProjectionMatrix();
        renderer.setSize(W, H, false);
        composer.setSize(W, H);
        lineMats.forEach(m => m.resolution.set(W, H));
    }
    window.addEventListener('resize', resize);
    resize();
}

/* =========================================================
   3. TEXTURAS GENERADAS EN CANVAS
   ========================================================= */
function makeDotTexture() {
    const c = document.createElement('canvas');
    c.width = c.height = 64;
    const ctx = c.getContext('2d');
    const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    g.addColorStop(0, 'rgba(255,255,255,1)');
    g.addColorStop(0.3, 'rgba(255,255,255,0.8)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 64, 64);
    return new THREE.CanvasTexture(c);
}

// Bloque estilo MakeCode / Scratch con muesca, pestaña y valores en "píldora"
function makeBlockTexture(text, type, hat) {
    const COLORS = {
        event: ['#ffbf00', '#cc9900'], loop: ['#ffab19', '#cf8b17'], motion: ['#4c97ff', '#3373cc'],
        sensor: ['#5cb1d6', '#2e8eb8'], led: ['#9966ff', '#774dcb'], sound: ['#cf63cf', '#bd42bd'],
        action: ['#ff8c1a', '#db6e00'], green: ['#59c059', '#389438'],
    };
    const [fill, stroke] = COLORS[type] || COLORS.motion;
    const S = 2;
    const FONT = '700 32px "JetBrains Mono", Consolas, monospace';
    const segs = text.split(/(\[[^\]]+\])/).filter(Boolean);

    const measure = document.createElement('canvas').getContext('2d');
    measure.font = FONT;
    const gap = 12, padX = 28, h = 78, notch = 10, hatH = hat ? 34 : 0;
    const widths = segs.map(s => s.startsWith('[') ? measure.measureText(s.slice(1, -1)).width + 32 : measure.measureText(s.trim()).width);
    const w = Math.ceil(padX * 2 + widths.reduce((a, b) => a + b, 0) + gap * (segs.length - 1));
    const H = hatH + h + notch + 6;
    const W = w + 6;

    const c = document.createElement('canvas');
    c.width = W * S; c.height = H * S;
    const ctx = c.getContext('2d');
    ctx.scale(S, S);
    ctx.translate(3, 3);

    const r = 10, nx = 28, nw = 38;
    const y0 = hatH;
    ctx.beginPath();
    if (hat) {
        ctx.moveTo(0, y0);
        ctx.bezierCurveTo(24, y0 - 40, 120, y0 - 40, 150, y0);
    } else {
        ctx.moveTo(0, y0 + r);
        ctx.arcTo(0, y0, r, y0, r);
        ctx.lineTo(nx, y0);
        ctx.lineTo(nx + 8, y0 + notch);
        ctx.lineTo(nx + nw - 8, y0 + notch);
        ctx.lineTo(nx + nw, y0);
    }
    ctx.lineTo(w - r, y0);
    ctx.arcTo(w, y0, w, y0 + r, r);
    ctx.lineTo(w, y0 + h - r);
    ctx.arcTo(w, y0 + h, w - r, y0 + h, r);
    ctx.lineTo(nx + nw, y0 + h);
    ctx.lineTo(nx + nw - 8, y0 + h + notch);
    ctx.lineTo(nx + 8, y0 + h + notch);
    ctx.lineTo(nx, y0 + h);
    ctx.lineTo(r, y0 + h);
    ctx.arcTo(0, y0 + h, 0, y0 + h - r, r);
    ctx.closePath();
    ctx.fillStyle = fill;
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = stroke;
    ctx.stroke();

    ctx.font = FONT;
    ctx.textBaseline = 'middle';
    const cy = y0 + h / 2 + 1;
    let x = padX;
    segs.forEach((s, i) => {
        if (s.startsWith('[')) {
            const pw = widths[i];
            ctx.fillStyle = '#ffffff';
            roundRect(ctx, x, cy - 22, pw, 44, 22);
            ctx.fill();
            ctx.fillStyle = '#333';
            ctx.fillText(s.slice(1, -1), x + 16, cy + 1);
        } else {
            ctx.fillStyle = '#ffffff';
            ctx.fillText(s.trim(), x, cy + 1);
        }
        x += widths[i] + gap;
    });

    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    return { tex, w: W, h: H };
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
