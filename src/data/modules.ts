import { LearningModule, SmkMajor } from '../types/vocab';

export const SMK_MAJOR_OPTIONS: { id: SmkMajor; label: string }[] = [
  { id: 'all', label: 'Semua Jurusan' },
  { id: 'tkj-rpl', label: 'TKJ & RPL' },
  { id: 'teknik-otomotif', label: 'Teknik & Otomotif' },
  { id: 'perhotelan-kuliner', label: 'Perhotelan & Kuliner' },
  { id: 'bisnis-perkantoran', label: 'Bisnis & Perkantoran' },
  { id: 'kesehatan-k3', label: 'Kesehatan & K3' },
  { id: 'umum-ujian', label: 'Umum & Ujian A2' },
];

export const LEARNING_MODULES: LearningModule[] = [
  {
    id: 'work-jobs',
    number: '01',
    title: 'Dunia Kerja & Profesi',
    cambridgeTopics: ['Work and Jobs'],
    description: 'Kosakata profesi, lingkungan kantor, perusahaan, jam kerja, serta interaksi dengan atasan dan pelanggan saat PKL.',
    majors: ['bisnis-perkantoran', 'tkj-rpl', 'teknik-otomotif', 'perhotelan-kuliner', 'kesehatan-k3', 'umum-ujian'],
    smkRelevanceLabel: 'Wajib Semua Jurusan SMK',
  },
  {
    id: 'tech-communication',
    number: '02',
    title: 'Teknologi, Komputer & Perangkat',
    cambridgeTopics: ['Communication and Technology', 'Appliances'],
    description: 'Istilah perangkat keras, lunak, jaringan internet, email, serta peralatan listrik dan elektronik modern.',
    majors: ['tkj-rpl', 'bisnis-perkantoran', 'teknik-otomotif'],
    smkRelevanceLabel: 'Prioritas TKJ, RPL & Elektro',
  },
  {
    id: 'travel-transport',
    number: '03',
    title: 'Otomotif, Bengkel & Transportasi',
    cambridgeTopics: ['Travel and Transport'],
    description: 'Komponen kendaraan, bengkel, perbaikan mesin, bahan bakar, jadwal perjalanan, dan transportasi publik.',
    majors: ['teknik-otomotif', 'perhotelan-kuliner'],
    smkRelevanceLabel: 'Prioritas Otomotif, Mesin & UPW',
  },
  {
    id: 'documents-services',
    number: '04',
    title: 'Dokumen, Administrasi & Layanan',
    cambridgeTopics: ['Documents and Texts', 'Services'],
    description: 'Formulir, surat menyurat, ijazah, izin, proyek, serta fasilitas layanan publik dan perkantoran.',
    majors: ['bisnis-perkantoran', 'perhotelan-kuliner'],
    smkRelevanceLabel: 'Prioritas OTKP, AKL & Perhotelan',
  },
  {
    id: 'shopping-finance',
    number: '05',
    title: 'Transaksi, Harga & Pemasaran',
    cambridgeTopics: ['Shopping'],
    description: 'Kosakata jual beli, diskon, struk pembayaran, kartu kredit, tunai, dan pelayanan pelanggan di toko.',
    majors: ['bisnis-perkantoran', 'perhotelan-kuliner'],
    smkRelevanceLabel: 'Prioritas BDP & Akuntansi',
  },
  {
    id: 'food-hospitality',
    number: '06',
    title: 'Kuliner, Dapur & Penyajian',
    cambridgeTopics: ['Food and Drink'],
    description: 'Bahan masakan, teknik memasak, peralatan dapur, menu restoran, dan layanan pramusaji.',
    majors: ['perhotelan-kuliner'],
    smkRelevanceLabel: 'Prioritas Tata Boga & Perhotelan',
  },
  {
    id: 'health-safety',
    number: '07',
    title: 'Kesehatan, Medis & K3 Bengkel',
    cambridgeTopics: ['Health, Medicine and Exercise'],
    description: 'Keselamatan kerja, kecelakaan, pertolongan pertama, bagian tubuh, keluhan medis, dan kebugaran.',
    majors: ['kesehatan-k3', 'teknik-otomotif'],
    smkRelevanceLabel: 'Prioritas Keperawatan & K3',
  },
  {
    id: 'education-measurements',
    number: '08',
    title: 'Pendidikan, Ujian & Pengukuran',
    cambridgeTopics: ['Education', 'Measurements'],
    description: 'Kosakata kelas, praktik kejuruan, nilai, instruksi, serta satuan ukur panjang, berat, suhu, dan volume.',
    majors: ['umum-ujian', 'teknik-otomotif', 'perhotelan-kuliner', 'tkj-rpl'],
    smkRelevanceLabel: 'Ujian A2 Key & Praktik Bengkel',
  },
  {
    id: 'home-places',
    number: '09',
    title: 'Hunian, Gedung & Navigasi Kota',
    cambridgeTopics: ['House and Home', 'Places: Buildings', 'Places: Town and City'],
    description: 'Ruangan, perabotan, arsitektur bangunan, fasilitas umum, dan petunjuk arah di perkotaan.',
    majors: ['perhotelan-kuliner', 'umum-ujian'],
    smkRelevanceLabel: 'Perhotelan, DPIB & Umum',
  },
  {
    id: 'clothes-feelings',
    number: '10',
    title: 'Busana, Warna & Sikap Kerja',
    cambridgeTopics: ['Clothes and Accessories', 'Colours', 'Personal Feelings, Opinions and Experiences'],
    description: 'Pakaian kerja, seragam, warna, serta kata sifat penting untuk mendeskripsikan kualitas dan sikap profesional.',
    majors: ['perhotelan-kuliner', 'bisnis-perkantoran', 'umum-ujian'],
    smkRelevanceLabel: 'Tata Busana & Wawancara Kerja',
  },
  {
    id: 'nature-time-leisure',
    number: '11',
    title: 'Alam, Cuaca, Waktu & Aktivitas',
    cambridgeTopics: ['The Natural World', 'Places: Countryside', 'Weather', 'Time', 'Family and Friends', 'Sport', 'Hobbies and Leisure', 'Entertainment and Media'],
    description: 'Jadwal shift, cuaca lapangan, lingkungan alam, relasi keluarga, olahraga, dan hobi sehari-hari.',
    majors: ['umum-ujian', 'perhotelan-kuliner'],
    smkRelevanceLabel: 'Kosakata Inti Ujian A2 Key',
  },
  {
    id: 'phrasal-2025',
    number: '12',
    title: 'Phrasal Verbs & Tambahan 2025',
    cambridgeTopics: ['Multi-word Verbs', 'August 2025 Additions'],
    description: 'Kata kerja frasa wajib Cambridge A2 Key (literal & non-literal) serta seluruh kosakata tambahan baru edisi Agustus 2025.',
    majors: ['umum-ujian', 'tkj-rpl', 'teknik-otomotif', 'bisnis-perkantoran', 'perhotelan-kuliner', 'kesehatan-k3'],
    smkRelevanceLabel: 'Update Resmi Agustus 2025',
  },
];

