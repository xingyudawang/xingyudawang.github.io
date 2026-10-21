import * as THREE from 'three';
import type { CaveScene } from '../data/caveScenes';

export interface SpotProjection {
  id: string;
  /** screen position in CSS pixels, relative to the canvas */
  x: number;
  y: number;
  /** 0 = exactly at the edge of the view, 1 = dead centre */
  centrality: number;
  visible: boolean;
  /** multiplier for marker size based on distance/zoom */
  scale: number;
}

interface EngineOptions {
  scene: CaveScene;
  canvasHost: HTMLElement;
  onReady?: () => void;
}

/**
 * Imperative 360° cave renderer.
 *
 * Replaces the original "one big sphere with a flat photo on it" approach with a
 * real room: four curved painted walls wrapping 360°, a painted caisson ceiling,
 * a sand floor, and (for central-pillar caves) a pillar in the middle. That
 * gives genuine parallax when you turn your head and keeps each mural at its own
 * native resolution instead of squeezing six images into one equirectangular
 * strip.
 */
export class CaveEngine {
  readonly renderer: THREE.WebGLRenderer;
  readonly scene = new THREE.Scene();
  readonly camera: THREE.PerspectiveCamera;

  private host: HTMLElement;
  private root = new THREE.Group();
  private dust: THREE.Points | null = null;
  private disposables: Array<{ dispose(): void }> = [];

  private yaw = 0;
  private pitch = 0;
  private targetYaw = 0;
  private targetPitch = 0;
  private velYaw = 0;
  private velPitch = 0;
  private fov = 78;
  private targetFov = 78;

  private gyroQuat: THREE.Quaternion | null = null;
  private gyroEnabled = false;
  private gyroOffsetQuat = new THREE.Quaternion();

  private raf = 0;
  private clock = new THREE.Clock();
  private elapsed = 0;
  private destroyed = false;
  private resizeObserver: ResizeObserver | null = null;

  private spotPoints: Array<{ id: string; pos: THREE.Vector3 }> = [];
  private projected: SpotProjection[] = [];
  private tmpV = new THREE.Vector3();
  private forward = new THREE.Vector3();

  /** external hook: receives per-frame marker positions */
  onSpots: ((spots: SpotProjection[]) => void) | null = null;

  private loadManager = new THREE.LoadingManager();
  private textureLoader: THREE.TextureLoader;
  private currentSceneId = '';
  /** wall panels awaiting their texture's real aspect ratio (known only after load) */
  private pendingPanels: Array<{
    geo: THREE.BufferGeometry;
    sourceAspect: number;
    surfaceAspect: number;
  }> = [];

  constructor({ scene, canvasHost, onReady }: EngineOptions) {
    this.host = canvasHost;
    this.currentSceneId = scene.caveId;

    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance',
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.setClearColor(0x0b0806, 1);
    canvasHost.appendChild(this.renderer.domElement);
    this.renderer.domElement.style.display = 'block';
    this.renderer.domElement.style.width = '100%';
    this.renderer.domElement.style.height = '100%';

    this.camera = new THREE.PerspectiveCamera(this.fov, 1, 0.1, 200);
    this.camera.rotation.order = 'YXZ';
    this.scene.add(this.root);

    this.textureLoader = new THREE.TextureLoader(this.loadManager);
    this.loadManager.onLoad = () => {
      this.applyPendingUV();
      if (!this.destroyed) onReady?.();
    };

    this.resize();
    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(this.host);

    this.build(scene);
    this.loop();
  }

  /* ------------------------------------------------------------------ */
  /* Scene construction                                                  */
  /* ------------------------------------------------------------------ */

  private loadTexture(url: string): THREE.Texture {
    const tex = this.textureLoader.load(url);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.generateMipmaps = true;
    tex.minFilter = THREE.LinearMipmapLinearFilter;
    tex.magFilter = THREE.LinearFilter;
    tex.anisotropy = Math.min(8, this.renderer.capabilities.getMaxAnisotropy());
    this.disposables.push(tex);
    return tex;
  }

