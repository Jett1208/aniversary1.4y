# 📘 Master Blueprint: "Our 1.4 Years Journey" — 3D Pop-up Scrapbook

เอกสารข้อกำหนดทางเทคนิค (Technical Specification) และ Agentic Workflow สำหรับพัฒนาเว็บไซต์เซอร์ไพรส์วันครบรอบ **1 ปี 4 เดือน (1.4 Years)** ในรูปแบบหนังสือป๊อปอัพ 3 มิติ (ออกแบบมาเพื่อใช้เป็น Context หลักใน **Antigravity IDE**)

---

## 🎯 1. Project Overview & Target Environment (ข้อมูลจำเพาะของโปรเจกต์)

* **ชื่อโปรเจกต์ / ชื่อหน้าปกสมุด:** **"Our 1.4 Years Journey"**
* **อุปกรณ์หลักที่แฟนใช้เปิดดู (Primary Target Device):** **Desktop (คอมพิวเตอร์) และ iPad (แนวนอน Landscape 16:9 / 4:3)**
  * *ข้อได้เปรียบทางเทคนิค:* พื้นที่หน้าจอกว้าง สามารถวางฉากป๊อปอัพ 3 มิติไว้ฝั่งซ้าย-กลาง และวางการ์ดข้อความความทรงจำไว้ด้านขวาได้โดยไม่บังกัน รองรับทั้งการไถเมาส์ (Wheel) และการใช้นิ้วปัด/แตะบนจอสัมผัส (Touch Scroll & Raycast Tap)
* **สไตล์ภาพและบรรยากาศ (Visual & Art Direction):** **แบบ A - Handmade Photo Scrapbook (รูปถ่ายจริงไดคัทตัดขอบขาวหนา + พื้นผิวกระดาษปอนด์)**
  * เน้นความรู้สึกเหมือนสมุดทำมือ (DIY Craft) ที่นำรูปถ่ายจริงของทั้งคู่และรูปสถานที่จริงมาตัดแปะซ้อนกันเป็นเลเยอร์ มีเงาตกกระทบระหว่างชั้นกระดาษและมีลูกเล่นเทปใส (Washi Tape) / สติกเกอร์แปะตกแต่ง
* **ระบบเสียง (Audio Architecture):** **Chapter-Specific BGM Crossfading (เพลงเฉพาะประจำแต่ละสถานที่)**
  * เมื่อเลื่อนเข้าสู่เขตของแต่ละสถานที่ เพลงของฉากก่อนหน้าจะค่อยๆ เบาลง (Fade out) และเพลงประจำสถานที่ใหม่จะค่อยๆ ดังขึ้น (Fade in) อย่างนุ่มนวล พร้อมเสียง SFX ตอนพลิกกระดาษและตอนกดเล่นกิมมิค
* **จำนวนบท/ฉากทั้งหมด (Total Chapters):** **7 ฉากหลัก** (เกาะเกร็ด $\rightarrow$ ทรงวาด $\rightarrow$ ตลาดน้อย $\rightarrow$ สวนลุมพินี $\rightarrow$ คาเฟ่นายปาร์คเลิศ $\rightarrow$ The Lake Club เมืองทอง $\rightarrow$ พัทยา) + 1 หน้าปก (Intro) + 1 ฉากจบ (Finale Letter & Live Timer)
* **AI Coding Environment:** **Antigravity IDE** (แบ่งการทำงานเป็น Modular Agentic Tasks)

---

## 🛠️ 2. Core Tech Stack (เทคโนโลยีหลัก)