export interface AbbreviationItem {
  code: string;
  english: string;
  indonesian: string;
  example: string;
}

export const CAMBRIDGE_ABBREVIATIONS: AbbreviationItem[] = [
  { code: 'abbrev', english: 'abbreviation or acronym', indonesian: 'singkatan atau akronim', example: 'ID, PC, TV, IT' },
  { code: 'adj', english: 'adjective', indonesian: 'kata sifat', example: 'careful, modern, useful' },
  { code: 'adv', english: 'adverb', indonesian: 'kata keterangan', example: 'carefully, immediately, recently' },
  { code: 'av', english: 'auxiliary verb', indonesian: 'kata kerja bantu', example: 'be, do, have' },
  { code: 'Am Eng', english: 'American English', indonesian: 'Bahasa Inggris Amerika', example: 'elevator, gas station, cookie' },
  { code: 'Br Eng', english: 'British English', indonesian: 'Bahasa Inggris Britania', example: 'lift, petrol station, biscuit' },
  { code: 'conj', english: 'conjunction', indonesian: 'kata hubung', example: 'and, because, but, while' },
  { code: 'det', english: 'determiner', indonesian: 'penentu kata benda', example: 'a, an, every, several' },
  { code: 'exclam', english: 'exclamation', indonesian: 'kata seru / ungkapan', example: 'Congratulations!, Excuse me!' },
  { code: 'mv', english: 'modal verb', indonesian: 'kata kerja modal', example: 'can, could, must, should' },
  { code: 'n', english: 'noun', indonesian: 'kata benda', example: 'engineer, equipment, workshop' },
  { code: 'phr v', english: 'phrasal verb', indonesian: 'kata kerja frasa', example: 'break down, fill in, turn off' },
  { code: 'pl', english: 'plural', indonesian: 'bentuk jamak', example: 'clothes, glasses, scissors' },
  { code: 'prep', english: 'preposition', indonesian: 'kata depan', example: 'across, between, during' },
  { code: 'prep phr', english: 'prepositional phrase', indonesian: 'frasa preposisi', example: 'by post, by accident, in front of' },
  { code: 'pron', english: 'pronoun', indonesian: 'kata ganti', example: 'anyone, myself, theirs' },
  { code: 'v', english: 'verb', indonesian: 'kata kerja', example: 'deliver, design, repair' },
];

