/** Bilingual educational info for amino acids and elements */

export type Lang = 'en' | 'th';
export type Bi = { en: string; th: string };

export interface ResidueInfo {
  name: Bi;
  code3: string;
  code1: string;
  type: 'nonpolar' | 'polar' | 'positive' | 'negative' | 'special';
  typeLabel: Bi;
  description: Bi;
  role: Bi;
  properties: Bi[];
  color: string;
}

export interface ElementInfo {
  name: Bi;
  symbol: string;
  description: Bi;
  role: Bi;
  properties: Bi[];
  color: string;
}

export const RESIDUE_DATA: Record<string, ResidueInfo> = {
  ALA: {
    name: { en: 'Alanine', th: 'อะลานีน' },
    code3: 'ALA', code1: 'A',
    type: 'nonpolar',
    typeLabel: { en: 'Nonpolar', th: 'ไม่มีขั้ว' },
    description: {
      en: 'One of the simplest amino acids with just a methyl group side chain. Very common in alpha helices.',
      th: 'กรดอะมิโนที่เรียบง่ายที่สุดชนิดหนึ่ง มีเพียงหมู่เมทิลเป็นสายข้าง พบมากในโครงสร้างแอลฟาเฮลิกซ์',
    },
    role: {
      en: 'Provides structural stability. Its small size allows tight packing in protein interiors.',
      th: 'ให้ความเสถียรทางโครงสร้าง ขนาดเล็กทำให้สามารถเรียงตัวแน่นในแกนกลางของโปรตีน',
    },
    properties: [
      { en: 'Hydrophobic', th: 'ไม่ชอบน้ำ' },
      { en: 'Small', th: 'ขนาดเล็ก' },
      { en: 'Helix-forming', th: 'สร้างเฮลิกซ์' },
    ],
    color: 'bg-amber-100 text-amber-800',
  },
  ARG: {
    name: { en: 'Arginine', th: 'อาร์จินีน' },
    code3: 'ARG', code1: 'R',
    type: 'positive',
    typeLabel: { en: 'Positively Charged', th: 'ประจุบวก' },
    description: {
      en: 'Has a guanidinium group that is almost always positively charged at physiological pH.',
      th: 'มีหมู่กวานิดิเนียมที่มีประจุบวกเกือบตลอดที่ pH ทางสรีรวิทยา',
    },
    role: {
      en: 'Forms salt bridges and hydrogen bonds. Critical for protein-DNA interactions and enzyme active sites.',
      th: 'สร้างสะพานเกลือและพันธะไฮโดรเจน สำคัญสำหรับปฏิสัมพันธ์โปรตีน-DNA และตำแหน่งเร่งปฏิกิริยา',
    },
    properties: [
      { en: 'Charged (+)', th: 'ประจุบวก (+)' },
      { en: 'Long side chain', th: 'สายข้างยาว' },
      { en: 'H-bond donor', th: 'ให้พันธะ H' },
    ],
    color: 'bg-blue-100 text-blue-800',
  },
  ASN: {
    name: { en: 'Asparagine', th: 'แอสพาราจีน' },
    code3: 'ASN', code1: 'N',
    type: 'polar',
    typeLabel: { en: 'Polar', th: 'มีขั้ว' },
    description: {
      en: 'The amide derivative of aspartic acid. Can form hydrogen bonds through its amide group.',
      th: 'อนุพันธ์เอไมด์ของกรดแอสพาร์ติก สร้างพันธะไฮโดรเจนผ่านหมู่เอไมด์ได้',
    },
    role: {
      en: 'Common site for N-linked glycosylation. Important for protein folding and stability.',
      th: 'ตำแหน่งทั่วไปสำหรับ N-linked glycosylation สำคัญต่อการพับตัวและความเสถียรของโปรตีน',
    },
    properties: [
      { en: 'Hydrophilic', th: 'ชอบน้ำ' },
      { en: 'H-bond donor/acceptor', th: 'ให้/รับพันธะ H' },
      { en: 'Glycosylation site', th: 'ตำแหน่งไกลโคซิเลชัน' },
    ],
    color: 'bg-green-100 text-green-800',
  },
  ASP: {
    name: { en: 'Aspartic Acid', th: 'กรดแอสพาร์ติก' },
    code3: 'ASP', code1: 'D',
    type: 'negative',
    typeLabel: { en: 'Negatively Charged', th: 'ประจุลบ' },
    description: {
      en: 'Carries a negative charge at physiological pH. One of the two acidic amino acids.',
      th: 'มีประจุลบที่ pH ทางสรีรวิทยา เป็นหนึ่งในสองกรดอะมิโนที่เป็นกรด',
    },
    role: {
      en: 'Key in enzyme catalysis, metal binding, and forming salt bridges that stabilize protein structure.',
      th: 'สำคัญในการเร่งปฏิกิริยาเอนไซม์ การจับโลหะ และสร้างสะพานเกลือที่ทำให้โปรตีนเสถียร',
    },
    properties: [
      { en: 'Charged (-)', th: 'ประจุลบ (-)' },
      { en: 'Acidic', th: 'เป็นกรด' },
      { en: 'Metal chelator', th: 'จับโลหะ' },
    ],
    color: 'bg-red-100 text-red-800',
  },
  CYS: {
    name: { en: 'Cysteine', th: 'ซิสเทอีน' },
    code3: 'CYS', code1: 'C',
    type: 'special',
    typeLabel: { en: 'Special', th: 'พิเศษ' },
    description: {
      en: 'Contains a thiol (sulfhydryl) group that can form disulfide bonds with other cysteines.',
      th: 'มีหมู่ไทออล (ซัลฟ์ไฮดริล) ที่สร้างพันธะไดซัลไฟด์กับซิสเทอีนตัวอื่นได้',
    },
    role: {
      en: 'Disulfide bonds cross-link protein chains for structural stability. Critical in toxin structure and function.',
      th: 'พันธะไดซัลไฟด์เชื่อมสายโปรตีนเพื่อความเสถียร สำคัญมากในโครงสร้างและหน้าที่ของสารพิษ',
    },
    properties: [
      { en: 'Disulfide bonds', th: 'พันธะไดซัลไฟด์' },
      { en: 'Redox-active', th: 'ทำปฏิกิริยารีดอกซ์' },
      { en: 'Metal binding', th: 'จับโลหะ' },
    ],
    color: 'bg-purple-100 text-purple-800',
  },
  GLU: {
    name: { en: 'Glutamic Acid', th: 'กรดกลูตามิก' },
    code3: 'GLU', code1: 'E',
    type: 'negative',
    typeLabel: { en: 'Negatively Charged', th: 'ประจุลบ' },
    description: {
      en: 'A longer-chain version of aspartic acid. Negatively charged at physiological pH.',
      th: 'กรดอะมิโนที่คล้ายกรดแอสพาร์ติกแต่สายข้างยาวกว่า มีประจุลบที่ pH ทางสรีรวิทยา',
    },
    role: {
      en: 'Involved in enzyme catalysis, signal transduction, and neurotransmitter function.',
      th: 'มีบทบาทในการเร่งปฏิกิริยาเอนไซม์ การส่งสัญญาณเซลล์ และเป็นสารสื่อประสาท',
    },
    properties: [
      { en: 'Charged (-)', th: 'ประจุลบ (-)' },
      { en: 'Acidic', th: 'เป็นกรด' },
      { en: 'Neurotransmitter precursor', th: 'สารตั้งต้นสารสื่อประสาท' },
    ],
    color: 'bg-red-100 text-red-800',
  },
  GLN: {
    name: { en: 'Glutamine', th: 'กลูตามีน' },
    code3: 'GLN', code1: 'Q',
    type: 'polar',
    typeLabel: { en: 'Polar', th: 'มีขั้ว' },
    description: {
      en: 'The amide derivative of glutamic acid. Can serve as a nitrogen donor in biosynthesis.',
      th: 'อนุพันธ์เอไมด์ของกรดกลูตามิก ทำหน้าที่เป็นตัวให้ไนโตรเจนในการสังเคราะห์ชีวภาพ',
    },
    role: {
      en: 'Important for nitrogen metabolism. Often found on protein surfaces forming hydrogen bonds.',
      th: 'สำคัญต่อเมแทบอลิซึมของไนโตรเจน มักพบบนพื้นผิวโปรตีนสร้างพันธะไฮโดรเจน',
    },
    properties: [
      { en: 'Hydrophilic', th: 'ชอบน้ำ' },
      { en: 'H-bond donor/acceptor', th: 'ให้/รับพันธะ H' },
      { en: 'Nitrogen storage', th: 'เก็บไนโตรเจน' },
    ],
    color: 'bg-green-100 text-green-800',
  },
  GLY: {
    name: { en: 'Glycine', th: 'ไกลซีน' },
    code3: 'GLY', code1: 'G',
    type: 'special',
    typeLabel: { en: 'Special', th: 'พิเศษ' },
    description: {
      en: 'The smallest amino acid with only a hydrogen as its side chain. Uniquely flexible.',
      th: 'กรดอะมิโนที่เล็กที่สุด มีเพียงไฮโดรเจนเป็นสายข้าง มีความยืดหยุ่นสูงเป็นพิเศษ',
    },
    role: {
      en: 'Provides backbone flexibility. Found in tight turns and loops where larger residues cannot fit.',
      th: 'ให้ความยืดหยุ่นของโครงสร้างหลัก พบในบริเวณโค้งแคบที่กรดอะมิโนขนาดใหญ่ไม่สามารถเข้าได้',
    },
    properties: [
      { en: 'Smallest', th: 'เล็กที่สุด' },
      { en: 'Highly flexible', th: 'ยืดหยุ่นสูง' },
      { en: 'Achiral', th: 'ไม่มีไครัล' },
    ],
    color: 'bg-purple-100 text-purple-800',
  },
  HIS: {
    name: { en: 'Histidine', th: 'ฮิสทิดีน' },
    code3: 'HIS', code1: 'H',
    type: 'positive',
    typeLabel: { en: 'Positively Charged', th: 'ประจุบวก' },
    description: {
      en: 'Has an imidazole ring with a pKa near physiological pH, allowing it to switch charge states.',
      th: 'มีวงแหวนอิมิดาโซลที่มี pKa ใกล้ pH ทางสรีรวิทยา สามารถสลับสถานะประจุได้',
    },
    role: {
      en: 'Essential in enzyme active sites as proton shuttle. Key for metal coordination in metalloproteins.',
      th: 'จำเป็นในตำแหน่งเร่งปฏิกิริยาเอนไซม์เป็นตัวส่งโปรตอน สำคัญในการประสานโลหะ',
    },
    properties: [
      { en: 'pH-sensitive', th: 'ไวต่อ pH' },
      { en: 'Metal binding', th: 'จับโลหะ' },
      { en: 'Catalytic', th: 'เร่งปฏิกิริยา' },
    ],
    color: 'bg-blue-100 text-blue-800',
  },
  ILE: {
    name: { en: 'Isoleucine', th: 'ไอโซลิวซีน' },
    code3: 'ILE', code1: 'I',
    type: 'nonpolar',
    typeLabel: { en: 'Nonpolar', th: 'ไม่มีขั้ว' },
    description: {
      en: 'A branched-chain hydrophobic amino acid. Essential amino acid that must come from diet.',
      th: 'กรดอะมิโนสายกิ่งที่ไม่ชอบน้ำ เป็นกรดอะมิโนจำเป็นที่ต้องได้รับจากอาหาร',
    },
    role: {
      en: 'Packs tightly in protein hydrophobic cores. Important for protein folding and structural integrity.',
      th: 'เรียงตัวแน่นในแกนกลางที่ไม่ชอบน้ำของโปรตีน สำคัญต่อการพับตัวและความสมบูรณ์ของโครงสร้าง',
    },
    properties: [
      { en: 'Hydrophobic', th: 'ไม่ชอบน้ำ' },
      { en: 'Branched-chain', th: 'สายกิ่ง' },
      { en: 'Essential', th: 'จำเป็น' },
    ],
    color: 'bg-amber-100 text-amber-800',
  },
  LEU: {
    name: { en: 'Leucine', th: 'ลิวซีน' },
    code3: 'LEU', code1: 'L',
    type: 'nonpolar',
    typeLabel: { en: 'Nonpolar', th: 'ไม่มีขั้ว' },
    description: {
      en: 'The most common amino acid in proteins. Strongly hydrophobic with a branched side chain.',
      th: 'กรดอะมิโนที่พบมากที่สุดในโปรตีน ไม่ชอบน้ำอย่างมากและมีสายข้างแบบกิ่ง',
    },
    role: {
      en: 'Forms leucine zippers for protein-protein interactions. Major component of protein hydrophobic cores.',
      th: 'สร้าง leucine zipper สำหรับปฏิสัมพันธ์โปรตีน-โปรตีน เป็นส่วนสำคัญของแกนกลางที่ไม่ชอบน้ำ',
    },
    properties: [
      { en: 'Hydrophobic', th: 'ไม่ชอบน้ำ' },
      { en: 'Most common', th: 'พบมากที่สุด' },
      { en: 'Helix-forming', th: 'สร้างเฮลิกซ์' },
    ],
    color: 'bg-amber-100 text-amber-800',
  },
  LYS: {
    name: { en: 'Lysine', th: 'ไลซีน' },
    code3: 'LYS', code1: 'K',
    type: 'positive',
    typeLabel: { en: 'Positively Charged', th: 'ประจุบวก' },
    description: {
      en: 'Has a long flexible side chain ending in a positively charged amino group.',
      th: 'มีสายข้างยาวยืดหยุ่นที่ลงท้ายด้วยหมู่อะมิโนที่มีประจุบวก',
    },
    role: {
      en: 'Target for post-translational modifications (acetylation, methylation). Important in DNA binding.',
      th: 'เป้าหมายของการดัดแปรหลังการแปลรหัส (อะเซทิเลชัน, เมทิเลชัน) สำคัญในการจับ DNA',
    },
    properties: [
      { en: 'Charged (+)', th: 'ประจุบวก (+)' },
      { en: 'Flexible', th: 'ยืดหยุ่น' },
      { en: 'Modified in signaling', th: 'ถูกดัดแปรในการส่งสัญญาณ' },
    ],
    color: 'bg-blue-100 text-blue-800',
  },
  MET: {
    name: { en: 'Methionine', th: 'เมไทโอนีน' },
    code3: 'MET', code1: 'M',
    type: 'nonpolar',
    typeLabel: { en: 'Nonpolar', th: 'ไม่มีขั้ว' },
    description: {
      en: 'Contains a sulfur atom in its side chain. Almost always the first amino acid in protein synthesis.',
      th: 'มีอะตอมกำมะถันในสายข้าง เป็นกรดอะมิโนตัวแรกในการสังเคราะห์โปรตีนเกือบทุกครั้ง',
    },
    role: {
      en: 'Start codon amino acid. Acts as antioxidant protecting against reactive oxygen species.',
      th: 'กรดอะมิโนของโคดอนเริ่มต้น ทำหน้าที่เป็นสารต้านอนุมูลอิสระปกป้องจาก ROS',
    },
    properties: [
      { en: 'Hydrophobic', th: 'ไม่ชอบน้ำ' },
      { en: 'Start codon', th: 'โคดอนเริ่มต้น' },
      { en: 'Antioxidant', th: 'ต้านอนุมูลอิสระ' },
    ],
    color: 'bg-amber-100 text-amber-800',
  },
  PHE: {
    name: { en: 'Phenylalanine', th: 'ฟีนิลอะลานีน' },
    code3: 'PHE', code1: 'F',
    type: 'nonpolar',
    typeLabel: { en: 'Nonpolar', th: 'ไม่มีขั้ว' },
    description: {
      en: 'Has a benzyl side chain making it one of the most hydrophobic amino acids.',
      th: 'มีสายข้างเบนซิลทำให้เป็นกรดอะมิโนที่ไม่ชอบน้ำมากที่สุดชนิดหนึ่ง',
    },
    role: {
      en: 'Participates in aromatic stacking interactions. Important for protein stability and ligand binding.',
      th: 'มีส่วนในปฏิสัมพันธ์แบบ aromatic stacking สำคัญต่อความเสถียรของโปรตีนและการจับลิแกนด์',
    },
    properties: [
      { en: 'Aromatic', th: 'อะโรมาติก' },
      { en: 'Hydrophobic', th: 'ไม่ชอบน้ำ' },
      { en: 'UV-absorbing', th: 'ดูดกลืน UV' },
    ],
    color: 'bg-amber-100 text-amber-800',
  },
  PRO: {
    name: { en: 'Proline', th: 'โพรลีน' },
    code3: 'PRO', code1: 'P',
    type: 'special',
    typeLabel: { en: 'Special', th: 'พิเศษ' },
    description: {
      en: 'Unique cyclic structure where the side chain bonds back to the backbone nitrogen.',
      th: 'มีโครงสร้างวงแหวนที่เป็นเอกลักษณ์ โดยสายข้างเชื่อมกลับไปที่ไนโตรเจนของโครงสร้างหลัก',
    },
    role: {
      en: 'Introduces rigid kinks in protein chains. Found in turns and collagen triple helices.',
      th: 'ทำให้เกิดส่วนโค้งแข็งในสายโปรตีน พบในบริเวณโค้งและเฮลิกซ์สามเส้นของคอลลาเจน',
    },
    properties: [
      { en: 'Rigid', th: 'แข็งตัว' },
      { en: 'Helix-breaking', th: 'ทำลายเฮลิกซ์' },
      { en: 'Cyclic', th: 'วงแหวน' },
    ],
    color: 'bg-purple-100 text-purple-800',
  },
  SER: {
    name: { en: 'Serine', th: 'เซรีน' },
    code3: 'SER', code1: 'S',
    type: 'polar',
    typeLabel: { en: 'Polar', th: 'มีขั้ว' },
    description: {
      en: 'Small polar amino acid with a hydroxyl group. Very common in enzyme active sites.',
      th: 'กรดอะมิโนมีขั้วขนาดเล็กที่มีหมู่ไฮดรอกซิล พบมากในตำแหน่งเร่งปฏิกิริยาของเอนไซม์',
    },
    role: {
      en: 'Key in serine proteases (enzymes that cut proteins). Major target for phosphorylation signaling.',
      th: 'สำคัญใน serine protease (เอนไซม์ตัดโปรตีน) เป็นเป้าหมายหลักของการส่งสัญญาณฟอสโฟรีเลชัน',
    },
    properties: [
      { en: 'Hydrophilic', th: 'ชอบน้ำ' },
      { en: 'Phosphorylation site', th: 'ตำแหน่งฟอสโฟรีเลชัน' },
      { en: 'Catalytic', th: 'เร่งปฏิกิริยา' },
    ],
    color: 'bg-green-100 text-green-800',
  },
  THR: {
    name: { en: 'Threonine', th: 'ทรีโอนีน' },
    code3: 'THR', code1: 'T',
    type: 'polar',
    typeLabel: { en: 'Polar', th: 'มีขั้ว' },
    description: {
      en: 'Similar to serine but with an additional methyl group. Essential amino acid.',
      th: 'คล้ายเซรีนแต่มีหมู่เมทิลเพิ่มเติม เป็นกรดอะมิโนจำเป็น',
    },
    role: {
      en: 'Target for phosphorylation and glycosylation. Important in protein signaling pathways.',
      th: 'เป้าหมายของฟอสโฟรีเลชันและไกลโคซิเลชัน สำคัญในวิถีการส่งสัญญาณของโปรตีน',
    },
    properties: [
      { en: 'Hydrophilic', th: 'ชอบน้ำ' },
      { en: 'Phosphorylation site', th: 'ตำแหน่งฟอสโฟรีเลชัน' },
      { en: 'Essential', th: 'จำเป็น' },
    ],
    color: 'bg-green-100 text-green-800',
  },
  TRP: {
    name: { en: 'Tryptophan', th: 'ทริปโตเฟน' },
    code3: 'TRP', code1: 'W',
    type: 'nonpolar',
    typeLabel: { en: 'Nonpolar', th: 'ไม่มีขั้ว' },
    description: {
      en: 'The largest amino acid with a double-ring indole group. Precursor to serotonin and melatonin.',
      th: 'กรดอะมิโนที่ใหญ่ที่สุด มีวงแหวนคู่อินโดล เป็นสารตั้งต้นของเซโรโทนินและเมลาโทนิน',
    },
    role: {
      en: 'Important for protein-membrane interactions. Its fluorescence is used to study protein dynamics.',
      th: 'สำคัญต่อปฏิสัมพันธ์โปรตีน-เยื่อหุ้มเซลล์ ใช้การเรืองแสงศึกษาพลวัตของโปรตีน',
    },
    properties: [
      { en: 'Aromatic', th: 'อะโรมาติก' },
      { en: 'Largest', th: 'ใหญ่ที่สุด' },
      { en: 'Fluorescent', th: 'เรืองแสง' },
    ],
    color: 'bg-amber-100 text-amber-800',
  },
  TYR: {
    name: { en: 'Tyrosine', th: 'ไทโรซีน' },
    code3: 'TYR', code1: 'Y',
    type: 'polar',
    typeLabel: { en: 'Polar', th: 'มีขั้ว' },
    description: {
      en: 'Has a hydroxyl-bearing aromatic ring. Can be phosphorylated for cell signaling.',
      th: 'มีวงแหวนอะโรมาติกที่มีหมู่ไฮดรอกซิล สามารถถูกฟอสโฟรีเลตเพื่อส่งสัญญาณเซลล์',
    },
    role: {
      en: 'Critical in enzyme catalysis and signal transduction. Target for tyrosine kinase drugs in cancer therapy.',
      th: 'สำคัญในการเร่งปฏิกิริยาเอนไซม์และการถ่ายทอดสัญญาณ เป้าหมายของยา tyrosine kinase ในการรักษามะเร็ง',
    },
    properties: [
      { en: 'Aromatic', th: 'อะโรมาติก' },
      { en: 'Phosphorylation site', th: 'ตำแหน่งฟอสโฟรีเลชัน' },
      { en: 'Phenolic', th: 'ฟีนอลิก' },
    ],
    color: 'bg-green-100 text-green-800',
  },
  VAL: {
    name: { en: 'Valine', th: 'วาลีน' },
    code3: 'VAL', code1: 'V',
    type: 'nonpolar',
    typeLabel: { en: 'Nonpolar', th: 'ไม่มีขั้ว' },
    description: {
      en: 'A branched-chain hydrophobic amino acid. Common in beta sheets.',
      th: 'กรดอะมิโนสายกิ่งที่ไม่ชอบน้ำ พบมากในโครงสร้างเบตาชีต',
    },
    role: {
      en: 'Contributes to hydrophobic core of proteins. A single mutation (GLU->VAL) causes sickle cell disease.',
      th: 'มีส่วนในแกนกลางที่ไม่ชอบน้ำของโปรตีน การกลายพันธุ์เพียงตำแหน่งเดียว (GLU→VAL) ทำให้เกิดโรคเม็ดเลือดแดงรูปเคียว',
    },
    properties: [
      { en: 'Hydrophobic', th: 'ไม่ชอบน้ำ' },
      { en: 'Branched-chain', th: 'สายกิ่ง' },
      { en: 'Beta-sheet forming', th: 'สร้างเบตาชีต' },
    ],
    color: 'bg-amber-100 text-amber-800',
  },
};

