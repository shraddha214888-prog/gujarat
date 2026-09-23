import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { River, Mountain, City, CategoryType, RegionType } from '../types/gujarat';
import { GUJARAT_RIVERS, GUJARAT_MOUNTAINS, GUJARAT_CITIES } from '../data/gujaratData';
import { 
  RotateCcw, 
  Play, 
  Pause, 
  Sun, 
  Sunset, 
  Moon, 
  Compass,
  Layers,
  ZoomIn,
  ZoomOut,
  CloudSun
} from 'lucide-react';
import { WeatherWidget } from './WeatherWidget';

interface Gujarat3DMapProps {
  categoryFilter: CategoryType;
  selectedRiver: River | null;
  selectedMountain: Mountain | null;
  selectedCity: City | null;
  onSelectRiver: (river: River) => void;
  onSelectMountain: (mountain: Mountain) => void;
  onSelectCity: (city: City) => void;
  searchQuery: string;
}

type LightingMode = 'day' | 'sunset' | 'night';

// Major geographical landmarks that receive prominent ambient highlighting
const MAJOR_LANDMARK_IDS = new Set([
  'girnar', 'pavagadh', 'chotila', 'shetrunjay', 'saputara', 'kalo_dungar',
  'narmada', 'tapi', 'sabarmati', 'mahi',
  'ahmedabad', 'surat', 'vadodara', 'rajkot'
]);

interface Mountain3DItem {
  id: string;
  group: THREE.Group;
  coneMesh: THREE.Mesh;
  summitMesh: THREE.Mesh;
  summitMat: THREE.MeshStandardMaterial;
  baseRingMesh: THREE.Mesh;
  baseRingMat: THREE.MeshBasicMaterial;
  baseRadius: number;
  heightScale: number;
  initialSummitY: number;
  phase: number;
  isMajor: boolean;
}

interface City3DItem {
  id: string;
  group: THREE.Group;
  pillarMesh: THREE.Mesh;
  pillarMat: THREE.MeshStandardMaterial;
  sphereMesh: THREE.Mesh;
  sphereMat: THREE.MeshStandardMaterial;
  ringMesh: THREE.Mesh;
  ringMat: THREE.MeshBasicMaterial;
  pillarHeight: number;
  initialSphereY: number;
  phase: number;
  isMajor: boolean;
}

interface River3DItem {
  id: string;
  mesh: THREE.Mesh;
  material: THREE.MeshStandardMaterial;
  initialColor: string;
  phase: number;
  isMajor: boolean;
}

// Gujarat boundary polygon points (scaled to [-10, 10] space, with Z as south)
// Capturing Kachchh, Saurashtra, Khambhat Gulf, South Gujarat, North & East borders
const GUJARAT_POLYGON_POINTS: [number, number][] = [
  // Kachchh North & West (Great Rann)
  [-7.5, -7.5],
  [-5.0, -7.8],
  [-2.0, -7.2],
  // North Gujarat border (Banaskantha / Sabarkantha)
  [1.0, -8.0],
  [3.5, -7.0],
  [4.5, -5.0],
  // East border with MP / Rajasthan
  [5.2, -3.0],
  [5.8, -0.5],
  [5.5, 2.0],
  // South-East border (Narmada / Dang / Valsad)
  [5.2, 5.0],
  [4.5, 8.5],
  [3.2, 9.2],
  // South Gujarat Coast (Daman / Surat / Bharuch)
  [2.0, 9.0],
  [1.6, 7.2],
  [1.8, 5.0],
  // Khambhat Gulf (ખંભાતનો અખાત)
  [0.8, 3.2],
  [0.2, 2.0],
  [-0.8, 3.2],
  // Saurashtra South Coast (Bhavnagar, Amreli, Junagadh, Somnath)
  [-1.5, 5.0],
  [-3.5, 5.8],
  [-6.0, 5.2],
  // Saurashtra West Coast (Porbandar, Dwarka)
  [-8.4, 4.0],
  [-8.6, 2.2],
  [-8.0, 0.5],
  // Gulf of Kachchh South shore (Jamnagar / Morbi)
  [-6.5, 0.2],
  [-4.5, 0.4],
  [-3.0, -1.0],
  // Little Rann / Kachchh connection
  [-2.5, -2.5],
  [-4.0, -3.0],
  // Gulf of Kachchh North shore (Kandla / Mandvi)
  [-5.5, -3.2],
  [-7.8, -3.5],
  [-8.8, -5.0],
  [-8.5, -6.5],
];