export interface BrAmPair {
  british: string;
  american: string;
  meaningId: string;
  pos: string;
  example: string;
}

export const BRITISH_AMERICAN_PAIRS: BrAmPair[] = [
  { british: 'autumn', american: 'fall', meaningId: 'musim gugur', pos: 'n', example: 'The new semester starts in autumn / fall.' },
  { british: 'biscuit', american: 'cookie', meaningId: 'biskuit / kue kering', pos: 'n', example: 'Would you like a biscuit / cookie with your tea?' },
  { british: 'bookshop', american: 'bookstore', meaningId: 'toko buku', pos: 'n', example: 'I bought an English dictionary at the bookshop / bookstore.' },
  { british: 'car park', american: 'parking lot', meaningId: 'tempat parkir mobil', pos: 'n', example: 'Leave the delivery van in the car park / parking lot.' },
  { british: 'centre', american: 'center', meaningId: 'pusat', pos: 'n', example: 'The training centre / center is near the station.' },
  { british: 'chemist', american: 'drugstore', meaningId: 'apotek / apoteker', pos: 'n', example: 'Buy first-aid supplies at the chemist / drugstore.' },
  { british: 'chips', american: 'French fries', meaningId: 'kentang goreng', pos: 'n pl', example: 'The café serves grilled chicken with chips / French fries.' },
  { british: 'colour', american: 'color', meaningId: 'warna', pos: 'n & v', example: 'Choose a bright colour / color for the safety sign.' },
  { british: 'driving licence', american: 'driver’s license', meaningId: 'surat izin mengemudi (SIM)', pos: 'n', example: 'A delivery driver must have a valid driving licence.' },
  { british: 'grey', american: 'gray', meaningId: 'abu-abu', pos: 'adj & n', example: 'All technicians wear grey / gray uniforms.' },
  { british: 'jewellery', american: 'jewelry', meaningId: 'perhiasan', pos: 'n', example: 'Do not wear loose jewellery near workshop machines.' },
  { british: 'kilogramme', american: 'kilogram', meaningId: 'kilogram (kg)', pos: 'n', example: 'Weigh two kilogrammes / kilograms of flour.' },
  { british: 'kilometre', american: 'kilometer', meaningId: 'kilometer (km)', pos: 'n', example: 'The factory is five kilometres / kilometers away.' },
  { british: 'lift', american: 'elevator', meaningId: 'lift / eskalator vertikal', pos: 'n', example: 'Take the lift / elevator to the fourth floor.' },
  { british: 'litre', american: 'liter', meaningId: 'liter', pos: 'n', example: 'The engine needs four litres / liters of oil.' },
  { british: 'maths', american: 'math', meaningId: 'matematika', pos: 'n', example: 'Technical drawing requires good maths / math skills.' },
  { british: 'metre', american: 'meter', meaningId: 'meter', pos: 'n', example: 'Cut a three-metre / three-meter network cable.' },
  { british: 'mum', american: 'mom', meaningId: 'ibu / mama', pos: 'n', example: 'I called my mum / mom after my internship shift.' },
  { british: 'film / cinema', american: 'movie / movie theater', meaningId: 'film / bioskop', pos: 'n', example: 'We edited a short film / movie for our school project.' },
  { british: 'petrol / petrol station', american: 'gas / gas station', meaningId: 'bensin / SPBU', pos: 'n', example: 'Stop at the petrol station / gas station before the trip.' },
  { british: 'practice (n)', american: 'practise (n/v)', meaningId: 'latihan / praktik', pos: 'n', example: 'Daily speaking practice improves your confidence.' },
  { british: 'rubber', american: 'eraser', meaningId: 'penghapus pensil', pos: 'n', example: 'Use a rubber / eraser to clean the blueprint sketch.' },
  { british: 'swimming costume', american: 'bathing suit', meaningId: 'baju renang', pos: 'n', example: 'Guests need a swimming costume for the hotel pool.' },
  { british: 'theatre', american: 'theater', meaningId: 'teater / gedung pertunjukan', pos: 'n', example: 'The graduation ceremony is at the city theatre.' },
  { british: 'tyre', american: 'tire', meaningId: 'ban kendaraan', pos: 'n', example: 'Check the tyre / tire pressure before driving.' },
];

