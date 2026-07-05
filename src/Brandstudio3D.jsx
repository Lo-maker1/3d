import React, { useEffect, useRef, useState, useCallback } from "react";
import * as THREE from "three";
import { Palette, Image as ImageIcon, Type, Download, RotateCcw, X, Ruler, Camera, Info, User } from "lucide-react";

// ---------------------------------------------------------------------------
// BRAND STUDIO 3D — moteur de personnalisation + fiche technique + mannequins
// Palette : charbon #1A1B1E / crème #F5F3ED / lime #D4FF3F / violet #6C4CFF
// ---------------------------------------------------------------------------

const FONT_LINK_ID = "bs3d-fonts";

const PRESET_COLORS = [
  "#F5F3ED", "#1A1B1E", "#D4FF3F", "#6C4CFF",
  "#E8483C", "#2E6F4E", "#F2A93B", "#3A3D45",
];

const STITCH_COLORS = ["#F5F3ED", "#1A1B1E", "#D4FF3F", "#E8483C"];

const TEXT_FONTS = [
  { label: "Bold", family: "Arial Black, sans-serif" },
  { label: "Serif", family: "Georgia, serif" },
  { label: "Mono", family: "Courier New, monospace" },
  { label: "Impact", family: "Impact, sans-serif" },
];

// --- Silhouettes 2D (extrudées en 3D) ---------------------------------------

function shapeFromPoints(points) {
  const shape = new THREE.Shape();
  shape.moveTo(points[0][0], points[0][1]);
  for (let i = 1; i < points.length; i++) shape.lineTo(points[i][0], points[i][1]);
  shape.closePath();
  return shape;
}

const SHAPES = {
  tshirt: [[-0.9, 1.0], [-0.4, 1.32], [0, 1.15], [0.4, 1.32], [0.9, 1.0], [1.55, 0.62], [1.18, 0.05], [0.85, 0.28], [0.85, -1.25], [-0.85, -1.25], [-0.85, 0.28], [-1.18, 0.05], [-1.55, 0.62]],
  chemise: [[-0.9, 1.0], [-0.35, 1.3], [0, 1.12], [0.35, 1.3], [0.9, 1.0], [1.5, 0.6], [1.3, -0.4], [0.95, -0.3], [0.85, -1.3], [-0.85, -1.3], [-0.95, -0.3], [-1.3, -0.4], [-1.5, 0.6]],
  jacket: [[-0.95, 1.0], [-0.4, 1.32], [0, 1.15], [0.4, 1.32], [0.95, 1.0], [1.6, 0.55], [1.35, -0.5], [0.95, -0.35], [0.9, -1.15], [-0.9, -1.15], [-0.95, -0.35], [-1.35, -0.5], [-1.6, 0.55]],
  sweat: [[-1.0, 0.95], [-0.5, 1.3], [0, 1.05], [0.5, 1.3], [1.0, 0.95], [1.6, 0.5], [1.3, -0.5], [0.95, -0.35], [0.95, -1.3], [-0.95, -1.3], [-0.95, -0.35], [-1.3, -0.5], [-1.6, 0.5]],
  pull: [[-0.85, 1.0], [-0.3, 1.28], [0, 1.0], [0.3, 1.28], [0.85, 1.0], [1.5, 0.55], [1.2, -0.4], [0.9, -0.3], [0.85, -1.2], [-0.85, -1.2], [-0.9, -0.3], [-1.2, -0.4], [-1.5, 0.55]],
  jean: [[-0.72, 1.25], [0.72, 1.25], [0.62, -1.35], [0.14, -1.35], [0, -0.05], [-0.14, -1.35], [-0.62, -1.35]],
  jogging: [[-0.75, 1.25], [0.75, 1.25], [0.55, -1.3], [0.15, -1.3], [0, 0], [-0.15, -1.3], [-0.55, -1.3]],
  short: [[-0.75, 1.25], [0.75, 1.25], [0.65, 0.15], [0.15, 0.05], [0, 0.3], [-0.15, 0.05], [-0.65, 0.15]],
  jupe: [[-0.55, 1.2], [0.55, 1.2], [0.95, -1.2], [-0.95, -1.2]],
  chaussure: [[-1.0, -0.32], [-1.0, 0.12], [-0.62, 0.38], [-0.2, 0.3], [0.32, 0.24], [0.92, -0.02], [0.85, -0.32]],
  chaussette: [[-0.4, 1.3], [0.4, 1.3], [0.4, -0.2], [0.9, -0.5], [0.85, -0.8], [-0.2, -0.8], [-0.4, -0.4]],
  sac_dos: [[-0.7, 1.1], [0.7, 1.1], [0.85, 0.3], [0.85, -1.0], [-0.85, -1.0], [-0.85, 0.3]],
  sac_bandouliere: [[-0.6, 0.5], [0.6, 0.5], [0.7, -0.5], [0, -0.75], [-0.7, -0.5]],
  sac_sport: [[-1.2, 0.45], [1.2, 0.45], [1.35, 0], [1.2, -0.45], [-1.2, -0.45], [-1.35, 0]],
};

