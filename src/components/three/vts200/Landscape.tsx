"use client";

import { useEffect, useMemo } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { TUFT, random, segment } from "./build";
import { COLORS, type Materials } from "./materials";
import type { Layout } from "./model";
import type { Vec3 } from "../useResponsiveFraming";

// Entorno de una mina en el altiplano: cielo con bruma, cerros áridos con cumbres nevadas,
// un tajo abierto escalonado e instalaciones a la distancia. Todo se genera aquí: no se descarga nada.

/** Dirección del sol (la misma que la luz que proyecta sombras) */
export const SUN: Vec3 = [-14, 22, 12];

/* ─── Ruido para el relieve (repetible) ─────────────────────────────────── */

function hash(x: number, y: number) {
  const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return s - Math.floor(s);
}

function noise(x: number, y: number) {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const u = (x - xi) ** 2 * (3 - 2 * (x - xi));
  const v = (y - yi) ** 2 * (3 - 2 * (y - yi));
  const a = THREE.MathUtils.lerp(hash(xi, yi), hash(xi + 1, yi), u);
  const b = THREE.MathUtils.lerp(hash(xi, yi + 1), hash(xi + 1, yi + 1), u);
  return THREE.MathUtils.lerp(a, b, v);
}

function fbm(x: number, y: number, octaves = 5) {
  let sum = 0;
  let amplitude = 0.5;
  for (let i = 0; i < octaves; i++) {
    sum += amplitude * noise(x, y);
    x *= 2.03;
    y *= 2.03;
    amplitude *= 0.5;
  }
  return sum;
}

/** Crestas: picos agudos en vez de lomas redondas */
const ridged = (x: number, y: number) => 1 - Math.abs(2 * fbm(x, y, 4) - 1);

/* ─── Cerros y tajo abierto ─────────────────────────────────────────────── */

const SIZE = 3200;
const SEGMENTS = 340;
/** Tajo abierto en las primeras laderas: centro, radios y altura de cada banco (m) */
const PIT = { x: 230, z: -250, rx: 110, rz: 85, floor: 2, bench: 7 };
/** Luz con la que se sombrea el relieve (de costado: marca las crestas aunque el sol de la obra venga de frente) */
const RELIEF_LIGHT = new THREE.Vector3(0.75, 0.55, 0.35).normalize();

const ROCK = {
  base: new THREE.Color("#a28b6a"),
  mid: new THREE.Color("#85705a"),
  high: new THREE.Color("#6f625a"),
  oxide: new THREE.Color("#8c6249"),
  snow: new THREE.Color("#f1f3f5"),
  bench: new THREE.Color("#a8946f"),
  face: new THREE.Color("#8f7560"),
};

function terrainHeight(x: number, z: number) {
  const r = Math.hypot(x, z * 1.15);
  // El valle de la obra queda plano y bajo el patio (más hondo que el foso). Desde unos 170 m se
  // levantan lomas áridas y, al fondo, la cordillera con sus cumbres
  const hills = THREE.MathUtils.smoothstep(r, 170, 650);
  const range = THREE.MathUtils.smoothstep(r, 750, 1450);
  const height =
    hills * (14 + 62 * fbm(x / 210, z / 210) ** 1.3 + 30 * ridged(x / 120, z / 120)) +
    range * (70 + 180 * fbm(x / 330 + 7, z / 330) ** 1.2 + 70 * ridged(x / 160, z / 160));
  return height - 3 * (1 - hills);
}

/** Bancos escalonados del tajo: un cuenco cuya altura se cuantiza en escalones */
function pitHeight(x: number, z: number, natural: number) {
  const d = Math.hypot((x - PIT.x) / PIT.rx, (z - PIT.z) / PIT.rz);
  if (d >= 1) return { height: natural, inPit: false };
  const bowl = PIT.floor + (natural - PIT.floor) * d ** 1.3;
  const level = bowl / PIT.bench;
  const stepped = (Math.floor(level) + THREE.MathUtils.smoothstep(level % 1, 0.7, 1)) * PIT.bench;
  // El borde se funde con la ladera
  return { height: THREE.MathUtils.lerp(stepped, natural, THREE.MathUtils.smoothstep(d, 0.88, 1)), inPit: true };
}