export const APPENDIX_1_WORD_SETS = {
  cardinalNumbers: [
    'one (1)', 'two (2)', 'three (3)', 'four (4)', 'five (5)', 'six (6)', 'seven (7)', 'eight (8)', 'nine (9)', 'ten (10)',
    'eleven (11)', 'twelve (12)', 'fifteen (15)', 'twenty (20)', 'thirty (30)', 'forty (40)', 'fifty (50)',
    'one hundred (100)', 'five hundred (500)', 'one thousand (1,000)',
  ],
  ordinalNumbers: [
    'first (1st)', 'second (2nd)', 'third (3rd)', 'fourth (4th)', 'fifth (5th)', 'sixth (6th)', 'seventh (7th)',
    'eighth (8th)', 'ninth (9th)', 'tenth (10th)', 'twelfth (12th)', 'twentieth (20th)', 'twenty-first (21st)', 'thirty-first (31st)',
  ],
  daysOfWeek: [
    { en: 'Monday', id: 'Senin' },
    { en: 'Tuesday', id: 'Selasa' },
    { en: 'Wednesday', id: 'Rabu' },
    { en: 'Thursday', id: 'Kamis' },
    { en: 'Friday', id: 'Jumat' },
    { en: 'Saturday', id: 'Sabtu' },
    { en: 'Sunday', id: 'Minggu' },
  ],
  monthsOfYear: [
    { en: 'January', id: 'Januari' }, { en: 'February', id: 'Februari' }, { en: 'March', id: 'Maret' },
    { en: 'April', id: 'April' }, { en: 'May', id: 'Mei' }, { en: 'June', id: 'Juni' },
    { en: 'July', id: 'Juli' }, { en: 'August', id: 'Agustus' }, { en: 'September', id: 'September' },
    { en: 'October', id: 'Oktober' }, { en: 'November', id: 'November' }, { en: 'December', id: 'Desember' },
  ],
  seasons: [
    { en: 'spring', id: 'musim semi' },
    { en: 'summer', id: 'musim panas' },
    { en: 'autumn (Br) / fall (Am)', id: 'musim gugur' },
    { en: 'winter', id: 'musim dingin' },
  ],
  continents: [
    { en: 'Africa', id: 'Afrika' }, { en: 'Antarctica', id: 'Antartika' }, { en: 'Asia', id: 'Asia' },
    { en: 'Australia', id: 'Australia' }, { en: 'Europe', id: 'Eropa' },
    { en: 'North America', id: 'Amerika Utara' }, { en: 'South America', id: 'Amerika Selatan' },
  ],
  countriesNationalities: [
    { country: 'Indonesia', nationality: 'Indonesian', id: 'Indonesia' },
    { country: 'United Kingdom / Britain', nationality: 'British', id: 'Inggris / Britania' },
    { country: 'United States', nationality: 'American', id: 'Amerika Serikat' },
    { country: 'Australia', nationality: 'Australian', id: 'Australia' },
    { country: 'Brazil', nationality: 'Brazilian', id: 'Brasil' },
    { country: 'Canada', nationality: 'Canadian', id: 'Kanada' },
    { country: 'China', nationality: 'Chinese', id: 'Tiongkok' },
    { country: 'France', nationality: 'French', id: 'Prancis' },
    { country: 'Ireland', nationality: 'Irish', id: 'Irlandia' },
    { country: 'India', nationality: 'Indian', id: 'India' },
    { country: 'Italy', nationality: 'Italian', id: 'Italia' },
    { country: 'Japan', nationality: 'Japanese', id: 'Jepang' },
    { country: 'Spain', nationality: 'Spanish', id: 'Spanyol' },
  ],
};