| หมวดหมู่ | เทคโนโลยี / ไลบรารี | หน้าที่และการใช้งานในโปรเจกต์ |
| :--- | :--- | :--- |
| **Framework** | **React 19 (Vite + TypeScript)** | ใช้ TypeScript คุมโครงสร้างข้อมูลทั้ง 5 ฉากและพิกัด 3D ไม่ให้ Agent เขียนโค้ดหลุดสเปก |
| **3D Engine** | **Three.js** + **React Three Fiber (R3F)** | เรนเดอร์ฉากกระดาษ 3 มิติ, จัดการแสงเงา และจับ Event การคลิก/แตะโมเดล (`onClick`, `onPointerOver`) |
| **3D Helpers** | **@react-three/drei** | ใช้ `useTexture`, `Html`, `Sparkles`, `Float`, `ContactShadows`, `useCursor` |
| **Animation** | **GSAP** + **ScrollTrigger** | ควบคุมการเดินของกล้องตามระยะ Scroll, อนิเมชันกางกระดาษป๊อปอัพ และอนิเมชันตอนกดเล่นไอเทม |
| **Smooth Scroll** | **Lenis** (`@studio-freight/lenis`) | ทำให้การไถเมาส์บนคอมและการปัดนิ้วบน iPad นุ่มนวลและส่งค่าเข้า 3D ได้สมูท |
| **Debug GUI** | **Leva** (`leva`) | ใช้ลากปรับตำแหน่งแผ่นกระดาษ X, Y, Z และมุมกล้องของแต่ละสถานที่บนหน้าเว็บจริง |
| **Audio Engine** | **Howler.js** (`howler`) | จัดการระบบ **Crossfade เพลงประจำทั้ง 5 สถานที่** และเสียง SFX คลิก/พลิกกระดาษ |
| **Styling & Icons** | **Tailwind CSS** + **Lucide React** | จัดหน้าจอ UI, การ์ดข้อความสไตล์กระดาษโน้ต, ป้ายบอกใบ้ให้กด (Tooltip) และนาฬิกานับเวลา |

---

## 🎬 3. Storyboard & Chapter Data Schema (โครงสร้างฉากและเนื้อหา)

สร้างไฟล์ `src/data/chapters.ts` เพื่อเก็บ Config ทั้งหมดแยกออกจาก Logic ของ 3D:

```typescript
export interface LayerAsset {
  id: string;
  imageUrl: string;       // พาธไฟล์รูปถ่ายจริงที่ไดคัทและใส่ขอบขาวแล้ว (.webp / .png)
  zOffset: number;        // ระยะความลึก (เช่น -2 = ฉากหลัง, 0 = กลาง, 1.5 = รูปคู่หน้าสุด)
  scale: [number, number]; // ขนาดความกว้าง x สูงของแผ่นกระดาษ
  xOffset?: number;       // ขยับซ้าย-ขวา
  isInteractiveProp?: boolean; // ถ้าเป็น true แฟนสามารถกดที่ชิ้นนี้เพื่อเล่นอนิเมชันพิเศษได้
  propActionType?: 'pottery-spin' | 'camera-flash' | 'car-honk' | 'duck-paddle' | 'tea-clink' | 'lake-lights' | 'fireworks';
  propHintText?: string;  // ข้อความ Tooltip เล็กๆ ชวนให้กด เช่น "ลองแตะที่รถเฟียตดูสิ!"
}

export interface PolaroidSecret {
  frontImageUrl: string;  // รูปด้านหน้าโพลารอยด์
  backNote: string;       // ข้อความลับ/คำแซวขำๆ ด้านหลังโพลารอยด์เมื่อกดพลิก
  position: [number, number, number];
  rotationZ?: number;     // องศาการวางเอียงนิดๆ ให้ดูธรรมชาติ
}

export interface ChapterConfig {
  id: string;
  locationName: string;   // ชื่อสถานที่
  title: string;          // หัวข้อฉาก / วันที่
  caption: string;        // ข้อความบรรยายความทรงจำหลักบนการ์ดโน้ต
  bgmUrl: string;         // ไฟล์เพลงประจำสถานที่นี้ (.mp3)
  bgmStartTime?: number;  // วินาทีที่ต้องการให้เพลงเริ่มเล่น (เช่น ท่อนฮุค)
  themeColor: string;     // สีไฟและโทนสีพื้นหลังประจำฉาก
  cameraPos: [number, number, number]; // พิกัดกล้องเมื่อถึงฉากนี้
  lookAtPos: [number, number, number]; // จุดโฟกัสสายตาของกล้อง
  layers: LayerAsset[];   // เลเยอร์กระดาษป๊อปอัพในฉาก (หลัง, กลาง, หน้า)
  polaroid: PolaroidSecret; // โพลารอยด์ประจำฉากที่กดพลิกอ่านข้อความหลังรูปได้
}

export interface AnniversaryMetadata {
  coverTitle: string;     // "Our 1.4 Years Journey"
  coverSubtitle: string;  // ข้อความรองหน้าปก
  startDateISO: string;   // วันแรกที่คบกัน รูปแบบ "YYYY-MM-DDTHH:mm:ss" สำหรับคำนวณเวลาเรียลไทม์
  finalLetterTitle: string;
  finalLetterBody: string;
}
```