function mountainsGeometry() {
  const geometry = new THREE.PlaneGeometry(SIZE, SIZE, SEGMENTS, SEGMENTS).rotateX(-Math.PI / 2);
  const position = geometry.attributes.position as THREE.BufferAttribute;
  const pit = new Uint8Array(position.count);
  for (let i = 0; i < position.count; i++) {
    const x = position.getX(i);
    const z = position.getZ(i);
    const { height, inPit } = pitHeight(x, z, terrainHeight(x, z));
    position.setY(i, height);
    pit[i] = inPit ? 1 : 0;
  }
  geometry.computeVertexNormals();

  // Color por altura y pendiente: laderas ocres, roca más oscura arriba, nieve en las cumbres,
  // vetas oxidadas y, en el tajo, bancos claros con taludes rojizos. El sombreado va en el color
  const normal = geometry.attributes.normal as THREE.BufferAttribute;
  const colors = new Float32Array(position.count * 3);
  const color = new THREE.Color();
  const n3 = new THREE.Vector3();
  for (let i = 0; i < position.count; i++) {
    const x = position.getX(i);
    const y = position.getY(i);
    const z = position.getZ(i);
    const flat = normal.getY(i);
    const n = fbm(x / 60, z / 60, 3);
    color.copy(ROCK.base).lerp(ROCK.mid, THREE.MathUtils.smoothstep(y, 20, 90));
    color.lerp(ROCK.high, THREE.MathUtils.smoothstep(y, 90, 210));
    color.lerp(ROCK.oxide, THREE.MathUtils.smoothstep(n, 0.6, 0.75) * 0.45);
    if (pit[i]) color.copy(ROCK.face).lerp(ROCK.bench, THREE.MathUtils.smoothstep(flat, 0.8, 0.95));
    color.lerp(ROCK.snow, THREE.MathUtils.smoothstep(y + n * 50, 215, 255) * THREE.MathUtils.smoothstep(flat, 0.4, 0.65));
    const light = 0.5 + 0.62 * Math.max(0, n3.fromBufferAttribute(normal, i).dot(RELIEF_LIGHT));
    color.multiplyScalar(light * (0.93 + n * 0.14));
    colors.set([color.r, color.g, color.b], i * 3);
  }
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  return geometry;
}

/* ─── Cielo y reflejos ──────────────────────────────────────────────────── */

const SKY_COLORS = {
  zenith: new THREE.Color("#3d76bb"),
  horizon: new THREE.Color(COLORS.haze),
  ground: new THREE.Color("#a49884"),
};

const skyMaterial = () =>
  new THREE.ShaderMaterial({
    side: THREE.BackSide,
    depthWrite: false,
    fog: false,
    uniforms: {
      zenith: { value: SKY_COLORS.zenith },
      horizon: { value: SKY_COLORS.horizon },
      ground: { value: SKY_COLORS.ground },
      sun: { value: new THREE.Vector3(...SUN).normalize() },
    },
    vertexShader: /* glsl */ `
      varying vec3 vDirection;
      void main() {
        vDirection = normalize(position);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform vec3 zenith;
      uniform vec3 horizon;
      uniform vec3 ground;
      uniform vec3 sun;
      varying vec3 vDirection;
      void main() {
        float h = vDirection.y;
        vec3 color = h > 0.0
          ? mix(horizon, zenith, pow(smoothstep(0.0, 0.55, h), 0.65))
          : mix(horizon, ground, smoothstep(0.0, -0.15, h));
        float s = max(dot(vDirection, sun), 0.0);
        color += vec3(1.0, 0.93, 0.78) * (pow(s, 400.0) * 1.5 + pow(s, 12.0) * 0.12);
        gl_FragColor = vec4(color, 1.0);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }
    `,
  });

/**
 * Reflejos del cielo para metales, vidrio y pintura. El mapa es diminuto (64 px de alto): se filtra
 * en milisegundos, a diferencia del entorno de drei, cuyo filtro congelaba la página al montarse.
 */
function useSkyEnvironment() {
  const gl = useThree((state) => state.gl);
  const target = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 128;
    canvas.height = 64;
    const ctx = canvas.getContext("2d")!;
    const gradient = ctx.createLinearGradient(0, 0, 0, 64);
    gradient.addColorStop(0, `#${SKY_COLORS.zenith.getHexString(THREE.SRGBColorSpace)}`);
    gradient.addColorStop(0.48, `#${SKY_COLORS.horizon.getHexString(THREE.SRGBColorSpace)}`);
    gradient.addColorStop(0.56, `#${SKY_COLORS.ground.getHexString(THREE.SRGBColorSpace)}`);
    gradient.addColorStop(1, "#6f6656");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 128, 64);
    const texture = new THREE.CanvasTexture(canvas);
    texture.mapping = THREE.EquirectangularReflectionMapping;
    texture.colorSpace = THREE.SRGBColorSpace;
    const pmrem = new THREE.PMREMGenerator(gl);
    const result = pmrem.fromEquirectangular(texture);
    pmrem.dispose();
    texture.dispose();
    return result;
  }, [gl]);
  useEffect(() => () => target.dispose(), [target]);
  return target.texture;
}