const DECAL_ANCHORS = {
  tshirt: { position: [0, 0.05, 0.24], scale: [1, 1] },
  chemise: { position: [0, 0.05, 0.24], scale: [1, 1] },
  jacket: { position: [0, 0.05, 0.24], scale: [1, 1] },
  sweat: { position: [0, 0.05, 0.24], scale: [1, 1] },
  pull: { position: [0, 0.1, 0.24], scale: [0.8, 0.8] },
  jean: { position: [0, 0.5, 0.24], scale: [0.7, 0.5] },
  jogging: { position: [0, 0.5, 0.24], scale: [0.7, 0.5] },
  short: { position: [0, 0.5, 0.24], scale: [0.55, 0.4] },
  jupe: { position: [0, 0.2, 0.24], scale: [0.7, 0.5] },
  chaussure: { position: [0, 0.05, 0.24], scale: [0.6, 0.4] },
  chaussette: { position: [0, 0.4, 0.24], scale: [0.5, 0.4] },
  casquette: { position: [0, 0.25, 0.98], scale: [0.6, 0.4] },
  bracelet: { position: [0, 0.9, 0.28], scale: [0.5, 0.35] },
  montre: { position: [0, 0, 0.13], scale: [0.5, 0.5] },
  sac_dos: { position: [0, 0.1, 0.24], scale: [0.6, 0.5] },
  sac_bandouliere: { position: [0, -0.05, 0.24], scale: [0.55, 0.45] },
  sac_sport: { position: [0, 0, 0.24], scale: [0.7, 0.45] },
};

const CATEGORIES = [
  { key: "hauts", label: "Hauts", products: ["tshirt", "chemise", "jacket", "sweat", "pull"] },
  { key: "bas", label: "Bas", products: ["jean", "jogging", "short", "jupe"] },
  { key: "pieds", label: "Chaussures", products: ["chaussure", "chaussette"] },
  { key: "access", label: "Accessoires", products: ["casquette", "bracelet", "montre"] },
  { key: "sacs", label: "Sacs", products: ["sac_dos", "sac_bandouliere", "sac_sport"] },
];

// Recale et redimensionne chaque produit pour qu'il coïncide précisément
// avec la zone du corps concernée sur le mannequin (épaules, taille,
// hanches, chevilles, tête, poignet...). Valeurs calculées à partir des
// repères anatomiques du mannequin (buildMannequin) et de l'étendue
// verticale réelle de chaque silhouette (voir SHAPES).
const POSE_TRANSFORM = {
  tshirt: { y: 0.285, scale: 0.572 },
  chemise: { y: 0.31, scale: 0.546 },
  jacket: { y: 0.25, scale: 0.648 },
  sweat: { y: 0.225, scale: 0.596 },
  pull: { y: 0.275, scale: 0.585 },
  jean: { y: -1.0, scale: 0.769 },
  jogging: { y: -0.95, scale: 0.745 },
  short: { y: -0.425, scale: 0.708 },
  jupe: { y: -0.5, scale: 0.417 },
  chaussure: { y: -2.025, scale: 0.5 },
  chaussette: { y: -1.825, scale: 0.31 },
  casquette: { y: 1.665, scale: 0.35 },
  bracelet: { x: 1.07, y: 0.02, z: 0.03, scale: 0.12 },
  montre: { x: 1.07, y: 0.02, z: 0.03, scale: 0.111 },
  sac_dos: { x: 1.5, y: 0.3, scale: 0.8 },
  sac_bandouliere: { x: 1.4, y: 0.0, scale: 0.75 },
  sac_sport: { x: 1.6, y: -0.5, scale: 0.7 },
};

const PRODUCT_LABELS = {
  tshirt: "T-shirt", chemise: "Chemise", jacket: "Veste/Jacket", sweat: "Sweat", pull: "Pull",
  jean: "Jean", jogging: "Jogging", short: "Short/Culotte", jupe: "Jupe",
  chaussure: "Chaussure", chaussette: "Chaussette",
  casquette: "Casquette", bracelet: "Bracelet", montre: "Montre",
  sac_dos: "Sac à dos", sac_bandouliere: "Sac bandoulière", sac_sport: "Sac de sport",
};

const MEASUREMENTS = {
  tshirt: [["chest", "Largeur poitrine", 52], ["length", "Longueur totale", 70], ["sleeve", "Longueur manche", 20], ["shoulder", "Largeur épaules", 45]],
  chemise: [["chest", "Largeur poitrine", 54], ["length", "Longueur totale", 74], ["sleeve", "Longueur manche", 62], ["shoulder", "Largeur épaules", 46]],
  jacket: [["chest", "Largeur poitrine", 56], ["length", "Longueur totale", 68], ["sleeve", "Longueur manche", 63], ["shoulder", "Largeur épaules", 48]],
  sweat: [["chest", "Largeur poitrine", 58], ["length", "Longueur totale", 68], ["sleeve", "Longueur manche", 60], ["shoulder", "Largeur épaules", 50]],
  pull: [["chest", "Largeur poitrine", 54], ["length", "Longueur totale", 66], ["sleeve", "Longueur manche", 61], ["shoulder", "Largeur épaules", 46]],
  jean: [["waist", "Tour de taille", 82], ["length", "Longueur", 104], ["thigh", "Largeur cuisse", 30], ["inseam", "Entrejambe", 80]],
  jogging: [["waist", "Tour de taille", 84], ["length", "Longueur", 102], ["thigh", "Largeur cuisse", 34], ["ankle", "Largeur cheville", 18]],
  short: [["waist", "Tour de taille", 82], ["length", "Longueur", 42], ["thigh", "Largeur cuisse", 32], ["hip", "Tour de hanches", 96]],
  jupe: [["waist", "Tour de taille", 70], ["length", "Longueur", 50], ["hip", "Tour de hanches", 96], ["hem", "Largeur ourlet", 60]],
  chaussure: [["size", "Pointure (EU)", 42], ["heel", "Hauteur talon", 2], ["width", "Largeur semelle", 10], ["length", "Longueur semelle", 28]],
  chaussette: [["footLength", "Longueur pied", 26], ["legHeight", "Hauteur tige", 15], ["cuff", "Largeur bord-côte", 9], ["thickness", "Épaisseur", 3]],
  casquette: [["head", "Tour de tête", 58], ["visor", "Longueur visière", 7], ["height", "Hauteur calotte", 11], ["strap", "Longueur ajustement", 12]],
  bracelet: [["diameter", "Diamètre intérieur", 6], ["width", "Largeur bande", 1.2], ["thickness", "Épaisseur", 0.3], ["clasp", "Longueur fermoir", 2]],
  montre: [["case", "Diamètre boîtier", 4.2], ["strap", "Largeur bracelet", 2.2], ["thickness", "Épaisseur boîtier", 1.1], ["length", "Longueur bracelet", 22]],
  sac_dos: [["height", "Hauteur", 45], ["width", "Largeur", 30], ["depth", "Profondeur", 15], ["strap", "Longueur bretelle", 70]],
  sac_bandouliere: [["height", "Hauteur", 22], ["width", "Largeur", 28], ["depth", "Profondeur", 8], ["strap", "Longueur bandoulière", 110]],
  sac_sport: [["height", "Hauteur", 30], ["width", "Largeur", 55], ["depth", "Profondeur", 25], ["strap", "Longueur bandoulière", 90]],
};

