import React, { useState, useEffect, useRef } from 'react';
import { 
  X, Compass, Eye, RotateCcw, HelpCircle, Layers, 
  Sun, Moon, ShieldCheck, Zap, Maximize2, Sparkles, Building,
  Trees, Palette, ArrowRight, EyeOff, Navigation, Layers2
} from 'lucide-react';
import { Parcel, Language } from '../types';
import { ModalShell, useModalClose } from '../ui';

interface VirtualTourModalProps {
  parcel: Parcel;
  currentLanguage: Language;
  onClose: () => void;
}

type TimeOfDay = 'sunrise' | 'midday' | 'golden_hour' | 'night';
type ViewMode = 'wireframe' | 'solid' | 'topography';
type VillaStyle = 'ultra-modern' | 'desert-oasis' | 'contemporary-cube' | 'classic-dome';
type CameraMode = 'orbit' | 'fpv';

export default function VirtualTourModal({ parcel, currentLanguage, onClose }: VirtualTourModalProps) {
  const isFR = currentLanguage === 'FR';

  // State parameters for basic Orbit HUD
  const [yaw, setYaw] = useState<number>(45); // Orbit angle in degrees (0 - 360)
  const [pitch, setPitch] = useState<number>(30); // Elevation pitch (15 - 75)
  const [zoom, setZoom] = useState<number>(1.2); // Zoom scale factor (0.8 - 2)
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>('golden_hour');
  const [viewMode, setViewMode] = useState<ViewMode>('solid');
  const [showVillaModel, setShowVillaModel] = useState<boolean>(true);
  const [isRotating, setIsRotating] = useState<boolean>(true);

  // Advanced features state parameters
  const [villaStyle, setVillaStyle] = useState<VillaStyle>('ultra-modern');
  const [storyCount, setStoryCount] = useState<number>(2); // 1, 2, or 3 levels
  const [showTrees, setShowTrees] = useState<boolean>(true);
  const [cameraMode, setCameraMode] = useState<CameraMode>('orbit');
  const [currentFurnishing, setCurrentFurnishing] = useState<boolean>(true); // Interior outline toggle

  /* Manipulation directe de la caméra : le visiteur doit pouvoir tourner
     autour du lot au doigt, à la souris, à la molette et au clavier. */
  const [isDraggingView, setIsDraggingView] = useState<boolean>(false);
  const [hasOrbited, setHasOrbited] = useState<boolean>(false);
  const viewportRef = useRef<HTMLDivElement>(null);
  const pointersRef = useRef(new Map<number, { x: number; y: number }>());
  const orbitRef = useRef({ active: false, x: 0, y: 0, yaw: 0, pitch: 0 });
  const pinchRef = useRef<{ dist: number; zoom: number } | null>(null);

  // Automatically adjust view parameters based on Camera Mode
  useEffect(() => {
    if (cameraMode === 'fpv') {
      setIsRotating(false);
      setPitch(8);   // Flat horizon angle
      setZoom(1.6);  // Immersive scale
      setYaw(180);   // Facing inwards
    } else {
      setPitch(30);  // High altitude
      setZoom(1.2);  // Standard orbit
      setYaw(45);
      setIsRotating(true);
    }
  }, [cameraMode]);

  // Auto-rotation effect
  useEffect(() => {
    let animationFrameId: number;
    if (isRotating && cameraMode === 'orbit') {
      const updateRotation = () => {
        setYaw((prev) => (prev + 0.3) % 360);
        animationFrameId = requestAnimationFrame(updateRotation);
      };
      animationFrameId = requestAnimationFrame(updateRotation);
    }
    return () => cancelAnimationFrame(animationFrameId);
  }, [isRotating, cameraMode]);

  // Viewport width and height
  const width = 500;
  const height = 350;

  // 3D Point projection mathematics
  const project = (x: number, y: number, z: number) => {
    let finalX = x;
    let finalY = y;
    let finalZ = z;

    // In First-Person Mode, simulate an eye-level position on the front of the plot
    if (cameraMode === 'fpv') {
      // Offset camera position to be at the edge looking inwards
      finalZ = z + 120; 
      finalY = y + 10;  // Lower eye-line
    }

    const yawRad = (yaw * Math.PI) / 180;
    const pitchRad = (pitch * Math.PI) / 180;

    // Rotate around Y-axis (Yaw)
    const cosY = Math.cos(yawRad);
    const sinY = Math.sin(yawRad);
    const x1 = finalX * cosY - finalZ * sinY;
    const z1 = finalX * sinY + finalZ * cosY;

    // Rotate around X-axis (Pitch)
    const cosX = Math.cos(pitchRad);
    const sinX = Math.sin(pitchRad);
    const y2 = finalY * cosX - z1 * sinX;
    const z2 = finalY * sinX + z1 * cosX;

    // Perspective projection calculation
    const cameraDistance = 350;
    const f = (cameraDistance * zoom) / (cameraDistance + z2);
    
    const screenX = x1 * f + width / 2;
    const screenY = y2 * f + height / 2;

    return { x: screenX, y: screenY, depth: z2 };
  };

  // Generate 3D geometries based on interactive configurations
  const renderObjects = () => {
    // Ground plane coordinates
    const gridSize = 160;
    const gridDivisions = 8;
    const gridLines = [];
    const topoLines = [];

    // Topography waves
    if (viewMode === 'topography') {
      for (let i = -4; i <= 4; i++) {
        const z = (i * gridSize) / 4;
        const pts = [];
        for (let j = -10; j <= 10; j++) {
          const x = (j * gridSize) / 10;
          // Mathematical landscape undulations
          const distFromCenter = Math.sqrt(x*x + z*z);
          const y = Math.sin(distFromCenter * 0.05) * 10 + Math.cos(x * 0.03) * 5;
          pts.push(project(x, y + 25, z));
        }
        topoLines.push(pts);
      }
    } else {
      // Coordinate mesh grid lines
      for (let i = -gridDivisions / 2; i <= gridDivisions / 2; i++) {
        const offset = (i * gridSize) / (gridDivisions / 2);
        const pStartH = project(-gridSize, 25, offset);
        const pEndH = project(gridSize, 25, offset);
        gridLines.push({ p1: pStartH, p2: pEndH });

        const pStartV = project(offset, 25, -gridSize);
        const pEndV = project(offset, 25, gridSize);
        gridLines.push({ p1: pStartV, p2: pEndV });
      }
    }

    // Interactive parcel boundary sizing based on the current plot ID
    const halfW = 40 + (parcel.id % 4) * 4;
    const halfH = 45 + (parcel.id % 3) * 5;
    const elevationY = 25; // Plot flat level height

    // Define vertices for the parcel plot block boundary
    const basePoints = [
      { x: -halfW, y: elevationY, z: -halfH },
      { x: halfW, y: elevationY, z: -halfH },
      { x: halfW, y: elevationY, z: halfH },
      { x: -halfW, y: elevationY, z: halfH },
    ];

    const topPoints = [
      { x: -halfW, y: elevationY - 4, z: -halfH },
      { x: halfW, y: elevationY - 4, z: -halfH },
      { x: halfW, y: elevationY - 4, z: halfH },
      { x: -halfW, y: elevationY - 4, z: halfH },
    ];

    const projectedBase = basePoints.map(p => project(p.x, p.y, p.z));
    const projectedTop = topPoints.map(p => project(p.x, p.y, p.z));

    /* --- Soleil : une seule source de vérité -------------------------------
       L'ombre portée et l'éclairement des faces doivent descendre du même
       vecteur lumière, sinon le rendu se contredit (une ombre à droite sous un
       soleil à droite). `LIGHT` pointe *vers* le soleil ; dans ce repère, −Y
       est le zénith et +Y descend vers le sol. */
    const LIGHT: Record<TimeOfDay, { x: number; y: number; z: number }> = {
      sunrise: { x: 0.9, y: -0.34, z: -0.28 },      // soleil rasant à l'est
      midday: { x: 0.14, y: -0.96, z: -0.24 },      // soleil au zénith
      golden_hour: { x: -0.82, y: -0.38, z: -0.42 }, // soleil couchant à l'ouest
      night: { x: 0.34, y: -0.3, z: 0.89 },          // lune basse, lumière rasante
    };
    const AMBIENT: Record<TimeOfDay, number> = {
      sunrise: 0.42, midday: 0.5, golden_hour: 0.38, night: 0.24,
    };
    /* L'exposition évite le contresens le plus visible : un toit blanc à midi
       *et* à minuit. Elle garde la nuit sombre même sur les faces bien orientées. */
    const EXPOSURE: Record<TimeOfDay, number> = {
      sunrise: 0.92, midday: 1, golden_hour: 1.04, night: 0.62,
    };
    const SHADOW_OPACITY: Record<TimeOfDay, number> = {
      sunrise: 0.26, midday: 0.42, golden_hour: 0.3, night: 0.16,
    };

    const l = LIGHT[timeOfDay];
    const lLen = Math.hypot(l.x, l.y, l.z) || 1;
    const sun = { x: l.x / lLen, y: l.y / lLen, z: l.z / lLen };
    const ambient = AMBIENT[timeOfDay];

    // Dynamic proposed villa dimensions depending on selected story/height parameters
    const villaBaseY = elevationY - 4;
    const baseStoryH = 15;
    const villaH = baseStoryH * storyCount; // Scale height dynamically based on state
    const villaW = halfW * 0.55;
    const villaD = halfH * 0.55;

    // Villa geometries depending on the Selected Architectural Style
    let villaStructure: { base: any[]; top: any[]; sideModules?: any[][] } = {
      base: [],
      top: []
    };

    if (villaStyle === 'ultra-modern') {
      // Clean rectilinear flat design with an overhanging roof canopy
      villaStructure.base = [
        { x: -villaW, y: villaBaseY, z: -villaD },
        { x: villaW, y: villaBaseY, z: -villaD },
        { x: villaW, y: villaBaseY, z: villaD },
        { x: -villaW, y: villaBaseY, z: villaD },
      ];
      villaStructure.top = [
        { x: -villaW - 4, y: villaBaseY - villaH, z: -villaD - 4 },
        { x: villaW + 4, y: villaBaseY - villaH, z: -villaD - 4 },
        { x: villaW + 4, y: villaBaseY - villaH, z: villaD + 4 },
        { x: -villaW - 4, y: villaBaseY - villaH, z: villaD + 4 },
      ];
    } else if (villaStyle === 'desert-oasis') {
      // Mediterranean style with central dome and courtyard structure
      villaStructure.base = [
        { x: -villaW * 0.9, y: villaBaseY, z: -villaD * 0.9 },
        { x: villaW * 0.9, y: villaBaseY, z: -villaD * 0.9 },
        { x: villaW * 0.9, y: villaBaseY, z: villaD * 0.9 },
        { x: -villaW * 0.9, y: villaBaseY, z: villaD * 0.9 },
      ];
      villaStructure.top = [
        { x: -villaW * 0.8, y: villaBaseY - villaH, z: -villaD * 0.8 },
        { x: villaW * 0.8, y: villaBaseY - villaH, z: -villaD * 0.8 },
        { x: villaW * 0.8, y: villaBaseY - villaH, z: villaD * 0.8 },
        { x: -villaW * 0.8, y: villaBaseY - villaH, z: villaD * 0.8 },
      ];
    } else if (villaStyle === 'contemporary-cube') {
      // Stacked staggered cubic geometry
      villaStructure.base = [
        { x: -villaW, y: villaBaseY, z: -villaD },
        { x: villaW * 0.7, y: villaBaseY, z: -villaD },
        { x: villaW * 0.7, y: villaBaseY, z: villaD * 0.7 },
        { x: -villaW, y: villaBaseY, z: villaD * 0.7 },
      ];
      villaStructure.top = [
        { x: -villaW * 0.7, y: villaBaseY - villaH, z: -villaD * 0.7 },
        { x: villaW * 0.9, y: villaBaseY - villaH, z: -villaD * 0.7 },
        { x: villaW * 0.9, y: villaBaseY - villaH, z: villaD * 0.9 },
        { x: -villaW * 0.7, y: villaBaseY - villaH, z: villaD * 0.9 },
      ];
    } else {
      // Symmetrical classic sloped apex/pyramid layout
      villaStructure.base = [
        { x: -villaW, y: villaBaseY, z: -villaD },
        { x: villaW, y: villaBaseY, z: -villaD },
        { x: villaW, y: villaBaseY, z: villaD },
        { x: -villaW, y: villaBaseY, z: villaD },
      ];
      villaStructure.top = [
        { x: 0, y: villaBaseY - villaH - 6, z: 0 },
        { x: 0, y: villaBaseY - villaH - 6, z: 0 },
        { x: 0, y: villaBaseY - villaH - 6, z: 0 },
        { x: 0, y: villaBaseY - villaH - 6, z: 0 },
      ];
    }

    const projVillaBase = villaStructure.base.map(p => project(p.x, p.y, p.z));
    const projVillaTop = villaStructure.top.map(p => project(p.x, p.y, p.z));

    // Scenic architectural palm trees coordinates around the edges
    const rawTrees = [
      { x: -halfW * 0.8, z: -halfH * 0.8 },
      { x: halfW * 0.8, z: -halfH * 0.8 },
      { x: -halfW * 0.8, z: halfH * 0.8 },
    ];

    const projTrees = rawTrees.map(t => {
      const trunkBase = project(t.x, elevationY, t.z);
      const trunkTop = project(t.x, elevationY - 18, t.z);
      const foliageA = project(t.x - 4, elevationY - 21, t.z);
      const foliageB = project(t.x + 4, elevationY - 21, t.z);
      return { trunkBase, trunkTop, foliageA, foliageB };
    });

    // Swimming pool attachment coordinate details
    const pBase = [
      { x: villaW, y: villaBaseY, z: -villaD * 0.3 },
      { x: villaW + 14, y: villaBaseY, z: -villaD * 0.3 },
      { x: villaW + 14, y: villaBaseY, z: villaD * 0.7 },
      { x: villaW, y: villaBaseY, z: villaD * 0.7 },
    ];
    const projPool = pBase.map(p => project(p.x, p.y + 1, p.z));

    // Ground interior partitions to represent interior furnishings or zone partitions
    const rawWalls = [
      { p1: { x: -villaW * 0.5, y: villaBaseY, z: 0 }, p2: { x: villaW * 0.5, y: villaBaseY, z: 0 } },
      { p1: { x: 0, y: villaBaseY, z: -villaD * 0.5 }, p2: { x: 0, y: villaBaseY, z: villaD * 0.5 } }
    ];
    const projWalls = rawWalls.map(w => ({
      p1: project(w.p1.x, w.p1.y, w.p1.z),
      p2: project(w.p2.x, w.p2.y, w.p2.z)
    }));

    // Dynamic high-level locator beacon pin
    const beaconTop = project(0, elevationY - 45, 0);
    const beaconBase = project(0, elevationY - 6, 0);

    /* --- Normales et éclairement (loi de Lambert) --------------------------
       Chaque face reçoit l'intensité de sa normale : c'est ce qui distingue un
       volume d'un aplat, et ce qui fait réagir le modèle à l'heure choisie. La
       normale est orientée vers l'extérieur du solide grâce au centroïde — sans
       cela deux faces opposées s'éclaireraient identiquement. */
    const shadeOf = (
      quad: { x: number; y: number; z: number }[],
      center: { x: number; y: number; z: number },
    ) => {
      const ux = quad[1].x - quad[0].x, uy = quad[1].y - quad[0].y, uz = quad[1].z - quad[0].z;
      const vx = quad[3].x - quad[0].x, vy = quad[3].y - quad[0].y, vz = quad[3].z - quad[0].z;
      let nx = uy * vz - uz * vy;
      let ny = uz * vx - ux * vz;
      let nz = ux * vy - uy * vx;
      const nLen = Math.hypot(nx, ny, nz) || 1;
      nx /= nLen; ny /= nLen; nz /= nLen;
      const cx = quad.reduce((s, p) => s + p.x, 0) / quad.length - center.x;
      const cy = quad.reduce((s, p) => s + p.y, 0) / quad.length - center.y;
      const cz = quad.reduce((s, p) => s + p.z, 0) / quad.length - center.z;
      if (nx * cx + ny * cy + nz * cz < 0) { nx = -nx; ny = -ny; nz = -nz; }
      const dot = Math.max(0, nx * sun.x + ny * sun.y + nz * sun.z);
      return (ambient + (1 - ambient) * dot) * EXPOSURE[timeOfDay];
    };

    type FaceKind =
      | 'parcel-top'
      | 'parcel-side'
      | 'villa-top'
      | 'villa-side'
      | 'pool'
      | 'shadow'
      | 'ao';

    /** Ce qui n'est pas un matériau éclairé (ombre, occlusion) porte son propre
     *  habillage : dégradé, couleur et opacité échappent à la loi de Lambert. */
    type FaceStyle = {
      fill?: string;
      fillOpacity?: number;
      stroke?: string;
      gradient?: string;
      depth?: number;
    };

    const faces: ({
      id: string;
      kind: FaceKind;
      layer: number;
      pts: { x: number; y: number }[];
      depth: number;
      shade: number;
    } & FaceStyle)[] = [];

    const addFace = (
      id: string,
      kind: FaceKind,
      layer: number,
      world: { x: number; y: number; z: number }[],
      center: { x: number; y: number; z: number },
      style?: FaceStyle,
    ) => {
      const proj = world.map((p) => project(p.x, p.y, p.z));
      faces.push({
        id,
        kind,
        layer,
        pts: proj.map((p) => ({ x: p.x, y: p.y })),
        depth: proj.reduce((s, p) => s + p.depth, 0) / proj.length,
        shade: shadeOf(world, center),
        ...style,
      });
    };

    const parcelCenter = { x: 0, y: elevationY - 2, z: 0 };
    const villaCenter = { x: 0, y: villaBaseY - villaH / 2, z: 0 };
    const poolCenter = {
      x: pBase.reduce((s, p) => s + p.x, 0) / pBase.length,
      y: villaBaseY,
      z: pBase.reduce((s, p) => s + p.z, 0) / pBase.length,
    };

    // Parois latérales du lot (couche 0), puis son dallage (couche 1).
    basePoints.forEach((_, idx) => {
      const next = (idx + 1) % 4;
      addFace(
        `parcel-side-${idx}`,
        'parcel-side',
        0,
        [basePoints[idx], basePoints[next], topPoints[next], topPoints[idx]],
        parcelCenter,
      );
    });
    addFace('parcel-top', 'parcel-top', 1, topPoints, parcelCenter);

    /* --- Ancrage au sol : ombre douce et occlusion ambiante ----------------
       Sans elles le bâti se lit comme un aplat posé sur l'image, pas comme un
       volume posé sur un terrain. Deux mécanismes distincts :
       - l'**ombre portée**, qui dit d'où vient la lumière et s'allonge dès que
         le soleil descend ;
       - l'**occlusion ambiante**, qui assombrit la jonction bâti/dallage, là où
         la lumière du ciel n'arrive plus. C'est elle qui « assoit » le volume.

       C'est de l'approximation assumée : en SVG, ni carte de profondeur ni
       lancer de rayons. Le rendu se paie en éléments, pas en filtres — un
       `feGaussianBlur` se ré-rastériserait à chaque image de la rotation auto. */
    const groundY = villaBaseY;

    /* Longueur de l'ombre : elle ne se choisit pas, elle se déduit. Un objet de
       hauteur h projette une ombre de longueur h × (composante horizontale ÷
       composante verticale) du soleil — donc très courte à midi, très longue au
       lever et au coucher. Les offsets écrits à la main donnaient l'inverse :
       une ombre à peine plus longue le soir qu'à midi. */
    const sunHorizontal = Math.hypot(sun.x, sun.z) || 0.001;
    const sunVertical = Math.max(0.14, Math.abs(sun.y));
    const shadowLength = Math.min(58, villaH * (sunHorizontal / sunVertical));
    const shadowDx = (-sun.x / sunHorizontal) * shadowLength;
    const shadowDz = (-sun.z / sunHorizontal) * shadowLength;

    /* Enveloppe convexe du contour balayé le long de la direction de l'ombre.
       Un simple quadrilatère translaté laissait des coins creux : l'ombre ne
       collait pas au bâti. Chaîne monotone, 8 points à trier. */
    const hullOf = (poly: { x: number; z: number }[], dx: number, dz: number) => {
      const pts = [
        ...poly.map((p) => ({ x: p.x, z: p.z })),
        ...poly.map((p) => ({ x: p.x + dx, z: p.z + dz })),
      ].sort((a, b) => a.x - b.x || a.z - b.z);
      const cross = (
        o: { x: number; z: number },
        a: { x: number; z: number },
        b: { x: number; z: number },
      ) => (a.x - o.x) * (b.z - o.z) - (a.z - o.z) * (b.x - o.x);
      const lower: { x: number; z: number }[] = [];
      for (const p of pts) {
        while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], p) <= 0) lower.pop();
        lower.push(p);
      }
      const upper: { x: number; z: number }[] = [];
      for (let i = pts.length - 1; i >= 0; i--) {
        const p = pts[i];
        while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], p) <= 0) upper.pop();
        upper.push(p);
      }
      upper.pop();
      lower.pop();
      return lower.concat(upper);
    };

    /* Trois passes de longueurs différentes : la plus longue est la plus pâle,
       la plus courte la plus dense. Le dégradé éteint l'extrémité, l'empilement
       ouvre la pénombre — un seul quadrilatère donnait une ombre découpée aux
       ciseaux, qui ne ressemblait à rien. */
    const SHADOW_PASSES = [
      { k: 1.25, opacity: 0.32 },
      { k: 1.0, opacity: 0.6 },
      { k: 0.78, opacity: 1 },
    ];
    const shadowLayers = shadowLength > 2
      ? SHADOW_PASSES.map((pass) => ({
          pts: hullOf(villaStructure.base, shadowDx * pass.k, shadowDz * pass.k).map((p) =>
            project(p.x, groundY, p.z),
          ),
          opacity: SHADOW_OPACITY[timeOfDay] * pass.opacity,
        }))
      : [];

    const shadowFrom = project(villaCenter.x, groundY, villaCenter.z);
    const shadowTo = project(villaCenter.x + shadowDx, groundY, villaCenter.z + shadowDz);

    // Emprise élargie sous laquelle se mesure le rayon du dégradé d'occlusion.
    const aoQuad = villaStructure.base.map((p) => ({
      x: villaCenter.x + (p.x - villaCenter.x) * 1.65,
      z: villaCenter.z + (p.z - villaCenter.z) * 1.65,
    }));
    const aoCenterWorld = { x: villaCenter.x, z: villaCenter.z };
    const aoProjected = aoQuad.map((p) => project(p.x, groundY + 0.4, p.z));
    const aoCenter = project(aoCenterWorld.x, groundY + 0.4, aoCenterWorld.z);
    const aoRadius =
      aoProjected.reduce((s, p) => s + Math.hypot(p.x - aoCenter.x, p.y - aoCenter.y), 0) /
      aoProjected.length;

    if (showVillaModel) {
      // L'ombre passe au-dessus du dallage (couche 2) mais sous le bâti.
      if (viewMode !== 'wireframe') {
        /* Couches fractionnaires : l'empilement des trois passes doit être
           fixe. Le tri par profondeur seul l'inversait dès que la caméra
           passait de l'autre côté — le halo pâle repeignait alors par-dessus
           le noyau dense, et l'ombre s'éclaircissait au centre. */
        shadowLayers.forEach((layer, idx) => {
          faces.push({
            id: `shadow-${idx}`,
            kind: 'shadow',
            layer: 2 + idx * 0.1,
            pts: layer.pts.map((p) => ({ x: p.x, y: p.y })),
            depth: layer.pts.reduce((s, p) => s + p.depth, 0) / layer.pts.length,
            shade: 1,
            gradient: 'vt-shadow',
            fillOpacity: layer.opacity,
            stroke: 'none',
          });
        });
        faces.push({
          id: 'ao',
          kind: 'ao',
          layer: 2.35,
          pts: aoProjected.map((p) => ({ x: p.x, y: p.y })),
          depth: aoProjected.reduce((s, p) => s + p.depth, 0) / aoProjected.length - 0.01,
          shade: 1,
          gradient: 'vt-ao',
          fillOpacity: SHADOW_OPACITY[timeOfDay] * 0.95,
          stroke: 'none',
        });
      }

      addFace('pool', 'pool', 3, pBase.map((p) => ({ x: p.x, y: p.y + 1, z: p.z })), poolCenter);
      villaStructure.base.forEach((_, idx) => {
        const next = (idx + 1) % 4;
        addFace(
          `villa-side-${idx}`,
          'villa-side',
          4,
          [villaStructure.base[idx], villaStructure.base[next], villaStructure.top[next], villaStructure.top[idx]],
          villaCenter,
        );
      });
      addFace('villa-top', 'villa-top', 5, villaStructure.top, villaCenter);
    }

    /* Tri du peintre : on peint du plus lointain au plus proche. La couche
       tranche d'abord (le bâti passe au-dessus du sol), la profondeur ensuite
       (les parois entre elles). Sans cela, le dallage recouvrait la villa dès
       que l'angle de caméra changeait. */
    const sortedFaces = faces
      .slice()
      .sort((a, b) => a.layer - b.layer || b.depth - a.depth);

    return {
      gridLines,
      topoLines,
      faces: sortedFaces,
      // Ligne d'horizon : bord lointain du sol, sert de repère de distance.
      horizonY: project(0, elevationY, -gridSize).y,
      projectedBase,
      projectedTop,
      projVillaBase,
      projVillaTop,
      projPool,
      beaconTop,
      beaconBase,
      // Géométrie des dégradés : exprimée en coordonnées écran (userSpaceOnUse),
      // puisqu'ils suivent la projection et non la forme qui les porte.
      shadowFrom,
      shadowTo,
      aoCenter,
      aoRadius,
      // Assombrissement de contact, indexé sur la hauteur du soleil : à midi
      // l'ombre est franche, la nuit elle s'efface.
      contactOpacity: SHADOW_OPACITY[timeOfDay] * 0.8,
      projTrees,
      projWalls
    };
  };

  const geo = renderObjects();

  /* Atmosphere : une teinte par matériau plutôt qu'une classe `fill-*` opaque.
     Le tri en profondeur et l'éclairage ont besoin de composer une couleur et
     une opacité séparément — une classe utilitaire ne le permet pas. */
  const getThemeStyles = () => {
    switch (timeOfDay) {
      case 'sunrise':
        return {
          bg: 'from-[#0B1528] via-[#1D2140] to-[#513650]',
          grid: '#E2A76F',
          parcelTop: '#E29C68',
          parcelSide: '#7A5A3C',
          villa: '#FFD9A8',
          roof: '#FFF3E0',
          pool: '#4EA5D9',
          tree: '#4E8F6B',
          outline: '#FED65B',
          beacon: '#E29C68',
        };
      case 'midday':
        return {
          bg: 'from-[#023E2F] via-[#045C45] to-[#128F6E]',
          grid: '#EAF7F0',
          parcelTop: '#00E676',
          parcelSide: '#046B50',
          villa: '#FFFFFF',
          roof: '#F2FFF8',
          pool: '#00E5FF',
          tree: '#1E9E62',
          outline: '#00E676',
          beacon: '#00E676',
        };
      case 'golden_hour':
        return {
          bg: 'from-[#1A1105] via-[#382006] to-[#6E3607]',
          grid: '#FED65B',
          parcelTop: '#FED65B',
          parcelSide: '#8C6A22',
          villa: '#FFAB40',
          roof: '#FFE0AD',
          pool: '#00BCD4',
          tree: '#3F7A55',
          outline: '#FED65B',
          beacon: '#FED65B',
        };
      case 'night':
      default:
        return {
          bg: 'from-[#020D0A] via-[#051C17] to-[#0A3026]',
          grid: '#00FFCC',
          parcelTop: '#00FFCC',
          parcelSide: '#0C4A3A',
          villa: '#9BE8D6',
          roof: '#CFF7EC',
          pool: '#0091A8',
          tree: '#1B6B52',
          outline: '#00FFCC',
          beacon: '#00FFCC',
        };
    }
  };

  const theme = getThemeStyles();

  /* Habillage des faces : la teinte vient de l'ambiance, l'opacité du soleil.
     C'est la variation d'opacité entre faces qui produit le volume — un aplat
     uniforme, quelle que soit sa couleur, reste plat. */
  const faceFill = (kind: string) => {
    switch (kind) {
      case 'parcel-top': return theme.parcelTop;
      case 'parcel-side': return theme.parcelSide;
      case 'villa-top': return theme.roof;
      case 'villa-side': return theme.villa;
      case 'pool': return theme.pool;
      default: return theme.parcelSide;
    }
  };

  const faceOpacity = (face: { kind: string; shade: number }) => {
    switch (face.kind) {
      case 'parcel-top': return 0.24 + 0.6 * face.shade;
      case 'parcel-side': return 0.3 + 0.55 * face.shade;
      case 'villa-top': return 0.22 + 0.7 * face.shade;
      case 'villa-side': return 0.1 + 0.6 * face.shade;
      case 'pool': return 0.5 + 0.5 * face.shade;
      default: return 0.5;
    }
  };

  // Dynamic compass rose orientation calculation based on active camera yaw
  const compassAngle = -yaw;

  // Reset to original settings
  const handleReset = () => {
    setYaw(45);
    setPitch(30);
    setZoom(1.2);
    setTimeOfDay('golden_hour');
    setViewMode('solid');
    setShowVillaModel(true);
    setIsRotating(true);
    setVillaStyle('ultra-modern');
    setStoryCount(2);
    setShowTrees(true);
    setCameraMode('orbit');
    setCurrentFurnishing(true);
  };

  /* --- Orbite au doigt / à la souris --------------------------------------
     Le geste suit la métaphore du globe : ce que le doigt pousse à droite
     tourne à droite. Le modèle n'était auparavant manipulable que par
     rotation automatique — impossible de regarder le lot sous l'angle qu'on
     veut, ce qui est précisément le propre d'une visite 3D. */
  const onViewPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    pointersRef.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    // La capture échoue pour un pointeur non actif : le geste doit continuer de
    // fonctionner même sans elle (elle ne sert qu'à ne pas perdre le doigt qui
    // sort du cadre).
    try { event.currentTarget.setPointerCapture(event.pointerId); } catch { /* sans capture aussi */ }
    setHasOrbited(true);
    setIsRotating(false);

    if (pointersRef.current.size === 2) {
      const [a, b] = [...pointersRef.current.values()];
      pinchRef.current = { dist: Math.hypot(a.x - b.x, a.y - b.y), zoom };
      orbitRef.current.active = false;
      setIsDraggingView(false);
      return;
    }
    orbitRef.current = { active: true, x: event.clientX, y: event.clientY, yaw, pitch };
    setIsDraggingView(true);
  };

  const onViewPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!pointersRef.current.has(event.pointerId)) return;
    pointersRef.current.set(event.pointerId, { x: event.clientX, y: event.clientY });

    if (pointersRef.current.size === 2 && pinchRef.current) {
      const [a, b] = [...pointersRef.current.values()];
      const dist = Math.hypot(a.x - b.x, a.y - b.y);
      if (pinchRef.current.dist > 0) {
        setZoom(Math.min(2.4, Math.max(0.7, (pinchRef.current.zoom * dist) / pinchRef.current.dist)));
      }
      return;
    }

    const g = orbitRef.current;
    if (!g.active) return;
    // Le signe fait que le sol suit le doigt : glisser à droite fait tourner la
    // scène vers la droite, sans quoi le geste paraît inversé.
    setYaw(((g.yaw - (event.clientX - g.x) * 0.5) % 360 + 360) % 360);
    setPitch(Math.min(82, Math.max(6, g.pitch - (event.clientY - g.y) * 0.35)));
  };

  const onViewPointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    pointersRef.current.delete(event.pointerId);
    try { event.currentTarget.releasePointerCapture(event.pointerId); } catch { /* déjà relâché */ }
    if (pointersRef.current.size < 2) pinchRef.current = null;
    if (pointersRef.current.size === 0) {
      orbitRef.current.active = false;
      setIsDraggingView(false);
    }
  };

  const onViewKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const step = event.shiftKey ? 15 : 5;
    switch (event.key) {
      case 'ArrowLeft': setYaw((y) => (y + step) % 360); break;
      case 'ArrowRight': setYaw((y) => (y - step + 360) % 360); break;
      case 'ArrowUp': setPitch((p) => Math.min(82, p + step * 0.4)); break;
      case 'ArrowDown': setPitch((p) => Math.max(6, p - step * 0.4)); break;
      case '+': case '=': setZoom((z) => Math.min(2.4, z + 0.1)); break;
      case '-': case '_': setZoom((z) => Math.max(0.7, z - 0.1)); break;
      default: return;
    }
    event.preventDefault();
    setHasOrbited(true);
    setIsRotating(false);
  };

  /* Molette : écoutée nativement, sinon React l'attache en passif et le
     `preventDefault` n'a aucun effet — la page défilerait sous le zoom. */
  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      setHasOrbited(true);
      setIsRotating(false);
      setZoom((z) => Math.min(2.4, Math.max(0.7, z - event.deltaY * 0.0016)));
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, []);

  const { close, closeRef } = useModalClose();

  return (
    <ModalShell
      onClose={onClose}
      closeRef={closeRef}
      label={isFR ? 'Visite 3D de la parcelle' : 'Plot 3D tour'}
      wrapperClassName="fixed inset-0 z-[var(--z-modal)] flex items-end justify-center overflow-hidden font-sans sm:items-center sm:p-4 md:p-8"
      backdropClassName="bg-primary/95 backdrop-blur-md"
      panelClassName="max-w-5xl bg-primary border border-gold-line/30 lg:flex-row"
    >
        {/* Left Column: 3D HUD Viewport Panel */}
        <div
          ref={viewportRef}
          onPointerDown={onViewPointerDown}
          onPointerMove={onViewPointerMove}
          onPointerUp={onViewPointerUp}
          onPointerCancel={onViewPointerUp}
          onKeyDown={onViewKeyDown}
          tabIndex={0}
          aria-label={
            isFR
              ? 'Vue 3D interactive : glissez pour tourner autour du lot, pincez ou utilisez la molette pour zoomer, flèches du clavier pour orienter'
              : 'Interactive 3D view: drag to orbit the plot, pinch or scroll to zoom, arrow keys to orient'
          }
          className={`flex-1 relative flex flex-col justify-between overflow-hidden bg-gradient-to-br ${theme.bg} min-h-[350px] md:min-h-[480px] border-b lg:border-b-0 lg:border-r border-[#8C7A53]/25 touch-none focus:outline-none focus-visible:ring-2 focus-visible:ring-secondary-fixed focus-visible:ring-inset ${isDraggingView ? 'cursor-grabbing' : 'cursor-grab'}`}
        >
          
          {/* Header readout line */}
          <div className="p-4 md:p-5 flex items-center justify-between relative z-10 bg-black/10 backdrop-blur-xs">
            <div className="flex items-center space-x-3">
              <span className="p-1.5 rounded-micro bg-[#8C7A53]/25 text-secondary-fixed animate-pulse">
                <Compass className="w-4 h-4" />
              </span>
              <div>
                <span className="text-micro font-mono font-bold tracking-widest uppercase block text-secondary-fixed">
                  MELROSE 3D ORBIT VIEWER
                </span>
                <h4 className="font-serif text-xs md:text-sm font-bold text-white leading-tight">
                  {isFR ? 'Simulation Architecture & Cadastre' : 'Simulated Architectural Blueprint'}
                </h4>
              </div>
            </div>

            {/* Live rotating compass rose widget */}
            <div className="flex items-center space-x-3">
              <div className="relative w-8 h-8 rounded-full border border-white/20 bg-black/10 flex items-center justify-center shadow-inset-highlight">
                <div 
                  className="absolute w-full h-full flex items-center justify-center transition-transform duration-200 ease-out-expo"
                  style={{ transform: `rotate(${compassAngle}deg)` }}
                >
                  <Navigation className="w-4 h-4 text-[#FED65B]" />
                </div>
                <span className="absolute top-0 text-micro font-mono font-bold text-white/60">N</span>
              </div>

              <div className="text-right font-mono text-micro text-white/70 space-y-0.5 hidden sm:block leading-tight">
                <div>{isFR ? 'CADASTRE SÉNÉGAL CERTIFIÉ' : 'CERTIFIED SENEGAL CADASTRAL'}</div>
                <div>SEC: {parcel.id} • ZONE: A1</div>
              </div>
            </div>
          </div>

          {/* SVG 3D Canvas rendering */}
          <div className="flex-1 flex items-center justify-center relative select-none">
            {/* Viewfinder crosshairs and scanner overlays */}
            <div className="absolute inset-8 pointer-events-none border border-white/5 rounded-card flex items-center justify-center">
              <div className="w-12 h-[1px] bg-white/20 absolute" />
              <div className="h-12 w-[1px] bg-white/20 absolute" />
              <div className="absolute top-4 left-4 text-micro font-mono text-white/60">CAM-01_P12</div>
              <div className="absolute bottom-4 right-4 text-micro font-mono text-white/60">RE_ZOOM: {zoom.toFixed(1)}x</div>
            </div>

            <svg 
              viewBox={`0 0 ${width} ${height}`} 
              className="w-full h-full max-h-[380px] max-w-[500px]"
            >
              <defs>
                <linearGradient id="vt-haze" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={theme.grid} stopOpacity="0.18" />
                  <stop offset="100%" stopColor={theme.grid} stopOpacity="0" />
                </linearGradient>

                {/* Ombre portée : opaque au contact du bâti, nulle à l'autre
                    bout. Suit la projection (userSpaceOnUse) et non la forme. */}
                <linearGradient
                  id="vt-shadow"
                  gradientUnits="userSpaceOnUse"
                  x1={geo.shadowFrom.x}
                  y1={geo.shadowFrom.y}
                  x2={geo.shadowTo.x}
                  y2={geo.shadowTo.y}
                >
                  <stop offset="0%" stopColor="#000" stopOpacity="1" />
                  <stop offset="45%" stopColor="#000" stopOpacity="0.72" />
                  <stop offset="100%" stopColor="#000" stopOpacity="0" />
                </linearGradient>

                {/* Occlusion ambiante : maximum sous l'emprise, nul avant le
                    bord — le quadrilatère porteur ne se voit donc jamais. */}
                <radialGradient
                  id="vt-ao"
                  gradientUnits="userSpaceOnUse"
                  cx={geo.aoCenter.x}
                  cy={geo.aoCenter.y}
                  r={Math.max(1, geo.aoRadius)}
                >
                  <stop offset="0%" stopColor="#000" stopOpacity="0.95" />
                  <stop offset="36%" stopColor="#000" stopOpacity="0.62" />
                  <stop offset="70%" stopColor="#000" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#000" stopOpacity="0" />
                </radialGradient>
              </defs>

              {/* Ligne d'horizon et brume de distance : sans elles le damier
                  flotte dans le vide, et plus rien ne donne l'échelle du sol. */}
              <line
                x1="0"
                y1={geo.horizonY}
                x2={width}
                y2={geo.horizonY}
                stroke={theme.grid}
                strokeOpacity="0.25"
                strokeWidth="1"
              />
              <rect
                x="0"
                y={geo.horizonY}
                width={width}
                height={Math.max(0, height - geo.horizonY)}
                fill="url(#vt-haze)"
              />

              {/* Ground level lines or topography levels */}
              {viewMode === 'topography' ? (
                geo.topoLines.map((pts, idx) => {
                  let pathStr = '';
                  pts.forEach((p, pIdx) => {
                    pathStr += `${pIdx === 0 ? 'M' : 'L'} ${p.x} ${p.y}`;
                  });
                  return (
                    <path
                      key={`topo-${idx}`}
                      d={pathStr}
                      fill="none"
                      stroke={theme.grid}
                      strokeOpacity="0.35"
                      strokeWidth="1"
                    />
                  );
                })
              ) : (
                geo.gridLines.map((line, idx) => (
                  <line
                    key={`grid-${idx}`}
                    x1={line.p1.x}
                    y1={line.p1.y}
                    x2={line.p2.x}
                    y2={line.p2.y}
                    stroke={theme.grid}
                    strokeOpacity="0.2"
                    strokeWidth="1.2"
                  />
                ))
              )}

              {/* Jonction du dallage avec le terrain : un liseré sombre qui déborde
                  vers l'extérieur. La dalle paraissait posée en lévitation sur
                  le damier. Dessiné avant les faces, il n'en reste que la moitié
                  extérieure, une fois le dallage peint par-dessus. */}
              {viewMode !== 'wireframe' && (
                <polygon
                  points={geo.projectedBase.map(p => `${p.x},${p.y}`).join(' ')}
                  fill="none"
                  stroke="#000"
                  strokeOpacity={geo.contactOpacity}
                  strokeWidth="11"
                  strokeLinejoin="round"
                />
              )}

              {/* Faces triées du plus lointain au plus proche (algorithme du
                  peintre), chacune teintée selon son éclairement au soleil.
                  Ombre et occlusion portent leur propre dégradé. */}
              {viewMode !== 'wireframe' &&
                geo.faces.map((face) => (
                  <polygon
                    key={face.id}
                    points={face.pts.map((p) => `${p.x},${p.y}`).join(' ')}
                    fill={face.gradient ? `url(#${face.gradient})` : face.fill ?? faceFill(face.kind)}
                    fillOpacity={face.fillOpacity ?? faceOpacity(face)}
                    stroke={face.stroke ?? theme.outline}
                    strokeOpacity={
                      face.stroke
                        ? 0
                        : face.kind === 'villa-top' || face.kind === 'parcel-top'
                          ? 0.5
                          : 0.12
                    }
                    strokeWidth={
                      face.kind === 'villa-top' || face.kind === 'parcel-top' ? 1.1 : 0.8
                    }
                  />
                ))}

              {/* Trame intérieure du bâti : traits fins posés sur le dallage. */}
              {currentFurnishing && viewMode !== 'wireframe' && (
                geo.projWalls.map((w, idx) => (
                  <line
                    key={`wall-${idx}`}
                    x1={w.p1.x}
                    y1={w.p1.y}
                    x2={w.p2.x}
                    y2={w.p2.y}
                    stroke={theme.outline}
                    strokeOpacity="0.3"
                    strokeWidth="1"
                    strokeDasharray="2 2"
                  />
                ))
              )}

              {/* Contour cadastral : l'arête qui doit rester lisible en toutes
                  circonstances — c'est elle qui matérialise la limite du lot. */}
              <polygon
                points={geo.projectedTop.map(p => `${p.x},${p.y}`).join(' ')}
                fill="none"
                stroke={theme.outline}
                strokeWidth="2"
                strokeDasharray={viewMode === 'wireframe' ? '4 2' : undefined}
              />
              <polygon
                points={geo.projectedBase.map(p => `${p.x},${p.y}`).join(' ')}
                fill="none"
                stroke={theme.outline}
                strokeOpacity="0.4"
                strokeWidth="1"
              />
              {geo.projectedBase.map((bp, idx) => (
                <line
                  key={`vert-${idx}`}
                  x1={bp.x}
                  y1={bp.y}
                  x2={geo.projectedTop[idx].x}
                  y2={geo.projectedTop[idx].y}
                  stroke={theme.outline}
                  strokeOpacity="0.4"
                  strokeWidth="1"
                />
              ))}

              {/* Arêtes hautes de la villa : conservées en toutes circonstances,
                  y compris en mode filaire où les faces ne sont pas peintes. */}
              {showVillaModel && (
                <g id="villa-model-projection">
                  <polygon
                    points={geo.projVillaTop.map(p => `${p.x},${p.y}`).join(' ')}
                    fill="none"
                    stroke={theme.roof}
                    strokeOpacity="0.85"
                    strokeWidth="1.5"
                  />
                  {geo.projVillaBase.map((vbp, idx) => (
                    <line
                      key={`vvert-${idx}`}
                      x1={vbp.x}
                      y1={vbp.y}
                      x2={geo.projVillaTop[idx].x}
                      y2={geo.projVillaTop[idx].y}
                      stroke={theme.roof}
                      strokeOpacity="0.4"
                      strokeWidth="1"
                    />
                  ))}
                </g>
              )}

              {/* Scenic architectural trees overlay */}
              {showTrees && viewMode !== 'wireframe' && (
                geo.projTrees.map((t, idx) => (
                  <g key={`tree-${idx}`}>
                    {/* Contact au sol de l'arbre : même rôle que l'occlusion du
                        bâti, à l'échelle d'un tronc. */}
                    <ellipse
                      cx={t.trunkBase.x}
                      cy={t.trunkBase.y}
                      rx={9}
                      ry={3.4}
                      fill="#000"
                      fillOpacity={geo.contactOpacity}
                      transform={`rotate(18 ${t.trunkBase.x} ${t.trunkBase.y})`}
                    />
                    <line
                      x1={t.trunkBase.x}
                      y1={t.trunkBase.y}
                      x2={t.trunkTop.x}
                      y2={t.trunkTop.y}
                      className="stroke-amber-800"
                      strokeWidth="1.5"
                    />
                    <circle
                      cx={t.trunkTop.x}
                      cy={t.trunkTop.y}
                      r="4"
                      fill={theme.tree}
                      fillOpacity="0.9"
                      stroke={theme.tree}
                      strokeWidth="0.5"
                    />
                    <circle
                      cx={t.foliageA.x}
                      cy={t.foliageA.y}
                      r="3"
                      fill={theme.tree}
                      fillOpacity="0.6"
                      stroke={theme.tree}
                      strokeWidth="0.5"
                    />
                    <circle
                      cx={t.foliageB.x}
                      cy={t.foliageB.y}
                      r="3"
                      fill={theme.tree}
                      fillOpacity="0.6"
                      stroke={theme.tree}
                      strokeWidth="0.5"
                    />
                  </g>
                ))
              )}

              {/* Glowing holographic center beacon pin targeting the plot */}
              <g id="camera-focus-marker">
                <line
                  x1={geo.beaconBase.x}
                  y1={geo.beaconBase.y}
                  x2={geo.beaconTop.x}
                  y2={geo.beaconTop.y}
                  stroke={theme.beacon}
                  className="animate-pulse"
                  strokeWidth="1.5"
                  strokeDasharray="3 3"
                />
                <circle
                  cx={geo.beaconTop.x}
                  cy={geo.beaconTop.y}
                  r="6"
                  fill={theme.beacon}
                  stroke={theme.beacon}
                />
                <circle
                  cx={geo.beaconTop.x}
                  cy={geo.beaconTop.y}
                  r="12"
                  className="fill-none stroke-white/30 animate-ping"
                  strokeWidth="1"
                />
                <ellipse
                  cx={geo.beaconBase.x}
                  cy={geo.beaconBase.y}
                  rx="10"
                  ry="4"
                  className="fill-none stroke-secondary-fixed/50"
                  strokeWidth="1"
                />
              </g>
            </svg>
          </div>

          {/* Invite gestuelle : la vue est manipulable, encore faut-il le dire. */}
          {!hasOrbited && (
            <div className="pointer-events-none absolute bottom-16 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-full bg-black/50 px-3 py-1.5 text-micro font-mono uppercase tracking-widest text-white/85 backdrop-blur-sm">
              {isFR ? 'Glissez • pincez pour zoomer' : 'Drag • pinch to zoom'}
            </div>
          )}

          {/* HUD Footer readouts */}
          <div className="p-4 bg-black/20 backdrop-blur-xs flex justify-between items-center text-caption font-mono text-white/70 relative z-10 border-t border-white/5">
            <div className="flex items-center space-x-4">
              {/* Instrumentation réelle : plus de compteur de FPS inventé. */}
              <span className="hidden sm:inline-block">YAW: {Math.round(yaw)}°</span>
              <span className="hidden sm:inline-block">PITCH: {Math.round(pitch)}°</span>
              <span>ZOOM: {zoom.toFixed(1)}x</span>
            </div>

            <button 
              onClick={handleReset}
              className="flex items-center space-x-1.5 px-2.5 py-1 rounded-micro bg-white/10 hover:bg-white/15 text-white transition-all cursor-pointer text-micro uppercase font-bold tracking-wide"
              title="Reset View"
            >
              <RotateCcw className="w-3 h-3" />
              <span>{isFR ? 'RÉINITIALISER' : 'RESET'}</span>
            </button>
          </div>
        </div>

        {/* Right Column: Controls and Preset Adjustments */}
        <div className="w-full lg:w-[380px] bg-white p-5 md:p-6 flex flex-col justify-between space-y-4 overflow-y-auto max-h-[50dvh] lg:max-h-full">
          <div className="space-y-4">
            
            {/* Modal Exit Button and Title */}
            <div className="flex justify-between items-start">
              <div>
                <span className="bg-[#8C7A53]/15 text-[#8C7A53] px-2 py-0.5 rounded-micro font-mono text-micro font-bold uppercase tracking-widest block w-fit mb-1">
                  PLOT TOUR 3D PRO
                </span>
                <h3 className="font-serif text-xl md:text-2xl font-bold text-primary leading-tight">
                  {isFR ? 'Parcelle' : 'Plot'} #{parcel.id < 10 ? `0${parcel.id}` : parcel.id}
                </h3>
                <p className="font-sans text-caption text-outline mt-0.5 font-light">
                  {parcel.area} m² • {parcel.orientation[currentLanguage]}
                </p>
              </div>
              <button 
                onClick={close}
                className="p-2.5 tap-44 hover:bg-black/5 rounded-full transition-colors duration-400 cursor-pointer text-primary"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Toggle Camera Mode: Orbit vs First Person */}
            <div className="space-y-1.5">
              <span className="font-sans font-bold text-primary uppercase tracking-wide text-micro block">
                {isFR ? 'Mode Caméra' : 'Camera Perspective'}
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  onClick={() => setCameraMode('orbit')}
                  className={`py-2 px-1 rounded-micro text-caption font-bold uppercase transition-all flex items-center justify-center space-x-2 cursor-pointer ${
                    cameraMode === 'orbit' 
                      ? 'bg-[#8C7A53] text-white shadow-elev-1' 
                      : 'bg-gray-50 text-outline hover:bg-gray-100 border border-black/5'
                  }`}
                >
                  <Compass className="w-3.5 h-3.5" />
                  <span>{isFR ? 'Orbite 3D' : 'Orbit'}</span>
                </button>
                <button
                  onClick={() => setCameraMode('fpv')}
                  className={`py-2 px-1 rounded-micro text-caption font-bold uppercase transition-all flex items-center justify-center space-x-2 cursor-pointer ${
                    cameraMode === 'fpv' 
                      ? 'bg-[#8C7A53] text-white shadow-elev-1' 
                      : 'bg-gray-50 text-outline hover:bg-gray-100 border border-black/5'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>{isFR ? 'Vue Piéton' : 'Eye-Level (FPV)'}</span>
                </button>
              </div>
            </div>

            {/* Slider 1: Camera Orbit Angle (Yaw) */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="font-sans font-bold text-primary uppercase tracking-wide text-micro">
                  {cameraMode === 'fpv' ? (isFR ? 'Orientation du regard (Pan)' : 'Look Direction') : (isFR ? 'Orbite Caméra (Yaw)' : 'Camera Orbit (Yaw)')}
                </span>
                <span className="font-mono text-caption text-outline font-bold">{Math.round(yaw)}°</span>
              </div>
              <input
                type="range"
                min="0"
                max="360"
                value={yaw}
                onChange={(e) => {
                  setYaw(Number(e.target.value));
                  setIsRotating(false); // Stop auto rotation on manual interaction
                }}
                className="w-full h-1 bg-gray-100 rounded-micro appearance-none cursor-pointer accent-[#8C7A53]"
              />
              <div className="flex justify-between items-center text-micro text-outline font-mono uppercase">
                <span>0°</span>
                {cameraMode === 'orbit' && (
                  <button 
                    onClick={() => setIsRotating(!isRotating)}
                    className={`px-1.5 py-0.5 rounded-micro text-micro font-bold transition-all ${
                      isRotating ? 'bg-emerald-50 text-[#0F6B4F]' : 'bg-gray-100 text-outline'
                    }`}
                  >
                    {isRotating ? 'Auto ON' : 'Auto OFF'}
                  </button>
                )}
                <span>360°</span>
              </div>
            </div>

            {/* Slider 2: Camera Elevation Pitch */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="font-sans font-bold text-primary uppercase tracking-wide text-micro">
                  {isFR ? 'Inclinaison / Hauteur Caméra' : 'Camera Gaze Pitch'}
                </span>
                <span className="font-mono text-caption text-outline font-bold">{Math.round(pitch)}°</span>
              </div>
              <input
                type="range"
                min="5"
                max="75"
                value={pitch}
                onChange={(e) => setPitch(Number(e.target.value))}
                className="w-full h-1 bg-gray-100 rounded-micro appearance-none cursor-pointer accent-[#8C7A53]"
              />
              <div className="flex justify-between text-micro text-outline font-mono">
                <span>5° (LOW)</span>
                <span>75° (HIGH)</span>
              </div>
            </div>

            {/* Premium Style Swapper */}
            <div className="space-y-1.5 pt-1.5 border-t border-gray-200">
              <span className="font-sans font-bold text-primary uppercase tracking-wide text-micro block">
                {isFR ? 'Style Architectural de la Villa' : 'Proposed Villa Style'}
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                {(['ultra-modern', 'desert-oasis', 'contemporary-cube', 'classic-dome'] as VillaStyle[]).map((style) => {
                  const isActive = villaStyle === style;
                  const label = {
                    'ultra-modern': isFR ? 'Moderne Verre' : 'Glass Modern',
                    'desert-oasis': isFR ? 'Oasis Saharien' : 'Desert Riad',
                    'contemporary-cube': isFR ? 'Cube Empilé' : 'Stacked Cube',
                    'classic-dome': isFR ? 'Dôme Classique' : 'Classic Apex',
                  }[style];
                  return (
                    <button
                      key={style}
                      onClick={() => setVillaStyle(style)}
                      className={`py-1.5 px-1 rounded-micro text-micro font-bold uppercase transition-all text-center cursor-pointer border ${
                        isActive 
                          ? 'bg-primary text-white border-primary shadow-elev-1' 
                          : 'bg-white text-outline border-outline-variant/30 hover:bg-gray-50'
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Slider 3: Villa Height (Story count multiplier) */}
            <div className="space-y-1.5 pt-1.5 border-t border-gray-200">
              <div className="flex justify-between items-center text-xs">
                <span className="font-sans font-bold text-primary uppercase tracking-wide text-micro">
                  {isFR ? 'Nombre d’Étages' : 'Villa Floors / Stories'}
                </span>
                <span className="font-mono text-caption text-[#8C7A53] font-bold">R+{storyCount - 1}</span>
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                {[1, 2, 3].map((num) => (
                  <button
                    key={num}
                    onClick={() => setStoryCount(num)}
                    className={`py-1.5 rounded-micro text-caption font-bold transition-all text-center cursor-pointer border ${
                      storyCount === num
                        ? 'bg-[#8C7A53]/15 text-primary border-[#8C7A53]'
                        : 'bg-white text-outline border-outline-variant/30 hover:bg-gray-50'
                    }`}
                  >
                    {num} {num === 1 ? (isFR ? 'Niveau' : 'Level') : (isFR ? 'Étages' : 'Stories')}
                  </button>
                ))}
              </div>
            </div>

            {/* Landscape and Interior Toggles */}
            <div className="space-y-2 pt-1.5 border-t border-gray-200">
              <span className="font-sans font-bold text-primary uppercase tracking-wide text-micro block">
                {isFR ? 'Aménagement & Paysage' : 'Landscaping & Utilities'}
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  onClick={() => setShowTrees(!showTrees)}
                  className={`py-1.5 px-2 rounded-micro text-micro font-bold uppercase transition-all flex items-center justify-center space-x-1 cursor-pointer border ${
                    showTrees 
                      ? 'bg-emerald-50 text-[#0F6B4F] border-emerald-300' 
                      : 'bg-white text-outline border-outline-variant/30'
                  }`}
                >
                  <Trees className="w-3.5 h-3.5" />
                  <span>{isFR ? 'Végétation' : 'Vegetation'}</span>
                </button>

                <button
                  onClick={() => setCurrentFurnishing(!currentFurnishing)}
                  className={`py-1.5 px-2 rounded-micro text-micro font-bold uppercase transition-all flex items-center justify-center space-x-1 cursor-pointer border ${
                    currentFurnishing 
                      ? 'bg-[#8C7A53]/10 text-primary border-[#8C7A53]/40' 
                      : 'bg-white text-outline border-outline-variant/30'
                  }`}
                >
                  <Layers2 className="w-3.5 h-3.5" />
                  <span>{isFR ? 'Cloisons' : 'Partitions'}</span>
                </button>
              </div>
            </div>

            {/* Atmosphere Preset Modes */}
            <div className="space-y-1.5 pt-1.5 border-t border-gray-200">
              <span className="font-sans font-bold text-primary uppercase tracking-wide text-micro block">
                {isFR ? 'Ambiance d’Ensoleillement' : 'Atmosphere & Shadows'}
              </span>
              <div className="grid grid-cols-4 gap-1.5">
                {(['sunrise', 'midday', 'golden_hour', 'night'] as TimeOfDay[]).map((mode) => {
                  const isActive = timeOfDay === mode;
                  const label = {
                    sunrise: isFR ? 'Aube' : 'Sunrise',
                    midday: isFR ? 'Midi' : 'Midday',
                    golden_hour: isFR ? 'Doré' : 'Golden',
                    night: isFR ? 'Nuit' : 'Night',
                  }[mode];
                  return (
                    <button
                      key={mode}
                      onClick={() => setTimeOfDay(mode)}
                      className={`py-2 px-1 rounded-micro text-micro font-bold uppercase transition-all flex flex-col items-center justify-center space-y-1 cursor-pointer ${
                        isActive 
                          ? 'bg-primary text-white shadow-elev-1' 
                          : 'bg-gray-50 text-outline hover:bg-gray-100 border border-black/5'
                      }`}
                    >
                      {mode === 'night' ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5" />}
                      <span>{label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Wireframe vs Topography vs Solid render layers */}
            <div className="space-y-1.5 pt-1 border-t border-gray-200">
              <span className="font-sans font-bold text-primary uppercase tracking-wide text-micro block">
                {isFR ? 'Rendu Visuel 3D' : '3D Render Mode'}
              </span>
              <div className="grid grid-cols-3 gap-1.5">
                {(['solid', 'wireframe', 'topography'] as ViewMode[]).map((mode) => {
                  const isActive = viewMode === mode;
                  const label = {
                    solid: isFR ? 'Plein' : 'Solid',
                    wireframe: isFR ? 'Filaire' : 'Wire',
                    topography: isFR ? 'Topo' : 'Topo',
                  }[mode];
                  return (
                    <button
                      key={mode}
                      onClick={() => setViewMode(mode)}
                      className={`py-1.5 rounded-micro text-micro font-bold uppercase transition-all text-center cursor-pointer border ${
                        isActive 
                          ? 'bg-secondary-fixed/15 text-primary border-[#8C7A53]' 
                          : 'bg-white text-outline border-outline-variant/30 hover:bg-gray-50'
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Footer controls container */}
          <div className="pt-3 border-t border-gray-200 space-y-2">
            <div className="flex items-start space-x-2 text-caption text-outline leading-tight font-light">
              <ShieldCheck className="w-4 h-4 text-[#0F6B4F] shrink-0 mt-0.5" />
              <span>
                {isFR 
                  ? 'Ce modèle est une projection cadastrale interactive certifiée par notre service d’urbanisme.'
                  : 'This spatial projection represents authentic cadastral measurements validated by certified surveyors.'}
              </span>
            </div>

            <button
              onClick={close}
              className="w-full bg-primary text-white hover:bg-opacity-95 min-h-[44px] py-2.5 rounded-full text-caption font-bold uppercase tracking-widest cursor-pointer transition-all duration-400 text-center"
            >
              {isFR ? 'Fermer la vue' : 'Exit Virtual View'}
            </button>
          </div>

        </div>
    </ModalShell>
  );
}
