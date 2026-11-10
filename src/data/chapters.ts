export interface LayerAsset {
  id: string;
  imageUrl: string;
  xOffset: number;
  yOffset?: number;
  zOffset: number;
  rotationZ: number;
  scale: [number, number]; // [width, height] in 3D units
  washiColor?: string;
  washiAngle?: number;
  hasSpotlight?: boolean;
  spotlightOffset?: number;
}

export interface PolaroidSecret {
  frontImageUrl: string;
  backNote: string;
  position: [number, number, number];
  rotationZ: number;
}

export type PropActionType =
  | 'pottery-spin'
  | 'camera-flash'
  | 'car-honk'
  | 'duck-paddle'
  | 'tea-clink'
  | 'lake-lights'
  | 'fireworks'
  | 'bicycle-ride';

export interface InteractivePropConfig {
  id: string;
  actionType: PropActionType;
  hintText: string;
  position: [number, number, number];
  label: string;
  imageUrl?: string;
  scale?: [number, number]; // [width, height] in 3D units
  rotationZ?: number;
}

export interface SceneryCutoutConfig {
  id: string;
  imageUrl: string;
  position: [number, number, number];
  scale: [number, number];
  rotationZ?: number;
  hasShadow?: boolean;
  animationType?: 'none' | 'water-bob' | 'gentle-breeze';
  foldable?: boolean;
}

export interface ChapterConfig {
  id: string;
  chapterNumber: number;
  locationName: string;
  locationEn: string;
  title: string;
  caption: string;
  bgmUrl: string;
  themeColor: string;
  baseX: number; // Deprecated horizontal coordinate, kept for compatibility
  baseZ: number; // Depth coordinate along the negative Z-axis in the Depth Tunnel
  layers: LayerAsset[];
  polaroid: PolaroidSecret;
  prop: InteractivePropConfig;
  sceneryCutouts?: SceneryCutoutConfig[];
}

export interface AnniversaryMetadata {
  coverTitle: string;
  coverSubtitle: string;
  startDateISO: string;
  finalLetterTitle: string;
  finalLetterBody: string;
}

export const ANNIVERSARY_META: AnniversaryMetadata = {
  coverTitle: 'Our 1.4 Years Journey',
  coverSubtitle: 'สมุดบันทึกการเดินทาง 1 ปี 4 เดือนที่เรามีกันและกัน',
  startDateISO: '2025-07-15T00:00:00',
  finalLetterTitle: 'Anniversary 1.4 years',
  finalLetterBody: 'สุขสันต์วันครบรอบของเรายัยบ๊องเอ้ย',
};

// Each chapter is spaced by ~22 units along the depth (negative Z) axis
export const SPACING_Z = 22;