function defaultMeasurements(productKey) {
  const fields = MEASUREMENTS[productKey] || [];
  const out = {};
  fields.forEach(([key, , def]) => { out[key] = def; });
  return out;
}

// Donne du volume à une silhouette plate extrudée, comme si un corps la
// remplissait par-dessous, plutôt qu'une plaque plate d'épaisseur constante.
function bulgeGeometry(geometry, amount) {
  geometry.computeBoundingBox();
  const bbox = geometry.boundingBox;
  const hw = Math.max(0.0001, (bbox.max.x - bbox.min.x) / 2);
  const hh = Math.max(0.0001, (bbox.max.y - bbox.min.y) / 2);
  const cx = (bbox.max.x + bbox.min.x) / 2;
  const cy = (bbox.max.y + bbox.min.y) / 2;
  const cz = (bbox.max.z + bbox.min.z) / 2;
  const pos = geometry.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const nx = (pos.getX(i) - cx) / hw;
    const ny = (pos.getY(i) - cy) / hh;
    const r = Math.min(1, Math.sqrt(nx * nx + ny * ny));
    const bulge = Math.cos((r * Math.PI) / 2);
    const z = pos.getZ(i);
    const dir = z >= cz ? 1 : -1;
    pos.setZ(i, z + dir * bulge * amount);
  }
  pos.needsUpdate = true;
  geometry.computeVertexNormals();
}

const BULGE_AMOUNT = {
  tshirt: 0.34, chemise: 0.3, jacket: 0.36, sweat: 0.38, pull: 0.32,
  jean: 0.28, jogging: 0.3, short: 0.26, jupe: 0.24,
  chaussure: 0.22, chaussette: 0.18,
  sac_dos: 0.22, sac_bandouliere: 0.18, sac_sport: 0.24,
};

// --- Construction du produit -------------------------------------------------

function buildProductGroup(productKey, color) {
  const group = new THREE.Group();
  const material = new THREE.MeshStandardMaterial({ color, roughness: 0.75, metalness: 0.05 });
  group.userData.solidMeshes = [];

  if (SHAPES[productKey]) {
    const shape = shapeFromPoints(SHAPES[productKey]);
    const geo = new THREE.ExtrudeGeometry(shape, { depth: 0.34, bevelEnabled: true, bevelThickness: 0.06, bevelSize: 0.06, bevelSegments: 6, curveSegments: 12 });
    geo.center();
    bulgeGeometry(geo, BULGE_AMOUNT[productKey] ?? 0.28);
    const mesh = new THREE.Mesh(geo, material);
    group.add(mesh);
    group.userData.solidMeshes.push(mesh);
  } else if (productKey === "casquette") {
    const dome = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2), material);
    dome.position.y = 0.1;
    group.add(dome);
    group.userData.solidMeshes.push(dome);
    const brimShape = shapeFromPoints([[-1.05, 0], [1.05, 0], [0.9, -0.55], [0, -0.7], [-0.9, -0.55]]);
    const brimGeo = new THREE.ExtrudeGeometry(brimShape, { depth: 0.06, bevelEnabled: false });
    const brim = new THREE.Mesh(brimGeo, material);
    brim.position.set(0, 0.1, 0.95);
    brim.rotation.x = -0.35;
    group.add(brim);
    group.userData.solidMeshes.push(brim);
  } else if (productKey === "bracelet") {
    const torus = new THREE.Mesh(new THREE.TorusGeometry(0.9, 0.28, 24, 64), material);
    torus.rotation.x = Math.PI / 2;
    group.add(torus);
    group.userData.solidMeshes.push(torus);
  } else if (productKey === "montre") {
    const face = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 0.14, 40), material);
    face.rotation.x = Math.PI / 2;
    group.add(face);
    group.userData.solidMeshes.push(face);
    const strapTop = new THREE.Mesh(new THREE.BoxGeometry(0.34, 1.0, 0.08), material);
    strapTop.position.set(0, 0.85, 0);
    group.add(strapTop);
    group.userData.solidMeshes.push(strapTop);
    const strapBottom = strapTop.clone();
    strapBottom.position.set(0, -0.85, 0);
    group.add(strapBottom);
    group.userData.solidMeshes.push(strapBottom);
  }

  group.userData.material = material;
  group.userData.decalAnchor = DECAL_ANCHORS[productKey] || { position: [0, 0, 0.2], scale: [1, 1] };
  return group;
}