/* ─── Instalaciones mineras ─────────────────────────────────────────────── */

/** Pieza alargada (viga, pata, cinta) entre dos puntos */
function Beam({ from, to, size, material }: { from: Vec3; to: Vec3; size: number; material: THREE.Material }) {
  const { position, quaternion, length } = segment(from, to);
  return (
    <mesh position={position} quaternion={quaternion} material={material} castShadow>
      <boxGeometry args={[size, length, size]} />
    </mesh>
  );
}

/** Castillo minero: torre reticulada con sus poleas, como los de los cerros bolivianos */
function Headframe({ position, materials }: { position: Vec3; materials: Materials }) {
  const H = 24;
  const legs: [Vec3, Vec3][] = [
    [[-2.5, 0, -2], [-1.2, H, 0]],
    [[2.5, 0, -2], [1.2, H, 0]],
    [[-2.5, 0, 2], [-1.2, H, 0]],
    [[2.5, 0, 2], [1.2, H, 0]],
    // Puntales hacia la casa de máquinas
    [[-1.5, 0, 12], [-1.2, H - 2, 0]],
    [[1.5, 0, 12], [1.2, H - 2, 0]],
  ];
  const braces: [Vec3, Vec3][] = [6, 12, 18].flatMap((y) => {
    const w = 2.5 - (1.3 * y) / H;
    const d = 2 - (2 * y) / H;
    return [
      [[-w, y, -d], [w, y, -d]],
      [[-w, y, d], [w, y, d]],
      [[-w, y, -d], [-w, y, d]],
      [[w, y, -d], [w, y, d]],
    ] as [Vec3, Vec3][];
  });
  return (
    <group position={position} rotation-y={0.5}>
      {[...legs, ...braces].map(([from, to], i) => (
        <Beam key={i} from={from} to={to} size={i < legs.length ? 0.45 : 0.22} material={materials.headframe} />
      ))}
      <mesh material={materials.headframe} position={[0, H + 0.3, 0]}>
        <boxGeometry args={[3.2, 0.6, 1.4]} />
      </mesh>
      {[-0.8, 0.8].map((x) => (
        <mesh key={x} material={materials.steel} position={[x, H + 1.6, 0]}>
          <torusGeometry args={[1.4, 0.12, 8, 28]} />
        </mesh>
      ))}
      {/* Casa de máquinas del winche */}
      <mesh material={materials.shed} position={[0, 3, 17]} castShadow>
        <boxGeometry args={[9, 6, 8]} />
      </mesh>
      <mesh material={materials.roof} position={[0, 6.25, 17]}>
        <boxGeometry args={[9.6, 0.5, 8.6]} />
      </mesh>
    </group>
  );
}

/** Planta de concentración: nave, silos y cinta transportadora hacia una pila de mineral */
function Plant({ position, materials }: { position: Vec3; materials: Materials }) {
  return (
    <group position={position}>
      <mesh material={materials.shed} position={[0, 7, 0]} castShadow>
        <boxGeometry args={[32, 14, 18]} />
      </mesh>
      {/* Techo a dos aguas */}
      {[-1, 1].map((side) => (
        <mesh key={side} material={materials.roof} position={[0, 15.2, side * 4.6]} rotation-x={side * 0.28} castShadow>
          <boxGeometry args={[33, 0.4, 9.8]} />
        </mesh>
      ))}
      {[0, 7, 14].map((x) => (
        <mesh key={x} material={materials.silo} position={[-26 + x, 9, -4]} castShadow>
          <cylinderGeometry args={[3, 3, 18, 20]} />
        </mesh>
      ))}
      <Beam from={[16, 11, 4]} to={[38, 2, 20]} size={1.2} material={materials.conveyor} />
      <mesh material={materials.oreDark} position={[40, 4, 22]} castShadow>
        <coneGeometry args={[10, 8, 28]} />
      </mesh>
    </group>
  );
}

