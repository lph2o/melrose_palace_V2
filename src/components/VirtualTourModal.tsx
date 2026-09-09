import React, { useState, useEffect } from 'react';
import { 
  X, Compass, Eye, RotateCcw, HelpCircle, Layers, 
  Sun, Moon, ShieldCheck, Zap, Maximize2, Sparkles, Building,
  Trees, Palette, ArrowRight, EyeOff, Navigation, Layers2
} from 'lucide-react';
import { Parcel, Language } from '../types';
import { motion, AnimatePresence } from 'motion/react';

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

    // Dynamic environmental shadow casting calculation
    let sDx = 0;
    let sDz = 0;
    let shadowOpacity = '0.35';

    switch (timeOfDay) {
      case 'sunrise':
        sDx = 45;
        sDz = 20;
        shadowOpacity = '0.25';
        break;
      case 'midday':
        sDx = -2;
        sDz = 4;
        shadowOpacity = '0.45';
        break;
      case 'golden_hour':
        sDx = -50;
        sDz = -30;
        shadowOpacity = '0.3';
        break;
      case 'night':
        sDx = 8;
        sDz = 8;
        shadowOpacity = '0.15';
        break;
    }

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

    // Dynamic shadow polygon on the ground plane matching structural width
    const shadowBase = villaStructure.base.map(p => project(p.x + sDx * 0.3, p.y + 4, p.z + sDz * 0.3));

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

    return {
      gridLines,
      topoLines,
      projectedBase,
      projectedTop,
      projVillaBase,
      projVillaTop,
      projPool,
      beaconTop,
      beaconBase,
      shadowBase,
      shadowOpacity,
      projTrees,
      projWalls
    };
  };

  const geo = renderObjects();

  // Atmosphere Styles depending on selected Time of Day
  const getThemeStyles = () => {
    switch (timeOfDay) {
      case 'sunrise':
        return {
          bg: 'from-[#0B1528] via-[#1D2140] to-[#513650]',
          gridColor: 'stroke-[#8C7A53]/20',
          parcelBaseFill: 'fill-[#8C7A53]/15',
          parcelTopFill: 'fill-[#8C7A53]/35',
          parcelOutline: 'stroke-[#D4AF37]',
          villaFill: 'fill-[#E29C68]/30',
          villaOutline: 'stroke-[#E29C68]',
          poolFill: 'fill-[#4EA5D9]/40',
          beaconColor: 'stroke-[#E29C68] fill-[#E29C68]',
          textColor: 'text-orange-200',
        };
      case 'midday':
        return {
          bg: 'from-[#023E2F] via-[#045C45] to-[#128F6E]',
          gridColor: 'stroke-white/10',
          parcelBaseFill: 'fill-[#25D366]/10',
          parcelTopFill: 'fill-[#00E676]/30',
          parcelOutline: 'stroke-[#25D366]',
          villaFill: 'fill-white/25',
          villaOutline: 'stroke-white/80',
          poolFill: 'fill-[#00E5FF]/40',
          beaconColor: 'stroke-[#00E676] fill-[#00E676]',
          textColor: 'text-emerald-100',
        };
      case 'golden_hour':
        return {
          bg: 'from-[#1A1105] via-[#382006] to-[#6E3607]',
          gridColor: 'stroke-[#8C7A53]/20',
          parcelBaseFill: 'fill-[#D4AF37]/10',
          parcelTopFill: 'fill-[#D4AF37]/45',
          parcelOutline: 'stroke-[#D4AF37]',
          villaFill: 'fill-[#FFAB40]/25',
          villaOutline: 'stroke-[#FFAB40]',
          poolFill: 'fill-[#00BCD4]/30',
          beaconColor: 'stroke-[#D4AF37] fill-[#D4AF37]',
          textColor: 'text-amber-100',
        };
      case 'night':
      default:
        return {
          bg: 'from-[#020D0A] via-[#051C17] to-[#0A3026]',
          gridColor: 'stroke-[#00FFCC]/15',
          parcelBaseFill: 'fill-[#00FFCC]/5',
          parcelTopFill: 'fill-[#00FFCC]/20',
          parcelOutline: 'stroke-[#00FFCC]',
          villaFill: 'fill-[#00E5FF]/10',
          villaOutline: 'stroke-[#00E5FF]',
          poolFill: 'fill-[#00261a]/60',
          beaconColor: 'stroke-[#00FFCC] fill-[#00FFCC]',
          textColor: 'text-teal-200',
        };
    }
  };

  const theme = getThemeStyles();

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

  return (
    <div 
      id="3d-virtual-tour-overlay"
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 bg-primary/95 backdrop-blur-md overflow-y-auto font-sans"
    >
      {/* Absolute Backdrop Close Trigger */}
      <div className="absolute inset-0 cursor-pointer" onClick={onClose} />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: 'spring', damping: 25, stiffness: 220 }}
        className="bg-primary border border-[#8C7A53]/30 rounded-3xl overflow-hidden max-w-5xl w-full shadow-2xl relative z-10 flex flex-col lg:flex-row max-h-[95vh] lg:max-h-[90vh]"
      >
        {/* Left Column: 3D HUD Viewport Panel */}
        <div className={`flex-1 relative flex flex-col justify-between overflow-hidden bg-gradient-to-br ${theme.bg} min-h-[350px] md:min-h-[480px] border-b lg:border-b-0 lg:border-r border-[#8C7A53]/25`}>
          
          {/* Header readout line */}
          <div className="p-4 md:p-5 flex items-center justify-between relative z-10 bg-black/10 backdrop-blur-xs">
            <div className="flex items-center space-x-3">
              <span className="p-1.5 rounded-md bg-[#8C7A53]/25 text-secondary-fixed animate-pulse">
                <Compass className="w-4 h-4" />
              </span>
              <div>
                <span className="text-[9px] font-mono font-bold tracking-widest uppercase block text-secondary-fixed">
                  MELROSE 3D ORBIT VIEWER
                </span>
                <h4 className="font-serif text-xs md:text-sm font-bold text-white leading-tight">
                  {isFR ? 'Simulation Architecture & Cadastre' : 'Simulated Architectural Blueprint'}
                </h4>
              </div>
            </div>

            {/* Live rotating compass rose widget */}
            <div className="flex items-center space-x-3">
              <div className="relative w-8 h-8 rounded-full border border-white/20 bg-black/10 flex items-center justify-center shadow-inner">
                <div 
                  className="absolute w-full h-full flex items-center justify-center transition-transform duration-75 ease-out"
                  style={{ transform: `rotate(${compassAngle}deg)` }}
                >
                  <Navigation className="w-4 h-4 text-[#D4AF37]" />
                </div>
                <span className="absolute top-0 text-[6px] font-mono font-bold text-white/50">N</span>
              </div>

              <div className="text-right font-mono text-[8px] text-white/60 space-y-0.5 hidden sm:block leading-tight">
                <div>{isFR ? 'CADASTRE SÉNÉGAL CERTIFIÉ' : 'CERTIFIED SENEGAL CADASTRAL'}</div>
                <div>SEC: {parcel.id} • ZONE: A1</div>
              </div>
            </div>
          </div>

          {/* SVG 3D Canvas rendering */}
          <div className="flex-1 flex items-center justify-center relative select-none">
            {/* Viewfinder crosshairs and scanner overlays */}
            <div className="absolute inset-8 pointer-events-none border border-white/5 rounded-2xl flex items-center justify-center">
              <div className="w-12 h-[1px] bg-white/20 absolute" />
              <div className="h-12 w-[1px] bg-white/20 absolute" />
              <div className="absolute top-4 left-4 text-[9px] font-mono text-white/30">CAM-01_P12</div>
              <div className="absolute bottom-4 right-4 text-[9px] font-mono text-white/30">RE_ZOOM: {zoom.toFixed(1)}x</div>
            </div>

            <svg 
              viewBox={`0 0 ${width} ${height}`} 
              className="w-full h-full max-h-[380px] max-w-[500px]"
            >
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
                      className="stroke-[#8C7A53]/35"
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
                    className={theme.gridColor}
                    strokeWidth="1.2"
                  />
                ))
              )}

              {/* Dynamic Environmental Casted Shadow Polygon */}
              {showVillaModel && viewMode !== 'wireframe' && (
                <polygon
                  points={geo.shadowBase.map(p => `${p.x},${p.y}`).join(' ')}
                  fill="rgba(0,0,0,1)"
                  opacity={geo.shadowOpacity}
                  className="transition-all duration-300"
                />
              )}

              {/* 3D Base boundary surface face for the selected plot */}
              {viewMode !== 'wireframe' && (
                <polygon
                  points={geo.projectedBase.map(p => `${p.x},${p.y}`).join(' ')}
                  className={theme.parcelBaseFill}
                />
              )}

              {/* Extruded parcel side walls (Left, Back, Right, Front faces) */}
              {viewMode !== 'wireframe' && geo.projectedBase.map((bp, idx) => {
                const nextIdx = (idx + 1) % 4;
                const bNext = geo.projectedBase[nextIdx];
                const tCurr = geo.projectedTop[idx];
                const tNext = geo.projectedTop[nextIdx];
                return (
                  <polygon
                    key={`side-${idx}`}
                    points={`${bp.x},${bp.y} ${bNext.x},${bNext.y} ${tNext.x},${tNext.y} ${tCurr.x},${tCurr.y}`}
                    className="fill-black/10 stroke-[#8C7A53]/15"
                  />
                );
              })}

              {/* Top boundary surface face of the selected plot */}
              {viewMode !== 'wireframe' && (
                <polygon
                  points={geo.projectedTop.map(p => `${p.x},${p.y}`).join(' ')}
                  className={theme.parcelTopFill}
                />
              )}

              {/* Interior division outlines if enabled */}
              {currentFurnishing && viewMode !== 'wireframe' && (
                geo.projWalls.map((w, idx) => (
                  <line
                    key={`wall-${idx}`}
                    x1={w.p1.x}
                    y1={w.p1.y}
                    x2={w.p2.x}
                    y2={w.p2.y}
                    className="stroke-[#8C7A53]/30"
                    strokeWidth="1"
                    strokeDasharray="2 2"
                  />
                ))
              )}

              {/* 3D Extrusion boundary outlines for high architectural visibility */}
              <polygon
                points={geo.projectedTop.map(p => `${p.x},${p.y}`).join(' ')}
                className={`${theme.parcelOutline} fill-none`}
                strokeWidth="2"
                strokeDasharray={viewMode === 'wireframe' ? '4 2' : 'none'}
              />
              <polygon
                points={geo.projectedBase.map(p => `${p.x},${p.y}`).join(' ')}
                className={`${theme.parcelOutline} fill-none opacity-40`}
                strokeWidth="1"
              />
              {geo.projectedBase.map((bp, idx) => (
                <line
                  key={`vert-${idx}`}
                  x1={bp.x}
                  y1={bp.y}
                  x2={geo.projectedTop[idx].x}
                  y2={geo.projectedTop[idx].y}
                  className={`${theme.parcelOutline} opacity-40`}
                  strokeWidth="1"
                />
              ))}

              {/* Proposed Architectural Villa Model rendering overlay */}
              {showVillaModel && (
                <g id="villa-model-projection">
                  {/* Villa Pool Deck face */}
                  <polygon
                    points={geo.projPool.map(p => `${p.x},${p.y}`).join(' ')}
                    className={theme.poolFill}
                    stroke="rgba(255,255,255,0.35)"
                    strokeWidth="1"
                  />

                  {/* Villa solid base & roof structure */}
                  {viewMode !== 'wireframe' && (
                    <>
                      <polygon
                        points={geo.projVillaBase.map(p => `${p.x},${p.y}`).join(' ')}
                        className="fill-black/30"
                      />
                      {/* Sides of the villa */}
                      {geo.projVillaBase.map((vbp, idx) => {
                        const nextIdx = (idx + 1) % 4;
                        const vbNext = geo.projVillaBase[nextIdx];
                        const vtCurr = geo.projVillaTop[idx];
                        const vtNext = geo.projVillaTop[nextIdx];
                        return (
                          <polygon
                            key={`vside-${idx}`}
                            points={`${vbp.x},${vbp.y} ${vbNext.x},${vbNext.y} ${vtNext.x},${vtNext.y} ${vtCurr.x},${vtCurr.y}`}
                            className={theme.villaFill}
                          />
                        );
                      })}
                    </>
                  )}

                  {/* Roof Outlines */}
                  <polygon
                    points={geo.projVillaTop.map(p => `${p.x},${p.y}`).join(' ')}
                    className="fill-white/10 stroke-white/85"
                    strokeWidth="1.5"
                  />
                  {/* Structural grid lines of the proposed villa */}
                  {geo.projVillaBase.map((vbp, idx) => (
                    <line
                      key={`vvert-${idx}`}
                      x1={vbp.x}
                      y1={vbp.y}
                      x2={geo.projVillaTop[idx].x}
                      y2={geo.projVillaTop[idx].y}
                      className="stroke-white/40"
                      strokeWidth="1"
                    />
                  ))}
                </g>
              )}

              {/* Scenic architectural trees overlay */}
              {showTrees && viewMode !== 'wireframe' && (
                geo.projTrees.map((t, idx) => (
                  <g key={`tree-${idx}`}>
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
                      className="fill-emerald-600/70 stroke-emerald-500"
                      strokeWidth="0.5"
                    />
                    <circle
                      cx={t.foliageA.x}
                      cy={t.foliageA.y}
                      r="3"
                      className="fill-emerald-500/60 stroke-emerald-400"
                      strokeWidth="0.5"
                    />
                    <circle
                      cx={t.foliageB.x}
                      cy={t.foliageB.y}
                      r="3"
                      className="fill-emerald-500/60 stroke-emerald-400"
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
                  className="stroke-[#8C7A53] animate-pulse"
                  strokeWidth="1.5"
                  strokeDasharray="3 3"
                />
                <circle
                  cx={geo.beaconTop.x}
                  cy={geo.beaconTop.y}
                  r="6"
                  className={theme.beaconColor}
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

          {/* HUD Footer readouts */}
          <div className="p-4 bg-black/20 backdrop-blur-xs flex justify-between items-center text-[10px] font-mono text-white/70 relative z-10 border-t border-white/5">
            <div className="flex items-center space-x-4">
              <span className="flex items-center space-x-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                <span className="font-bold text-emerald-400">FPS: 60.0_STABLE</span>
              </span>
              <span className="hidden sm:inline-block">•</span>
              <span className="hidden sm:inline-block">YAW: {Math.round(yaw)}°</span>
              <span className="hidden sm:inline-block">PITCH: {Math.round(pitch)}°</span>
            </div>

            <button 
              onClick={handleReset}
              className="flex items-center space-x-1.5 px-2.5 py-1 rounded bg-white/10 hover:bg-white/15 text-white transition-all cursor-pointer text-[9px] uppercase font-bold tracking-wide"
              title="Reset View"
            >
              <RotateCcw className="w-3 h-3" />
              <span>{isFR ? 'RÉINITIALISER' : 'RESET'}</span>
            </button>
          </div>
        </div>

        {/* Right Column: Controls and Preset Adjustments */}
        <div className="w-full lg:w-[380px] bg-white p-5 md:p-6 flex flex-col justify-between space-y-4 overflow-y-auto max-h-[50vh] lg:max-h-full">
          <div className="space-y-4">
            
            {/* Modal Exit Button and Title */}
            <div className="flex justify-between items-start">
              <div>
                <span className="bg-[#8C7A53]/15 text-[#8C7A53] px-2 py-0.5 rounded-sm font-mono text-[9px] font-bold uppercase tracking-widest block w-fit mb-1">
                  PLOT TOUR 3D PRO
                </span>
                <h3 className="font-serif text-xl md:text-2xl font-bold text-primary leading-tight">
                  {isFR ? 'Parcelle' : 'Plot'} #{parcel.id < 10 ? `0${parcel.id}` : parcel.id}
                </h3>
                <p className="font-sans text-[11px] text-outline mt-0.5 font-light">
                  {parcel.area} m² • {parcel.orientation[currentLanguage]}
                </p>
              </div>
              <button 
                onClick={onClose}
                className="p-1.5 hover:bg-black/5 rounded-full transition-colors cursor-pointer text-primary"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Toggle Camera Mode: Orbit vs First Person */}
            <div className="space-y-1.5">
              <span className="font-sans font-bold text-primary uppercase tracking-wide text-[9px] block">
                {isFR ? 'Mode Caméra' : 'Camera Perspective'}
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  onClick={() => setCameraMode('orbit')}
                  className={`py-2 px-1 rounded-lg text-[10px] font-bold uppercase transition-all flex items-center justify-center space-x-2 cursor-pointer ${
                    cameraMode === 'orbit' 
                      ? 'bg-[#8C7A53] text-white shadow-xs' 
                      : 'bg-gray-50 text-outline hover:bg-gray-100 border border-black/5'
                  }`}
                >
                  <Compass className="w-3.5 h-3.5" />
                  <span>{isFR ? 'Orbite 3D' : 'Orbit'}</span>
                </button>
                <button
                  onClick={() => setCameraMode('fpv')}
                  className={`py-2 px-1 rounded-lg text-[10px] font-bold uppercase transition-all flex items-center justify-center space-x-2 cursor-pointer ${
                    cameraMode === 'fpv' 
                      ? 'bg-[#8C7A53] text-white shadow-xs' 
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
                <span className="font-sans font-bold text-primary uppercase tracking-wide text-[9px]">
                  {cameraMode === 'fpv' ? (isFR ? 'Orientation du regard (Pan)' : 'Look Direction') : (isFR ? 'Orbite Caméra (Yaw)' : 'Camera Orbit (Yaw)')}
                </span>
                <span className="font-mono text-[10px] text-outline font-bold">{Math.round(yaw)}°</span>
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
                className="w-full h-1 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-[#8C7A53]"
              />
              <div className="flex justify-between items-center text-[9px] text-outline font-mono uppercase">
                <span>0°</span>
                {cameraMode === 'orbit' && (
                  <button 
                    onClick={() => setIsRotating(!isRotating)}
                    className={`px-1.5 py-0.5 rounded-sm text-[8px] font-bold transition-all ${
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
                <span className="font-sans font-bold text-primary uppercase tracking-wide text-[9px]">
                  {isFR ? 'Inclinaison / Hauteur Caméra' : 'Camera Gaze Pitch'}
                </span>
                <span className="font-mono text-[10px] text-outline font-bold">{Math.round(pitch)}°</span>
              </div>
              <input
                type="range"
                min="5"
                max="75"
                value={pitch}
                onChange={(e) => setPitch(Number(e.target.value))}
                className="w-full h-1 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-[#8C7A53]"
              />
              <div className="flex justify-between text-[9px] text-outline font-mono">
                <span>5° (LOW)</span>
                <span>75° (HIGH)</span>
              </div>
            </div>

            {/* Premium Style Swapper */}
            <div className="space-y-1.5 pt-1.5 border-t border-gray-200">
              <span className="font-sans font-bold text-primary uppercase tracking-wide text-[9px] block">
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
                      className={`py-1.5 px-1 rounded-md text-[9px] font-bold uppercase transition-all text-center cursor-pointer border ${
                        isActive 
                          ? 'bg-primary text-white border-primary shadow-xs' 
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
                <span className="font-sans font-bold text-primary uppercase tracking-wide text-[9px]">
                  {isFR ? 'Nombre d’Étages' : 'Villa Floors / Stories'}
                </span>
                <span className="font-mono text-[10px] text-[#8C7A53] font-bold">R+{storyCount - 1}</span>
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                {[1, 2, 3].map((num) => (
                  <button
                    key={num}
                    onClick={() => setStoryCount(num)}
                    className={`py-1.5 rounded-md text-[10px] font-bold transition-all text-center cursor-pointer border ${
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
              <span className="font-sans font-bold text-primary uppercase tracking-wide text-[9px] block">
                {isFR ? 'Aménagement & Paysage' : 'Landscaping & Utilities'}
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  onClick={() => setShowTrees(!showTrees)}
                  className={`py-1.5 px-2 rounded-md text-[9px] font-bold uppercase transition-all flex items-center justify-center space-x-1 cursor-pointer border ${
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
                  className={`py-1.5 px-2 rounded-md text-[9px] font-bold uppercase transition-all flex items-center justify-center space-x-1 cursor-pointer border ${
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
              <span className="font-sans font-bold text-primary uppercase tracking-wide text-[9px] block">
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
                      className={`py-2 px-1 rounded-lg text-[8px] font-bold uppercase transition-all flex flex-col items-center justify-center space-y-1 cursor-pointer ${
                        isActive 
                          ? 'bg-primary text-white shadow-xs' 
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
              <span className="font-sans font-bold text-primary uppercase tracking-wide text-[9px] block">
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
                      className={`py-1.5 rounded-lg text-[9px] font-bold uppercase transition-all text-center cursor-pointer border ${
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
            <div className="flex items-start space-x-2 text-[10px] text-outline leading-tight font-light">
              <ShieldCheck className="w-4 h-4 text-[#0F6B4F] shrink-0 mt-0.5" />
              <span>
                {isFR 
                  ? 'Ce modèle est une projection cadastrale interactive certifiée par notre service d’urbanisme.'
                  : 'This spatial projection represents authentic cadastral measurements validated by certified surveyors.'}
              </span>
            </div>

            <button
              onClick={onClose}
              className="w-full bg-primary text-white hover:bg-opacity-95 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest cursor-pointer transition-all text-center"
            >
              {isFR ? 'Fermer la vue' : 'Exit Virtual View'}
            </button>
          </div>

        </div>

      </motion.div>
    </div>
  );
}
