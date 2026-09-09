// Official Cadastral Survey Geometry for Sébikhotane (54 Parcels)
// Extracted with precision from the authentic surveyor plan (Plan Cadastral)

export interface SurveyorBorne {
  id: string;
  x: number;
  y: number;
  labelX: number;
  labelY: number;
}

export interface PerimeterSegment {
  from: string;
  to: string;
  dimension: string;
  textX: number;
  textY: number;
  rotate?: number;
}

export interface ParcelGeo {
  id: number;
  points: string;
  cx: number;
  cy: number;
  zone: 'green' | 'yellow' | 'red' | 'salmon';
  zoneNameFR: string;
  dimensions: string;
  widthM: number;
  depthM: number;
  subLabel?: string;
}

export interface CadastralAnnotation {
  text: string;
  x: number;
  y: number;
  color?: string;
  rotate?: number;
  fontSize?: number;
}

// 17 Boundary surveyor markers (Bornes B1 à B17)
export const CADASTRAL_BORNES: SurveyorBorne[] = [
  { id: 'B1', x: 490, y: 75, labelX: 490, labelY: 58 },
  { id: 'B2', x: 630, y: 135, labelX: 638, labelY: 120 },
  { id: 'B3', x: 748, y: 195, labelX: 780, labelY: 178 },
  { id: 'B4', x: 898, y: 235, labelX: 928, labelY: 228 },
  { id: 'B5', x: 925, y: 385, labelX: 952, labelY: 395 },
  { id: 'B6', x: 740, y: 465, labelX: 768, labelY: 472 },
  { id: 'B7', x: 705, y: 520, labelX: 728, labelY: 540 },
  { id: 'B8', x: 605, y: 595, labelX: 628, labelY: 605 },
  { id: 'B9', x: 570, y: 620, labelX: 585, labelY: 642 },
  { id: 'B10', x: 518, y: 535, labelX: 490, labelY: 545 },
  { id: 'B11', x: 405, y: 420, labelX: 380, labelY: 440 },
  { id: 'B12', x: 244, y: 320, labelX: 230, labelY: 345 },
  { id: 'B13', x: 160, y: 275, labelX: 135, labelY: 300 },
  { id: 'B14', x: 55, y: 205, labelX: 32, labelY: 220 },
  { id: 'B15', x: 85, y: 155, labelX: 75, labelY: 138 },
  { id: 'B16', x: 140, y: 165, labelX: 150, labelY: 148 },
  { id: 'B17', x: 405, y: 170, labelX: 388, labelY: 150 },
];

// Surveyor linear boundary measurements
export const CADASTRAL_PERIMETER_MEASUREMENTS: PerimeterSegment[] = [
  { from: 'B15', to: 'B16', dimension: '14.32', textX: 110, textY: 154 },
  { from: 'B16', to: 'B17', dimension: '60.01', textX: 270, textY: 160 },
  { from: 'B17', to: 'B1', dimension: '29.00', textX: 450, textY: 115, rotate: -35 },
  { from: 'B1', to: 'B2', dimension: '35.84', textX: 555, textY: 98, rotate: 23 },
  { from: 'B4', to: 'B5', dimension: '22.13', textX: 940, textY: 310, rotate: 80 },
  { from: 'B6', to: 'B5', dimension: '49.61', textX: 830, textY: 435, rotate: -22 },
  { from: 'B7', to: 'B8', dimension: '31.52', textX: 660, textY: 565, rotate: 38 },
  { from: 'B8', to: 'B9', dimension: '10.31', textX: 588, textY: 622, rotate: 35 },
  { from: 'B10', to: 'B11', dimension: '33.34', textX: 460, textY: 485, rotate: -45 },
  { from: 'B11', to: 'B12', dimension: '45.95', textX: 335, textY: 385, rotate: -32 },
  { from: 'B12', to: 'B13', dimension: '22.51', textX: 200, textY: 310, rotate: -28 },
  { from: 'B13', to: 'B14', dimension: '19.78', textX: 110, textY: 250, rotate: -35 },
];

