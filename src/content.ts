// Ruh hallerine göre seçilmiş ayet ve hadisler.
// ÖNEMLİ: Metinler elle derlenmiş, sabit bir listedir; yapay zekâ ile üretilmez.
// Ayet mealleri Diyanet İşleri Başkanlığı mealine yakın özetlerdir. Yayına almadan
// önce her metni kuran.diyanet.gov.tr ve hadislerin.diyanet.gov.tr üzerinden
// bir ilahiyatçıya kontrol ettirmeniz önerilir.

export type MoodId = 'huzun' | 'kaygi' | 'ofke' | 'ozlem' | 'nese' | 'huzur';

export type Mood = {
  id: MoodId;
  label: string;
  emoji: string;
  color: string;
  description: string;
};

export type Ayah = { kind: 'ayet'; text: string; surah: string; surahNo: number; ayah: string };
export type Hadith = { kind: 'hadis'; text: string; source: string };
export type Item = Ayah | Hadith;

export const MOODS: Record<MoodId, Mood> = {
  huzun: { id: 'huzun', label: 'Hüzünlü', emoji: '🌧️', color: '#4A6FA5', description: 'Kalbin biraz ağır görünüyor.' },
  kaygi: { id: 'kaygi', label: 'Kaygılı', emoji: '🌪️', color: '#7B6D8D', description: 'Zihnin meşgul, için rahat değil gibi.' },
  ofke: { id: 'ofke', label: 'Öfkeli', emoji: '🔥', color: '#B5483B', description: 'İçinde bir gerginlik, bir hırs var.' },
  ozlem: { id: 'ozlem', label: 'Özlem / Yalnızlık', emoji: '🌙', color: '#3E5C76', description: 'Birini ya da bir şeyi özlüyorsun.' },
  nese: { id: 'nese', label: 'Neşeli', emoji: '☀️', color: '#D08C2F', description: 'Enerjin yüksek, keyfin yerinde.' },
  huzur: { id: 'huzur', label: 'Huzurlu', emoji: '🍃', color: '#4F8A6B', description: 'Sakin ve dingin bir haldesin.' },
};

const a = (surah: string, surahNo: number, ayah: string, text: string): Ayah => ({ kind: 'ayet', surah, surahNo, ayah, text });
const h = (source: string, text: string): Hadith => ({ kind: 'hadis', source, text });