### รายละเอียดทั้ง 5 ฉาก + กิมมิค Interactive & เพลงประจำฉาก

* **Intro (หน้าปกสมุด Scrapbook: "Our 1.4 Years Journey"):**
  * *รูปแบบ:* หน้าปกสมุดหนัง/กระดาษคราฟต์ทำมือ แปะป้ายชื่อ **"Our 1.4 Years Journey"** ตกแต่งด้วยเทปใสและสติกเกอร์ พร้อมปุ่ม **"เปิดสมุดความทรงจำ (แตะเพื่อเริ่มเล่นเสียง)"** เพื่อปลดล็อก Autoplay Policy บน iPad Safari และ Desktop Browser
* **Chapter 1: เกาะเกร็ด (Koh Kret)**
  * *โทนแสง/บรรยากาศ:* แสงแดดอบอุ่นริมแม่น้ำเจ้าพระยา (`#FDE68A`)
  * *เลเยอร์ป๊อปอัพ:* ฉากหลังเจดีย์เอียงริมน้ำ $\rightarrow$ ฉากกลางร้านเครื่องปั้นดินเผา/ตลาดริมน้ำ $\rightarrow$ ฉากหน้ารูปคู่ถือขนม/น้ำ
  * *กิมมิคกดเล่น (Interactive):*
    1. **Prop Action (`pottery-spin`):** กดที่ **"เครื่องปั้นดินเผา/จักรยาน"** แล้วหมุนติ้วๆ หรือขยับดุ๊กดิ๊กพร้อมเสียงกระดิ่ง
    2. **Polaroid Flip:** กดพลิกรูปโพลารอยด์ข้างฉากเพื่ออ่านข้อความลับหลังรูป
  * *เพลงประจำฉาก:* `/audio/bgm-kohkret.mp3`
* **Chapter 2: ทรงวาด (Song Wat Road)**
  * *โทนแสง/บรรยากาศ:* โทนวินเทจชิคๆ แสงแดดส่องตึกเก่า (`#FDBA74`)
  * *เลเยอร์ป๊อปอัพ:* ฉากหลังตึกแถวโบราณและป้ายถนนทรงวาด $\rightarrow$ ฉากกลางมุมหน้าร้านคาเฟ่เก๋ๆ $\rightarrow$ ฉากหน้ารูปคู่ถ่ายสตรีทเท่ๆ
  * *กิมมิคกดเล่น (Interactive):*
    1. **Prop Action (`camera-flash`):** กดที่ **"แก้วกาแฟ/กล้องถ่ายรูป"** แล้วมีแสงแฟลชกะพริบขาวสว่างวาบ (Camera Flash Effect) พร้อมเสียงชัตเตอร์ถ่ายรูป
    2. **Polaroid Flip:** กดพลิกรูปโพลารอยด์อ่านความในใจของวันนั้น
  * *เพลงประจำฉาก:* `/audio/bgm-songwat.mp3`
* **Chapter 3: ตลาดน้อย (Talad Noi)**
  * *โทนแสง/บรรยากาศ:* โทนเรโทรคลาสสิก ส้มอิฐ-น้ำตาลเก่า (`#FCA5A5`)
  * *เลเยอร์ป๊อปอัพ:* ฉากหลังกำแพงอิฐและตรอกซอกซอย $\rightarrow$ ฉากกลาง **รถเฟียตโบราณสีส้ม (มุมมหาชน)** $\rightarrow$ ฉากหน้ารูปคู่โพสท่าคู่กับรถ
  * *กิมมิคกดเล่น (Interactive):*
    1. **Prop Action (`car-honk`):** กดที่ **"รถเฟียตสีส้ม"** แล้วตัวรถกระเด้งดึ๋งๆ เหมือนติดเครื่องยนต์ พร้อมเสียงแตรรถวินเทจ *"ปู๊นๆ!"* และมีควันปุยกระดาษลอยออกมา
    2. **Polaroid Flip:** กดพลิกรูปโพลารอยด์อ่านข้อความลับ
  * *เพลงประจำฉาก:* `/audio/bgm-taladnoi.mp3`