// Interior road network polygons (grey roadways #C5C8CE)
export const CADASTRAL_ROAD_NETWORK = {
  // Northern road along B16-B17
  northRoad: "140,165 405,170 405,185 140,185",
  // Western road between Green and Yellow zones
  westRoad: "405,170 440,145 440,430 405,420",
  // Central road between Yellow and Red zones
  centralRoad: "570,145 605,145 605,595 570,535",
  // Eastern branch road serving Zone Saumon
  eastRoad: "735,305 898,305 898,335 735,335",
};

// 54 Parcels geometry matching the authentic surveyor plan
export const CADASTRAL_PARCELS_GEO: Record<number, ParcelGeo> = {
  // ==================== ZONE VERTE (OUEST) ====================
  53: {
    id: 53,
    points: "60,185 115,185 115,252 75,235",
    cx: 88,
    cy: 215,
    zone: 'green',
    zoneNameFR: 'Zone Ouest (Verte)',
    dimensions: '14.32 m × 19.78 m',
    widthM: 14.32,
    depthM: 19.78,
    subLabel: 'Angle Ouest'
  },
  1: {
    id: 1,
    points: "115,185 160,185 160,248 115,252",
    cx: 137,
    cy: 216,
    zone: 'green',
    zoneNameFR: 'Zone Ouest (Verte)',
    dimensions: '12.00 m × 12.00 m',
    widthM: 12,
    depthM: 12,
    subLabel: 'Façade Nord'
  },
  2: {
    id: 2,
    points: "160,185 202,185 202,238 160,238",
    cx: 181,
    cy: 211,
    zone: 'green',
    zoneNameFR: 'Zone Ouest (Verte)',
    dimensions: '10.00 m × 12.00 m',
    widthM: 10,
    depthM: 12,
    subLabel: 'Façade Nord'
  },
  3: {
    id: 3,
    points: "202,185 244,185 244,238 202,238",
    cx: 223,
    cy: 211,
    zone: 'green',
    zoneNameFR: 'Zone Ouest (Verte)',
    dimensions: '10.00 m × 12.00 m',
    widthM: 10,
    depthM: 12,
    subLabel: 'Façade Nord'
  },
  4: {
    id: 4,
    points: "160,238 244,238 244,320 175,290 160,248",
    cx: 202,
    cy: 275,
    zone: 'green',
    zoneNameFR: 'Zone Ouest (Verte)',
    dimensions: '10.00 m / 18.00 m × 12.00 m',
    widthM: 18,
    depthM: 12,
    subLabel: 'Sud-Ouest B12-B13'
  },
  5: {
    id: 5,
    points: "275,185 340,185 340,225 275,225",
    cx: 307,
    cy: 205,
    zone: 'green',
    zoneNameFR: 'Zone Ouest (Verte)',
    dimensions: '15.00 m × 10.00 m',
    widthM: 15,
    depthM: 10
  },
  6: {
    id: 6,
    points: "340,185 405,185 405,225 340,225",
    cx: 372,
    cy: 205,
    zone: 'green',
    zoneNameFR: 'Zone Ouest (Verte)',
    dimensions: '15.00 m × 10.00 m',
    widthM: 15,
    depthM: 10,
    subLabel: 'Bord Voie Ouest'
  },
  7: {
    id: 7,
    points: "275,225 340,225 340,265 275,265",
    cx: 307,
    cy: 245,
    zone: 'green',
    zoneNameFR: 'Zone Ouest (Verte)',
    dimensions: '15.00 m × 10.00 m',
    widthM: 15,
    depthM: 10
  },
  8: {
    id: 8,
    points: "340,225 405,225 405,265 340,265",
    cx: 372,
    cy: 245,
    zone: 'green',
    zoneNameFR: 'Zone Ouest (Verte)',
    dimensions: '15.00 m × 10.00 m',
    widthM: 15,
    depthM: 10,
    subLabel: 'Bord Voie Ouest'
  },
  9: {
    id: 9,
    points: "275,265 340,265 340,305 275,305",
    cx: 307,
    cy: 285,
    zone: 'green',
    zoneNameFR: 'Zone Ouest (Verte)',
    dimensions: '15.00 m × 10.00 m',
    widthM: 15,
    depthM: 10
  },
  10: {
    id: 10,
    points: "340,265 405,265 405,305 340,305",
    cx: 372,
    cy: 285,
    zone: 'green',
    zoneNameFR: 'Zone Ouest (Verte)',
    dimensions: '15.00 m × 10.00 m',
    widthM: 15,
    depthM: 10,
    subLabel: 'Bord Voie Ouest'
  },
  11: {
    id: 11,
    points: "275,305 340,305 340,360 275,335",
    cx: 307,
    cy: 330,
    zone: 'green',
    zoneNameFR: 'Zone Ouest (Verte)',
    dimensions: '15.00 m × 8.00 / 12.00 m',
    widthM: 15,
    depthM: 10,
    subLabel: 'Sud B12'
  },
  12: {
    id: 12,
    points: "340,305 405,305 405,345 340,345",
    cx: 372,
    cy: 325,
    zone: 'green',
    zoneNameFR: 'Zone Ouest (Verte)',
    dimensions: '15.00 m × 10.00 m',
    widthM: 15,
    depthM: 10,
    subLabel: 'Bord Voie Ouest'
  },
  13: {
    id: 13,
    points: "340,345 405,345 405,420 340,360",
    cx: 372,
    cy: 380,
    zone: 'green',
    zoneNameFR: 'Zone Ouest (Verte)',
    dimensions: '15.00 m × 18.20 m',
    widthM: 15,
    depthM: 18.2,
    subLabel: 'Angle Sud B11'
  },

  // ==================== ZONE JAUNE (CENTRALE) ====================
  54: {
    id: 54,
    points: "440,145 490,75 570,145",
    cx: 500,
    cy: 125,
    zone: 'yellow',
    zoneNameFR: 'Zone Centrale (Jaune)',
    dimensions: '30.00 m × 15.00 m',
    widthM: 30,
    depthM: 15,
    subLabel: 'Sommet Nord B1'
  },
  14: {
    id: 14,
    points: "440,145 505,145 505,185 440,185",
    cx: 472,
    cy: 165,
    zone: 'yellow',
    zoneNameFR: 'Zone Centrale (Jaune)',
    dimensions: '15.00 m × 10.00 m',
    widthM: 15,
    depthM: 10
  },
  15: {
    id: 15,
    points: "505,145 570,145 570,185 505,185",
    cx: 537,
    cy: 165,
    zone: 'yellow',
    zoneNameFR: 'Zone Centrale (Jaune)',
    dimensions: '15.00 m × 10.00 m',
    widthM: 15,
    depthM: 10
  },
  16: {
    id: 16,
    points: "440,185 505,185 505,225 440,225",
    cx: 472,
    cy: 205,
    zone: 'yellow',
    zoneNameFR: 'Zone Centrale (Jaune)',
    dimensions: '15.00 m × 10.00 m',
    widthM: 15,
    depthM: 10
  },
  17: {
    id: 17,
    points: "505,185 570,185 570,225 505,225",
    cx: 537,
    cy: 205,
    zone: 'yellow',
    zoneNameFR: 'Zone Centrale (Jaune)',
    dimensions: '15.00 m × 10.00 m',
    widthM: 15,
    depthM: 10
  },
  18: {
    id: 18,
    points: "440,225 505,225 505,265 440,265",
    cx: 472,
    cy: 245,
    zone: 'yellow',
    zoneNameFR: 'Zone Centrale (Jaune)',
    dimensions: '15.00 m × 10.00 m',
    widthM: 15,
    depthM: 10
  },
  19: {
    id: 19,
    points: "505,225 570,225 570,268 505,268",
    cx: 537,
    cy: 246,
    zone: 'yellow',
    zoneNameFR: 'Zone Centrale (Jaune)',
    dimensions: '15.00 m × 12.00 m',
    widthM: 15,
    depthM: 12
  },
  20: {
    id: 20,
    points: "440,265 505,265 505,305 440,305",
    cx: 472,
    cy: 285,
    zone: 'yellow',
    zoneNameFR: 'Zone Centrale (Jaune)',
    dimensions: '15.00 m × 10.00 m',
    widthM: 15,
    depthM: 10
  },
  21: {
    id: 21,
    points: "505,268 570,268 570,308 505,308",
    cx: 537,
    cy: 288,
    zone: 'yellow',
    zoneNameFR: 'Zone Centrale (Jaune)',
    dimensions: '15.00 m × 10.00 m',
    widthM: 15,
    depthM: 10
  },
  22: {
    id: 22,
    points: "440,305 505,305 505,345 440,345",
    cx: 472,
    cy: 325,
    zone: 'yellow',
    zoneNameFR: 'Zone Centrale (Jaune)',
    dimensions: '15.00 m × 10.00 m',
    widthM: 15,
    depthM: 10
  },
  23: {
    id: 23,
    points: "505,308 570,308 570,348 505,348",
    cx: 537,
    cy: 328,
    zone: 'yellow',
    zoneNameFR: 'Zone Centrale (Jaune)',
    dimensions: '15.00 m × 10.00 m',
    widthM: 15,
    depthM: 10
  },
  24: {
    id: 24,
    points: "440,345 505,345 505,385 440,385",
    cx: 472,
    cy: 365,
    zone: 'yellow',
    zoneNameFR: 'Zone Centrale (Jaune)',
    dimensions: '15.00 m × 10.00 m',
    widthM: 15,
    depthM: 10
  },
  25: {
    id: 25,
    points: "505,348 570,348 570,388 505,388",
    cx: 537,
    cy: 368,
    zone: 'yellow',
    zoneNameFR: 'Zone Centrale (Jaune)',
    dimensions: '15.00 m × 10.00 m',
    widthM: 15,
    depthM: 10
  },
  26: {
    id: 26,
    points: "440,385 505,385 505,425 440,425",
    cx: 472,
    cy: 405,
    zone: 'yellow',
    zoneNameFR: 'Zone Centrale (Jaune)',
    dimensions: '15.00 m × 10.00 m',
    widthM: 15,
    depthM: 10
  },
  27: {
    id: 27,
    points: "505,388 570,388 570,428 505,428",
    cx: 537,
    cy: 408,
    zone: 'yellow',
    zoneNameFR: 'Zone Centrale (Jaune)',
    dimensions: '15.00 m × 10.00 m',
    widthM: 15,
    depthM: 10
  },
  28: {
    id: 28,
    points: "440,425 505,425 505,475 440,435",
    cx: 472,
    cy: 450,
    zone: 'yellow',
    zoneNameFR: 'Zone Centrale (Jaune)',
    dimensions: '15.00 m × 10.00 / 4.77 m',
    widthM: 15,
    depthM: 10,
    subLabel: 'Façade B10'
  },
  29: {
    id: 29,
    points: "505,428 570,428 570,468 505,468",
    cx: 537,
    cy: 448,
    zone: 'yellow',
    zoneNameFR: 'Zone Centrale (Jaune)',
    dimensions: '15.00 m × 10.00 m',
    widthM: 15,
    depthM: 10
  },
  30: {
    id: 30,
    points: "465,475 570,468 570,535 518,535 465,475",
    cx: 525,
    cy: 500,
    zone: 'yellow',
    zoneNameFR: 'Zone Centrale (Jaune)',
    dimensions: '15.00 m × 7.00 / 9.00 m',
    widthM: 15,
    depthM: 9,
    subLabel: 'Angle Sud'
  },
  31: {
    id: 31,
    points: "518,535 570,535 570,610 528,600 518,535",
    cx: 544,
    cy: 568,
    zone: 'yellow',
    zoneNameFR: 'Zone Centrale (Jaune)',
    dimensions: '9.00 m × 15.17 m',
    widthM: 9,
    depthM: 15.17,
    subLabel: 'Pointe Sud B9-B10'
  },

  // ==================== ZONE ROUGE / ORANGE (CENTRE-EST) ====================
  32: {
    id: 32,
    points: "605,145 640,145 670,185 605,185",
    cx: 635,
    cy: 165,
    zone: 'red',
    zoneNameFR: 'Zone Centre-Est (Rouge)',
    dimensions: '10.00 m × 15.00 m',
    widthM: 10,
    depthM: 15,
    subLabel: 'Nord B2'
  },
  33: {
    id: 33,
    points: "605,185 670,185 670,225 605,225",
    cx: 637,
    cy: 205,
    zone: 'red',
    zoneNameFR: 'Zone Centre-Est (Rouge)',
    dimensions: '15.00 m × 10.00 m',
    widthM: 15,
    depthM: 10
  },
  34: {
    id: 34,
    points: "670,185 745,200 735,265 670,265",
    cx: 705,
    cy: 230,
    zone: 'red',
    zoneNameFR: 'Zone Centre-Est (Rouge)',
    dimensions: '15.00 m × 14.00 m',
    widthM: 15,
    depthM: 14,
    subLabel: 'Angle B3'
  },
  35: {
    id: 35,
    points: "605,225 670,225 670,265 605,265",
    cx: 637,
    cy: 245,
    zone: 'red',
    zoneNameFR: 'Zone Centre-Est (Rouge)',
    dimensions: '15.00 m × 10.00 m',
    widthM: 15,
    depthM: 10
  },
  36: {
    id: 36,
    points: "670,265 735,265 735,305 670,305",
    cx: 702,
    cy: 285,
    zone: 'red',
    zoneNameFR: 'Zone Centre-Est (Rouge)',
    dimensions: '15.00 m × 10.00 m',
    widthM: 15,
    depthM: 10
  },
  37: {
    id: 37,
    points: "605,265 670,265 670,305 605,305",
    cx: 637,
    cy: 285,
    zone: 'red',
    zoneNameFR: 'Zone Centre-Est (Rouge)',
    dimensions: '15.00 m × 10.00 m',
    widthM: 15,
    depthM: 10
  },
  38: {
    id: 38,
    points: "670,305 735,305 735,345 670,345",
    cx: 702,
    cy: 325,
    zone: 'red',
    zoneNameFR: 'Zone Centre-Est (Rouge)',
    dimensions: '15.00 m × 10.00 m',
    widthM: 15,
    depthM: 10
  },
  39: {
    id: 39,
    points: "605,305 670,305 670,345 605,345",
    cx: 637,
    cy: 325,
    zone: 'red',
    zoneNameFR: 'Zone Centre-Est (Rouge)',
    dimensions: '15.00 m × 10.00 m',
    widthM: 15,
    depthM: 10
  },
  40: {
    id: 40,
    points: "670,345 735,345 735,385 670,385",
    cx: 702,
    cy: 365,
    zone: 'red',
    zoneNameFR: 'Zone Centre-Est (Rouge)',
    dimensions: '15.00 m × 10.00 m',
    widthM: 15,
    depthM: 10
  },
  41: {
    id: 41,
    points: "605,345 670,345 670,385 605,385",
    cx: 637,
    cy: 365,
    zone: 'red',
    zoneNameFR: 'Zone Centre-Est (Rouge)',
    dimensions: '15.00 m × 10.00 m',
    widthM: 15,
    depthM: 10
  },
  42: {
    id: 42,
    points: "670,385 735,385 735,425 670,425",
    cx: 702,
    cy: 405,
    zone: 'red',
    zoneNameFR: 'Zone Centre-Est (Rouge)',
    dimensions: '15.00 m × 10.00 m',
    widthM: 15,
    depthM: 10
  },
  43: {
    id: 43,
    points: "605,385 670,385 670,425 605,425",
    cx: 637,
    cy: 405,
    zone: 'red',
    zoneNameFR: 'Zone Centre-Est (Rouge)',
    dimensions: '15.00 m × 10.00 m',
    widthM: 15,
    depthM: 10
  },
  44: {
    id: 44,
    points: "670,425 735,425 735,465 670,465",
    cx: 702,
    cy: 445,
    zone: 'red',
    zoneNameFR: 'Zone Centre-Est (Rouge)',
    dimensions: '15.00 m × 10.00 m',
    widthM: 15,
    depthM: 10,
    subLabel: 'Angle B6'
  },
  45: {
    id: 45,
    points: "605,425 670,425 670,465 605,465",
    cx: 637,
    cy: 445,
    zone: 'red',
    zoneNameFR: 'Zone Centre-Est (Rouge)',
    dimensions: '15.00 m × 10.00 m',
    widthM: 15,
    depthM: 10
  },
  46: {
    id: 46,
    points: "605,465 670,465 675,540 605,590",
    cx: 637,
    cy: 510,
    zone: 'red',
    zoneNameFR: 'Zone Centre-Est (Rouge)',
    dimensions: '21.00 m × 31.52 m',
    widthM: 21,
    depthM: 31.52,
    subLabel: 'Pointe Sud B8'
  },

  // ==================== ZONE SAUMON (EST) ====================
  47: {
    id: 47,
    points: "768,220 808,225 808,305 768,305",
    cx: 788,
    cy: 265,
    zone: 'salmon',
    zoneNameFR: 'Zone Est (Saumon)',
    dimensions: '9.00 m × 15.00 m',
    widthM: 9,
    depthM: 15,
    subLabel: 'Façade Nord'
  },
  48: {
    id: 48,
    points: "808,225 848,230 848,305 808,305",
    cx: 828,
    cy: 265,
    zone: 'salmon',
    zoneNameFR: 'Zone Est (Saumon)',
    dimensions: '9.00 m × 15.00 m',
    widthM: 9,
    depthM: 15,
    subLabel: 'Façade Nord'
  },
  49: {
    id: 49,
    points: "848,230 898,235 898,305 848,305",
    cx: 873,
    cy: 265,
    zone: 'salmon',
    zoneNameFR: 'Zone Est (Saumon)',
    dimensions: '12.00 m × 15.00 m',
    widthM: 12,
    depthM: 15,
    subLabel: 'Angle B4'
  },
  51: {
    id: 51,
    points: "768,335 832,335 832,375 768,375",
    cx: 800,
    cy: 355,
    zone: 'salmon',
    zoneNameFR: 'Zone Est (Saumon)',
    dimensions: '15.00 m × 10.00 m',
    widthM: 15,
    depthM: 10
  },
  52: {
    id: 52,
    points: "768,375 832,375 832,425 768,410",
    cx: 800,
    cy: 395,
    zone: 'salmon',
    zoneNameFR: 'Zone Est (Saumon)',
    dimensions: '15.00 m × 10.00 m',
    widthM: 15,
    depthM: 10,
    subLabel: 'Bordure Sud B6-B5'
  },
  50: {
    id: 50,
    points: "832,335 898,335 925,385 832,425",
    cx: 872,
    cy: 375,
    zone: 'salmon',
    zoneNameFR: 'Zone Est (Saumon)',
    dimensions: '15.00 m × 15.00 / 22.13 m',
    widthM: 15,
    depthM: 22.13,
    subLabel: 'Extrémité Est B5'
  },
};