/** Pilas de mineral junto al camino */
function Stockpiles({ layout, materials }: { layout: Layout; materials: Materials }) {
  const x = layout.site.x;
  const piles: { at: Vec3; r: number; h: number; dark?: boolean }[] = [
    { at: [x + 35, 0, -50], r: 8, h: 5.5 },
    { at: [x + 55, 0, -42], r: 10, h: 7, dark: true },
    { at: [x + 25, 0, -66], r: 7, h: 5 },
  ];
  return (
    <group>
      {piles.map(({ at, r, h, dark }) => (
        <mesh key={at.join()} material={dark ? materials.oreDark : materials.ore} position={[at[0], h / 2, at[2]]} castShadow receiveShadow>
          <coneGeometry args={[r, h, 28]} />
        </mesh>
      ))}
    </group>
  );
}

/** Contenedores de oficina de obra */
function SiteOffices({ layout, materials }: { layout: Layout; materials: Materials }) {
  const x = -layout.site.x - 7;
  return (
    <group position={[x, 0, -14]} rotation-y={0.2}>
      {[0, 2.8].map((z, i) => (
        <mesh key={z} material={i ? materials.boothWall : materials.container} position={[0, 1.3, z]} castShadow receiveShadow>
          <boxGeometry args={[6.1, 2.6, 2.44]} />
        </mesh>
      ))}
    </group>
  );
}

/* ─── Paja brava y piedras sueltas en el patio ──────────────────────────── */

const yardDummy = new THREE.Object3D();

/** Instancias repartidas en el patio, fuera de la obra, del camino y de las instalaciones */
function YardScatter({
  layout,
  geometry,
  material,
  count,
  seed,
  size,
}: {
  layout: Layout;
  geometry: THREE.BufferGeometry;
  material: THREE.Material;
  count: number;
  seed: number;
  size: [number, number];
}) {
  const mesh = useMemo(() => {
    const { site } = layout;
    const rand = random(seed);
    const keepOut: [number, number, number][] = [
      [site.x + 82, -32, 26],
      [site.x + 8, -66, 16],
      [site.x + 40, -52, 22],
    ];
    const instanced = new THREE.InstancedMesh(geometry, material, count);
    let placed = 0;
    while (placed < count) {
      const angle = rand() * Math.PI * 2;
      const r = 24 + rand() ** 0.7 * 130;
      const x = Math.cos(angle) * r;
      const z = Math.sin(angle) * r;
      const onSite = Math.abs(x) < site.x + 1 && z > site.z0 - 1 && z < site.z1 + 1;
      const onRoad = Math.abs(z) < 3.2;
      if (onSite || onRoad || keepOut.some(([cx, cz, cr]) => Math.hypot(x - cx, z - cz) < cr)) continue;
      const s = size[0] + rand() * (size[1] - size[0]);
      yardDummy.position.set(x, 0, z);
      yardDummy.rotation.set(0, rand() * Math.PI * 2, 0);
      yardDummy.scale.set(s, s * (0.8 + rand() * 0.5), s);
      yardDummy.updateMatrix();
      instanced.setMatrixAt(placed++, yardDummy.matrix);
    }
    instanced.castShadow = true;
    return instanced;
  }, [count, geometry, layout, material, seed, size]);

  useEffect(
    () => () => {
      mesh.dispose();
    },
    [mesh]
  );
  return <primitive object={mesh} />;
}

const ROCK_GEOMETRY = new THREE.DodecahedronGeometry(0.22);
const TUFT_SIZE: [number, number] = [0.6, 1.3];
const ROCK_SIZE: [number, number] = [0.5, 1.6];

/* ─── Conjunto ──────────────────────────────────────────────────────────── */

export function Landscape({ layout, materials }: { layout: Layout; materials: Materials }) {
  const environment = useSkyEnvironment();
  const sky = useMemo(() => skyMaterial(), []);
  const mountains = useMemo(() => mountainsGeometry(), []);
  const x = layout.site.x;

  return (
    <group>
      <primitive object={environment} attach="environment" />
      <mesh material={sky} renderOrder={-1}>
        <sphereGeometry args={[4500, 32, 16]} />
      </mesh>
      <mesh geometry={mountains} material={materials.mountains} />
      <Stockpiles layout={layout} materials={materials} />
      {/* La mina rodea la obra por detrás: planta a la derecha y castillo a la izquierda de las vistas */}
      <Plant position={[x + 82, 0, -32]} materials={materials} />
      <Headframe position={[x + 8, 0, -78]} materials={materials} />
      <SiteOffices layout={layout} materials={materials} />
      <YardScatter layout={layout} geometry={TUFT} material={materials.grass} count={650} seed={21} size={TUFT_SIZE} />
      <YardScatter layout={layout} geometry={ROCK_GEOMETRY} material={materials.rock} count={110} seed={33} size={ROCK_SIZE} />
    </group>
  );
}
