// Ruh hâlleri ve her hâle uygun ayet/hadis listesi.
//
// AYETLER: Burada yalnızca sure/ayet numarası (ve istenirse meal içinden birebir bir kesit) tutulur.
// Meal metni ve Arapça metin, `npm run ayat` ile Diyanet İşleri meali verisinden (tanzil.net, quran-json
// paketi) src/data/ayat.json dosyasına üretilir. Kesitler o metinde kelimesi kelimesine geçmek zorundadır;
// geçmezse betik hata verir. Yani uygulamada gösterilen meal, Diyanet metninin aynısıdır.
//
// HADİSLER: Elle derlenmiştir ve meal özeti niteliğindedir; kaynak gösterilir. Yayına almadan önce
// hadislerin metin ve kaynaklarını bir ilahiyatçıya kontrol ettirin.
//
// HÂL LİSTESİ şu üç kaynağın birleşimine dayanır:
//  - Geneva Emotional Music Scale (Zentner, Grandjean & Scherer, 2008): müziğin uyandırdığı 9 duygu
//  - Cowen, Fang, Sauter & Keltner (PNAS, 2020): müziğin uyandırdığı 13 duygu boyutu
//  - Gazâlî, İhyâ-u Ulûmi'd-Dîn, Münciyât ve Mühlikât bölümleri (kalp hâlleri)

export type MoodId =
  // Zor anlar
  | 'huzun' | 'yas' | 'ayrilik' | 'kaygi' | 'korku' | 'ofke' | 'kirginlik' | 'kiskanclik'
  | 'umutsuzluk' | 'yalnizlik' | 'yorgunluk' | 'pismanlik' | 'isyan'
  // Gönül
  | 'ozlem' | 'ask' | 'sefkat' | 'dostluk' | 'aile'
  // Canlılık
  | 'nese' | 'cosku' | 'guc' | 'sukur' | 'umut'
  // Derinlik ve dinginlik
  | 'huzur' | 'hayranlik' | 'hayal' | 'varolus' | 'sezgi' | 'arayis' | 'kararsizlik' | 'sevk';

export type MoodGroup = 'zor' | 'gonul' | 'canli' | 'derin';

export const GROUPS: { id: MoodGroup; label: string }[] = [
  { id: 'zor', label: 'Zor anlar' },
  { id: 'gonul', label: 'Gönül' },
  { id: 'canli', label: 'Canlılık' },
  { id: 'derin', label: 'Derinlik ve dinginlik' },
];

export type Mood = {
  id: MoodId;
  group: MoodGroup;
  label: string;
  emoji: string;
  color: string;
  description: string;
};

export type Ayah = { kind: 'ayet'; surahNo: number; ayah: string; excerpt?: string };
export type Hadith = { kind: 'hadis'; text: string; source: string };
export type Item = Ayah | Hadith;

const m = (id: MoodId, group: MoodGroup, label: string, emoji: string, color: string, description: string): Mood =>
  ({ id, group, label, emoji, color, description });