// Key cadastral annotations (15.00, 10.00, 12.00, 18.00...) on borders
export const CADASTRAL_ANNOTATIONS: CadastralAnnotation[] = [
  { text: '15.00', x: 472, y: 140, fontSize: 8 },
  { text: '15.00', x: 537, y: 140, fontSize: 8 },
  { text: '15.00', x: 637, y: 180, fontSize: 8 },
  { text: '15.00', x: 702, y: 260, fontSize: 8 },
  { text: '10.00', x: 433, y: 165, fontSize: 7, rotate: -90 },
  { text: '10.00', x: 433, y: 205, fontSize: 7, rotate: -90 },
  { text: '10.00', x: 433, y: 245, fontSize: 7, rotate: -90 },
  { text: '10.00', x: 433, y: 285, fontSize: 7, rotate: -90 },
  { text: '10.00', x: 433, y: 325, fontSize: 7, rotate: -90 },
  { text: '10.00', x: 433, y: 365, fontSize: 7, rotate: -90 },
  { text: '10.00', x: 433, y: 405, fontSize: 7, rotate: -90 },
  { text: '10.00', x: 574, y: 165, fontSize: 7, rotate: 90 },
  { text: '10.00', x: 574, y: 205, fontSize: 7, rotate: 90 },
  { text: '10.00', x: 574, y: 288, fontSize: 7, rotate: 90 },
  { text: '10.00', x: 574, y: 328, fontSize: 7, rotate: 90 },
  { text: '10.00', x: 574, y: 368, fontSize: 7, rotate: 90 },
  { text: '10.00', x: 574, y: 408, fontSize: 7, rotate: 90 },
  { text: '10.00', x: 600, y: 205, fontSize: 7, rotate: -90 },
  { text: '10.00', x: 600, y: 245, fontSize: 7, rotate: -90 },
  { text: '10.00', x: 600, y: 285, fontSize: 7, rotate: -90 },
  { text: '10.00', x: 600, y: 325, fontSize: 7, rotate: -90 },
  { text: '10.00', x: 600, y: 365, fontSize: 7, rotate: -90 },
  { text: '10.00', x: 600, y: 405, fontSize: 7, rotate: -90 },
  { text: '10.00', x: 600, y: 445, fontSize: 7, rotate: -90 },
  { text: '10.00', x: 739, y: 285, fontSize: 7, rotate: 90 },
  { text: '10.00', x: 739, y: 325, fontSize: 7, rotate: 90 },
  { text: '10.00', x: 739, y: 365, fontSize: 7, rotate: 90 },
  { text: '10.00', x: 739, y: 405, fontSize: 7, rotate: 90 },
  { text: '10.00', x: 739, y: 445, fontSize: 7, rotate: 90 },
  { text: '9.00', x: 788, y: 312, fontSize: 7 },
  { text: '9.00', x: 828, y: 312, fontSize: 7 },
  { text: '12.00', x: 873, y: 312, fontSize: 7 },
  { text: '15.00', x: 800, y: 330, fontSize: 7 },
  { text: '15.00', x: 865, y: 330, fontSize: 7 },
  { text: '10.00', x: 181, y: 180, fontSize: 7 },
  { text: '10.00', x: 223, y: 180, fontSize: 7 },
  { text: '10.00', x: 181, y: 233, fontSize: 7 },
  { text: '10.00', x: 223, y: 233, fontSize: 7 },
  { text: '15.00', x: 307, y: 180, fontSize: 7 },
  { text: '15.00', x: 372, y: 180, fontSize: 7 },
  { text: '15.00', x: 307, y: 260, fontSize: 7 },
  { text: '15.00', x: 372, y: 260, fontSize: 7 },
  { text: '15.00', x: 307, y: 300, fontSize: 7 },
  { text: '15.00', x: 372, y: 300, fontSize: 7 },
  { text: '15.00', x: 372, y: 340, fontSize: 7 },
  { text: '18.20', x: 410, y: 380, fontSize: 7, rotate: 90 },
  { text: '15.17', x: 574, y: 575, fontSize: 7, rotate: 90 },
  { text: '21.00', x: 600, y: 510, fontSize: 7, rotate: -90 },
  { text: '31.52', x: 645, y: 565, fontSize: 8, rotate: 40 },
];