* **Chapter 4: สวนลุมพินี (Lumphini Park)**
  * *โทนแสง/บรรยากาศ:* โทนสีเขียวธรรมชาติผสานแสงเย็น Golden Hour (`#86EFAC`)
  * *เลเยอร์ป๊อปอัพ:* ฉากหลังหมู่ตึกกรุงเทพฯ และต้นไม้ใหญ่ริมบึงน้ำ $\rightarrow$ ฉากกลาง **เรือเป็ดสีเหลืองในบึง** (แอบมีป๊อปอัพตัวเงินตัวทองจิ๋วโผล่ข้างพุ่มไม้) $\rightarrow$ ฉากหน้ารูปคู่ตอนนั่งเรือเป็ดหรือเดินเล่น
  * *กิมมิคกดเล่น (Interactive):*
    1. **Prop Action (`duck-paddle`):** กดที่ **"เรือเป็ด"** แล้วเรือเป็ดจะโยกเยกแล่นไปมาบนผิวน้ำกระดาษ พร้อมเจ้าตัวเงินตัวทองโผล่หัวออกมาทักทายขำๆ
    2. **Polaroid Flip:** กดพลิกรูปโพลารอยด์อ่านข้อความลับ
  * *เพลงประจำฉาก:* `/audio/bgm-lumphini.mp3`
* **Chapter 5: คาเฟ่นายปาร์คเลิศ (Nai Lert Park Heritage Cafe)**
  * *โทนแสง/บรรยากาศ:* โทนกลาสเฮ้าส์ในสวนสีเขียวร่มรื่น แสงแดดยามบ่ายละมุนตา (`#A7F3D0`)
  * *เลเยอร์ป๊อปอัพ:* ฉากหลังเรือนกระจกกลาสเฮ้าส์และแมกไม้ใจกลางเมือง $\rightarrow$ ฉากกลาง **เซ็ตถ้วยน้ำชา/จานเค้ก Afternoon Tea และดอกไม้บาน** $\rightarrow$ ฉากหน้ารูปคู่สุดหวานนั่งจิบชาพักผ่อนในสวน
  * *กิมมิคกดเล่น (Interactive):*
    1. **Prop Action (`tea-clink`):** กดที่ **"ถ้วยชา/แก้วกาแฟ"** แล้วมีควันไอลอยฟุ้งเป็นรูปหัวใจ พร้อมเสียงแก้วชนกันเบาๆ *"กริ๊ง~"* และดอกไม้บานสะพรั่งรอบโต๊ะ
    2. **Polaroid Flip:** กดพลิกรูปโพลารอยด์อ่านข้อความลับของวันนั้น
  * *เพลงประจำฉาก:* `/audio/bgm-nailert.mp3`
* **Chapter 6: The Lake Club เมืองทอง (The Lake Club Muang Thong Thani)**
  * *โทนแสง/บรรยากาศ:* โทนแสงทไวไลท์ริมทะเลสาบ ผสานแสงไฟปิงปองสีส้มอุ่นโรแมนติกยามเย็น (`#F59E0B`)
  * *เลเยอร์ป๊อปอัพ:* ฉากหลังผืนน้ำกว้างของทะเลสาบเมืองทองและท้องฟ้ายามพลบค่ำ $\rightarrow$ ฉากกลาง **สะพานไม้ยื่นลงน้ำพร้อมสายไฟประดับ (Fairy Lights) และโต๊ะดินเนอร์ริมน้ำ** $\rightarrow$ ฉากหน้ารูปคู่สุดชิลรับลมเย็นริมทะเลสาบ
  * *กิมมิคกดเล่น (Interactive):*
    1. **Prop Action (`lake-lights`):** กดที่ **"สายไฟประดับริมน้ำ / แก้วเครื่องดื่ม"** แล้วสายไฟจะกะพริบระยิบระยับ (Twinkle Lights Effect) พร้อมระลอกคลื่นน้ำไหวเบาๆ และเสียงแก้วชนกันฉลองบรรยากาศชิลๆ
    2. **Polaroid Flip:** กดพลิกรูปโพลารอยด์อ่านข้อความลับของวันนั้น
  * *เพลงประจำฉาก:* `/audio/bgm-lakeclub.mp3`