export const MOODS: Record<MoodId, Mood> = {
  huzun: m('huzun', 'zor', 'Hüzün', '🌧️', '#4A6FA5', 'Kalbin biraz ağır görünüyor.'),
  yas: m('yas', 'zor', 'Yas / Kayıp', '🖤', '#3B3F4A', 'Birini ya da bir şeyi kaybetmenin acısını taşıyorsun.'),
  ayrilik: m('ayrilik', 'zor', 'Ayrılık', '💔', '#8C3B4F', 'Bir ilişkinin, bir bağın bitişini yaşıyorsun.'),
  kaygi: m('kaygi', 'zor', 'Kaygı', '🌪️', '#7B6D8D', 'Zihnin meşgul, için rahat değil gibi.'),
  korku: m('korku', 'zor', 'Korku', '🌑', '#3F3A56', 'Bir şeyden çekiniyor, tedirgin oluyorsun.'),
  ofke: m('ofke', 'zor', 'Öfke', '🔥', '#B5483B', 'İçinde bir gerginlik, bir hırs var.'),
  kirginlik: m('kirginlik', 'zor', 'Kırgınlık', '🩹', '#8A6A5C', 'Birisi seni incitmiş, içinde bir küskünlük var.'),
  kiskanclik: m('kiskanclik', 'zor', 'Kıskançlık', '🍋', '#7D8B3A', 'Başkasında olana gözün takılmış olabilir.'),
  umutsuzluk: m('umutsuzluk', 'zor', 'Çaresizlik', '🕳️', '#4B4E5C', 'Bir çıkış yolu göremiyormuş gibisin.'),
  yalnizlik: m('yalnizlik', 'zor', 'Yalnızlık', '🕯️', '#55606E', 'Kendini biraz yalnız hissediyorsun.'),
  yorgunluk: m('yorgunluk', 'zor', 'Yorgunluk', '🌫️', '#6B7A80', 'Bedenin ya da ruhun biraz tükenmiş.'),
  pismanlik: m('pismanlik', 'zor', 'Pişmanlık', '🥀', '#6E4F5E', 'Geçmişte kalan bir şey içini sızlatıyor.'),
  isyan: m('isyan', 'zor', 'İsyan', '✊', '#9E3D2C', 'Haksızlığa, düzene, kurallara kafa tutuyorsun.'),

  ozlem: m('ozlem', 'gonul', 'Özlem', '🌙', '#3E5C76', 'Birini, bir yeri ya da bir zamanı özlüyorsun.'),
  ask: m('ask', 'gonul', 'Aşk', '❤️', '#B03A5B', 'Kalbin birine ya da bir şeye bağlanmış.'),
  sefkat: m('sefkat', 'gonul', 'Şefkat', '🤲', '#B5717B', 'İçinde bir yumuşaklık, korumak isteği var.'),
  dostluk: m('dostluk', 'gonul', 'Dostluk', '🤝', '#C0763A', 'Sevdiklerinle bir arada olmanın havası var.'),
  aile: m('aile', 'gonul', 'Aile', '🏡', '#A0674B', 'Annen, baban, yuvan aklında.'),

  nese: m('nese', 'canli', 'Neşe', '☀️', '#D08C2F', 'Keyfin yerinde, yüzün gülüyor.'),
  cosku: m('cosku', 'canli', 'Coşku / Enerji', '⚡', '#D0632F', 'Enerjin tavan, harekete geçmek istiyorsun.'),
  guc: m('guc', 'canli', 'Güç / Zafer', '🏆', '#9C7A1E', 'Kendini güçlü, kazanmış hissediyorsun.'),
  sukur: m('sukur', 'canli', 'Şükür', '🌾', '#8A8A2E', 'Sahip olduklarının farkındasın.'),
  umut: m('umut', 'canli', 'Umut', '🌅', '#C9874B', 'Yeni bir başlangıca hazırlanıyorsun.'),

  huzur: m('huzur', 'derin', 'Huzur', '🍃', '#4F8A6B', 'Sakin ve dingin bir hâldesin.'),
  hayranlik: m('hayranlik', 'derin', 'Hayranlık', '✨', '#3C6E8F', 'Güzelliğe, yaratılışa hayret ediyorsun.'),
  hayal: m('hayal', 'derin', 'Hayal / Dalgınlık', '☁️', '#7C8FB0', 'Aklın bulutlarda, hayallere dalmışsın.'),
  varolus: m('varolus', 'derin', 'Varoluş', '🌌', '#2E3A59', 'Hayatın anlamını, nereden gelip nereye gittiğini düşünüyorsun.'),
  sezgi: m('sezgi', 'derin', 'Sezgi', '🔮', '#5B4B8A', 'İç sesine, kalbine kulak veriyorsun.'),
  arayis: m('arayis', 'derin', 'Arayış', '🧭', '#4A6B6B', 'Bir yol, bir yön, kendini arıyorsun.'),
  kararsizlik: m('kararsizlik', 'derin', 'Kararsızlık', '⚖️', '#6A6F7A', 'İki yol arasında kalmışsın.'),
  sevk: m('sevk', 'derin', 'Manevi Coşku', '🕌', '#2F6B5A', 'Kalbin Rabbine doğru bir şevkle çarpıyor.'),
};

const a = (surahNo: number, ayah: string, excerpt?: string): Ayah => ({ kind: 'ayet', surahNo, ayah, excerpt });
const h = (source: string, text: string): Hadith => ({ kind: 'hadis', source, text });