function addSeamOverlay(group, color) {
  group.userData.solidMeshes.forEach((mesh) => {
    const edges = new THREE.EdgesGeometry(mesh.geometry, 25);
    const line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color }));
    line.position.copy(mesh.position);
    line.rotation.copy(mesh.rotation);
    line.scale.copy(mesh.scale);
    line.userData.isSeam = true;
    group.add(line);
  });
}

function makeDecalTexture(canvas, { logoImg, text, textColor, fontFamily }) {
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const cx = canvas.width / 2;
  let logoBottom = canvas.height * 0.4;

  if (logoImg) {
    const maxW = canvas.width * 0.7;
    const maxH = canvas.height * (text ? 0.55 : 0.8);
    const ratio = Math.min(maxW / logoImg.width, maxH / logoImg.height);
    const w = logoImg.width * ratio;
    const h = logoImg.height * ratio;
    const y = text ? canvas.height * 0.12 : (canvas.height - h) / 2;
    ctx.drawImage(logoImg, cx - w / 2, y, w, h);
    logoBottom = y + h;
  }

  if (text) {
    ctx.fillStyle = textColor;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const fontSize = logoImg ? 46 : 64;
    ctx.font = `bold ${fontSize}px ${fontFamily}`;
    const y = logoImg ? logoBottom + 40 : canvas.height / 2;
    ctx.fillText(text.toUpperCase(), cx, y);
  }
}

// --- Construction du mannequin ------------------------------------------------

const MANNEQUIN_BASE = {
  homme: {
    torso: [[0.15, 1.3], [0.36, 1.05], [0.33, 0.55], [0.25, 0.05], [0.29, -0.35]],
    headR: 0.31, shoulderX: 1.0, hipX: 0.32,
    upperArmR: 0.115, foreArmR: 0.095, thighR: 0.175, calfR: 0.125,
  },
  femme: {
    torso: [[0.14, 1.3], [0.29, 1.05], [0.31, 0.5], [0.2, 0.0], [0.33, -0.35]],
    headR: 0.28, shoulderX: 0.88, hipX: 0.36,
    upperArmR: 0.1, foreArmR: 0.085, thighR: 0.155, calfR: 0.115,
  },
};

function limb(radiusA, radiusB, length, material) {
  return new THREE.Mesh(new THREE.CylinderGeometry(radiusA, radiusB, length, 16), material);
}

function buildMannequin(gender, corpulence01, muscle01) {
  const base = MANNEQUIN_BASE[gender] || MANNEQUIN_BASE.homme;
  const group = new THREE.Group();
  const material = new THREE.MeshStandardMaterial({ color: "#B9B4A8", roughness: 0.92, metalness: 0 });

  const girth = 0.72 + corpulence01 * 0.66;
  const bulk = 1 + muscle01 * 0.4;

  const pts = base.torso.map(([r, y], i) => {
    const emphasis = i <= 1 ? bulk : 1 + muscle01 * 0.08;
    return new THREE.Vector2(Math.max(0.02, r * girth * emphasis), y);
  });
  const torso = new THREE.Mesh(new THREE.LatheGeometry(pts, 24), material);
  group.add(torso);

  const head = new THREE.Mesh(new THREE.SphereGeometry(base.headR, 24, 16), material);
  head.position.y = 1.3 + base.headR + 0.06;
  group.add(head);

  const neck = limb(0.1 * girth, 0.12 * girth, 0.16, material);
  neck.position.y = 1.3 + 0.08;
  group.add(neck);

  const shoulderX = base.shoulderX * (0.92 + corpulence01 * 0.16);
  const hipX = base.hipX * girth * 0.5;

  [-1, 1].forEach((side) => {
    const upperArm = limb(base.upperArmR * girth * bulk, base.upperArmR * girth, 0.5, material);
    upperArm.position.set(side * shoulderX, 0.75, 0);
    upperArm.rotation.z = side * 0.12;
    group.add(upperArm);

    const foreArm = limb(base.foreArmR * girth, base.foreArmR * girth * 0.9, 0.48, material);
    foreArm.position.set(side * (shoulderX + 0.05), 0.28, 0.02);
    foreArm.rotation.z = side * 0.08;
    group.add(foreArm);

    const hand = new THREE.Mesh(new THREE.SphereGeometry(base.foreArmR * girth * 0.9, 12, 10), material);
    hand.position.set(side * (shoulderX + 0.07), 0.02, 0.03);
    group.add(hand);

    const thigh = limb(base.thighR * girth * (1 + muscle01 * 0.15), base.thighR * girth, 0.85, material);
    thigh.position.set(side * hipX, -0.75, 0);
    group.add(thigh);

    const calf = limb(base.calfR * girth, base.calfR * girth * 0.85, 0.85, material);
    calf.position.set(side * hipX, -1.6, 0);
    group.add(calf);

    const foot = new THREE.Mesh(new THREE.BoxGeometry(0.16 * girth, 0.1, 0.32), material);
    foot.position.set(side * hipX, -2.08, 0.1);
    group.add(foot);
  });

  return group;
}