* **Chapter 7: พัทยา (Pattaya) & Grand Finale**
  * *โทนแสง/บรรยากาศ:* โทนพระอาทิตย์ตกริมทะเลค่อยๆ เปลี่ยนเป็นสีน้ำเงินเข้มยามค่ำคืน (`#818CF8`)
  * *เลเยอร์ป๊อปอัพ:* ฉากหลังท้องฟ้าและเกลียวคลื่นทะเลพัทยา $\rightarrow$ ฉากกลางต้นมะพร้าวและชายหาด $\rightarrow$ ฉากหน้ารูปคู่สุดโรแมนติกริมทะเล
  * *กิมมิคกดเล่น & ฉากจบ (Finale Sequence):*
    1. **Prop Action (`fireworks`):** กดที่ปุ่ม **"จุดพลุฉลองครบรอบ 1.4 ปี"** แล้วท้องฟ้าด้านหลังจะมืดลงพร้อมจุดพลุ 3 มิติ (`Sparkles` & Custom Particle Burst) สว่างไสวเต็มท้องฟ้าเหนือหาดพัทยา
    2. **Polaroid Flip:** กดพลิกโพลารอยด์ใบสุดท้าย
    3. **Live Relationship Timer & Final Letter Modal:** การ์ดจดหมายความในใจฉบับเต็มกางออก พร้อม **นาฬิกานับเวลาแบบ Real-time** ที่คำนวณตั้งแต่วันแรกที่คบกันจนถึงวินาทีปัจจุบัน (แสดงผลเป็น: **วัน / ชั่วโมง / นาที / วินาที** ที่เดินไปข้างหน้าเรื่อยๆ แบบไม่มีวันหยุด)
  * *เพลงประจำฉาก:* `/audio/bgm-pattaya.mp3`

---

## ⚙️ 4. Core 3D & Audio Mechanics Rules (กฎเหล็กสำหรับ Antigravity Agent)

1. **Scrapbook Die-Cut Sticker Effect:** แผ่นกระดาษทุกชิ้นต้องจำลองความหนาหรือมีขอบสีขาวรอบรูปถ่าย พร้อมเปิด `castShadow` และ `receiveShadow` เพื่อให้เกิดเงาตกกระทบลงบนพื้นกระดาษสมุดจริงๆ
2. **Bottom-Edge Pivot Rule (สำคัญมาก):** ทุกแผ่นกระดาษ (`<PaperCutout />`) ห้ามหมุนจากจุดกึ่งกลางรูป ให้สร้าง `<group position={[x, 0, z]}>` เป็นจุดหมุนที่พื้นสมุด แล้วดัน `<mesh position={[0, height / 2, 0]}>` ขึ้นด้านบนครึ่งหนึ่งของความสูงเสมอ:
   * ตอนพับเก็บนอนราบ: $\text{rotation.x} = -\frac{\pi}{2}$
   * ตอนกางออกตั้งฉาก: $\text{rotation.x} = 0$ (ใช้ GSAP Easing: `back.out(1.6)` เพื่อให้มีจังหวะกระดาษดีดตัว)
3. **Interactive Raycasting (Polaroid & Prop Bounce):**
   * `<InteractivePolaroid />`: สร้างด้วย BoxGeometry บางๆ ที่มีวัสดุ 2 ด้าน (ด้านหน้าเป็นรูปถ่าย ด้านหลังเป็นกระดาษเขียนข้อความ) เมื่อคลิก/แตะ จะรัน GSAP หมุน $\text{rotation.y} = \pi$ (180 องศา) และขยับแกน $Y$ ขึ้นเล็กน้อย
   * `<InteractiveProp />`: มี Idle Animation ขยับเบาๆ หรือมีป้าย `<Html>` เล็กๆ บอกใบ้ เมื่อคลิกจะรันอนิเมชันตาม `propActionType` และเล่นเสียง SFX