// Sık kullanılan hadisler
const H = {
  mumininHali: h('Müslim, Zühd 64', 'Müminin durumu ne hoştur! Her hâli kendisi için hayırlıdır. Sevindirici bir şeyle karşılaşırsa şükreder, bu onun için hayır olur. Başına bir sıkıntı gelirse sabreder, bu da onun için hayır olur.'),
  kudsiYakinlik: h('Buhârî, Tevhîd 15; Müslim, Zikir 2', 'Allah buyuruyor ki: "Ben kulumun beni zannı üzereyim. O beni andığı zaman onunla beraberim. Bana bir karış yaklaşana ben bir arşın yaklaşırım; bana yürüyerek gelene ben koşarak gelirim." (Kudsî hadis)'),
  rahmet: h('Buhârî, Tevhîd 15; Müslim, Tevbe 14', 'Allah buyuruyor ki: "Rahmetim gazabımı geçmiştir." (Kudsî hadis)'),
  fidan: h('Ahmed b. Hanbel, Müsned 3/191; Buhârî, el-Edebü\'l-müfred 479', 'Kıyamet kopuyor olsa bile, birinizin elinde bir fidan varsa ve onu dikmeye gücü yetiyorsa, diksin.'),
  sevdigiIle: h('Buhârî, Edeb 96; Müslim, Birr 165', 'Kişi sevdiği ile beraberdir.'),
  guclu: h('Buhârî, Edeb 76; Müslim, Birr 107', 'Güçlü kimse, güreşte rakibini yenen değildir. Gerçek güçlü kimse, öfkelendiği zaman nefsine hâkim olandır.'),
  aileyeHayirli: h('Tirmizî, Menâkıb 63', 'Sizin en hayırlınız, ailesine karşı en hayırlı olanınızdır.'),
  asagiyaBak: h('Müslim, Zühd 9', 'Kendinizden aşağıdakine bakın, üstünüzdekine bakmayın. Bu, Allah\'ın size verdiği nimeti küçümsememeniz için daha uygundur.'),
  teskkur: h('Tirmizî, Birr 35; Ebû Dâvûd, Edeb 11', 'İnsanlara teşekkür etmeyen, Allah\'a da şükretmez.'),
  supheyiBirak: h('Tirmizî, Kıyâmet 60; Nesâî, Eşribe 50', 'Sana şüphe veren şeyi bırak, şüphe vermeyene bak.'),
  izzet: h('Müslim, Birr 69', 'Sadaka maldan bir şey eksiltmez. Allah, affeden kulun ancak izzetini artırır. Allah için alçakgönüllü olanı Allah yükseltir.'),
  gucluMumin: h('Müslim, Kader 34', 'Güçlü mümin, Allah katında zayıf müminden daha hayırlı ve daha sevimlidir; ama her birinde hayır vardır. Sana fayda verecek şeye sarıl, Allah\'tan yardım iste ve acizlik gösterme.'),
  garip: h('Buhârî, Rikâk 3', 'Dünyada bir garip veya bir yolcu gibi ol.'),
};