  /**
   * Rewrite a curved wall panel's UVs.
   *
   * Two problems appear on a plain `CylinderGeometry` seen from the inside:
   *  1. `u` runs the wrong way, so every mural would be mirrored.
   *  2. A 90° panel is not 16:9, so a rectangular texture gets stretched.
   *
   * We fix both here, in UV space, by mirroring `u` and then cropping the source
   * rectangle to the panel's real aspect ratio instead of squashing it.
   */
  private fitPanelUV(geometry: THREE.BufferGeometry, sourceAspect: number, surfaceAspect: number) {
    // fraction of the source image we actually use
    let rx = 1;
    let ry = 1;
    if (surfaceAspect < sourceAspect) {
      rx = surfaceAspect / sourceAspect; // panel is taller than the image: crop horizontally
    } else {
      ry = sourceAspect / surfaceAspect; // panel is wider: crop vertically
    }
    const ox = (1 - rx) / 2;
    const oy = (1 - ry) / 2;

    const uv = geometry.getAttribute('uv') as THREE.BufferAttribute;
    for (let i = 0; i < uv.count; i++) {
      const u = uv.getX(i);
      const v = uv.getY(i);
      uv.setXY(i, ox + (1 - u) * rx, oy + v * ry);
    }
    uv.needsUpdate = true;
  }

  /** Apply deferred UV fitting once every wall texture has real dimensions. */
  private applyPendingUV() {
    for (const panel of this.pendingPanels) {
      this.fitPanelUV(panel.geo, panel.sourceAspect, panel.surfaceAspect);
    }
    this.pendingPanels = [];
  }