export const Gujarat3DMap: React.FC<Gujarat3DMapProps> = ({
  categoryFilter,
  selectedRiver,
  selectedMountain,
  selectedCity,
  onSelectRiver,
  onSelectMountain,
  onSelectCity,
  searchQuery,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Three.js internal state refs
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const animFrameIdRef = useRef<number | null>(null);
  const interactiveObjectsRef = useRef<{ id: string; type: 'river' | 'mountain' | 'city'; mesh: THREE.Object3D; data: any }[]>([]);
  const riverTubesRef = useRef<River3DItem[]>([]);
  const mountainMeshesRef = useRef<Mountain3DItem[]>([]);
  const cityBeaconsRef = useRef<City3DItem[]>([]);
  const particlesRef = useRef<THREE.Points | null>(null);

  // 3D Highlight & Breathing Beacon Refs for Viewed Landmarks
  const highlightGroupRef = useRef<THREE.Group | null>(null);
  const highlightWave1Ref = useRef<THREE.Mesh | null>(null);
  const highlightWave2Ref = useRef<THREE.Mesh | null>(null);
  const highlightTargetRingRef = useRef<THREE.Mesh | null>(null);
  const highlightBeamRef = useRef<THREE.Mesh | null>(null);
  const highlightCrystalRef = useRef<THREE.Mesh | null>(null);
  const highlightCrystalBaseYRef = useRef<number>(2.5);

  // Smooth camera panning refs
  const targetLookAtRef = useRef<THREE.Vector3 | null>(null);
  const targetCamPosRef = useRef<THREE.Vector3 | null>(null);

  // Selected landmark ref for 60fps real-time sync with animation loop
  const selectedItemRef = useRef<{
    id: string;
    type: 'river' | 'mountain' | 'city';
    coord: [number, number, number];
  } | null>(null);

  // Screen projected badges state
  const [screenBadges, setScreenBadges] = useState<{
    id: string;
    nameGu: string;
    type: 'river' | 'mountain' | 'city';
    x: number;
    y: number;
    visible: boolean;
    data: any;
    altitudeOrLength?: string;
  }[]>([]);

  // HUD & Lighting state
  const [lightingMode, setLightingMode] = useState<LightingMode>('day');
  const [isAutoRotating, setIsAutoRotating] = useState<boolean>(true);
  const [activeRegion, setActiveRegion] = useState<RegionType>('all');
  const [hoveredItem, setHoveredItem] = useState<{ nameGu: string; type: string; info: string } | null>(null);
  const [showWeatherLayer, setShowWeatherLayer] = useState<boolean>(true);

  // Active location for real-time weather data
  const activeWeatherCoord = (() => {
    if (selectedCity?.geoCoords) {
      return {
        lat: selectedCity.geoCoords.lat,
        lng: selectedCity.geoCoords.lng,
        nameGu: selectedCity.nameGu,
        nameEn: selectedCity.nameEn,
      };
    }
    if (selectedMountain?.geoCoords) {
      return {
        lat: selectedMountain.geoCoords.lat,
        lng: selectedMountain.geoCoords.lng,
        nameGu: selectedMountain.nameGu,
        nameEn: selectedMountain.nameEn,
      };
    }
    if (selectedRiver?.geoCoords) {
      return {
        lat: selectedRiver.geoCoords.lat,
        lng: selectedRiver.geoCoords.lng,
        nameGu: selectedRiver.nameGu,
        nameEn: selectedRiver.nameEn,
      };
    }
    // Default to Ahmedabad
    return {
      lat: GUJARAT_CITIES[0].geoCoords.lat,
      lng: GUJARAT_CITIES[0].geoCoords.lng,
      nameGu: GUJARAT_CITIES[0].nameGu,
      nameEn: GUJARAT_CITIES[0].nameEn,
    };
  })();

  // Lighting References for dynamic theme change
  const dirLightRef = useRef<THREE.DirectionalLight | null>(null);
  const hemiLightRef = useRef<THREE.HemisphereLight | null>(null);
  const ambientLightRef = useRef<THREE.AmbientLight | null>(null);

  // Update lighting theme
  const applyLightingMode = useCallback((mode: LightingMode) => {
    if (!sceneRef.current || !dirLightRef.current || !hemiLightRef.current || !ambientLightRef.current) return;

    if (mode === 'day') {
      sceneRef.current.background = new THREE.Color(0x0a1128);
      sceneRef.current.fog = new THREE.FogExp2(0x0a1128, 0.022);
      dirLightRef.current.color.setHex(0xfff1d6);
      dirLightRef.current.intensity = 2.0;
      dirLightRef.current.position.set(12, 18, 10);
      hemiLightRef.current.color.setHex(0xdbeafe);
      hemiLightRef.current.groundColor.setHex(0x1e293b);
      hemiLightRef.current.intensity = 1.2;
      ambientLightRef.current.color.setHex(0x38bdf8);
      ambientLightRef.current.intensity = 0.5;
    } else if (mode === 'sunset') {
      sceneRef.current.background = new THREE.Color(0x1e1026);
      sceneRef.current.fog = new THREE.FogExp2(0x1e1026, 0.024);
      dirLightRef.current.color.setHex(0xf97316);
      dirLightRef.current.intensity = 2.4;
      dirLightRef.current.position.set(18, 8, 12);
      hemiLightRef.current.color.setHex(0xfb923c);
      hemiLightRef.current.groundColor.setHex(0x3b0764);
      hemiLightRef.current.intensity = 1.0;
      ambientLightRef.current.color.setHex(0xf43f5e);
      ambientLightRef.current.intensity = 0.6;
    } else {
      // Night
      sceneRef.current.background = new THREE.Color(0x030712);
      sceneRef.current.fog = new THREE.FogExp2(0x030712, 0.025);
      dirLightRef.current.color.setHex(0x38bdf8);
      dirLightRef.current.intensity = 0.8;
      dirLightRef.current.position.set(8, 16, -6);
      hemiLightRef.current.color.setHex(0x1e3a8a);
      hemiLightRef.current.groundColor.setHex(0x020617);
      hemiLightRef.current.intensity = 0.6;
      ambientLightRef.current.color.setHex(0x6366f1);
      ambientLightRef.current.intensity = 0.4;
    }
  }, []);

  // Synchronize viewed landmark with 3D highlight beacon & smooth camera glide
  useEffect(() => {
    let activeItem: { id: string; type: 'river' | 'mountain' | 'city'; coord: [number, number, number] } | null = null;
    let colorHex = 0xf59e0b;
    let crystalY = 2.2;

    if (selectedMountain) {
      activeItem = { id: selectedMountain.id, type: 'mountain', coord: selectedMountain.coord3D };
      colorHex = 0xf59e0b; // Gold/Amber for Mountains
      const heightScale = Math.max(0.7, (selectedMountain.heightM / 1117) * 2.2);
      crystalY = heightScale + 0.85;
    } else if (selectedRiver) {
      activeItem = { id: selectedRiver.id, type: 'river', coord: selectedRiver.markerCoord3D };
      colorHex = 0x38bdf8; // Sky/Cyan for Rivers
      crystalY = 1.6;
    } else if (selectedCity) {
      activeItem = { id: selectedCity.id, type: 'city', coord: selectedCity.coord3D };
      colorHex = 0xf43f5e; // Rose/Coral for Cities
      crystalY = 1.8;
    }

    selectedItemRef.current = activeItem;

    if (highlightGroupRef.current) {
      if (activeItem) {
        const [x, , z] = activeItem.coord;
        highlightGroupRef.current.position.set(x, 0, z);
        highlightGroupRef.current.visible = true;
        highlightCrystalBaseYRef.current = crystalY;

        // Update colors of all highlight beacon components
        const color = new THREE.Color(colorHex);
        if (highlightWave1Ref.current) (highlightWave1Ref.current.material as THREE.MeshBasicMaterial).color.set(color);
        if (highlightWave2Ref.current) (highlightWave2Ref.current.material as THREE.MeshBasicMaterial).color.set(color);
        if (highlightTargetRingRef.current) (highlightTargetRingRef.current.material as THREE.MeshBasicMaterial).color.set(color);
        if (highlightBeamRef.current) (highlightBeamRef.current.material as THREE.MeshBasicMaterial).color.set(color);
        if (highlightCrystalRef.current) {
          const mat = highlightCrystalRef.current.material as THREE.MeshStandardMaterial;
          mat.color.set(color);
          mat.emissive.set(color);
        }

        // Smooth camera glide towards the viewed landmark
        targetLookAtRef.current = new THREE.Vector3(x, 0.4, z);
        if (cameraRef.current) {
          const currentDist = cameraRef.current.position.length();
          const targetDist = Math.max(8.5, Math.min(currentDist, 16));
          targetCamPosRef.current = new THREE.Vector3(x + 0.6, targetDist * 0.55, z + targetDist * 0.7);
        }
      } else {
        highlightGroupRef.current.visible = false;
        targetLookAtRef.current = null;
        targetCamPosRef.current = null;
      }
    }
  }, [selectedMountain, selectedRiver, selectedCity]);

  // Initialize Three.js Scene
  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const container = containerRef.current;
    const canvas = canvasRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // 1. Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 16, 17);
    cameraRef.current = camera;

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      powerPreference: 'high-performance',
      alpha: false,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    rendererRef.current = renderer;

    // 4. OrbitControls
    const controls = new OrbitControls(camera, canvas);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2.05; // don't go below ground
    controls.minDistance = 6;
    controls.maxDistance = 32;
    controls.target.set(0, 0, 0.5);
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.6;
    controlsRef.current = controls;

    // 5. Lights
    const ambientLight = new THREE.AmbientLight(0x38bdf8, 0.5);
    scene.add(ambientLight);
    ambientLightRef.current = ambientLight;

    const hemiLight = new THREE.HemisphereLight(0xdbeafe, 0x1e293b, 1.2);
    scene.add(hemiLight);
    hemiLightRef.current = hemiLight;

    const dirLight = new THREE.DirectionalLight(0xfff1d6, 2.0);
    dirLight.position.set(12, 18, 10);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    dirLight.shadow.camera.near = 0.5;
    dirLight.shadow.camera.far = 50;
    dirLight.shadow.camera.left = -16;
    dirLight.shadow.camera.right = 16;
    dirLight.shadow.camera.top = 16;
    dirLight.shadow.camera.bottom = -16;
    dirLight.shadow.bias = -0.0005;
    scene.add(dirLight);
    dirLightRef.current = dirLight;

    // Apply default day lighting
    applyLightingMode('day');

    // 6. Arabian Sea / Gulfs Water Plane (with subtle grid & glow)
    const oceanGeo = new THREE.PlaneGeometry(60, 60, 40, 40);
    const oceanMat = new THREE.MeshStandardMaterial({
      color: 0x071b38,
      roughness: 0.15,
      metalness: 0.85,
      transparent: true,
      opacity: 0.94,
    });
    const oceanMesh = new THREE.Mesh(oceanGeo, oceanMat);
    oceanMesh.rotation.x = -Math.PI / 2;
    oceanMesh.position.y = -0.08;
    oceanMesh.receiveShadow = true;
    scene.add(oceanMesh);

    // Subtle decorative concentric grid rings in the ocean for futuristic geography depth
    const ringGeo = new THREE.RingGeometry(8, 22, 64);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x0284c7,
      transparent: true,
      opacity: 0.12,
      side: THREE.DoubleSide,
    });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.rotation.x = -Math.PI / 2;
    ringMesh.position.y = -0.06;
    scene.add(ringMesh);

    // 7. Gujarat Landmass 3D Extrusion & Relief
    const gujaratShape = new THREE.Shape();
    GUJARAT_POLYGON_POINTS.forEach(([x, z], index) => {
      // Shape coordinates: map X to x, and Z to -y
      if (index === 0) {
        gujaratShape.moveTo(x, -z);
      } else {
        gujaratShape.lineTo(x, -z);
      }
    });
    gujaratShape.closePath();

    const extrudeSettings = {
      steps: 2,
      depth: 0.28,
      bevelEnabled: true,
      bevelThickness: 0.08,
      bevelSize: 0.08,
      bevelSegments: 4,
    };

    const terrainGeometry = new THREE.ExtrudeGeometry(gujaratShape, extrudeSettings);
    // Orient horizontally: Extrude creates in Z, rotate so it lies flat on XZ plane
    terrainGeometry.rotateX(Math.PI / 2);

    const terrainMaterial = new THREE.MeshStandardMaterial({
      color: 0x163428, // rich Gujarati terrain emerald-slate
      roughness: 0.65,
      metalness: 0.15,
      flatShading: false,
    });

    const terrainMesh = new THREE.Mesh(terrainGeometry, terrainMaterial);
    terrainMesh.position.y = 0;
    terrainMesh.castShadow = true;
    terrainMesh.receiveShadow = true;
    scene.add(terrainMesh);

    // Gujarat Landmass Border Glow Line
    const borderPoints = GUJARAT_POLYGON_POINTS.map(([x, z]) => new THREE.Vector3(x, 0.38, z));
    borderPoints.push(new THREE.Vector3(GUJARAT_POLYGON_POINTS[0][0], 0.38, GUJARAT_POLYGON_POINTS[0][1]));
    const borderGeo = new THREE.BufferGeometry().setFromPoints(borderPoints);
    const borderMat = new THREE.LineBasicMaterial({
      color: 0xf59e0b, // vibrant golden toran accent
      linewidth: 2,
      transparent: true,
      opacity: 0.85,
    });
    const borderLine = new THREE.Line(borderGeo, borderMat);
    scene.add(borderLine);

    // 8. Add 3D Rivers (Curved glowing tubes with flow dynamics)
    const riverTubesList: River3DItem[] = [];
    GUJARAT_RIVERS.forEach((river, idx) => {
      const curvePoints = river.pathCoords3D.map(([x, y, z]) => new THREE.Vector3(x, y + 0.32, z));
      const curve = new THREE.CatmullRomCurve3(curvePoints);
      const tubeGeo = new THREE.TubeGeometry(curve, 32, 0.07, 8, false);
      const tubeMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(river.color),
        emissive: new THREE.Color(river.color),
        emissiveIntensity: 0.8,
        roughness: 0.2,
        metalness: 0.5,
      });

      const tubeMesh = new THREE.Mesh(tubeGeo, tubeMat);
      tubeMesh.castShadow = true;
      scene.add(tubeMesh);

      // Register interactive object
      interactiveObjectsRef.current.push({
        id: river.id,
        type: 'river',
        mesh: tubeMesh,
        data: river,
      });

      riverTubesList.push({
        id: river.id,
        mesh: tubeMesh,
        material: tubeMat,
        initialColor: river.color,
        phase: (idx * 0.85) % (Math.PI * 2),
        isMajor: MAJOR_LANDMARK_IDS.has(river.id),
      });
    });
    riverTubesRef.current = riverTubesList;

    // 9. Add 3D Mountains (Tall Cones/Peaks with glowing summit beacons)
    const mountainMeshesList: Mountain3DItem[] = [];
    GUJARAT_MOUNTAINS.forEach((mountain, idx) => {
      const group = new THREE.Group();
      const [x, y, z] = mountain.coord3D;

      // Scale height relative to real elevation
      const heightScale = Math.max(0.7, (mountain.heightM / 1117) * 2.2);
      const baseRadius = 0.55 + (mountain.heightM / 1117) * 0.35;

      // Peak Cone Geometry
      const coneGeo = new THREE.ConeGeometry(baseRadius, heightScale, 7);
      const coneMat = new THREE.MeshStandardMaterial({
        color: 0x854d0e, // earthy mountain ochre
        roughness: 0.8,
        metalness: 0.1,
        flatShading: true,
      });
      const coneMesh = new THREE.Mesh(coneGeo, coneMat);
      coneMesh.position.y = heightScale / 2 + 0.3;
      coneMesh.castShadow = true;
      coneMesh.receiveShadow = true;
      group.add(coneMesh);

      // Glowing peak summit beacon
      const summitGeo = new THREE.SphereGeometry(0.13, 16, 16);
      const summitMat = new THREE.MeshStandardMaterial({
        color: 0xf59e0b,
        emissive: 0xf59e0b,
        emissiveIntensity: 1.2,
        roughness: 0.2,
      });
      const summitMesh = new THREE.Mesh(summitGeo, summitMat);
      const initialSummitY = heightScale + 0.35;
      summitMesh.position.y = initialSummitY;
      group.add(summitMesh);

      // Base ring
      const baseRingGeo = new THREE.RingGeometry(baseRadius * 0.95, baseRadius * 1.15, 24);
      const baseRingMat = new THREE.MeshBasicMaterial({
        color: 0xd97706,
        transparent: true,
        opacity: 0.4,
        side: THREE.DoubleSide,
      });
      const baseRingMesh = new THREE.Mesh(baseRingGeo, baseRingMat);
      baseRingMesh.rotation.x = -Math.PI / 2;
      baseRingMesh.position.y = 0.32;
      group.add(baseRingMesh);

      group.position.set(x, 0, z);
      scene.add(group);

      interactiveObjectsRef.current.push({
        id: mountain.id,
        type: 'mountain',
        mesh: coneMesh,
        data: mountain,
      });

      mountainMeshesList.push({
        id: mountain.id,
        group,
        coneMesh,
        summitMesh,
        summitMat,
        baseRingMesh,
        baseRingMat,
        baseRadius,
        heightScale,
        initialSummitY,
        phase: (idx * 0.95) % (Math.PI * 2),
        isMajor: MAJOR_LANDMARK_IDS.has(mountain.id),
      });
    });
    mountainMeshesRef.current = mountainMeshesList;

    // 10. Add 3D Cities (Glowing pillars & architectural pin)
    const cityBeaconsList: City3DItem[] = [];
    GUJARAT_CITIES.forEach((city, idx) => {
      const group = new THREE.Group();
      const [x, y, z] = city.coord3D;

      // City light pillar
      const pillarHeight = 0.7;
      const pillarGeo = new THREE.CylinderGeometry(0.08, 0.12, pillarHeight, 16);
      const pillarMat = new THREE.MeshStandardMaterial({
        color: 0xec4899,
        emissive: 0xec4899,
        emissiveIntensity: 0.8,
        transparent: true,
        opacity: 0.85,
      });
      const pillarMesh = new THREE.Mesh(pillarGeo, pillarMat);
      pillarMesh.position.y = pillarHeight / 2 + 0.3;
      group.add(pillarMesh);

      // Top glowing sphere
      const sphereGeo = new THREE.SphereGeometry(0.14, 16, 16);
      const sphereMat = new THREE.MeshStandardMaterial({
        color: 0xf43f5e,
        emissive: 0xf43f5e,
        emissiveIntensity: 1.5,
        roughness: 0.2,
      });
      const sphereMesh = new THREE.Mesh(sphereGeo, sphereMat);
      const initialSphereY = pillarHeight + 0.35;
      sphereMesh.position.y = initialSphereY;
      group.add(sphereMesh);

      // Rotating pulse ring
      const ringGeo = new THREE.RingGeometry(0.2, 0.32, 20);
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0xfb7185,
        transparent: true,
        opacity: 0.5,
        side: THREE.DoubleSide,
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.rotation.x = -Math.PI / 2;
      ringMesh.position.y = 0.32;
      group.add(ringMesh);

      group.position.set(x, 0, z);
      scene.add(group);

      interactiveObjectsRef.current.push({
        id: city.id,
        type: 'city',
        mesh: pillarMesh,
        data: city,
      });

      cityBeaconsList.push({
        id: city.id,
        group,
        pillarMesh,
        pillarMat,
        sphereMesh,
        sphereMat,
        ringMesh,
        ringMat,
        pillarHeight,
        initialSphereY,
        phase: (idx * 0.9) % (Math.PI * 2),
        isMajor: MAJOR_LANDMARK_IDS.has(city.id),
      });
    });
    cityBeaconsRef.current = cityBeaconsList;

    // 11. Subtle Ambient Floating Star Particles
    const particleCount = 200;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 35;
      positions[i + 1] = Math.random() * 12 + 1;
      positions[i + 2] = (Math.random() - 0.5) * 35;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0x93c5fd,
      size: 0.12,
      transparent: true,
      opacity: 0.6,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);
    particlesRef.current = particles;

    // 12. Add Dedicated 3D Highlight & Breathing Beacon System for Viewed Landmarks
    const hlGroup = new THREE.Group();
    hlGroup.visible = false;

    // Radar Ripple Wave 1 (Expands outward with sinusoidal fade)
    const waveGeo1 = new THREE.RingGeometry(0.35, 0.52, 32);
    const waveMat1 = new THREE.MeshBasicMaterial({
      color: 0xf59e0b,
      transparent: true,
      opacity: 0.8,
      side: THREE.DoubleSide,
    });
    const waveMesh1 = new THREE.Mesh(waveGeo1, waveMat1);
    waveMesh1.rotation.x = -Math.PI / 2;
    waveMesh1.position.y = 0.34;
    hlGroup.add(waveMesh1);
    highlightWave1Ref.current = waveMesh1;

    // Radar Ripple Wave 2 (Half-cycle offset for continuous ripple)
    const waveGeo2 = new THREE.RingGeometry(0.35, 0.52, 32);
    const waveMat2 = new THREE.MeshBasicMaterial({
      color: 0xf59e0b,
      transparent: true,
      opacity: 0.8,
      side: THREE.DoubleSide,
    });
    const waveMesh2 = new THREE.Mesh(waveGeo2, waveMat2);
    waveMesh2.rotation.x = -Math.PI / 2;
    waveMesh2.position.y = 0.34;
    hlGroup.add(waveMesh2);
    highlightWave2Ref.current = waveMesh2;

    // Rotating target ring with breathing scale
    const targetGeo = new THREE.RingGeometry(0.7, 0.88, 32);
    const targetMat = new THREE.MeshBasicMaterial({
      color: 0xf59e0b,
      transparent: true,
      opacity: 0.85,
      side: THREE.DoubleSide,
    });
    const targetMesh = new THREE.Mesh(targetGeo, targetMat);
    targetMesh.rotation.x = -Math.PI / 2;
    targetMesh.position.y = 0.35;
    hlGroup.add(targetMesh);
    highlightTargetRingRef.current = targetMesh;

    // Holographic Vertical Light Column / Beacon Ray
    const beamGeo = new THREE.CylinderGeometry(0.08, 0.3, 4.5, 16, 1, true);
    const beamMat = new THREE.MeshBasicMaterial({
      color: 0xf59e0b,
      transparent: true,
      opacity: 0.28,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
    });
    const beamMesh = new THREE.Mesh(beamGeo, beamMat);
    beamMesh.position.y = 2.6;
    hlGroup.add(beamMesh);
    highlightBeamRef.current = beamMesh;

    // Floating Glowing Diamond / Crystal Indicator
    const crystalGeo = new THREE.OctahedronGeometry(0.2, 0);
    const crystalMat = new THREE.MeshStandardMaterial({
      color: 0xfef08a,
      emissive: 0xf59e0b,
      emissiveIntensity: 2.0,
      roughness: 0.1,
      metalness: 0.3,
    });
    const crystalMesh = new THREE.Mesh(crystalGeo, crystalMat);
    crystalMesh.position.y = 2.5;
    hlGroup.add(crystalMesh);
    highlightCrystalRef.current = crystalMesh;

    scene.add(hlGroup);
    highlightGroupRef.current = hlGroup;

    // 13. Animation Loop & Screen Projection of Badges
    const clock = new THREE.Clock();

    const animate = () => {
      animFrameIdRef.current = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Gentle floating of ambient cosmic particles
      if (particlesRef.current) {
        particlesRef.current.rotation.y = elapsedTime * 0.02;
      }

      // Highlight Beacon Breathing & Pulsing (Radar Waves, Light Beam, Indicator Crystal)
      if (highlightGroupRef.current && highlightGroupRef.current.visible) {
        const speed = 0.65; // gentle, majestic breathing cadence

        // Expanding radar wave 1
        if (highlightWave1Ref.current) {
          const p1 = (elapsedTime * speed) % 1.0;
          const s1 = 0.8 + p1 * 3.6;
          highlightWave1Ref.current.scale.set(s1, s1, 1.0);
          (highlightWave1Ref.current.material as THREE.MeshBasicMaterial).opacity = Math.sin(p1 * Math.PI) * 0.85;
        }

        // Expanding radar wave 2 (half-period offset)
        if (highlightWave2Ref.current) {
          const p2 = ((elapsedTime * speed) + 0.5) % 1.0;
          const s2 = 0.8 + p2 * 3.6;
          highlightWave2Ref.current.scale.set(s2, s2, 1.0);
          (highlightWave2Ref.current.material as THREE.MeshBasicMaterial).opacity = Math.sin(p2 * Math.PI) * 0.85;
        }

        // Rotating target ring with subtle breathing scale
        if (highlightTargetRingRef.current) {
          highlightTargetRingRef.current.rotation.z = elapsedTime * 1.2;
          const trScale = 1.0 + Math.sin(elapsedTime * 3.2) * 0.12;
          highlightTargetRingRef.current.scale.set(trScale, trScale, 1.0);
        }

        // Vertical holographic light beam breathing
        if (highlightBeamRef.current) {
          (highlightBeamRef.current.material as THREE.MeshBasicMaterial).opacity = 0.22 + Math.sin(elapsedTime * 2.8) * 0.14;
        }

        // Floating diamond crystal rotating and breathing
        if (highlightCrystalRef.current) {
          highlightCrystalRef.current.rotation.y = elapsedTime * 2.4;
          highlightCrystalRef.current.position.y = highlightCrystalBaseYRef.current + Math.sin(elapsedTime * 3.2) * 0.14;
          const crScale = 1.0 + Math.sin(elapsedTime * 3.2) * 0.18;
          highlightCrystalRef.current.scale.set(crScale, crScale, crScale);
        }
      }

      // Pulse & Breathe River Tubes
      riverTubesRef.current.forEach((r) => {
        const isSelected = selectedItemRef.current?.id === r.id;
        if (isSelected) {
          // Energetic surge of light when river is being viewed
          r.material.emissiveIntensity = 2.0 + Math.sin(elapsedTime * 4.0) * 0.8;
        } else {
          // Subtle breathing flow
          r.material.emissiveIntensity = 0.65 + Math.sin(elapsedTime * 2.2 + r.phase) * (r.isMajor ? 0.35 : 0.2);
        }
      });

      // Pulse & Breathe Mountain Summit Beacons & Base Rings
      mountainMeshesRef.current.forEach((m) => {
        const isSelected = selectedItemRef.current?.id === m.id;
        if (isSelected) {
          // Dynamic breathing for viewed mountain
          const s = 1.0 + Math.sin(elapsedTime * 4.0) * 0.35;
          m.summitMesh.scale.set(s, s, s);
          m.summitMat.emissiveIntensity = 2.4 + Math.sin(elapsedTime * 4.0) * 1.0;
          m.summitMesh.position.y = m.initialSummitY + Math.sin(elapsedTime * 3.5) * 0.08;
          m.baseRingMat.opacity = 0.75 + Math.sin(elapsedTime * 3.2) * 0.25;
          const rs = 1.0 + Math.sin(elapsedTime * 3.2) * 0.25;
          m.baseRingMesh.scale.set(rs, rs, 1.0);
        } else {
          // Subtle ambient breathing (elevated for major mountains like Girnar, Pavagadh, Saputara)
          const s = 1.0 + Math.sin(elapsedTime * 2.0 + m.phase) * (m.isMajor ? 0.15 : 0.08);
          m.summitMesh.scale.set(s, s, s);
          m.summitMat.emissiveIntensity = 1.2 + Math.sin(elapsedTime * 2.0 + m.phase) * (m.isMajor ? 0.5 : 0.25);
          m.baseRingMat.opacity = 0.35 + Math.sin(elapsedTime * 1.8 + m.phase) * 0.12;
        }
      });

      // Pulse & Breathe City Beacons
      cityBeaconsRef.current.forEach((c) => {
        const isSelected = selectedItemRef.current?.id === c.id;
        if (isSelected) {
          // Dynamic breathing for viewed city
          const s = 1.0 + Math.sin(elapsedTime * 4.0) * 0.38;
          c.sphereMesh.scale.set(s, s, s);
          c.sphereMat.emissiveIntensity = 2.6 + Math.sin(elapsedTime * 4.0) * 1.0;
          c.sphereMesh.position.y = c.initialSphereY + Math.sin(elapsedTime * 3.5) * 0.08;
          c.pillarMat.emissiveIntensity = 1.4 + Math.sin(elapsedTime * 4.0) * 0.5;
          c.ringMesh.rotation.z = elapsedTime * 2.5;
          const rScale = 1.0 + Math.sin(elapsedTime * 4.0) * 0.45;
          c.ringMesh.scale.set(rScale, rScale, 1.0);
        } else {
          // Subtle ambient breathing (elevated for major cities like Ahmedabad, Surat, Vadodara)
          const s = 1.0 + Math.sin(elapsedTime * 2.2 + c.phase) * (c.isMajor ? 0.15 : 0.08);
          c.sphereMesh.scale.set(s, s, s);
          c.sphereMat.emissiveIntensity = 1.4 + Math.sin(elapsedTime * 2.2 + c.phase) * (c.isMajor ? 0.55 : 0.25);
          c.ringMesh.rotation.z = elapsedTime * 0.8;
          const rScale = 1.0 + Math.sin(elapsedTime * 2.4 + c.phase) * 0.18;
          c.ringMesh.scale.set(rScale, rScale, 1.0);
        }
      });

      // Smooth Camera Glide towards viewed landmark
      if (targetLookAtRef.current && targetCamPosRef.current && controlsRef.current) {
        controlsRef.current.target.lerp(targetLookAtRef.current, 0.045);
        camera.position.lerp(targetCamPosRef.current, 0.045);
        if (
          controlsRef.current.target.distanceTo(targetLookAtRef.current) < 0.04 &&
          camera.position.distanceTo(targetCamPosRef.current) < 0.08
        ) {
          targetLookAtRef.current = null;
          targetCamPosRef.current = null;
        }
      }

      // Update camera controls
      controls.update();
      renderer.render(scene, camera);

      // Project 3D markers to 2D screen positions for crisp Gujarati typography
      const badges: any[] = [];
      const tempVec = new THREE.Vector3();

      // Mountains
      GUJARAT_MOUNTAINS.forEach((m) => {
        tempVec.set(m.coord3D[0], 1.2, m.coord3D[2]);
        tempVec.project(camera);
        // Is it facing camera?
        if (tempVec.z < 1) {
          const x = (tempVec.x * 0.5 + 0.5) * container.clientWidth;
          const y = (-(tempVec.y * 0.5) + 0.5) * container.clientHeight;
          badges.push({
            id: m.id,
            nameGu: m.nameGu,
            type: 'mountain',
            x,
            y,
            visible: true,
            data: m,
            altitudeOrLength: `${m.heightM} મીટર`,
          });
        }
      });

      // Cities
      GUJARAT_CITIES.forEach((c) => {
        tempVec.set(c.coord3D[0], 0.9, c.coord3D[2]);
        tempVec.project(camera);
        if (tempVec.z < 1) {
          const x = (tempVec.x * 0.5 + 0.5) * container.clientWidth;
          const y = (-(tempVec.y * 0.5) + 0.5) * container.clientHeight;
          badges.push({
            id: c.id,
            nameGu: c.nameGu,
            type: 'city',
            x,
            y,
            visible: true,
            data: c,
            altitudeOrLength: c.nicknameGu.split('/')[0].trim(),
          });
        }
      });

      // Rivers (at midpoint)
      GUJARAT_RIVERS.forEach((r) => {
        tempVec.set(r.markerCoord3D[0], 0.5, r.markerCoord3D[2]);
        tempVec.project(camera);
        if (tempVec.z < 1) {
          const x = (tempVec.x * 0.5 + 0.5) * container.clientWidth;
          const y = (-(tempVec.y * 0.5) + 0.5) * container.clientHeight;
          badges.push({
            id: r.id,
            nameGu: r.nameGu,
            type: 'river',
            x,
            y,
            visible: true,
            data: r,
            altitudeOrLength: `${r.lengthKm} કિમી`,
          });
        }
      });

      setScreenBadges(badges);
    };

    animate();

    // 13. Window resize handling
    const handleResize = () => {
      if (!containerRef.current || !rendererRef.current || !cameraRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
      renderer.dispose();
      controls.dispose();
    };
  }, [applyLightingMode]);

  // Handle click raycasting on 3D canvas
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || !cameraRef.current || !sceneRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const mouse = new THREE.Vector2(
      ((e.clientX - rect.left) / rect.width) * 2 - 1,
      -((e.clientY - rect.top) / rect.height) * 2 + 1
    );

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, cameraRef.current);

    const meshesToCheck = interactiveObjectsRef.current.map((o) => o.mesh);
    const intersects = raycaster.intersectObjects(meshesToCheck, true);

    if (intersects.length > 0) {
      const hitMesh = intersects[0].object;
      const found = interactiveObjectsRef.current.find(
        (o) => o.mesh === hitMesh || o.mesh.children.includes(hitMesh)
      );

      if (found) {
        if (found.type === 'mountain') onSelectMountain(found.data);
        else if (found.type === 'river') onSelectRiver(found.data);
        else if (found.type === 'city') onSelectCity(found.data);
      }
    }
  };

  // Visibility filtering based on category and region
  const filteredBadges = screenBadges.filter((b) => {
    // Category filter
    if (categoryFilter === 'rivers' && b.type !== 'river') return false;
    if (categoryFilter === 'mountains' && b.type !== 'mountain') return false;
    if (categoryFilter === 'cities' && b.type !== 'city') return false;

    // Region filter
    if (activeRegion !== 'all' && b.data.region !== activeRegion) return false;

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchNameGu = b.data.nameGu?.toLowerCase().includes(q);
      const matchNameEn = b.data.nameEn?.toLowerCase().includes(q);
      const matchDistrict = b.data.districtGu?.toLowerCase().includes(q);
      return matchNameGu || matchNameEn || matchDistrict;
    }

    return true;
  });

  // Camera presets
  const handleFocusRegion = (region: RegionType) => {
    setActiveRegion(region);
    if (!cameraRef.current || !controlsRef.current) return;

    const controls = controlsRef.current;
    if (region === 'all') {
      controls.target.set(0, 0, 0.5);
      cameraRef.current.position.set(0, 16, 17);
    } else if (region === 'saurashtra') {
      controls.target.set(-4.5, 0, 3.0);
      cameraRef.current.position.set(-4.5, 9, 9);
    } else if (region === 'kachchh') {
      controls.target.set(-6.0, 0, -4.5);
      cameraRef.current.position.set(-6.0, 8, 2);
    } else if (region === 'north') {
      controls.target.set(1.0, 0, -5.0);
      cameraRef.current.position.set(1.0, 9, 2);
    } else if (region === 'central') {
      controls.target.set(1.8, 0, 0.8);
      cameraRef.current.position.set(1.8, 8, 6.5);
    } else if (region === 'south') {
      controls.target.set(2.8, 0, 6.2);
      cameraRef.current.position.set(2.8, 8, 11);
    }
  };

  const handleResetCamera = () => {
    handleFocusRegion('all');
  };

  const toggleAutoRotate = () => {
    if (controlsRef.current) {
      const next = !isAutoRotating;
      controlsRef.current.autoRotate = next;
      setIsAutoRotating(next);
    }
  };

  const handleZoom = (delta: number) => {
    if (!cameraRef.current || !controlsRef.current) return;
    const camera = cameraRef.current;
    const factor = delta > 0 ? 0.8 : 1.25;
    camera.position.x *= factor;
    camera.position.y *= factor;
    camera.position.z *= factor;
  };

  const handleLightingChange = (mode: LightingMode) => {
    setLightingMode(mode);
    applyLightingMode(mode);
  };

  return (
    <div ref={containerRef} className="relative w-full h-full overflow-hidden select-none bg-slate-950">
      {/* 3D WebGL Canvas */}
      <canvas
        ref={canvasRef}
        onClick={handleCanvasClick}
        className="w-full h-full block cursor-grab active:cursor-grabbing"
      />

      {/* Floating 2D Screen Badges for 3D markers with rich Gujarati typography */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {filteredBadges.map((badge) => {
          const isSelected =
            (selectedMountain && selectedMountain.id === badge.id) ||
            (selectedRiver && selectedRiver.id === badge.id) ||
            (selectedCity && selectedCity.id === badge.id);

          let typeColor = 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30';
          let iconChar = '⛰️';
          if (badge.type === 'river') {
            typeColor = 'bg-sky-500/20 text-sky-300 border-sky-500/40 hover:bg-sky-500/30';
            iconChar = '🌊';
          } else if (badge.type === 'city') {
            typeColor = 'bg-rose-500/20 text-rose-300 border-rose-500/40 hover:bg-rose-500/30';
            iconChar = '🏛️';
          }

          return (
            <div
              key={`${badge.type}-${badge.id}`}
              style={{
                transform: `translate(${badge.x}px, ${badge.y}px) translate(-50%, -100%)`,
              }}
              className="absolute pointer-events-auto transition-transform duration-100 ease-out"
            >
              <button
                onClick={() => {
                  if (badge.type === 'mountain') onSelectMountain(badge.data);
                  else if (badge.type === 'river') onSelectRiver(badge.data);
                  else if (badge.type === 'city') onSelectCity(badge.data);
                }}
                onMouseEnter={() =>
                  setHoveredItem({
                    nameGu: badge.nameGu,
                    type: badge.type === 'river' ? 'નદી' : badge.type === 'mountain' ? 'પર્વત' : 'પ્રમુખ શહેર',
                    info: badge.altitudeOrLength || '',
                  })
                }
                onMouseLeave={() => setHoveredItem(null)}
                className={`group flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border backdrop-blur-md shadow-lg transition-all ${typeColor} ${
                  isSelected
                    ? 'ring-2 ring-amber-400 ring-offset-2 ring-offset-slate-950 shadow-[0_0_24px_rgba(245,158,11,0.7)] animate-breathe scale-110 z-30 font-bold bg-amber-500/40 text-amber-200 border-amber-400'
                    : MAJOR_LANDMARK_IDS.has(badge.id)
                    ? 'hover:scale-105 border-amber-500/30'
                    : 'hover:scale-105'
                }`}
              >
                {isSelected ? (
                  <span className="relative flex h-2 w-2 shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400"></span>
                  </span>
                ) : (
                  <span>{iconChar}</span>
                )}
                <span className="font-semibold tracking-wide whitespace-nowrap">{badge.nameGu}</span>
                {badge.altitudeOrLength && (
                  <span className="text-[10px] opacity-75 hidden sm:inline whitespace-nowrap">
                    · {badge.altitudeOrLength}
                  </span>
                )}
                {isSelected && (
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-400 text-slate-950 tracking-wider shadow-sm ml-0.5">
                    દ્રશ્યમાન
                  </span>
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* Floating 3D HUD Controls: Region Presets & Map Viewports */}
      <div className="absolute top-4 left-4 z-20 flex flex-wrap items-center gap-1 p-1 bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-lg shadow-xl max-w-[calc(100%-2rem)]">
        <div className="flex items-center gap-1 px-2 py-1 text-xs text-slate-400 font-medium">
          <Compass className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden sm:inline">પ્રદેશ:</span>
        </div>
        <button
          onClick={() => handleFocusRegion('all')}
          className={`px-2.5 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap ${
            activeRegion === 'all'
              ? 'bg-amber-500 text-slate-950 font-semibold'
              : 'text-slate-300 hover:bg-slate-800'
          }`}
        >
          સમગ્ર ગુજરાત
        </button>
        <button
          onClick={() => handleFocusRegion('saurashtra')}
          className={`px-2.5 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap ${
            activeRegion === 'saurashtra'
              ? 'bg-amber-500 text-slate-950 font-semibold'
              : 'text-slate-300 hover:bg-slate-800'
          }`}
        >
          સૌરાષ્ટ્ર
        </button>
        <button
          onClick={() => handleFocusRegion('kachchh')}
          className={`px-2.5 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap ${
            activeRegion === 'kachchh'
              ? 'bg-amber-500 text-slate-950 font-semibold'
              : 'text-slate-300 hover:bg-slate-800'
          }`}
        >
          કચ્છ
        </button>
        <button
          onClick={() => handleFocusRegion('central')}
          className={`px-2.5 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap ${
            activeRegion === 'central'
              ? 'bg-amber-500 text-slate-950 font-semibold'
              : 'text-slate-300 hover:bg-slate-800'
          }`}
        >
          મધ્ય ગુજરાત
        </button>
        <button
          onClick={() => handleFocusRegion('south')}
          className={`px-2.5 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap ${
            activeRegion === 'south'
              ? 'bg-amber-500 text-slate-950 font-semibold'
              : 'text-slate-300 hover:bg-slate-800'
          }`}
        >
          દક્ષિણ ગુજરાત
        </button>
        <button
          onClick={() => handleFocusRegion('north')}
          className={`px-2.5 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap ${
            activeRegion === 'north'
              ? 'bg-amber-500 text-slate-950 font-semibold'
              : 'text-slate-300 hover:bg-slate-800'
          }`}
        >
          ઉત્તર ગુજરાત
        </button>
      </div>

      {/* Floating 3D Tools (Lighting mode, Rotation, Camera zoom) */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-1.5 p-1 bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-lg shadow-xl">
        {/* Lighting Selector */}
        <div className="flex items-center gap-0.5 bg-slate-950/60 p-0.5 rounded border border-slate-800/80">
          <button
            onClick={() => handleLightingChange('day')}
            title="દિન પ્રકાશ (Daylight)"
            className={`p-1.5 rounded transition-colors ${
              lightingMode === 'day' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sun className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => handleLightingChange('sunset')}
            title="સંધ્યાકાળ (Sunset)"
            className={`p-1.5 rounded transition-colors ${
              lightingMode === 'sunset' ? 'bg-orange-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sunset className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => handleLightingChange('night')}
            title="રાત્રિ દ્રશ્ય (Night)"
            className={`p-1.5 rounded transition-colors ${
              lightingMode === 'night' ? 'bg-indigo-500 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Moon className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="h-4 w-px bg-slate-800" />

        {/* Auto Rotate Toggle */}
        <button
          onClick={toggleAutoRotate}
          title={isAutoRotating ? 'પરિક્રમા અટકાવો' : '૩૬૦° પરિક્રમા શરૂ કરો'}
          className={`p-1.5 rounded transition-colors ${
            isAutoRotating ? 'bg-amber-500/20 text-amber-400' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
          }`}
        >
          {isAutoRotating ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
        </button>

        {/* Reset View */}
        <button
          onClick={handleResetCamera}
          title="દ્રષ્ટિકોણ રીસેટ કરો"
          className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>

        <div className="h-4 w-px bg-slate-800" />

        {/* Zoom In/Out */}
        <button
          onClick={() => handleZoom(1)}
          title="ઝૂમ ઇન"
          className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded transition-colors"
        >
          <ZoomIn className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => handleZoom(-1)}
          title="ઝૂમ આઉટ"
          className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded transition-colors"
        >
          <ZoomOut className="w-3.5 h-3.5" />
        </button>

        <div className="h-4 w-px bg-slate-800" />

        {/* Real-time Weather Layer Toggle Button */}
        <button
          onClick={() => setShowWeatherLayer((prev) => !prev)}
          title={showWeatherLayer ? 'હવામાન લેયર છુપાવો' : 'લાઇવ હવામાન લેયર દર્શાવો (Real-time Weather Layer)'}
          className={`flex items-center gap-1.5 px-2 py-1 rounded transition-colors text-xs ${
            showWeatherLayer
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-semibold'
              : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
          }`}
        >
          <CloudSun className="w-3.5 h-3.5 text-emerald-400" />
          <span className="hidden md:inline">હવામાન</span>
          {showWeatherLayer && (
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          )}
        </button>
      </div>

      {/* Real-time Weather Floating HUD Card */}
      {showWeatherLayer && (
        <div className="absolute top-16 right-4 z-20">
          <WeatherWidget
            lat={activeWeatherCoord.lat}
            lng={activeWeatherCoord.lng}
            landmarkNameGu={activeWeatherCoord.nameGu}
            landmarkNameEn={activeWeatherCoord.nameEn}
            compact={true}
            onClose={() => setShowWeatherLayer(false)}
            onSelectCity={onSelectCity}
          />
        </div>
      )}

      {/* Hover Info Tooltip */}
      {hoveredItem && (
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-20 pointer-events-none px-4 py-2 bg-slate-900/90 border border-amber-500/30 rounded-lg backdrop-blur-md shadow-2xl flex items-center gap-2 text-xs">
          <span className="text-amber-400 font-semibold">{hoveredItem.nameGu}</span>
          <span className="text-slate-400">({hoveredItem.type})</span>
          {hoveredItem.info && <span className="text-slate-300">· {hoveredItem.info}</span>}
          <span className="text-amber-300/70 text-[11px]">→ ક્લિક કરી વિગત જુઓ</span>
        </div>
      )}

      {/* 3D Navigation Guide Footer Bar */}
      <div className="absolute bottom-4 left-4 right-4 z-20 flex flex-col sm:flex-row items-center justify-between gap-2 px-4 py-2 bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-lg text-xs text-slate-400">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-400 inline-block shadow-sm shadow-sky-400" />
            <span>નદીઓ ({GUJARAT_RIVERS.length})</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block shadow-sm shadow-amber-400" />
            <span>ડુંગરો ({GUJARAT_MOUNTAINS.length})</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-400 inline-block shadow-sm shadow-rose-400" />
            <span>પ્રમુખ શહેરો ({GUJARAT_CITIES.length})</span>
          </span>
        </div>
        <div className="flex items-center gap-3 text-[11px] text-slate-500">
          <span>માઉસ/ટચથી ૩૬૦° ફેરવો</span>
          <span>·</span>
          <span>સ્ક્રોલથી ઝૂમ કરો</span>
          <span>·</span>
          <span>કોઈપણ સ્થળ પર ક્લિક કરી માહિતી મેળવો</span>
        </div>
      </div>
    </div>
  );
};