export const CHAPTERS: ChapterConfig[] = [
  {
    id: 'ch1-kohkret',
    chapterNumber: 1,
    locationName: 'เกาะเกร็ด',
    locationEn: 'Koh Kret',
    title: 'วันชิลริมแม่น้ำเจ้าพระยา',
    caption: 'ปั่นจักรยานรับลมริมน้ำ กินขนมไทยโบราณ และวันสบายๆ ที่เกาะเกร็ด ริมสายน้ำเจ้าพระยา',
    bgmUrl: '/audio/music/bgm-kohkret.mp3',
    themeColor: '#FDE68A',
    baseX: 0,
    baseZ: 0,
    layers: [
      {
        id: 'ch1-photo-1',
        imageUrl: '/images/ch1-kohkret/photo-1.jpg',
        xOffset: -1.8,
        zOffset: -0.8,
        rotationZ: -0.06,
        scale: [2.2, 2.8],
        washiColor: '#FBBF24',
        washiAngle: -15,
        hasSpotlight: true,
        spotlightOffset: -0.35,
      },
      {
        id: 'ch1-photo-2',
        imageUrl: '/images/ch1-kohkret/photo-2.png',
        xOffset: 0.2,
        zOffset: 0.1,
        rotationZ: 0.03,
        scale: [2.5, 3.2],
        washiColor: '#F472B6',
        washiAngle: 12,
        hasSpotlight: true,
        spotlightOffset: 0.0,
      },
      {
        id: 'ch1-photo-3',
        imageUrl: '/images/ch1-kohkret/photo-3.png',
        xOffset: 2.15,
        zOffset: 0.6,
        rotationZ: -0.04,
        scale: [2.1, 2.6],
        washiColor: '#60A5FA',
        washiAngle: -8,
        hasSpotlight: true,
        spotlightOffset: 0.35,
      },
    ],
    polaroid: {
      frontImageUrl: '/images/ch1-kohkret/polaroid.png',
      backNote: 'รูปนี้จำได้ไหม? อากาศร้อนมากแต่ก็ยังยิ้มแป้น น่ารักที่สุดเลย 🍦',
      position: [3.15, 0.05, 1.55],
      rotationZ: 0.08,
    },
    prop: {
      id: 'ch1-prop',
      actionType: 'bicycle-ride',
      hintText: 'แตะที่จักรยานปั่นริมน้ำเพื่อกดกริ่ง กริ๊งๆ! 🚲',
      position: [-3.55, 0, 1.15],
      label: '🚲 กริ่งจักรยาน',
      imageUrl: '/images/ch1-kohkret/props/bicycle.png',
      scale: [2.25, 1.37],
      rotationZ: 0.02,
    },
    sceneryCutouts: [
      {
        id: 'ch1-scenery-pagoda',
        imageUrl: '/images/ch1-kohkret/props/kohkret.png',
        position: [-2.8, 0, -2.4],
        scale: [8.0, 6.32],
        rotationZ: 0.0,
        hasShadow: false,
        foldable: true,
      },
      {
        id: 'ch1-scenery-boat',
        imageUrl: '/images/ch1-kohkret/props/boat.png',
        position: [4.35, 0, 1.2],
        scale: [2.4, 1.28],
        rotationZ: -0.06,
        hasShadow: true,
        animationType: 'water-bob',
        foldable: true,
      },
      {
        id: 'ch1-scenery-pottery',
        imageUrl: '/images/ch1-kohkret/props/pottery.png',
        position: [-2.55, 0, 1.4],
        scale: [1.05, 0.94],
        rotationZ: 0.03,
        hasShadow: true,
        foldable: true,
      },
      {
        id: 'ch1-scenery-cloud-warm',
        imageUrl: '/images/ch1-kohkret/props/cloud-warm.png',
        position: [3.2, 3.8, -2.2],
        scale: [3.6, 1.62],
        hasShadow: false,
        animationType: 'gentle-breeze',
        foldable: false,
      },
      {
        id: 'ch1-scenery-cloud-blue',
        imageUrl: '/images/ch1-kohkret/props/cloud-blue.png',
        position: [1.6, 4.5, -2.6],
        scale: [2.8, 1.37],
        hasShadow: false,
        animationType: 'gentle-breeze',
        foldable: false,
      },
    ],
  },
  {
    id: 'ch2-songwat',
    chapterNumber: 2,
    locationName: 'ทรงวาด',
    locationEn: 'Song Wat Road',
    title: 'สตรีทวินเทจ & คาเฟ่ตึกเก่า',
    caption: 'เดินเล่นตรอกตึกเก่าทรงวาด ถ่ายรูปมุมฮิต จิบกาแฟชิคๆ ในย่านสุดคลาสสิก',
    bgmUrl: '/audio/music/bgm-songwat.mp3',
    themeColor: '#FDBA74',
    baseX: 0,
    baseZ: -SPACING_Z * 1,
    layers: [
      {
        id: 'ch2-photo-1',
        imageUrl: '/images/ch2-songwat/photo-1.png',
        xOffset: -1.8,
        zOffset: -0.7,
        rotationZ: 0.05,
        scale: [2.2, 2.8],
        washiColor: '#FB923C',
        washiAngle: 10,
        hasSpotlight: true,
        spotlightOffset: -0.3,
      },
      {
        id: 'ch2-photo-2',
        imageUrl: '/images/ch2-songwat/photo-2.jpg',
        xOffset: 0.2,
        zOffset: 0.1,
        rotationZ: -0.04,
        scale: [2.6, 3.3],
        washiColor: '#A78BFA',
        washiAngle: -12,
        hasSpotlight: true,
        spotlightOffset: 0.0,
      },
      {
        id: 'ch2-photo-3',
        imageUrl: '/images/ch2-songwat/photo-3.jpg',
        xOffset: 2.15,
        zOffset: 0.6,
        rotationZ: 0.06,
        scale: [2.0, 2.5],
        washiColor: '#34D399',
        washiAngle: 15,
        hasSpotlight: true,
        spotlightOffset: 0.3,
      },
    ],
    polaroid: {
      frontImageUrl: '/images/ch2-songwat/polaroid.jpg',
      backNote: 'มุมนี้เท่มาก แสงกำลังสวยพอดีเลย ชอบลุคนี้ของเธอมากๆ 📸',
      position: [3.15, 0.05, 1.55],
      rotationZ: -0.07,
    },
    prop: {
      id: 'ch2-prop',
      actionType: 'camera-flash',
      hintText: 'แตะที่กล้องฟิล์มเพื่อกดชัตเตอร์แฟลช! 📸',
      position: [-3.45, 0, 1.1],
      label: '📷 กดแชะกล้อง',
      imageUrl: '/images/ch2-songwat/props/camera.png',
      scale: [2.35, 1.49],
      rotationZ: 0.02,
    },
    sceneryCutouts: [
      {
        id: 'ch2-scenery-building',
        imageUrl: '/images/ch2-songwat/props/building.png',
        position: [-3.0, 0, -2.4],
        scale: [5.5, 5.6],
        rotationZ: 0.0,
        hasShadow: false,
        foldable: true,
      },
      {
        id: 'ch2-scenery-cassette',
        imageUrl: '/images/ch2-songwat/props/cassette.png',
        position: [-2.25, 0, 1.35],
        scale: [1.3, 1.27],
        rotationZ: 0.06,
        hasShadow: true,
        foldable: true,
      },
      {
        id: 'ch2-scenery-newspaper',
        imageUrl: '/images/ch2-songwat/props/newspaper.png',
        position: [4.55, 0, 1.15],
        scale: [2.2, 2.14],
        rotationZ: -0.08,
        hasShadow: true,
        foldable: true,
      },
      {
        id: 'ch2-scenery-butterfly',
        imageUrl: '/images/ch2-songwat/props/butterfly.png',
        position: [4.1, 2.3, 1.35],
        scale: [1.15, 0.98],
        rotationZ: 0.12,
        hasShadow: false,
        animationType: 'gentle-breeze',
        foldable: false,
      },
      {
        id: 'ch2-scenery-cloud-warm',
        imageUrl: '/images/ch2-songwat/props/cloud-warm.png',
        position: [3.2, 4.0, -2.2],
        scale: [3.6, 1.62],
        hasShadow: false,
        animationType: 'gentle-breeze',
        foldable: false,
      },
      {
        id: 'ch2-scenery-cloud-teal',
        imageUrl: '/images/ch2-songwat/props/cloud-teal.png',
        position: [1.5, 4.6, -2.6],
        scale: [2.8, 1.7],
        hasShadow: false,
        animationType: 'gentle-breeze',
        foldable: false,
      },
    ],
  },
  {
    id: 'ch3-taladnoi',
    chapterNumber: 3,
    locationName: 'ตลาดน้อย',
    locationEn: 'Talad Noi',
    title: 'รถเฟียตส้ม & กำแพงกราฟฟิตี้',
    caption: 'เช็กอินมุมมหาชนกับรถเฟียตสีส้มในตำนาน ลัดเลาะตรอกซอกซอยเซียงกงสุดเก๋า',
    bgmUrl: '/audio/music/bgm-taladnoi.mp3',
    themeColor: '#FCA5A5',
    baseX: 0,
    baseZ: -SPACING_Z * 2,
    layers: [
      {
        id: 'ch3-photo-1',
        imageUrl: '/images/ch3-taladnoi/photo-1.jpg',
        xOffset: -2.25,
        zOffset: -0.75,
        rotationZ: -0.08,
        scale: [2.2, 2.7],
        washiColor: '#F87171',
        washiAngle: -10,
        hasSpotlight: true,
        spotlightOffset: -0.3,
      },
      {
        id: 'ch3-photo-2',
        imageUrl: '/images/ch3-taladnoi/photo-2.jpg',
        xOffset: 0.1,
        zOffset: 0.1,
        rotationZ: 0.03,
        scale: [2.5, 3.2],
        washiColor: '#FBBF24',
        washiAngle: 8,
        hasSpotlight: true,
        spotlightOffset: 0.0,
      },
      {
        id: 'ch3-photo-3',
        imageUrl: '/images/ch3-taladnoi/photo-3.jpg',
        xOffset: 2.2,
        zOffset: 0.6,
        rotationZ: -0.05,
        scale: [2.1, 2.6],
        washiColor: '#4ADE80',
        washiAngle: -14,
        hasSpotlight: true,
        spotlightOffset: 0.3,
      },
    ],
    polaroid: {
      frontImageUrl: '/images/ch3-taladnoi/polaroid.jpg',
      backNote: 'รถคันนี้สีเหมือนเธอตอนแก้มส้มๆ เลย น่ารักสดใสสุดๆ 🚗',
      position: [3.15, 0.05, 1.55],
      rotationZ: 0.08,
    },
    prop: {
      id: 'ch3-prop',
      actionType: 'car-honk',
      hintText: 'แตะที่รถคลาสสิกเพื่อกดบีบแตร ปี๊นๆ! 🚗',
      position: [-3.65, 0, 1.25],
      label: '🚗 บีบแตรเฟียต',
      imageUrl: '/images/ch3-taladnoi/props/car.png',
      scale: [2.65, 1.54],
      rotationZ: 0.02,
    },
    sceneryCutouts: [
      {
        id: 'ch3-scenery-backdrop',
        imageUrl: '/images/ch3-taladnoi/props/backdrop.png',
        position: [-0.2, 0.2, -2.8],
        scale: [10.1, 5.6],
        rotationZ: 0.0,
        hasShadow: false,
        foldable: true,
      },
      {
        id: 'ch3-scenery-controller',
        imageUrl: '/images/ch3-taladnoi/props/controller-sticker.png',
        position: [4.7, 0, 1.15],
        scale: [2.05, 1.38],
        rotationZ: -0.06,
        hasShadow: true,
        foldable: true,
      },
      {
        id: 'ch3-scenery-pixel-heart',
        imageUrl: '/images/ch3-taladnoi/props/pixel-heart-sticker.png',
        position: [4.45, 2.3, 1.35],
        scale: [0.95, 0.88],
        rotationZ: 0.08,
        hasShadow: false,
        animationType: 'gentle-breeze',
        foldable: false,
      },
      {
        id: 'ch3-scenery-hp-bar',
        imageUrl: '/images/ch3-taladnoi/props/hp-bar-sticker.png',
        position: [4.45, 1.7, 1.35],
        scale: [1.88, 0.35],
        rotationZ: -0.03,
        hasShadow: false,
        animationType: 'gentle-breeze',
        foldable: false,
      },
      {
        id: 'ch3-scenery-cloud-warm',
        imageUrl: '/images/ch3-taladnoi/props/cloud-warm.png',
        position: [3.3, 4.1, -2.2],
        scale: [3.6, 1.62],
        hasShadow: false,
        animationType: 'gentle-breeze',
        foldable: false,
      },
      {
        id: 'ch3-scenery-cloud-teal',
        imageUrl: '/images/ch3-taladnoi/props/cloud-teal.png',
        position: [1.4, 4.6, -2.6],
        scale: [2.8, 1.7],
        hasShadow: false,
        animationType: 'gentle-breeze',
        foldable: false,
      },
      {
        id: 'ch3-scenery-coin',
        imageUrl: '/images/ch3-taladnoi/props/coin-sticker.png',
        position: [4.5, 3.8, -1.8],
        scale: [0.88, 0.88],
        hasShadow: false,
        animationType: 'gentle-breeze',
        foldable: false,
      },
    ],
  },
  {
    id: 'ch4-lumphini',
    chapterNumber: 4,
    locationName: 'สวนลุมพินี',
    locationEn: 'Lumphini Park',
    title: 'ถีบเรือเป็ด & สวนสีเขียวใจกลางกรุง',
    caption: 'ลมเย็นๆ ยามบ่าย ปั่นเรือเป็ดสีเหลืองในบึงน้ำใหญ่ และความสงบใจกลางเมืองหลวง',
    bgmUrl: '/audio/music/bgm-lumphini.mp3',
    themeColor: '#86EFAC',
    baseX: 0,
    baseZ: -SPACING_Z * 3,
    layers: [
      {
        id: 'ch4-photo-1',
        imageUrl: '/images/ch4-lumphini/photo-1.jpg',
        xOffset: -1.7,
        zOffset: -0.5,
        rotationZ: 0.04,
        scale: [2.2, 2.8],
        washiColor: '#34D399',
        washiAngle: 12,
      },
      {
        id: 'ch4-photo-2',
        imageUrl: '/images/ch4-lumphini/photo-2.jpg',
        xOffset: 0.2,
        zOffset: 0.1,
        rotationZ: -0.03,
        scale: [2.6, 3.3],
        washiColor: '#FACC15',
        washiAngle: -10,
      },
      {
        id: 'ch4-photo-3',
        imageUrl: '/images/ch4-lumphini/photo-3.jpg',
        xOffset: 1.9,
        zOffset: 0.6,
        rotationZ: 0.05,
        scale: [2.0, 2.5],
        washiColor: '#38BDF8',
        washiAngle: 14,
      },
    ],
    polaroid: {
      frontImageUrl: '/images/ch4-lumphini/polaroid.jpg',
      backNote: 'ตอนปั่นเรือเป็ดใครเหนื่อยกว่ากันนะ? แต่สนุกมากๆ เลยเนอะ 🦆',
      position: [3.3, 0.05, 0.7],
      rotationZ: -0.11,
    },
    prop: {
      id: 'ch4-prop',
      actionType: 'duck-paddle',
      hintText: 'แตะที่เรือเป็ดให้แล่นโยกเยก!',
      position: [-3.0, 0.1, 0.4],
      label: '🦆 โยกเรือเป็ด',
    },
  },
  {
    id: 'ch5-nailert',
    chapterNumber: 5,
    locationName: 'คาเฟ่นายปาร์คเลิศ',
    locationEn: 'Nai Lert Park Heritage Cafe',
    title: 'Afternoon Tea & กลาสเฮ้าส์ในสวนสวย',
    caption: 'จิบชายามบ่ายท่ามกลางเรือนกระจกและสวนต้นไม้เขียวขจี เติมความหวานให้หัวใจ',
    bgmUrl: '/audio/music/bgm-nailert.mp3',
    themeColor: '#A7F3D0',
    baseX: 0,
    baseZ: -SPACING_Z * 4,
    layers: [
      {
        id: 'ch5-photo-1',
        imageUrl: '/images/ch5-nailert/photo-1.jpg',
        xOffset: -1.8,
        zOffset: -0.6,
        rotationZ: -0.05,
        scale: [2.2, 2.8],
        washiColor: '#6EE7B7',
        washiAngle: -12,
      },
      {
        id: 'ch5-photo-2',
        imageUrl: '/images/ch5-nailert/photo-2.jpg',
        xOffset: 0.1,
        zOffset: 0.1,
        rotationZ: 0.04,
        scale: [2.5, 3.2],
        washiColor: '#F472B6',
        washiAngle: 9,
      },
      {
        id: 'ch5-photo-3',
        imageUrl: '/images/ch5-nailert/photo-3.jpg',
        xOffset: 1.8,
        zOffset: 0.5,
        rotationZ: -0.03,
        scale: [2.1, 2.6],
        washiColor: '#FCD34D',
        washiAngle: -10,
      },
    ],
    polaroid: {
      frontImageUrl: '/images/ch5-nailert/polaroid.jpg',
      backNote: 'ขนมหวานอร่อย แต่คนที่นั่งตรงข้ามหวานกว่าเยอะเลย 🍰',
      position: [3.4, 0.05, 0.8],
      rotationZ: 0.1,
    },
    prop: {
      id: 'ch5-prop',
      actionType: 'tea-clink',
      hintText: 'แตะที่ถ้วยชาเพื่อส่งไอรัก!',
      position: [-3.1, 0.1, 0.5],
      label: '☕ ชนแก้วชา',
    },
  },
  {
    id: 'ch6-lakeclub',
    chapterNumber: 6,
    locationName: 'The Lake Club เมืองทอง',
    locationEn: 'The Lake Club Muang Thong Thani',
    title: 'ดินเนอร์ริมทะเลสาบ & ไฟทไวไลท์',
    caption: 'รับลมเย็นริมน้ำ มองแสงอาทิตย์ลับขอบฟ้า และประกายไฟปิงปองยามพลบค่ำ',
    bgmUrl: '/audio/music/bgm-lakeclub.mp3',
    themeColor: '#F59E0B',
    baseX: 0,
    baseZ: -SPACING_Z * 5,
    layers: [
      {
        id: 'ch6-photo-1',
        imageUrl: '/images/ch6-lakeclub/photo-1.jpg',
        xOffset: -1.7,
        zOffset: -0.7,
        rotationZ: 0.03,
        scale: [2.2, 2.8],
        washiColor: '#F59E0B',
        washiAngle: 14,
      },
      {
        id: 'ch6-photo-2',
        imageUrl: '/images/ch6-lakeclub/photo-2.jpg',
        xOffset: 0.2,
        zOffset: 0.1,
        rotationZ: -0.04,
        scale: [2.5, 3.2],
        washiColor: '#EC4899',
        washiAngle: -11,
      },
      {
        id: 'ch6-photo-3',
        imageUrl: '/images/ch6-lakeclub/photo-3.jpg',
        xOffset: 2.0,
        zOffset: 0.6,
        rotationZ: 0.05,
        scale: [2.0, 2.5],
        washiColor: '#38BDF8',
        washiAngle: 8,
      },
    ],
    polaroid: {
      frontImageUrl: '/images/ch6-lakeclub/polaroid.jpg',
      backNote: 'บรรยากาศริมน้ำดีมากๆ ลมพัดเย็นสบาย อยากมานั่งชิลแบบนี้บ่อยๆ จัง ✨',
      position: [3.3, 0.05, 0.7],
      rotationZ: -0.08,
    },
    prop: {
      id: 'ch6-prop',
      actionType: 'lake-lights',
      hintText: 'แตะที่ไฟประดับริมน้ำเพื่อเปิดประกายวิบวับ!',
      position: [-3.0, 0.1, 0.4],
      label: '💡 ไฟปิงปองวิบวับ',
    },
  },
  {
    id: 'ch7-pattaya',
    chapterNumber: 7,
    locationName: 'พัทยา',
    locationEn: 'Pattaya Beach & Grand Finale',
    title: 'เกลียวคลื่น พระอาทิตย์ตก & พลุฉลอง 1.4 ปี',
    caption: 'เสียงคลื่นกระทบหาดทราย ท้องฟ้าสีคราม และจุดเริ่มต้นของความทรงจำบทต่อไป',
    bgmUrl: '/audio/music/bgm-pattaya.mp3',
    themeColor: '#818CF8',
    baseX: 0,
    baseZ: -SPACING_Z * 6,
    layers: [
      {
        id: 'ch7-photo-1',
        imageUrl: '/images/ch7-pattaya/photo-1.png',
        xOffset: -1.8,
        zOffset: -0.6,
        rotationZ: -0.04,
        scale: [2.2, 2.8],
        washiColor: '#818CF8',
        washiAngle: -13,
      },
      {
        id: 'ch7-photo-2',
        imageUrl: '/images/ch7-pattaya/photo-2.jpg',
        xOffset: 0.2,
        zOffset: 0.1,
        rotationZ: 0.03,
        scale: [2.6, 3.3],
        washiColor: '#F43F5E',
        washiAngle: 9,
      },
      {
        id: 'ch7-photo-3',
        imageUrl: '/images/ch7-pattaya/photo-3.jpg',
        xOffset: 1.9,
        zOffset: 0.5,
        rotationZ: -0.05,
        scale: [2.1, 2.6],
        washiColor: '#2DD4BF',
        washiAngle: -15,
      },
    ],
    polaroid: {
      frontImageUrl: '/images/ch7-pattaya/polaroid.jpg',
      backNote: 'รูปนี้ทะเลสวยมาก แต่คนข้างๆ สวยกว่าทะเลล้านเท่าเลย 🌊',
      position: [3.4, 0.05, 0.8],
      rotationZ: 0.13,
    },
    prop: {
      id: 'ch7-prop',
      actionType: 'fireworks',
      hintText: 'กดปุ่มเพื่อจุดพลุฉลองครบรอบ 1.4 ปี!',
      position: [-3.1, 0.1, 0.5],
      label: '🎆 จุดพลุฉลอง',
    },
  },
];