  private build(sceneData: CaveScene) {
    const { radius, height } = sceneData.room;
    const halfH = height / 2;

    // ---- Four curved painted walls -----------------------------------
    // Panel i is centred on bearing i*90°, and the camera's zero bearing looks
    // down -Z. A cylinder vertex at angle θ sits at (R·sinθ, y, R·cosθ), so a
    // bearing of `yaw` corresponds to θ = π − yaw.
    const SEG = 40;
    const arcLength = (2 * Math.PI * radius) / 4;
    const surfaceAspect = arcLength / height;

    for (let i = 0; i < 4; i++) {
      const yawCenter = i * 90;
      const yawA = THREE.MathUtils.degToRad(yawCenter - 45.2);
      const yawB = THREE.MathUtils.degToRad(yawCenter + 45.2);
      // slight overlap hides hairline seams between panels
      const thetaStart = Math.PI - yawB;
      const thetaLength = yawB - yawA;

      const geo = new THREE.CylinderGeometry(radius, radius, height, SEG, 1, true, thetaStart, thetaLength);
      const texture = this.loadTexture(sceneData.walls[i]);
      const image = texture.image as HTMLImageElement | undefined;
      const sourceAspect =
        image && image.width && image.height ? image.width / image.height : 16 / 9;

      const mat = new THREE.MeshBasicMaterial({
        map: texture,
        side: THREE.BackSide,
        toneMapped: false,
      });
      const mesh = new THREE.Mesh(geo, mat);
      this.pendingPanels.push({ geo, sourceAspect, surfaceAspect });
      this.root.add(mesh);
      this.disposables.push(geo, mat);
    }

    // ---- Painted caisson ceiling -------------------------------------
    const ceilGeo = new THREE.CircleGeometry(radius, 72);
    const ceilMat = new THREE.MeshBasicMaterial({
      map: this.loadTexture(sceneData.ceiling),
      side: THREE.DoubleSide,
      toneMapped: false,
    });
    const ceiling = new THREE.Mesh(ceilGeo, ceilMat);
    ceiling.rotation.x = Math.PI / 2;
    ceiling.position.y = halfH;
    this.root.add(ceiling);
    this.disposables.push(ceilGeo, ceilMat);

    // ---- Sand floor --------------------------------------------------
    const floorGeo = new THREE.CircleGeometry(radius, 72);
    const floorMat = new THREE.MeshBasicMaterial({
      map: this.makeFloorTexture(),
      side: THREE.DoubleSide,
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -halfH;
    this.root.add(floor);
    this.disposables.push(floorGeo, floorMat);

    // ---- Optional central pillar (中心塔柱) ---------------------------
    if (sceneData.pillar) {
      const p = sceneData.pillar;
      const side = p.radius * 2;
      const geo = new THREE.BoxGeometry(side, p.height, side);
      const mat = new THREE.MeshBasicMaterial({
        map: this.loadTexture(p.texture),
        toneMapped: false,
      });
      const pillar = new THREE.Mesh(geo, mat);
      pillar.rotation.y = Math.PI / 4;
      this.root.add(pillar);
      this.disposables.push(geo, mat);
    }

    // ---- Floating dust ----------------------------------------------
    const count = 260;
    const positions = new Float32Array(count * 3);
    const speeds = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2;
      const r = Math.sqrt(Math.random()) * radius * 0.85;
      positions[i * 3] = Math.cos(a) * r;
      positions[i * 3 + 1] = (Math.random() - 0.5) * (height - 0.4);
      positions[i * 3 + 2] = Math.sin(a) * r;
      speeds[i] = 0.15 + Math.random() * 0.5;
    }
    const dustGeo = new THREE.BufferGeometry();
    dustGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const dustMat = new THREE.PointsMaterial({
      color: 0xe8c48a,
      size: 0.055,
      transparent: true,
      opacity: 0.55,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
    });
    this.dust = new THREE.Points(dustGeo, dustMat);
    this.dust.userData.speeds = speeds;
    this.root.add(this.dust);
    this.disposables.push(dustGeo, dustMat);

    // ---- Spot anchors ------------------------------------------------
    this.updateSpotAnchors(sceneData);

    // start facing the authored entry bearing
    this.yaw = sceneData.startYaw;
    this.targetYaw = sceneData.startYaw;
  }

  /** Place a marker on the wall, ceiling or floor along a bearing/elevation ray. */
  private anchorFor(sceneData: CaveScene, yawDeg: number, pitchDeg: number): THREE.Vector3 {
    const { radius, height } = sceneData.room;
    const halfH = height / 2;
    const yaw = THREE.MathUtils.degToRad(yawDeg);
    const pitch = THREE.MathUtils.degToRad(THREE.MathUtils.clamp(pitchDeg, -88, 88));

    // height on the cylinder wall for this elevation
    const wallY = Math.tan(pitch) * radius;
    const hitsWall = Math.abs(wallY) <= halfH;

    // pull markers slightly inside the surface so they never z-fight with it
    const r = hitsWall ? radius * 0.985 : Math.abs(halfH / Math.tan(pitch)) * 0.985;
    const y = hitsWall ? wallY : Math.sign(pitch) * halfH * 0.99;

    return new THREE.Vector3(Math.sin(yaw) * r, y, -Math.cos(yaw) * r);
  }

  private updateSpotAnchors(sceneData: CaveScene) {
    this.spotPoints = sceneData.spots.map((s) => ({
      id: s.id,
      pos: this.anchorFor(sceneData, s.yaw, s.pitch),
    }));
  }

  private makeFloorTexture(): THREE.Texture {
    const size = 512;
    const c = document.createElement('canvas');
    c.width = size;
    c.height = size;
    const ctx = c.getContext('2d')!;
    const g = ctx.createRadialGradient(size / 2, size / 2, size * 0.05, size / 2, size / 2, size * 0.62);
    g.addColorStop(0, '#3a2a1d');
    g.addColorStop(0.55, '#2a1e15');
    g.addColorStop(1, '#150f0a');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);
    // sand grain
    for (let i = 0; i < 9000; i++) {
      const x = Math.random() * size;
      const y = Math.random() * size;
      const a = Math.random() * 0.09;
      ctx.fillStyle = Math.random() > 0.5 ? `rgba(200,170,120,${a})` : `rgba(0,0,0,${a})`;
      ctx.fillRect(x, y, 1.6, 1.6);
    }
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    this.disposables.push(tex);
    return tex;
  }

  /** Swap to a different cave in-place (disposes only the room geometry). */
  loadScene(next: CaveScene) {
    if (next.caveId === this.currentSceneId) return;
    this.currentSceneId = next.caveId;

    // drop previous room objects (textures + geometry)
    const keep: THREE.Object3D[] = [];
    this.root.children.forEach((child) => {
      if (child !== this.dust) keep.push(child);
    });
    keep.forEach((child) => this.root.remove(child));
    this.disposables.forEach((d) => {
      try {
        d.dispose();
      } catch {
        /* noop */
      }
    });
    this.disposables = [];

    this.yaw = next.startYaw;
    this.targetYaw = next.startYaw;
    this.pitch = 0;
    this.targetPitch = 0;
    this.velYaw = 0;
    this.velPitch = 0;

    this.build(next);
  }

  /* ------------------------------------------------------------------ */
  /* Camera control                                                      */
  /* ------------------------------------------------------------------ */

