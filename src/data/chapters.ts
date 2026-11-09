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
  | 'fireworks';

export interface InteractivePropConfig {
  id: string;
  actionType: PropActionType;
  hintText: string;
  position: [number, number, number];
  label: string;
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
      },
      {
        id: 'ch1-photo-3',
        imageUrl: '/images/ch1-kohkret/photo-3.png',
        xOffset: 1.9,
        zOffset: 0.6,
        rotationZ: -0.04,
        scale: [2.1, 2.6],
        washiColor: '#60A5FA',
        washiAngle: -8,
      },
    ],
    polaroid: {
      frontImageUrl: '/images/ch1-kohkret/polaroid.png',
      backNote: 'รูปนี้จำได้ไหม? อากาศร้อนมากแต่ก็ยังยิ้มแป้น น่ารักที่สุดเลย 🍦',
      position: [3.4, 0.05, 0.8],
      rotationZ: 0.12,
    },
    prop: {
      id: 'ch1-prop',
      actionType: 'pottery-spin',
      hintText: 'ลองแตะที่จักรยานปั่นริมน้ำดูสิ!',
      position: [-3.2, 0.1, 0.5],
      label: '🚲 หมุนจักรยาน',
    },
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
        xOffset: -1.7,
        zOffset: -0.6,
        rotationZ: 0.05,
        scale: [2.2, 2.8],
        washiColor: '#FB923C',
        washiAngle: 10,
      },
      {
        id: 'ch2-photo-2',
        imageUrl: '/images/ch2-songwat/photo-2.jpg',
        xOffset: 0.3,
        zOffset: 0.2,
        rotationZ: -0.04,
        scale: [2.6, 3.3],
        washiColor: '#A78BFA',
        washiAngle: -12,
      },
      {
        id: 'ch2-photo-3',
        imageUrl: '/images/ch2-songwat/photo-3.jpg',
        xOffset: 2.0,
        zOffset: 0.5,
        rotationZ: 0.06,
        scale: [2.0, 2.5],
        washiColor: '#34D399',
        washiAngle: 15,
      },
    ],
    polaroid: {
      frontImageUrl: '/images/ch2-songwat/polaroid.jpg',
      backNote: 'มุมนี้เท่มาก แสงกำลังสวยพอดีเลย ชอบลุคนี้ของเธอมากๆ 📸',
      position: [3.3, 0.05, 0.7],
      rotationZ: -0.09,
    },
    prop: {
      id: 'ch2-prop',
      actionType: 'camera-flash',
      hintText: 'แตะที่กล้องเพื่อกดชัตเตอร์แฟลช!',
      position: [-3.0, 0.1, 0.4],
      label: '📷 กดแชะกล้อง',
    },
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
        xOffset: -1.8,
        zOffset: -0.7,
        rotationZ: -0.04,
        scale: [2.2, 2.7],
        washiColor: '#F87171',
        washiAngle: -10,
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
      },
      {
        id: 'ch3-photo-3',
        imageUrl: '/images/ch3-taladnoi/photo-3.jpg',
        xOffset: 1.8,
        zOffset: 0.6,
        rotationZ: -0.05,
        scale: [2.1, 2.6],
        washiColor: '#4ADE80',
        washiAngle: -14,
      },
    ],
    polaroid: {
      frontImageUrl: '/images/ch3-taladnoi/polaroid.jpg',
      backNote: 'รถคันนี้สีเหมือนเธอตอนแก้มส้มๆ เลย น่ารักสดใสสุดๆ 🚗',
      position: [3.4, 0.05, 0.8],
      rotationZ: 0.14,
    },
    prop: {
      id: 'ch3-prop',
      actionType: 'car-honk',
      hintText: 'ลองแตะที่รถเฟียตดูสิ!',
      position: [-3.1, 0.1, 0.5],
      label: '🚗 บีบแตรเฟียต',
    },
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