export const ELEMENT_DATA: Record<string, ElementInfo> = {
  C: {
    name: { en: 'Carbon', th: 'คาร์บอน' },
    symbol: 'C',
    description: {
      en: 'The backbone element of all organic molecules. Forms 4 bonds creating diverse molecular structures.',
      th: 'ธาตุโครงสร้างหลักของโมเลกุลอินทรีย์ทั้งหมด สร้างพันธะได้ 4 พันธะทำให้เกิดโครงสร้างหลากหลาย',
    },
    role: {
      en: 'Forms the structural skeleton of drug molecules. Carbon rings and chains define drug shape and properties.',
      th: 'สร้างโครงสร้างหลักของโมเลกุลยา วงแหวนและสายคาร์บอนกำหนดรูปร่างและสมบัติของยา',
    },
    properties: [
      { en: '4 bonds', th: '4 พันธะ' },
      { en: 'Organic backbone', th: 'โครงสร้างหลักอินทรีย์' },
      { en: 'Versatile bonding', th: 'พันธะหลากหลาย' },
    ],
    color: 'bg-gray-100 text-gray-800',
  },
  N: {
    name: { en: 'Nitrogen', th: 'ไนโตรเจน' },
    symbol: 'N',
    description: {
      en: 'Essential for life. Found in amino acids, nucleic acids, and many drug molecules.',
      th: 'จำเป็นต่อชีวิต พบในกรดอะมิโน กรดนิวคลีอิก และโมเลกุลยาหลายชนิด',
    },
    role: {
      en: 'Acts as hydrogen bond donor/acceptor. Many drugs contain nitrogen heterocycles for target binding.',
      th: 'ทำหน้าที่ให้/รับพันธะไฮโดรเจน ยาหลายชนิดมีวงแหวนเฮเทอโรไซคลิกที่มีไนโตรเจนสำหรับจับเป้าหมาย',
    },
    properties: [
      { en: 'H-bond capable', th: 'สร้างพันธะ H ได้' },
      { en: 'Basic', th: 'เป็นเบส' },
      { en: 'In amino groups', th: 'ในหมู่อะมิโน' },
    ],
    color: 'bg-blue-100 text-blue-800',
  },
  O: {
    name: { en: 'Oxygen', th: 'ออกซิเจน' },
    symbol: 'O',
    description: {
      en: 'Highly electronegative element critical for biological function.',
      th: 'ธาตุที่มีอิเล็กโทรเนกาทิวิตีสูง สำคัญต่อการทำงานทางชีวภาพ',
    },
    role: {
      en: 'Forms hydrogen bonds with protein targets. Hydroxyl and carbonyl groups determine drug solubility.',
      th: 'สร้างพันธะไฮโดรเจนกับโปรตีนเป้าหมาย หมู่ไฮดรอกซิลและคาร์บอนิลกำหนดการละลายของยา',
    },
    properties: [
      { en: 'Electronegative', th: 'อิเล็กโทรเนกาทิวิตีสูง' },
      { en: 'H-bond acceptor', th: 'รับพันธะ H' },
      { en: 'Redox-active', th: 'ทำปฏิกิริยารีดอกซ์' },
    ],
    color: 'bg-red-100 text-red-800',
  },
  S: {
    name: { en: 'Sulfur', th: 'กำมะถัน' },
    symbol: 'S',
    description: {
      en: 'Found in amino acids cysteine and methionine. Important in drug design.',
      th: 'พบในกรดอะมิโนซิสเทอีนและเมไทโอนีน สำคัญในการออกแบบยา',
    },
    role: {
      en: 'Forms disulfide bonds in proteins. Thiol groups in drugs can bind metal centers in enzyme targets.',
      th: 'สร้างพันธะไดซัลไฟด์ในโปรตีน หมู่ไทออลในยาสามารถจับศูนย์โลหะในเอนไซม์เป้าหมาย',
    },
    properties: [
      { en: 'Disulfide bonds', th: 'พันธะไดซัลไฟด์' },
      { en: 'Metal binding', th: 'จับโลหะ' },
      { en: 'Nucleophilic', th: 'นิวคลีโอฟิลิก' },
    ],
    color: 'bg-yellow-100 text-yellow-800',
  },
  P: {
    name: { en: 'Phosphorus', th: 'ฟอสฟอรัส' },
    symbol: 'P',
    description: {
      en: 'Central to energy transfer (ATP) and genetic material (DNA/RNA).',
      th: 'เป็นศูนย์กลางของการถ่ายโอนพลังงาน (ATP) และสารพันธุกรรม (DNA/RNA)',
    },
    role: {
      en: 'Phosphate groups in drugs can mimic natural substrates. Important in prodrug design.',
      th: 'หมู่ฟอสเฟตในยาสามารถเลียนแบบซับสเตรตธรรมชาติ สำคัญในการออกแบบโปรดรัก',
    },
    properties: [
      { en: '5 bonds', th: '5 พันธะ' },
      { en: 'In phosphates', th: 'ในฟอสเฟต' },
      { en: 'Energy transfer', th: 'ถ่ายโอนพลังงาน' },
    ],
    color: 'bg-orange-100 text-orange-800',
  },
  H: {
    name: { en: 'Hydrogen', th: 'ไฮโดรเจน' },
    symbol: 'H',
    description: {
      en: 'The most abundant element in the universe. Essential for hydrogen bonding in biology.',
      th: 'ธาตุที่มีมากที่สุดในจักรวาล จำเป็นสำหรับพันธะไฮโดรเจนในชีววิทยา',
    },
    role: {
      en: 'Hydrogen bonds between drugs and protein targets are critical for binding specificity and strength.',
      th: 'พันธะไฮโดรเจนระหว่างยาและโปรตีนเป้าหมายสำคัญต่อความจำเพาะและความแข็งแรงของการจับ',
    },
    properties: [
      { en: 'H-bonding', th: 'พันธะไฮโดรเจน' },
      { en: 'Smallest atom', th: 'อะตอมเล็กที่สุด' },
      { en: 'Ubiquitous', th: 'พบทั่วไป' },
    ],
    color: 'bg-slate-100 text-slate-700',
  },
  F: {
    name: { en: 'Fluorine', th: 'ฟลูออรีน' },
    symbol: 'F',
    description: {
      en: 'The most electronegative element. Increasingly used in modern drug design.',
      th: 'ธาตุที่มีอิเล็กโทรเนกาทิวิตีสูงที่สุด ถูกใช้มากขึ้นในการออกแบบยาสมัยใหม่',
    },
    role: {
      en: 'Improves drug metabolic stability and membrane permeability. Blocks metabolic degradation sites.',
      th: 'เพิ่มความเสถียรทางเมแทบอลิซึมและการซึมผ่านเยื่อหุ้มเซลล์ ปิดกั้นตำแหน่งสลายตัว',
    },
    properties: [
      { en: 'Most electronegative', th: 'อิเล็กโทรเนกาทิวิตีสูงสุด' },
      { en: 'Metabolic blocker', th: 'ป้องกันการสลายตัว' },
      { en: 'Lipophilic', th: 'ชอบไขมัน' },
    ],
    color: 'bg-emerald-100 text-emerald-800',
  },
  Cl: {
    name: { en: 'Chlorine', th: 'คลอรีน' },
    symbol: 'Cl',
    description: {
      en: 'A halogen commonly found in pharmaceutical compounds.',
      th: 'ฮาโลเจนที่พบได้ทั่วไปในสารประกอบทางเภสัชกรรม',
    },
    role: {
      en: 'Increases lipophilicity for better membrane penetration. Can form halogen bonds with protein targets.',
      th: 'เพิ่มความชอบไขมันเพื่อการซึมผ่านเยื่อหุ้มเซลล์ที่ดีขึ้น สร้างพันธะฮาโลเจนกับโปรตีนเป้าหมายได้',
    },
    properties: [
      { en: 'Halogen bonding', th: 'พันธะฮาโลเจน' },
      { en: 'Lipophilic', th: 'ชอบไขมัน' },
      { en: 'Electron-withdrawing', th: 'ดึงอิเล็กตรอน' },
    ],
    color: 'bg-lime-100 text-lime-800',
  },
  Br: {
    name: { en: 'Bromine', th: 'โบรมีน' },
    symbol: 'Br',
    description: {
      en: 'A heavier halogen used in some drugs and natural products.',
      th: 'ฮาโลเจนหนักที่ใช้ในยาบางชนิดและผลิตภัณฑ์ธรรมชาติ',
    },
    role: {
      en: 'Similar to chlorine but larger. Used in marine natural product-derived drugs.',
      th: 'คล้ายคลอรีนแต่ใหญ่กว่า ใช้ในยาที่พัฒนาจากผลิตภัณฑ์ธรรมชาติทางทะเล',
    },
    properties: [
      { en: 'Heavy halogen', th: 'ฮาโลเจนหนัก' },
      { en: 'Marine products', th: 'ผลิตภัณฑ์ทางทะเล' },
      { en: 'Lipophilic', th: 'ชอบไขมัน' },
    ],
    color: 'bg-rose-100 text-rose-800',
  },
  Na: {
    name: { en: 'Sodium', th: 'โซเดียม' },
    symbol: 'Na',
    description: {
      en: 'An alkali metal. Sodium salts are the most common drug salt forms.',
      th: 'โลหะแอลคาไล เกลือโซเดียมเป็นรูปแบบเกลือของยาที่พบมากที่สุด',
    },
    role: {
      en: 'Used as sodium salt to improve drug solubility and dissolution rate in pharmaceutical formulations.',
      th: 'ใช้เป็นเกลือโซเดียมเพื่อเพิ่มการละลายและอัตราการสลายตัวในสูตรยา',
    },
    properties: [
      { en: 'Counterion', th: 'ไอออนตรงข้าม' },
      { en: 'Improves solubility', th: 'เพิ่มการละลาย' },
      { en: 'Salt form', th: 'รูปแบบเกลือ' },
    ],
    color: 'bg-violet-100 text-violet-800',
  },
};