  rotateBy(dxPx: number, dyPx: number) {
    // scale so a full swipe across a phone screen turns a comfortable amount
    const k = 0.16 * (this.fov / 78);
    this.velYaw = -dxPx * k * 0.2;
    this.velPitch = -dyPx * k * 0.2;
    this.targetYaw = this.wrapYaw(this.targetYaw - dxPx * k);
    this.targetPitch = THREE.MathUtils.clamp(this.targetPitch + dyPx * k, -75, 75);
  }

  /** Apply release velocity for a natural flick. */
  fling(vxPx: number, vyPx: number) {
    const k = 9 * (this.fov / 78);
    this.velYaw = -vxPx * k;
    this.velPitch = -vyPx * k;
  }

  zoomBy(factor: number) {
    this.setFov(this.targetFov / factor);
  }

  setFov(next: number) {
    this.targetFov = THREE.MathUtils.clamp(next, 26, 92);
  }

  getFov() {
    return this.targetFov;
  }

  /** Zoom toward a screen-space point so pinch feels anchored. */
  nudgeToward(xPx: number, yPx: number) {
    const w = this.host.clientWidth || 1;
    const h = this.host.clientHeight || 1;
    const nx = (xPx / w) * 2 - 1;
    const ny = (yPx / h) * 2 - 1;
    this.targetYaw = this.wrapYaw(this.targetYaw - nx * 3);
    this.targetPitch = THREE.MathUtils.clamp(this.targetPitch + ny * 3, -75, 75);
  }

  lookAtBearing(yawDeg: number, pitchDeg = 0) {
    this.targetYaw = this.wrapYaw(yawDeg);
    this.targetPitch = THREE.MathUtils.clamp(pitchDeg, -75, 75);
  }

  private wrapYaw(v: number) {
    while (v > 180) v -= 360;
    while (v < -180) v += 360;
    return v;
  }

  /* ------------------------------------------------------------------ */
  /* Gyroscope                                                           */
  /* ------------------------------------------------------------------ */

  setGyroEnabled(enabled: boolean) {
    this.gyroEnabled = enabled;
    if (!enabled) {
      // keep the current view where the user left it
      this.targetYaw = this.yaw;
      this.targetPitch = this.pitch;
      this.gyroQuat = null;
    } else {
      this.gyroOffsetQuat.identity();
      this.targetYaw = 0;
      this.targetPitch = 0;
      this.yaw = 0;
      this.pitch = 0;
    }
  }