export const CONTENT: Record<MoodId, Item[]> = {
  huzun: [
    a('İnşirâh', 94, '5-6', 'Şüphesiz güçlükle beraber bir kolaylık vardır. Evet, güçlükle beraber bir kolaylık vardır.'),
    a('Duhâ', 93, '3', 'Rabbin seni terk etmedi, sana darılmadı da.'),
    a('Tevbe', 9, '40', 'Üzülme, çünkü Allah bizimle beraberdir.'),
    a('Yûsuf', 12, '86', '(Yakup) dedi ki: "Ben derdimi ve hüznümü yalnızca Allah\'a arz ediyorum."'),
    a('Bakara', 2, '286', 'Allah hiç kimseyi gücünün yetmediği bir şeyle yükümlü kılmaz.'),
    h('Buhârî, Merdâ 1; Müslim, Birr 52', 'Müslümanın başına gelen hiçbir yorgunluk, hastalık, keder, üzüntü, eziyet ve gam yoktur ki, ayağına batan bir diken bile olsa, Allah onu günahlarına kefaret kılmasın.'),
    h('Buhârî, Daavât 36', 'Allah\'ım! Kederden ve hüzünden, acizlikten ve tembellikten sana sığınırım.'),
  ],
  kaygi: [
    a('Ra\'d', 13, '28', 'Bilesiniz ki kalpler ancak Allah\'ı anmakla huzur bulur.'),
    a('Talâk', 65, '3', 'Kim Allah\'a tevekkül ederse, O ona yeter.'),
    a('Bakara', 2, '216', 'Hoşunuza gitmeyen bir şey sizin için hayırlı olabilir; hoşunuza giden bir şey de sizin için kötü olabilir. Allah bilir, siz bilmezsiniz.'),
    a('Tâhâ', 20, '25-26', '(Musa) dedi ki: "Rabbim! Göğsümü genişlet, işimi bana kolaylaştır."'),
    a('Bakara', 2, '186', 'Kullarım sana beni sorduklarında (söyle onlara): Ben çok yakınım. Bana dua ettiğinde dua edenin dileğine karşılık veririm.'),
    h('Müslim, Zühd 64', 'Müminin durumu ne hoştur! Her hâli kendisi için hayırlıdır. Sevindirici bir şeyle karşılaşırsa şükreder, bu onun için hayır olur. Başına bir sıkıntı gelirse sabreder, bu da onun için hayır olur.'),
    h('Tirmizî, Daavât 89', 'Ey kalpleri evirip çeviren Allah\'ım! Kalbimi dinin üzere sabit kıl.'),
  ],
  ofke: [
    a('Âl-i İmrân', 3, '134', '(Takva sahipleri) bollukta ve darlıkta Allah yolunda harcayan, öfkelerini yenen ve insanları affeden kimselerdir. Allah iyilik yapanları sever.'),
    a('Fussilet', 41, '34', 'İyilik ile kötülük bir olmaz. Sen kötülüğü en güzel bir şekilde sav. O zaman seninle arasında düşmanlık bulunan kimse sanki sıcak bir dost olur.'),
    a('Şûrâ', 42, '43', 'Kim sabreder ve bağışlarsa, şüphesiz bu, azim gerektiren işlerdendir.'),
    a('Enfâl', 8, '46', 'Sabredin. Şüphesiz Allah sabredenlerle beraberdir.'),
    h('Buhârî, Edeb 76; Müslim, Birr 107', 'Güçlü kimse, güreşte rakibini yenen değildir. Gerçek güçlü kimse, öfkelendiği zaman nefsine hâkim olandır.'),
    h('Buhârî, Edeb 76', 'Bir adam Peygamberimize "Bana öğüt ver" dedi. O da "Öfkelenme" buyurdu. Adam isteğini birkaç kez tekrarladı; her seferinde "Öfkelenme" buyurdu.'),
    h('Ebû Dâvûd, Edeb 4', 'Biriniz ayakta iken öfkelenirse otursun. Öfkesi geçerse ne âlâ; geçmezse yatsın.'),
  ],
  ozlem: [
    a('Kâf', 50, '16', 'Biz insana şah damarından daha yakınız.'),
    a('Bakara', 2, '152', 'Öyleyse siz beni anın ki ben de sizi anayım. Bana şükredin, sakın nankörlük etmeyin.'),
    a('Rûm', 30, '21', 'Kendileriyle huzura kavuşmanız için size kendi cinsinizden eşler yaratması ve aranızda sevgi ve merhamet var etmesi de O\'nun varlığının delillerindendir.'),
    a('Yûsuf', 12, '87', 'Allah\'ın rahmetinden ümit kesmeyin.'),
    a('Hadîd', 57, '23', '(Bu böyledir) ki elinizden çıkana üzülmeyesiniz ve Allah\'ın size verdiği şeylerle şımarmayasınız.'),
    h('Buhârî, Rikâk 3', 'Dünyada bir garip veya bir yolcu gibi ol.'),
    h('Buhârî, İman 7; Müslim, İman 71', 'Sizden biriniz kendisi için istediğini kardeşi için de istemedikçe (gerçek anlamda) iman etmiş olmaz.'),
  ],
  nese: [
    a('İbrâhîm', 14, '7', 'Andolsun, eğer şükrederseniz elbette size nimetimi artırırım.'),
    a('Rahmân', 55, '13', 'O hâlde Rabbinizin hangi nimetlerini yalanlarsınız?'),
    a('Nahl', 16, '18', 'Allah\'ın nimetlerini saymaya kalksanız onları sayamazsınız.'),
    a('Lokmân', 31, '18', 'Yeryüzünde böbürlenerek yürüme. Çünkü Allah, kendini beğenip övünen hiç kimseyi sevmez.'),
    h('Tirmizî, Birr 36', 'Kardeşini güler yüzle karşılaman sadakadır.'),
    h('Tirmizî, Birr 35; Ebû Dâvûd, Edeb 11', 'İnsanlara teşekkür etmeyen, Allah\'a da şükretmez.'),
    h('Buhârî, İlim 11; Müslim, Cihâd 8', 'Kolaylaştırınız, zorlaştırmayınız; müjdeleyiniz, nefret ettirmeyiniz.'),
  ],
  huzur: [
    a('Ra\'d', 13, '28', 'Onlar iman edenler ve kalpleri Allah\'ı anmakla huzura kavuşanlardır. Bilesiniz ki kalpler ancak Allah\'ı anmakla huzur bulur.'),
    a('Fecr', 89, '27-28', 'Ey huzura ermiş nefis! Sen O\'ndan razı, O da senden razı olarak Rabbine dön.'),
    a('Furkân', 25, '63', 'Rahmân\'ın kulları yeryüzünde vakar ve tevazu ile yürüyen kimselerdir. Cahiller onlara laf attığında "selâm" der geçerler.'),
    a('Fetih', 48, '4', 'İmanlarını kat kat artırsınlar diye müminlerin kalplerine huzur ve güven indiren O\'dur.'),
    h('Buhârî, Rikâk 15; Müslim, Zekât 120', 'Zenginlik mal çokluğu değildir. Gerçek zenginlik gönül zenginliğidir.'),
    h('Müslim, Zühd 9', 'Kendinizden aşağıdakine bakın, üstünüzdekine bakmayın. Bu, Allah\'ın size verdiği nimeti küçümsememeniz için daha uygundur.'),
    h('Müslim, Birr 34', 'Allah sizin suretlerinize ve mallarınıza bakmaz; ancak kalplerinize ve amellerinize bakar.'),
  ],
};

/** Gün ve ruh haline göre karışık ama tekrar edilebilir bir seçim yapar. */
export function pickItems(mood: MoodId, seed: number, count = 3): Item[] {
  const list = [...CONTENT[mood]];
  let s = seed || 1;
  for (let i = list.length - 1; i > 0; i--) {
    s = (s * 9301 + 49297) % 233280;
    const j = Math.floor((s / 233280) * (i + 1));
    [list[i], list[j]] = [list[j], list[i]];
  }
  // En az bir ayet ve bir hadis olsun
  const ayet = list.find((x) => x.kind === 'ayet')!;
  const hadis = list.find((x) => x.kind === 'hadis')!;
  const rest = list.filter((x) => x !== ayet && x !== hadis);
  return [ayet, hadis, ...rest].slice(0, count);
}

/** Ayetin farklı meallerle karşılaştırılabileceği sayfa (hadisler için kaynak metinde verilir). */
export function ayahLink(item: Ayah): string {
  const first = item.ayah.split('-')[0];
  return `https://acikkuran.com/${item.surahNo}/${first}`;
}