4. **Live Relationship Counter (`<RelationshipTimer />`):**
   * ใช้ `setInterval` ทุกๆ `1000ms` คำนวณผลต่างระหว่าง `new Date()` กับ `new Date(startDateISO)`
   * แสดงผลแยกเป็นกล่องตัวเลขสไตล์ Scrapbook Stamp: **Years / Months / Total Days / Hours / Minutes / Seconds**
5. **Audio Crossfader Manager (`useAudioCrossfade`):**
   * ใช้ `Howler.js` โหลดเพลงทั้ง 5 ฉากแบบ Preload เมื่อเปลี่ยน `activeChapterIndex` ให้สั่ง `.fade(currentVol, 0, 1200)` กับเพลงฉากเก่า และสั่ง `.fade(0, 0.7, 1200)` กับเพลงฉากใหม่

---

## 🤖 5. Antigravity IDE Execution Roadmap (ลำดับคำสั่ง Prompt สำหรับรันใน Antigravity)

คุณสามารถเซฟไฟล์นี้ไว้ในโฟลเดอร์โปรเจกต์ชื่อ `SPEC.md` แล้วสั่ง Agent ใน **Antigravity IDE** ทีละ Phase ตามลำดับด้านล่างนี้ได้เลยครับ:

### 🔹 Phase 1: Project Setup & Mock Data Architecture
> **Prompt สำหรับสั่ง Antigravity:**
> "อ่านไฟล์ `SPEC.md` แล้วช่วยขึ้นโครงโปรเจกต์ Vite + React 19 + TypeScript + Tailwind CSS พร้อมติดตั้ง `three`, `@types/three`, `@react-three/fiber`, `@react-three/drei`, `gsap`, `@studio-freight/lenis`, `howler`, `@types/howler`, `leva`, `lucide-react` จากนั้นสร้างไฟล์ `src/data/chapters.ts` ตาม Schema ใน `SPEC.md` โดยใส่ข้อมูลทั้ง 7 สถานที่ (เกาะเกร็ด, ทรงวาด, ตลาดน้อย, สวนลุมพินี, คาเฟ่นายปาร์คเลิศ, The Lake Club เมืองทอง, พัทยา) พร้อมใช้รูป Placeholder และเสียง Placeholder ไปก่อนเพื่อให้รันทดสอบได้ทันที"

### 🔹 Phase 2: 3D Scrapbook Canvas & Bottom-Pivot Cutout Component
> **Prompt สำหรับสั่ง Antigravity:**
> "สร้าง 3D Canvas หลักและสร้าง Component `<PaperCutout />` ตามกฎ Bottom-Edge Pivot Rule ใน `SPEC.md` (จุดหมุนอยู่ที่ฐานล่าง `y=0` เมื่อ `isOpen=false` ให้ `rotation.x = -Math.PI/2` และเมื่อ `isOpen=true` ให้ GSAP ดีดขึ้นมาที่ `rotation.x = 0` ด้วย `back.out(1.6)`) พร้อมสร้างพื้นโต๊ะไม้/กระดาษปอนด์และระบบไฟ Soft Shadows"

### 🔹 Phase 3: Interactive Polaroid Flip & Location Props
> **Prompt สำหรับสั่ง Antigravity:**
> "สร้าง Component `<InteractivePolaroid />` ที่วางอยู่ข้างฉาก เมื่อผู้ใช้คลิกหรือแตะบน iPad จะพลิกกลับด้าน 180 องศา (`rotation.y = Math.PI`) เพื่อโชว์ข้อความลับด้านหลัง และสร้างระบบ `<InteractiveProp />` รองรับ Action ทั้ง 7 ฉาก (`pottery-spin`, `camera-flash`, `car-honk`, `duck-paddle`, `tea-clink`, `lake-lights`, `fireworks`) พร้อมใส่ `useCursor` ให้เมาส์เปลี่ยนเป็นรูปมือเมื่อชี้"