export default function BrandStudio3D() {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const rigRef = useRef(null);
  const garmentGroupRef = useRef(null);
  const decalTextureRef = useRef(null);
  const decalCanvasRef = useRef(document.createElement("canvas"));
  const dragState = useRef({ dragging: false, lastX: 0, lastY: 0, rotY: 0.5, rotX: 0.1 });
  const rafRef = useRef(null);

  const [appMode, setAppMode] = useState("catalogue");
  const [category, setCategory] = useState("hauts");
  const [product, setProduct] = useState("tshirt");
  const [color, setColor] = useState("#F5F3ED");
  const [logoImg, setLogoImg] = useState(null);
  const [text, setText] = useState("");
  const [textColor, setTextColor] = useState("#1A1B1E");
  const [fontFamily, setFontFamily] = useState(TEXT_FONTS[0].family);
  const [activeTab, setActiveTab] = useState("color");
  const [showSeams, setShowSeams] = useState(false);
  const [stitchColor, setStitchColor] = useState("#D4FF3F");
  const [measurements, setMeasurements] = useState(defaultMeasurements("tshirt"));
  const [notes, setNotes] = useState("");
  const [scanImgUrl, setScanImgUrl] = useState(null);
  const [showMannequin, setShowMannequin] = useState(true);
  const [gender, setGender] = useState("homme");
  const [corpulence, setCorpulence] = useState(50);
  const [muscle, setMuscle] = useState(30);

  useEffect(() => {
    if (!document.getElementById(FONT_LINK_ID)) {
      const link = document.createElement("link");
      link.id = FONT_LINK_ID;
      link.rel = "stylesheet";
      link.href = "https://fonts.googleapis.com/css2?family=Anton&family=Inter:wght@400;500;600;700&display=swap";
      document.head.appendChild(link);
    }
  }, []);

  // Init three.js une seule fois
  useEffect(() => {
    const mount = mountRef.current;
    const width = mount.clientWidth;
    const height = mount.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#1A1B1E");
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(32, width / height, 0.1, 100);
    camera.position.set(0, -0.1, 6.6);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mount.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    scene.add(new THREE.AmbientLight(0xffffff, 0.65));
    const key = new THREE.DirectionalLight(0xffffff, 0.9);
    key.position.set(3, 4, 4);
    scene.add(key);
    const rim = new THREE.DirectionalLight(0xd4ff3f, 0.3);
    rim.position.set(-4, 2, -3);
    scene.add(rim);

    const grid = new THREE.GridHelper(10, 20, 0x3a3d45, 0x2a2b30);
    grid.position.y = -2.25;
    scene.add(grid);
    const spot = new THREE.PointLight(0xffffff, 0.5, 8);
    spot.position.set(0, 1.5, 2);
    scene.add(spot);

    const rig = new THREE.Group();
    scene.add(rig);
    rigRef.current = rig;

    const decalCanvas = decalCanvasRef.current;
    decalCanvas.width = 512;
    decalCanvas.height = 512;
    decalTextureRef.current = new THREE.CanvasTexture(decalCanvas);

    const animate = () => {
      rafRef.current = requestAnimationFrame(animate);
      if (!dragState.current.dragging) dragState.current.rotY += 0.0035;
      rig.rotation.y = dragState.current.rotY;
      rig.rotation.x = dragState.current.rotX;
      renderer.render(scene, camera);
    };
    animate();

    const onResize = () => {
      const w = mount.clientWidth, h = mount.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", onResize);

    const onDown = (e) => {
      dragState.current.dragging = true;
      const p = e.touches ? e.touches[0] : e;
      dragState.current.lastX = p.clientX;
      dragState.current.lastY = p.clientY;
    };
    const onMove = (e) => {
      if (!dragState.current.dragging) return;
      const p = e.touches ? e.touches[0] : e;
      const dx = p.clientX - dragState.current.lastX;
      const dy = p.clientY - dragState.current.lastY;
      dragState.current.rotY += dx * 0.008;
      dragState.current.rotX = Math.max(-0.4, Math.min(0.4, dragState.current.rotX + dy * 0.006));
      dragState.current.lastX = p.clientX;
      dragState.current.lastY = p.clientY;
    };
    const onUp = () => { dragState.current.dragging = false; };

    const dom = renderer.domElement;
    dom.style.cursor = "grab";
    dom.addEventListener("mousedown", onDown);
    dom.addEventListener("touchstart", onDown, { passive: true });
    window.addEventListener("mousemove", onMove);
    window.addEventListener("touchmove", onMove, { passive: true });
    window.addEventListener("mouseup", onUp);
    window.addEventListener("touchend", onUp);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("touchend", onUp);
      dom.removeEventListener("mousedown", onDown);
      dom.removeEventListener("touchstart", onDown);
      mount.removeChild(dom);
      renderer.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Reconstruit le contenu du rig (produit + mannequin, ou aperçu scan)
  useEffect(() => {
    const rig = rigRef.current;
    if (!rig) return;
    while (rig.children.length) {
      const child = rig.children.pop();
      child.traverse((obj) => { if (obj.geometry) obj.geometry.dispose(); });
    }

    if (appMode === "scan") {
      const geo = new THREE.BoxGeometry(1.6, 1.6, 1.6);
      const mat = scanImgUrl
        ? new THREE.MeshStandardMaterial({ map: new THREE.TextureLoader().load(scanImgUrl), roughness: 0.8 })
        : new THREE.MeshStandardMaterial({ color: "#3A3D45", roughness: 0.9, wireframe: true });
      rig.add(new THREE.Mesh(geo, mat));
      garmentGroupRef.current = null;
      return;
    }

    if (showMannequin) {
      rig.add(buildMannequin(gender, corpulence / 100, muscle / 100));
    }

    const garment = buildProductGroup(product, color);
    const t = showMannequin ? POSE_TRANSFORM[product] : null;
    if (t) {
      garment.position.set(t.x || 0, t.y, t.z || 0);
      garment.scale.setScalar(t.scale);
    }

    const decalMat = new THREE.MeshBasicMaterial({ map: decalTextureRef.current, transparent: true, depthWrite: false });
    const anchor = garment.userData.decalAnchor;
    const decalMesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), decalMat);
    decalMesh.position.set(...anchor.position);
    decalMesh.scale.set(anchor.scale[0], anchor.scale[1], 1);
    garment.add(decalMesh);

    if (showSeams) addSeamOverlay(garment, stitchColor);

    rig.add(garment);
    garmentGroupRef.current = garment;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appMode, product, showMannequin, gender, corpulence, muscle, scanImgUrl, showSeams, stitchColor]);

  // Couleur (rapide, pas de reconstruction complète)
  useEffect(() => {
    if (garmentGroupRef.current?.userData?.material) garmentGroupRef.current.userData.material.color.set(color);
  }, [color]);

  // Décalque logo/texte
  useEffect(() => {
    if (!decalTextureRef.current) return;
    makeDecalTexture(decalCanvasRef.current, { logoImg, text, textColor, fontFamily });
    decalTextureRef.current.needsUpdate = true;
  }, [logoImg, text, textColor, fontFamily, product]);

  useEffect(() => {
    setMeasurements(defaultMeasurements(product));
  }, [product]);

  const handleLogoUpload = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => setLogoImg(img);
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  }, []);

  const handleScanUpload = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setScanImgUrl(reader.result);
    reader.readAsDataURL(file);
  }, []);

  const handleExport = useCallback(() => {
    const renderer = rendererRef.current;
    if (!renderer) return;
    renderer.render(sceneRef.current, cameraRef.current);
    const url = renderer.domElement.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = `mockup-${product}.png`;
    a.click();
  }, [product]);

  const handleExportSpecs = useCallback(() => {
    const fields = MEASUREMENTS[product] || [];
    const lines = [
      `FICHE TECHNIQUE — ${PRODUCT_LABELS[product] || product}`,
      `Date : ${new Date().toLocaleDateString("fr-FR")}`,
      "",
      `Couleur : ${color}`,
      `Couleur de couture : ${showSeams ? stitchColor : "non spécifiée"}`,
      `Impression / logo : ${logoImg ? "oui (voir mockup joint)" : "non"}`,
      `Texte imprimé : ${text || "aucun"}`,
      `Mannequin de référence : ${showMannequin ? `${gender}, corpulence ${corpulence}/100, musculature ${muscle}/100` : "aucun"}`,
      "",
      "MESURES (cm) :",
      ...fields.map(([key, label]) => `- ${label} : ${measurements[key] ?? "-"} cm`),
      "",
      "NOTES POUR LE COUTURIER / ARTISAN :",
      notes || "aucune",
    ].join("\n");
    const blob = new Blob([lines], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `fiche-technique-${product}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }, [product, color, showSeams, stitchColor, logoImg, text, measurements, notes, showMannequin, gender, corpulence, muscle]);

  const bodyFont = "'Inter', sans-serif";
  const displayFont = "'Anton', sans-serif";
  const currentCategory = CATEGORIES.find((c) => c.key === category);

  return (
    <div style={{ fontFamily: bodyFont, background: "#1A1B1E", minHeight: "660px", display: "flex", flexDirection: "column", color: "#F5F3ED" }}>
      <div style={{ padding: "20px 24px 12px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
          <h1 style={{ fontFamily: displayFont, fontSize: 28, letterSpacing: 1, margin: 0 }}>
            BRAND STUDIO<span style={{ color: "#D4FF3F" }}>3D</span>
          </h1>
          <span style={{ fontSize: 12, color: "#8B8B90", textTransform: "uppercase", letterSpacing: 1 }}>Prototype</span>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          <button onClick={() => setAppMode("catalogue")} style={pillStyle(appMode === "catalogue")}>Catalogue</button>
          <button onClick={() => setAppMode("scan")} style={pillStyle(appMode === "scan")}>
            <Camera size={13} style={{ marginRight: 5, verticalAlign: -2 }} />Scanner un objet
          </button>
        </div>
      </div>

      <div style={{ display: "flex", flex: 1, flexWrap: "wrap" }}>
        <div style={{ flex: "1 1 480px", minWidth: 320, display: "flex", flexDirection: "column" }}>
          {appMode === "catalogue" && (
            <>
              <div style={{ padding: "0 24px 8px", display: "flex", gap: 6, flexWrap: "wrap" }}>
                {CATEGORIES.map((c) => (
                  <button key={c.key} onClick={() => { setCategory(c.key); setProduct(c.products[0]); }} style={pillStyle(category === c.key, true)}>
                    {c.label}
                  </button>
                ))}
              </div>
              <div style={{ padding: "0 24px 8px", display: "flex", gap: 8, flexWrap: "wrap" }}>
                {currentCategory.products.map((p) => (
                  <button key={p} onClick={() => setProduct(p)} style={pillStyle(product === p)}>
                    {PRODUCT_LABELS[p]}
                  </button>
                ))}
              </div>
            </>
          )}
          {appMode === "scan" && (
            <div style={{ padding: "0 24px 8px", fontSize: 12, color: "#8B8B90", display: "flex", gap: 8, alignItems: "flex-start" }}>
              <Info size={14} style={{ flexShrink: 0, marginTop: 2 }} />
              <span>Aperçu placeholder — voir l'explication sous la vue 3D pour brancher un vrai moteur de photogrammétrie.</span>
            </div>
          )}
          <div ref={mountRef} style={{ flex: 1, minHeight: 460, margin: "0 24px 12px", borderRadius: 12, overflow: "hidden", border: "1px solid #2A2B30" }} />
          <div style={{ padding: "0 24px 20px", display: "flex", gap: 12, alignItems: "center" }}>
            <RotateCcw size={14} color="#8B8B90" />
            <span style={{ fontSize: 12, color: "#8B8B90" }}>Glisse sur la scène pour faire pivoter l'objet</span>
          </div>
        </div>

        <div style={{ flex: "0 0 340px", minWidth: 280, background: "#F5F3ED", color: "#1A1B1E", padding: "20px 22px", display: "flex", flexDirection: "column", gap: 18 }}>
          {appMode === "scan" ? (
            <ScanPanel scanImgUrl={scanImgUrl} onUpload={handleScanUpload} onClear={() => setScanImgUrl(null)} />
          ) : (
            <>
              <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                {[
                  { key: "color", icon: Palette, label: "Couleur" },
                  { key: "logo", icon: ImageIcon, label: "Logo" },
                  { key: "text", icon: Type, label: "Texte" },
                  { key: "mannequin", icon: User, label: "Mannequin" },
                  { key: "specs", icon: Ruler, label: "Technique" },
                ].map(({ key, icon: Icon, label }) => (
                  <button
                    key={key}
                    onClick={() => setActiveTab(key)}
                    style={{
                      flex: "1 1 62px", display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
                      padding: "10px 2px", borderRadius: 8, border: "none",
                      background: activeTab === key ? "#1A1B1E" : "transparent",
                      color: activeTab === key ? "#D4FF3F" : "#5F5E5A",
                      cursor: "pointer", fontFamily: bodyFont, fontSize: 10.5, fontWeight: 600,
                    }}
                  >
                    <Icon size={16} />{label}
                  </button>
                ))}
              </div>

              {activeTab === "color" && (
                <div>
                  <SectionLabel>Couleur du produit</SectionLabel>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
                    {PRESET_COLORS.map((c) => (
                      <button key={c} onClick={() => setColor(c)} style={swatchStyle(c, color === c)} />
                    ))}
                  </div>
                  <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 10 }}>
                    <input type="color" value={color} onChange={(e) => setColor(e.target.value)} style={colorInputStyle} />
                    <span style={{ fontSize: 13, color: "#5F5E5A" }}>{color}</span>
                  </div>
                </div>
              )}

              {activeTab === "logo" && (
                <div>
                  <SectionLabel>Logo de la marque</SectionLabel>
                  <label style={uploadBoxStyle}>
                    <ImageIcon size={20} />
                    {logoImg ? "Remplacer le logo" : "Importer une image"}
                    <input type="file" accept="image/*" onChange={handleLogoUpload} style={{ display: "none" }} />
                  </label>
                  {logoImg && (
                    <button onClick={() => setLogoImg(null)} style={removeLinkStyle}>
                      <X size={14} /> Retirer le logo
                    </button>
                  )}
                </div>
              )}

              {activeTab === "text" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <div>
                    <SectionLabel>Texte du print</SectionLabel>
                    <input value={text} onChange={(e) => setText(e.target.value.slice(0, 20))} placeholder="NOM DE LA MARQUE" style={inputStyle} />
                  </div>
                  <div>
                    <SectionLabel>Police</SectionLabel>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {TEXT_FONTS.map((f) => (
                        <button key={f.label} onClick={() => setFontFamily(f.family)} style={fontBtnStyle(f, fontFamily === f.family)}>
                          {f.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 12, color: "#5F5E5A" }}>Couleur du texte</span>
                    <input type="color" value={textColor} onChange={(e) => setTextColor(e.target.value)} style={colorInputStyle} />
                  </div>
                </div>
              )}

              {activeTab === "mannequin" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, cursor: "pointer" }}>
                    <input type="checkbox" checked={showMannequin} onChange={(e) => setShowMannequin(e.target.checked)} />
                    Afficher le mannequin d'essayage
                  </label>
                  {showMannequin && (
                    <>
                      <div>
                        <SectionLabel>Silhouette</SectionLabel>
                        <div style={{ display: "flex", gap: 8 }}>
                          <button onClick={() => setGender("homme")} style={pillStyle(gender === "homme", true, true)}>Homme</button>
                          <button onClick={() => setGender("femme")} style={pillStyle(gender === "femme", true, true)}>Femme</button>
                        </div>
                      </div>
                      <SliderRow label="Corpulence" hint="mince → large" value={corpulence} onChange={setCorpulence} />
                      <SliderRow label="Musculature" hint="mince → musclé" value={muscle} onChange={setMuscle} />
                      <p style={{ fontSize: 11, color: "#8B8B90", margin: 0, lineHeight: 1.4 }}>
                        Chaque produit est calé sur ses propres repères anatomiques (épaules, taille,
                        hanches, chevilles, tête, poignet). Les sacs sont posés à côté du mannequin
                        plutôt que portés, pour rester lisibles.
                      </p>
                    </>
                  )}
                </div>
              )}

              {activeTab === "specs" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 14, maxHeight: 360, overflowY: "auto" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, cursor: "pointer" }}>
                    <input type="checkbox" checked={showSeams} onChange={(e) => setShowSeams(e.target.checked)} />
                    Afficher les repères de couture
                  </label>
                  {showSeams && (
                    <div>
                      <SectionLabel>Couleur du fil</SectionLabel>
                      <div style={{ display: "flex", gap: 8 }}>
                        {STITCH_COLORS.map((c) => (
                          <button key={c} onClick={() => setStitchColor(c)} style={swatchStyle(c, stitchColor === c, 28)} />
                        ))}
                      </div>
                    </div>
                  )}
                  <div>
                    <SectionLabel>Mesures (cm)</SectionLabel>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {(MEASUREMENTS[product] || []).map(([key, label]) => (
                        <div key={key} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                          <span style={{ fontSize: 12, color: "#5F5E5A" }}>{label}</span>
                          <input
                            type="number"
                            value={measurements[key] ?? 0}
                            onChange={(e) => setMeasurements((m) => ({ ...m, [key]: Number(e.target.value) }))}
                            style={{ width: 72, padding: "6px 8px", borderRadius: 6, border: "1px solid #D3D1C7", fontFamily: bodyFont, fontSize: 13 }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <SectionLabel>Notes pour le couturier</SectionLabel>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Ex: surpiqûre double, fermeture zip YKK, doublure coton..."
                      rows={3}
                      style={{ width: "100%", padding: "8px 10px", borderRadius: 8, border: "1px solid #D3D1C7", fontFamily: bodyFont, fontSize: 13, resize: "vertical", boxSizing: "border-box" }}
                    />
                  </div>
                  <button onClick={handleExportSpecs} style={secondaryBtnStyle}>
                    <Ruler size={15} /> Exporter la fiche technique
                  </button>
                </div>
              )}
            </>
          )}

          <div style={{ marginTop: "auto", paddingTop: 12, borderTop: "1px solid #E3E1D8" }}>
            <button onClick={handleExport} style={primaryBtnStyle}>
              <Download size={16} /> Exporter le mockup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ScanPanel({ scanImgUrl, onUpload, onClear }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <SectionLabel>Scanner un objet réel</SectionLabel>
      <p style={{ fontSize: 13, color: "#5F5E5A", lineHeight: 1.5, margin: 0 }}>
        Prends une photo nette de ton objet. Ceci affiche un aperçu 3D provisoire. Une vraie
        reconstruction 3D à partir de plusieurs angles demande un moteur de photogrammétrie ou un
        scanner LiDAR côté serveur/mobile — voir la note ci-dessous.
      </p>
      <label style={uploadBoxStyle}>
        <Camera size={20} />
        {scanImgUrl ? "Remplacer la photo" : "Importer une photo"}
        <input type="file" accept="image/*" onChange={onUpload} style={{ display: "none" }} />
      </label>
      {scanImgUrl && (
        <button onClick={onClear} style={removeLinkStyle}><X size={14} /> Retirer la photo</button>
      )}
      <div style={{ background: "#E9E7DE", borderRadius: 8, padding: "12px 14px", fontSize: 12, color: "#5F5E5A", lineHeight: 1.5 }}>
        <strong style={{ color: "#1A1B1E" }}>Pour une vraie reconstruction 3D :</strong> connecter un
        service de photogrammétrie (multi-photos) ou un capteur LiDAR (iPhone/iPad Pro via ARKit,
        Android via ARCore Depth), puis convertir le nuage de points en maillage texturé.
      </div>
    </div>
  );
}

function SliderRow({ label, hint, value, onChange }) {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
        <span style={{ fontSize: 12, color: "#5F5E5A", textTransform: "uppercase", letterSpacing: 0.5 }}>{label}</span>
        <span style={{ fontSize: 12, color: "#1A1B1E", fontWeight: 600 }}>{value}</span>
      </div>
      <input type="range" min={0} max={100} value={value} onChange={(e) => onChange(Number(e.target.value))} style={{ width: "100%" }} />
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "#8B8B90" }}>
        <span>{hint.split(" → ")[0]}</span>
        <span>{hint.split(" → ")[1]}</span>
      </div>
    </div>
  );
}

function SectionLabel({ children }) {
  return <p style={{ fontSize: 12, color: "#5F5E5A", margin: "0 0 10px", textTransform: "uppercase", letterSpacing: 0.5 }}>{children}</p>;
}

function pillStyle(active, small, light) {
  return {
    fontFamily: "'Inter', sans-serif", fontSize: small ? 12 : 13, fontWeight: 600,
    padding: small ? "6px 12px" : "8px 14px", borderRadius: 999,
    border: active ? `1px solid ${light ? "#1A1B1E" : "#D4FF3F"}` : `1px solid ${light ? "#D3D1C7" : "#3A3D45"}`,
    background: active ? (light ? "#1A1B1E" : "rgba(212,255,63,0.12)") : "transparent",
    color: active ? (light ? "#D4FF3F" : "#D4FF3F") : (light ? "#1A1B1E" : "#F5F3ED"),
    cursor: "pointer", display: "inline-flex", alignItems: "center",
  };
}

function swatchStyle(c, active, size) {
  return { width: size || "100%", height: size || undefined, aspectRatio: size ? undefined : "1", borderRadius: 8, background: c, border: active ? "2px solid #1A1B1E" : "1px solid #D3D1C7", cursor: "pointer" };
}

const colorInputStyle = { width: 40, height: 32, border: "none", background: "none", cursor: "pointer" };
const uploadBoxStyle = { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, height: 110, border: "1.5px dashed #B4B2A9", borderRadius: 10, cursor: "pointer", fontSize: 13, color: "#5F5E5A" };
const removeLinkStyle = { marginTop: 10, display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#993C1D", background: "none", border: "none", cursor: "pointer", padding: 0 };
const inputStyle = { width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #D3D1C7", fontFamily: "'Inter', sans-serif", fontSize: 14, boxSizing: "border-box" };
function fontBtnStyle(f, active) {
  return { padding: "6px 10px", borderRadius: 6, fontSize: 12, cursor: "pointer", border: active ? "1px solid #1A1B1E" : "1px solid #D3D1C7", background: active ? "#1A1B1E" : "transparent", color: active ? "#D4FF3F" : "#1A1B1E", fontFamily: f.family };
}
const primaryBtnStyle = { width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "12px", borderRadius: 8, border: "none", background: "#1A1B1E", color: "#D4FF3F", fontFamily: "'Inter', sans-serif", fontSize: 14, fontWeight: 600, cursor: "pointer" };
const secondaryBtnStyle = { width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "10px", borderRadius: 8, border: "1px solid #1A1B1E", background: "transparent", color: "#1A1B1E", fontFamily: "'Inter', sans-serif", fontSize: 13, fontWeight: 600, cursor: "pointer" };