export const CONTENT: Record<MoodId, Item[]> = {
  // ───────── Zor anlar ─────────
  huzun: [
    a(94, '5-6'), a(93, '3'), a(12, '86'), a(3, '139'), a(15, '97-98'), a(2, '153'),
    h('Buhârî, Merdâ 1; Müslim, Birr 52', 'Müslümanın başına gelen hiçbir yorgunluk, hastalık, keder, üzüntü, eziyet ve gam yoktur ki, ayağına batan bir diken bile olsa, Allah onu günahlarına kefaret kılmasın.'),
    h('Buhârî, Daavât 36', 'Allah\'ım! Kederden ve hüzünden, acizlikten ve tembellikten sana sığınırım.'),
  ],
  yas: [
    a(2, '155-157'), a(55, '26-27'), a(29, '57'), a(3, '185', 'Her insan ölümü tadacaktır.'),
    h('Buhârî, Cenâiz 43; Müslim, Fezâil 62', 'Oğlu İbrahim vefat ettiğinde Peygamberimiz şöyle buyurdu: "Göz yaşarır, kalp hüzünlenir. Biz ise ancak Rabbimizin razı olacağı sözü söyleriz. Ey İbrahim! Senin ayrılığınla gerçekten hüzünlüyüz."'),
    h('Buhârî, Cenâiz 32; Müslim, Cenâiz 15', 'Asıl sabır, musibetin ilk geldiği andaki sabırdır.'),
  ],
  ayrilik: [
    a(2, '216', 'İhtimal ki hoşlanmadığınız şey sizin iyiliğinizedir ve ihtimal ki sevdiğiniz bir şey sizin kötülüğünüzedir. Siz bilmezsiniz, Allah bilir'),
    a(4, '130'), a(93, '4-5'), a(57, '23'), a(94, '5-6'),
    h('Tirmizî, Birr 60', 'Sevdiğini ölçülü sev; olur ki bir gün buğzettiğin olur. Buğzettiğine de ölçülü buğzet; olur ki bir gün sevdiğin olur.'),
    H.mumininHali,
  ],
  kaygi: [
    a(13, '28'), a(65, '3', 'Allah\'a güvenen kimseye O yeter.'), a(20, '25-26', 'Musa: "Rabbim! Göğsümü genişlet, işimi kolaylaştır'),
    a(2, '186'), a(9, '51'), a(3, '173', '"Allah bize yeter. O ne güzel Vekil\'dir" dediler'),
    H.mumininHali,
    h('Ebû Dâvûd, Edeb 101', 'Allah\'ım! Rahmetini umuyorum. Beni göz açıp kapayıncaya kadar bile nefsimle baş başa bırakma. Bütün işlerimi düzelt. Senden başka ilah yoktur.'),
    h('Tirmizî, Daavât 89', 'Ey kalpleri evirip çeviren Allah\'ım! Kalbimi dinin üzere sabit kıl.'),
  ],
  korku: [
    a(10, '62'), a(20, '46', 'Allah: Korkmayın, dedi; Ben sizinle beraberim; görür ve işitirim.'), a(41, '30', 'Korkmayınız, üzülmeyiniz'),
    a(3, '175'), a(9, '51'),
    h('Tirmizî, Kıyâmet 59', 'Bil ki bütün insanlar sana bir fayda vermek için bir araya gelseler, Allah\'ın senin için yazdığından başka bir fayda veremezler. Sana bir zarar vermek için bir araya gelseler, Allah\'ın senin için yazdığından başka bir zarar veremezler.'),
    h('Ebû Dâvûd, Edeb 110; İbn Mâce, Dua 14', 'Allah\'ım! Ayıplarımı ört, korktuklarımdan beni emin kıl.'),
  ],
  ofke: [
    a(3, '134'), a(41, '34'), a(42, '37', 'öfkelendiklerinde bile bağışlayanlar'), a(7, '199-200'),
    H.guclu,
    h('Buhârî, Edeb 76', 'Bir adam Peygamberimize "Bana öğüt ver" dedi. O da "Öfkelenme" buyurdu. Adam isteğini birkaç kez tekrarladı; her seferinde "Öfkelenme" buyurdu.'),
    h('Ebû Dâvûd, Edeb 4', 'Biriniz ayakta iken öfkelenirse otursun. Öfkesi geçerse ne âlâ; geçmezse yatsın.'),
  ],
  kirginlik: [
    a(24, '22', 'affetsinler, geçsinler. Allah\'ın sizi bağışlamasından hoşlanmaz mısınız? Allah bağışlayandır, merhametli olandır'),
    a(42, '40', 'Ama kim affeder ve barışırsa, onun ecri Allah\'a aittir.'),
    a(12, '92', 'Yusuf: "Bugün azarlanacak değilsiniz, Allah sizi bağışlar. O, merhametlilerin merhametlisidir.'),
    a(2, '263'), a(49, '10'),
    h('Buhârî, Edeb 62; Müslim, Birr 25', 'Bir müslümanın, din kardeşine üç günden fazla küs durması helal olmaz. Karşılaştıklarında biri bir yana, diğeri öbür yana döner. Bunların en hayırlısı, önce selam verendir.'),
    H.izzet,
  ],
  kiskanclik: [
    a(4, '32'), a(20, '131'),
    a(59, '10', 'Rabbimiz! Bizi ve bizden önce inanmış olan kardeşlerimizi bağışla; kalbimizde müminlere karşı kin bırakma; Rabbimiz! Şüphesiz Sen şefkatlisin, merhametlisin'),
    h('Buhârî, Edeb 57; Müslim, Birr 23', 'Birbirinize haset etmeyin, birbirinize kin tutmayın, birbirinize sırt çevirmeyin. Ey Allah\'ın kulları, kardeş olun.'),
    H.asagiyaBak,
    h('Buhârî, Rikâk 15; Müslim, Zekât 120', 'Zenginlik mal çokluğu değildir. Gerçek zenginlik gönül zenginliğidir.'),
  ],
  umutsuzluk: [
    a(39, '53'), a(12, '87', 'Allah\'ın rahmetinden ümidinizi kesmeyin'),
    a(15, '56', 'Zaten sapıklardan başka kim Rabbinin rahmetinden umudunu keser!'),
    a(2, '214', 'iyi bilin ki Allah\'ın yardımı şüphesiz yakındır'), a(94, '5-6'),
    H.rahmet, H.fidan,
  ],
  yalnizlik: [
    a(50, '16'), a(57, '4', 'Nerede olursanız olun, O, sizinle beraberdir.'), a(93, '6-8'), a(2, '152'), a(2, '186'),
    H.kudsiYakinlik,
    h('Müslim, İman 232', 'İslam garip başladı ve başladığı gibi yine garip olacaktır. Ne mutlu o gariplere!'),
    H.garip,
  ],
  yorgunluk: [
    a(2, '286', 'Allah kişiye ancak gücünün yeteceği kadar yükler'), a(94, '7-8'), a(20, '2'), a(78, '9'),
    a(2, '45', 'Sabır ve namazla Allah\'a sığınıp yardım isteyin'),
    h('Buhârî, Savm 51', 'Rabbinin senin üzerinde hakkı vardır, nefsinin senin üzerinde hakkı vardır, ailenin de senin üzerinde hakkı vardır. Her hak sahibine hakkını ver.'),
    h('Buhârî, Rikâk 18; Müslim, Müsâfirîn 216', 'Allah katında amellerin en sevimlisi, az da olsa devamlı olanıdır.'),
    h('Buhârî, İman 29', 'Bu din kolaylıktır. Kim dini zorlaştırırsa din ona galip gelir. Orta yolu tutun, mükemmele yaklaşmaya çalışın ve müjdeleyin.'),
  ],
  pismanlik: [
    a(7, '23'), a(25, '70'), a(11, '114', 'Doğrusu iyilikler kötülükleri giderir.'), a(3, '135'), a(4, '110'),
    a(66, '8', 'Ey inananlar! Yürekten tevbe ederek Allah\'a dönün ki, Rabbiniz kötülüklerinizi örtsün'),
    h('Tirmizî, Kıyâmet 49; İbn Mâce, Zühd 30', 'Her insan hata eder. Hata edenlerin en hayırlısı ise tövbe edenlerdir.'),
    h('İbn Mâce, Zühd 30', 'Pişmanlık tövbedir.'),
    h('Tirmizî, Birr 55', 'Nerede olursan ol Allah\'tan kork. Kötülüğün ardından bir iyilik yap ki onu silsin. İnsanlara güzel ahlakla davran.'),
  ],
  isyan: [
    a(4, '135', 'Ey İnananlar! Kendiniz, ana babanız ve yakınlarınız aleyhlerine de olsa, Allah için şahit olarak adaleti gözetin'),
    a(5, '8', 'Bir topluluğa olan öfkeniz sizi adaletsizliğe sürüklemesin; adil olun'),
    a(11, '112'), a(17, '37'),
    h('Ebû Dâvûd, Melâhim 17; Tirmizî, Fiten 13', 'Cihadın en faziletlisi, zalim bir yöneticinin yanında hakkı söylemektir.'),
    h('Buhârî, Mezâlim 4', '"Zalim de olsa mazlum da olsa kardeşine yardım et." "Ey Allah\'ın Resulü! Mazluma yardım ederiz; ama zalime nasıl yardım ederiz?" "Onu zulümden alıkoyarsın."'),
    H.guclu,
  ],

  // ───────── Gönül ─────────
  ozlem: [
    a(12, '84'), a(12, '94', 'Doğrusu ben Yusuf\'un kokusunu duyuyorum'), a(12, '87', 'Allah\'ın rahmetinden ümidinizi kesmeyin'),
    a(2, '156'), a(89, '27-30'),
    h('Buhârî, Zekât 54; Müslim, Hac 462', 'Uhud, bizi seven ve bizim de kendisini sevdiğimiz bir dağdır.'),
    H.sevdigiIle,
  ],
  ask: [
    a(30, '21'), a(3, '31'), a(85, '14'), a(19, '96'), a(20, '39', 'Gözümün önünde yetişesin diye seni sevimli kıldım'),
    h('Tirmizî, Daavât 72', 'Allah\'ım! Senden seni sevmeyi, seni sevenleri sevmeyi ve beni senin sevgine ulaştıracak amelleri sevmeyi isterim.'),
    H.aileyeHayirli, H.sevdigiIle,
  ],
  sefkat: [
    a(21, '107'), a(9, '128'), a(17, '24'), a(90, '17'),
    a(3, '159', 'Allah\'ın rahmetinden dolayı, sen onlara karşı yumuşak davrandın. Eğer kaba ve katı kalbli olsaydın, şüphesiz etrafından dağılır giderlerdi.'),
    h('Buhârî, Edeb 18; Müslim, Fezâil 65', 'Merhamet etmeyene merhamet olunmaz.'),
    h('Tirmizî, Birr 16', 'Merhamet edenlere Rahmân da merhamet eder. Yeryüzündekilere merhamet edin ki göktekiler de size merhamet etsin.'),
    h('Tirmizî, Birr 15', 'Küçüklerimize merhamet etmeyen, büyüklerimize saygı göstermeyen bizden değildir.'),
  ],
  dostluk: [
    a(49, '10'), a(43, '67'),
    a(25, '27-28', 'O gün, zalim kimse ellerini ısırıp: "Keşke Peygamberle beraber bir yol tutsaydım, vay başıma gelene; keşke falancayı dost edinmeseydim.'),
    a(18, '28', 'Sabah akşam Rablerinin rızasını dileyerek O\'na yalvaranlarla beraber sen de sabret.'),
    h('Buhârî, Büyû 38; Müslim, Birr 146', 'İyi arkadaş ile kötü arkadaşın durumu, misk taşıyan ile körük üfleyen kimsenin durumu gibidir. Misk taşıyan ya sana ondan verir, ya sen ondan satın alırsın ya da ondan güzel bir koku duyarsın. Körük üfleyen ise ya elbiseni yakar ya da ondan kötü bir koku duyarsın.'),
    h('Ebû Dâvûd, Edeb 16; Tirmizî, Zühd 45', 'Kişi dostunun dini üzeredir. Öyleyse her biriniz kiminle dost olduğuna baksın.'),
    h('Buhârî, Edeb 27; Müslim, Birr 66', 'Müminler birbirlerini sevmekte, birbirlerine merhamet etmekte ve şefkat göstermekte bir vücut gibidir. Vücudun bir organı rahatsız olursa, diğer organlar da uykusuzluk ve ateşle bu rahatsızlığa ortak olur.'),
    h('Buhârî, İman 7; Müslim, İman 71', 'Sizden biriniz kendisi için istediğini kardeşi için de istemedikçe (gerçek anlamda) iman etmiş olmaz.'),
  ],
  aile: [
    a(17, '23'), a(17, '24'), a(31, '14'), a(25, '74'), a(14, '41'),
    h('Buhârî, Edeb 2; Müslim, Birr 1', 'Bir adam: "Ey Allah\'ın Resulü! İyilik etmeme en layık kimdir?" diye sordu. "Annen" buyurdu. "Sonra kim?" dedi. "Annen" buyurdu. "Sonra kim?" dedi. "Annen" buyurdu. "Sonra kim?" dedi. "Baban" buyurdu.'),
    H.aileyeHayirli,
  ],

  // ───────── Canlılık ─────────
  nese: [
    a(10, '58'), a(93, '11'), a(16, '18'), a(55, '13'),
    h('Tirmizî, Birr 36', 'Kardeşini güler yüzle karşılaman sadakadır.'),
    h('Buhârî, İlim 11; Müslim, Cihâd 8', 'Kolaylaştırınız, zorlaştırmayınız; müjdeleyiniz, nefret ettirmeyiniz.'),
    h('Tirmizî, Birr 57', 'Peygamberimiz: "Ben de şaka yaparım; ama doğrudan başka bir şey söylemem" buyurdu.'),
  ],
  cosku: [
    a(3, '133'), a(2, '148', 'Hayırlı işlerde birbirinizle yarışın.'), a(53, '39'), a(94, '7-8'), a(62, '10'),
    H.gucluMumin, H.fidan,
  ],
  guc: [
    a(3, '160'), a(110, '1-3'), a(17, '37'),
    a(28, '77', 'Allah\'ın sana verdiği şeylerde, ahiret yurdunu gözet, dünyadaki payını da unutma; Allah\'ın sana yaptığı iyilik gibi, sen de iyilik yap'),
    H.gucluMumin, H.guclu, H.izzet,
  ],
  sukur: [
    a(14, '7'), a(16, '18'), a(2, '152'), a(31, '12', 'Şükreden kimse ancak kendisi için şükretmiş olur.'), a(93, '11'),
    H.teskkur, H.asagiyaBak, H.mumininHali,
  ],
  umut: [
    a(39, '53'), a(3, '139'),
    a(65, '2', 'Allah, kendisine karşı gelmekten sakınan kimseye kurtuluş yolu sağlar, ona beklemediği yerden rızık verir.'),
    a(94, '5-6'), a(7, '56', 'Allah\'a korkarak ve umutla yalvarın. Doğrusu Allah\'ın rahmeti iyi davrananlara yakındır'), a(93, '4-5'),
    H.rahmet, H.fidan, H.kudsiYakinlik,
  ],

  // ───────── Derinlik ve dinginlik ─────────
  huzur: [
    a(13, '28'), a(89, '27-30'), a(25, '63'),
    a(48, '4', 'İnananların, imanlarını kat kat artırmaları için, kalblerine güven indiren O\'dur.'),
    h('Buhârî, Rikâk 15; Müslim, Zekât 120', 'Zenginlik mal çokluğu değildir. Gerçek zenginlik gönül zenginliğidir.'),
    H.asagiyaBak,
    h('Müslim, Birr 34', 'Allah sizin suretlerinize ve mallarınıza bakmaz; ancak kalplerinize ve amellerinize bakar.'),
  ],
  hayranlik: [
    a(3, '190-191'), a(67, '3-4'), a(88, '17-20'), a(41, '53'), a(51, '20-21'),
    a(24, '35', 'Allah göklerin ve yerin Nur\'udur.'),
    h('Müslim, İman 147', 'Allah güzeldir, güzelliği sever.'),
  ],
  hayal: [
    a(12, '4'), a(39, '42'), a(30, '23'),
    a(57, '20', 'Bilin ki, dünya hayatı oyun, oyalanma, süslenme, aranızda övünme ve daha çok mal ve çocuk sahibi olmaktan ibarettir.'),
    a(18, '46'),
    h('Buhârî, Rikâk 1', 'İki nimet vardır ki insanların çoğu onların kıymetini bilmez: Sağlık ve boş vakit.'),
    h('Buhârî, Bed\'ü\'l-halk 11; Müslim, Rü\'yâ 1', 'Güzel rüya Allah\'tandır; kötü rüya şeytandandır.'),
  ],
  varolus: [
    a(51, '56'), a(23, '115', 'Sizi boşuna yarattığımızı ve Bize döndürülmeyeceğinizi mi sandınız?'), a(67, '2'), a(75, '36'),
    a(103, '1-3'), a(55, '26-27'),
    h('Hâkim, el-Müstedrek 4/341', 'Beş şey gelmeden önce beş şeyin kıymetini bil: İhtiyarlıktan önce gençliğin, hastalıktan önce sağlığın, fakirlikten önce zenginliğin, meşguliyetten önce boş vaktin ve ölümden önce hayatın.'),
    h('Tirmizî, Kıyâmet 25', 'Akıllı kişi, nefsini hesaba çeken ve ölümden sonrası için çalışandır.'),
    h('Buhârî, Bed\'ü\'l-vahy 1; Müslim, İmâre 155', 'Ameller niyetlere göredir. Herkes niyetinin karşılığını alır.'),
  ],
  sezgi: [
    a(91, '7-10'), a(8, '29'), a(22, '46', 'Ama yalnız gözler kör olmaz, fakat göğüslerde olan kalbler de körleşir'),
    a(2, '269'), a(50, '16'), a(17, '85'),
    h('Buhârî, İman 39; Müslim, Müsâkât 107', 'Dikkat edin! Bedende bir et parçası vardır. O düzgün olursa bütün beden düzgün olur; o bozulursa bütün beden bozulur. Dikkat edin, o kalptir.'),
    h('Müslim, Birr 14', 'İyilik, güzel ahlaktır. Günah ise içini tırmalayan ve insanların bilmesinden hoşlanmadığın şeydir.'),
    H.supheyiBirak,
  ],
  arayis: [
    a(1, '6'), a(29, '69'), a(6, '79'), a(93, '7'), a(20, '114', '"Rabbim! ilmimi artır" de'),
    h('Müslim, Zikir 38', 'Kim ilim öğrenmek için bir yola girerse, Allah ona cennete giden yolu kolaylaştırır.'),
    H.kudsiYakinlik,
  ],
  kararsizlik: [
    a(3, '159', 'iş hakkında onlara danış, fakat karar verdin mi Allah\'a güven, doğrusu Allah güvenenleri sever'),
    a(2, '216', 'İhtimal ki hoşlanmadığınız şey sizin iyiliğinizedir ve ihtimal ki sevdiğiniz bir şey sizin kötülüğünüzedir. Siz bilmezsiniz, Allah bilir'),
    a(18, '23-24'), a(65, '3', 'Allah\'a güvenen kimseye O yeter.'), a(6, '59'),
    h('Buhârî, Teheccüd 25', 'Biriniz bir işe niyet ettiğinde iki rekât namaz kılsın, sonra şöyle desin: "Allah\'ım! İlminle senden hayır isterim, kudretinle senden güç isterim… Bu iş hakkımda hayırlıysa onu bana takdir et ve kolaylaştır; hayırlı değilse onu benden, beni de ondan uzaklaştır." (İstihare duası)'),
    H.supheyiBirak,
  ],
  sevk: [
    a(8, '2', 'İnananlar ancak, o kimselerdir ki Allah anıldığı zaman kalbleri titrer, ayetleri okunduğu zaman bu onların imanlarını artırır.'),
    a(39, '23', 'Rablerinden korkanların, bu Kitap\'tan tüyleri ürperir, sonra hem derileri ve hem de kalbleri Allah\'ın zikrine yumuşar ve yatışır.'),
    a(33, '41-42'), a(7, '205'),
    a(57, '16', 'İnananların gönüllerinin Allah\'ı anması ve O\'ndan inen gerçeğe içten bağlanması zamanı daha gelmedi mi?'),
    h('Nesâî, Sehv 62', 'Allah\'ım! Senden, yüzüne bakmanın lezzetini ve sana kavuşmanın şevkini isterim.'),
    h('Buhârî, Rikâk 41; Müslim, Zikir 14', 'Kim Allah\'a kavuşmayı severse, Allah da ona kavuşmayı sever.'),
  ],
};

/** Gün ve ruh hâline göre karışık ama tekrar edilebilir bir seçim yapar (en az bir ayet ve bir hadis). */
export function pickItems(mood: MoodId, seed: number, count = 3): Item[] {
  const list = [...CONTENT[mood]];
  let s = seed || 1;
  for (let i = list.length - 1; i > 0; i--) {
    s = (s * 9301 + 49297) % 233280;
    const j = Math.floor((s / 233280) * (i + 1));
    [list[i], list[j]] = [list[j], list[i]];
  }
  const ayet = list.find((x) => x.kind === 'ayet')!;
  const hadis = list.find((x) => x.kind === 'hadis')!;
  const rest = list.filter((x) => x !== ayet && x !== hadis);
  return [ayet, hadis, ...rest].slice(0, count);
}