### 🔹 Phase 4: ScrollTrigger Camera Path & Audio Crossfader
> **Prompt สำหรับสั่ง Antigravity:**
> "ผูก Lenis Smooth Scroll เข้ากับ GSAP ScrollTrigger เพื่อเลื่อนกล้อง 3D ไปตามพิกัด `cameraPos` ของทั้ง 7 สถานที่เมื่อผู้ใช้ไถหน้าจอ พร้อมสร้างหน้าปก Intro 'Our 1.4 Years Journey' ที่มีปุ่มกดเริ่มเปิดสมุดและปลดล็อกเสียง จากนั้นเขียน Hook `useAudioCrossfade` ด้วย Howler.js ให้เปลี่ยนเพลงประจำแต่ละสถานที่แบบ Crossfade นุ่มนวลตามฉากปัจจุบัน"

### 🔹 Phase 5: Pattaya Fireworks Finale & Live Relationship Timer
> **Prompt สำหรับสั่ง Antigravity:**
> "ในฉากที่ 7 (พัทยา) เมื่อกดปุ่มจุดพลุ ให้เปลี่ยนสีไฟฉากเป็นกลางคืนและรัน Particle พลุฉลองเหนือชายหาด พร้อมเปิดการ์ดจดหมายฉบับเต็มและ Component `<RelationshipTimer startDateISO='...' />` ที่นับเวลาตั้งแต่วันแรกที่คบกันจนถึงวินาทีปัจจุบันแบบ Real-time ทุกวินาที"

---

## 📦 6. Your Asset Preparation Checklist (สิ่งที่คุณต้องเตรียมเองระหว่างให้ AI เขียนโค้ด)

เพื่อให้เว็บออกมาสวยสมบูรณ์แบบ ระหว่างที่ให้ Antigravity ขึ้นโครงโค้ด คุณแค่เตรียมไฟล์เหล่านี้มาใส่ทับในโฟลเดอร์ `public/` ครับ:

* [ ] **1. วันแรกที่คบกัน (`startDateISO`):** `2025-07-15T00:00:00` (15 กรกฎาคม 2568 / 2025) ครบ 1 ปี 4 เดือน วันที่ 15 พฤศจิกายน 2569
* [ ] **2. รูปการ์ดความทรงจำทั้ง 7 สถานที่ (สถานที่ละประมาณ 1-3 รูป):**
  * ใช้รูปถ่ายคู่หรือรูปแฟนปกติ (ไม่จำเป็นต้องลบพื้นหลัง) ใส่ขอบขาว/กรอบรูปและเทปกระดาษน่ารักๆ
  * *เกาะเกร็ด:* รูปคู่/รูปของกิน/บรรยากาศริมน้ำ
  * *ทรงวาด:* รูปคู่แนวสตรีท/คาเฟ่ตึกเก่า
  * *ตลาดน้อย:* รูปคู่มุมรถเฟียตสีส้ม/ตรอกเก่า
  * *สวนลุมพินี:* รูปคู่ริมบึง/เรือเป็ด/ต้นไม้
  * *คาเฟ่นายปาร์คเลิศ:* รูปคู่จิบกาแฟ/เซ็ต Afternoon Tea/บรรยากาศกลาสเฮ้าส์ในสวน
  * *The Lake Club เมืองทอง:* รูปคู่ริมทะเลสาบ/บรรยากาศไฟปิงปองยามเย็น/ดินเนอร์ริมน้ำ
  * *พัทยา:* รูปคู่ริมทะเล/พระอาทิตย์ตก
* [ ] **3. รูปโพลารอยด์ 7 ใบ + ข้อความลับหลังรูป 7 ข้อความ:** เลือกรูปน่ารักๆ หรือโมเมนต์ขำๆ ของแต่ละที่ พร้อมคำแซวสั้นๆ ไว้ใส่หลังรูป
* [ ] **4. ไฟล์เพลงประจำสถานที่ 7 เพลง (`.mp3`):** ตัดเฉพาะท่อนที่ชอบ (ความยาวประมาณ 1-2 นาทีต่อเพลง) นำไปวางใน `public/audio/`
* [ ] **5. จดหมายความในใจตอนจบ:** ข้อความยาวที่จะให้อ่านตอนจุดพลุที่พัทยาเสร็จ