  /**
   * Feed a raw `deviceorientation` event.
   *
   * The naive `targetLon = e.alpha` in the original code ignores beta/gamma,
   * which means the horizon tilts and the view jumps whenever the phone rolls —
   * the single most obvious "gyro is broken" symptom. We build a proper
   * quaternion (YXZ + the -90° screen correction + display rotation) instead.
   */
  handleOrientation(alpha: number | null, beta: number | null, gamma: number | null) {
    if (!this.gyroEnabled) return;
    if (alpha === null || beta === null || gamma === null) return;

    const deg = THREE.MathUtils.degToRad;
    const orient = deg(screen.orientation?.angle ?? (window as { orientation?: number }).orientation ?? 0);

    const euler = new THREE.Euler(deg(beta), deg(alpha), deg(-gamma), 'YXZ');
    const q = new THREE.Quaternion().setFromEuler(euler);
    // camera looks down -Z; device convention is +Z out of the screen
    const qScreen = new THREE.Quaternion(-Math.sqrt(0.5), 0, 0, Math.sqrt(0.5));
    q.multiply(qScreen);
    // compensate for landscape/portrait rotation
    q.multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), -orient));

    this.gyroQuat = q;
  }

  /* ------------------------------------------------------------------ */
  /* Loop                                                                */
  /* ------------------------------------------------------------------ */

  private resize() {
    const w = Math.max(1, this.host.clientWidth);
    const h = Math.max(1, this.host.clientHeight);
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
  }

  private updateDust(dt: number) {
    if (!this.dust) return;
    const geo = this.dust.geometry as THREE.BufferGeometry;
    const pos = geo.getAttribute('position') as THREE.BufferAttribute;
    const speeds = this.dust.userData.speeds as Float32Array;
    const arr = pos.array as Float32Array;
    const halfH = 2.5;
    for (let i = 0; i < speeds.length; i++) {
      arr[i * 3 + 1] += speeds[i] * dt * 0.35;
      if (arr[i * 3 + 1] > halfH) arr[i * 3 + 1] = -halfH;
      arr[i * 3] += Math.sin(this.elapsed * 0.5 + i) * dt * 0.02;
      arr[i * 3 + 2] += Math.cos(this.elapsed * 0.4 + i) * dt * 0.02;
    }
    pos.needsUpdate = true;
    this.dust.rotation.y = this.elapsed * 0.008;
  }

  private projectSpots() {
    if (!this.onSpots) return;
    const w = this.host.clientWidth;
    const h = this.host.clientHeight;
    if (!w || !h) return;

    this.camera.getWorldDirection(this.forward);
    const out: SpotProjection[] = [];

    for (const sp of this.spotPoints) {
      this.tmpV.copy(sp.pos).normalize();
      // dot with forward: > 0 means in front of the camera
      const facing = this.tmpV.dot(this.forward);
      if (facing <= 0.05) {
        out.push({ id: sp.id, x: 0, y: 0, centrality: 0, visible: false, scale: 1 });
        continue;
      }

      const p = sp.pos.clone().project(this.camera);
      if (p.z > 1 || Math.abs(p.x) > 1.25 || Math.abs(p.y) > 1.25) {
        out.push({ id: sp.id, x: 0, y: 0, centrality: 0, visible: false, scale: 1 });
        continue;
      }
      const x = ((p.x + 1) / 2) * w;
      const y = ((1 - p.y) / 2) * h;
      const centrality = THREE.MathUtils.clamp(facing, 0, 1);
      out.push({
        id: sp.id,
        x,
        y,
        centrality,
        visible: true,
        scale: 0.82 + centrality * 0.35,
      });
    }

    this.projected = out;
    this.onSpots(out);
  }

  private loop = () => {
    if (this.destroyed) return;
    this.raf = requestAnimationFrame(this.loop);

    const dt = Math.min(this.clock.getDelta(), 0.05);
    this.elapsed += dt;

    // inertia from flicks
    if (Math.abs(this.velYaw) > 0.01 || Math.abs(this.velPitch) > 0.01) {
      this.targetYaw = this.wrapYaw(this.targetYaw + this.velYaw * dt * 60);
      this.targetPitch = THREE.MathUtils.clamp(this.targetPitch + this.velPitch * dt * 60, -75, 75);
      const decay = Math.pow(0.9, dt * 60);
      this.velYaw *= decay;
      this.velPitch *= decay;
    }

    // critically-damped smoothing
    const lerp = 1 - Math.pow(0.0015, dt);
    this.yaw += (this.targetYaw - this.yaw) * lerp;
    this.pitch += (this.targetPitch - this.pitch) * lerp;
    this.fov += (this.targetFov - this.fov) * lerp;

    if (Math.abs(this.fov - this.camera.fov) > 0.01) {
      this.camera.fov = this.fov;
      this.camera.updateProjectionMatrix();
    }

    if (this.gyroEnabled && this.gyroQuat) {
      // gyro drives the base orientation; drag adds a small offset on top
      const offset = new THREE.Quaternion().setFromEuler(
        new THREE.Euler(
          THREE.MathUtils.degToRad(this.pitch),
          THREE.MathUtils.degToRad(this.yaw),
          0,
          'YXZ'
        )
      );
      this.camera.quaternion.copy(this.gyroQuat).multiply(offset);
    } else {
      this.camera.rotation.set(
        THREE.MathUtils.degToRad(this.pitch),
        THREE.MathUtils.degToRad(this.yaw),
        0,
        'YXZ'
      );
    }

    this.updateDust(dt);
    this.renderer.render(this.scene, this.camera);
    this.projectSpots();
  };

  getYaw() {
    return this.yaw;
  }

  getPitch() {
    return this.pitch;
  }

  /** Returns the spot whose marker is nearest a screen point, within a radius. */
  hitTest(x: number, y: number, radiusPx = 46): string | null {
    let best: string | null = null;
    let bestD = radiusPx * radiusPx;
    for (const s of this.projected) {
      if (!s.visible) continue;
      const d = (s.x - x) ** 2 + (s.y - y) ** 2;
      if (d < bestD) {
        bestD = d;
        best = s.id;
      }
    }
    return best;
  }

  dispose() {
    this.destroyed = true;
    cancelAnimationFrame(this.raf);
    this.resizeObserver?.disconnect();
    this.disposables.forEach((d) => {
      try {
        d.dispose();
      } catch {
        /* noop */
      }
    });
    this.renderer.dispose();
    if (this.renderer.domElement.parentElement === this.host) {
      this.host.removeChild(this.renderer.domElement);
    }
  }
}
