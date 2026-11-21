// Ruh hallerine göre seçilmiş ayet ve hadisler.
// ÖNEMLİ: Metinler elle derlenmiş, sabit bir listedir; yapay zekâ ile üretilmez.
// Ayet mealleri Diyanet İşleri Başkanlığı mealine yakın özetlerdir. Yayına almadan
// önce her metni kuran.diyanet.gov.tr ve hadislerin.diyanet.gov.tr üzerinden
// bir ilahiyatçıya kontrol ettirmeniz önerilir.

export type MoodId =
  | 'huzun' | 'kaygi' | 'ofke' | 'ozlem' | 'yalnizlik' | 'ask' | 'dostluk'
  | 'nese' | 'huzur' | 'varolus' | 'sezgi' | 'umut' | 'pismanlik' | 'yorgunluk';

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
  huzun: { id: 'huzun', label: 'Hüzün', emoji: '🌧️', color: '#4A6FA5', description: 'Kalbin biraz ağır görünüyor.' },
  kaygi: { id: 'kaygi', label: 'Kaygı', emoji: '🌪️', color: '#7B6D8D', description: 'Zihnin meşgul, için rahat değil gibi.' },
  ofke: { id: 'ofke', label: 'Öfke', emoji: '🔥', color: '#B5483B', description: 'İçinde bir gerginlik, bir hırs var.' },
  ozlem: { id: 'ozlem', label: 'Özlem', emoji: '🌙', color: '#3E5C76', description: 'Birini, bir yeri ya da bir zamanı özlüyorsun.' },
  yalnizlik: { id: 'yalnizlik', label: 'Yalnızlık', emoji: '🕯️', color: '#55606E', description: 'Kendini biraz yalnız hissediyorsun.' },
  ask: { id: 'ask', label: 'Aşk', emoji: '❤️', color: '#B03A5B', description: 'Kalbin birine ya da bir şeye bağlanmış.' },
  dostluk: { id: 'dostluk', label: 'Dostluk', emoji: '🤝', color: '#C0763A', description: 'Sevdiklerinle bir arada olmanın havası var.' },
  nese: { id: 'nese', label: 'Neşe', emoji: '☀️', color: '#D08C2F', description: 'Enerjin yüksek, keyfin yerinde.' },
  huzur: { id: 'huzur', label: 'Huzur', emoji: '🍃', color: '#4F8A6B', description: 'Sakin ve dingin bir hâldesin.' },
  varolus: { id: 'varolus', label: 'Varoluş', emoji: '🌌', color: '#2E3A59', description: 'Hayatın anlamını, nereden gelip nereye gittiğini düşünüyorsun.' },
  sezgi: { id: 'sezgi', label: 'Sezgi', emoji: '🔮', color: '#5B4B8A', description: 'İç sesine, kalbine kulak veriyorsun.' },
  umut: { id: 'umut', label: 'Umut', emoji: '🌅', color: '#C9874B', description: 'Yeni bir başlangıca hazırlanıyorsun.' },
  pismanlik: { id: 'pismanlik', label: 'Pişmanlık', emoji: '🥀', color: '#6E4F5E', description: 'Geçmişte kalan bir şey içini sızlatıyor.' },
  yorgunluk: { id: 'yorgunluk', label: 'Yorgunluk', emoji: '🌫️', color: '#6B7A80', description: 'Bedenin ya da ruhun biraz tükenmiş.' },
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
    a('Yûsuf', 12, '84', '(Yakup) "Ey Yusuf\'a olan hasretim!" dedi. Gözleri hüzünden ağardı; o, derdini içine gömüyordu.'),
    a('Yûsuf', 12, '87', 'Allah\'ın rahmetinden ümit kesmeyin.'),
    a('Bakara', 2, '156', 'Biz Allah\'a aitiz ve şüphesiz O\'na döneceğiz.'),
    a('Hadîd', 57, '23', '(Bu böyledir) ki elinizden çıkana üzülmeyesiniz ve Allah\'ın size verdiği şeylerle şımarmayasınız.'),
    h('Buhârî, Zekât 54; Müslim, Hac 462', 'Uhud, bizi seven ve bizim de kendisini sevdiğimiz bir dağdır.'),
    h('Buhârî, Edeb 96; Müslim, Birr 165', 'Kişi sevdiği ile beraberdir.'),
  ],
  yalnizlik: [
    a('Kâf', 50, '16', 'Biz insana şah damarından daha yakınız.'),
    a('Hadîd', 57, '4', 'Nerede olursanız olun, O sizinle beraberdir.'),
    a('Duhâ', 93, '6-8', 'O seni yetim bulup barındırmadı mı? Seni yolunu bilmez bulup doğru yola iletmedi mi? Seni yoksul bulup zengin etmedi mi?'),
    a('Bakara', 2, '152', 'Öyleyse siz beni anın ki ben de sizi anayım.'),
    h('Buhârî, Tevhîd 15; Müslim, Zikir 2', 'Allah buyuruyor ki: "Ben kulumun beni zannı üzereyim. O beni andığı zaman onunla beraberim. Bana bir karış yaklaşana ben bir arşın yaklaşırım; bana yürüyerek gelene ben koşarak gelirim." (Kudsî hadis)'),
    h('Müslim, İman 232', 'İslam garip başladı ve başladığı gibi yine garip olacaktır. Ne mutlu o gariplere!'),
    h('Buhârî, Rikâk 3', 'Dünyada bir garip veya bir yolcu gibi ol.'),
  ],
  ask: [
    a('Rûm', 30, '21', 'Kendileriyle huzura kavuşmanız için size kendi cinsinizden eşler yaratması ve aranızda sevgi ve merhamet var etmesi de O\'nun varlığının delillerindendir.'),
    a('Bakara', 2, '165', 'İman edenlerin Allah\'a olan sevgisi ise çok daha güçlüdür.'),
    a('Âl-i İmrân', 3, '31', 'De ki: "Eğer Allah\'ı seviyorsanız bana uyun ki Allah da sizi sevsin ve günahlarınızı bağışlasın."'),
    a('Bürûc', 85, '14', 'O, çok bağışlayandır, çok sevendir (Vedûd).'),
    h('Buhârî, Edeb 96; Müslim, Birr 165', 'Kişi sevdiği ile beraberdir.'),
    h('Tirmizî, Menâkıb 63', 'Sizin en hayırlınız, ailesine karşı en hayırlı olanınızdır.'),
    h('Tirmizî, Daavât 72', 'Allah\'ım! Senden seni sevmeyi, seni sevenleri sevmeyi ve beni senin sevgine ulaştıracak amelleri sevmeyi isterim.'),
  ],
  dostluk: [
    a('Hucurât', 49, '10', 'Müminler ancak kardeştir. Öyleyse kardeşlerinizin arasını düzeltin.'),
    a('Tevbe', 9, '71', 'Mümin erkekler ve mümin kadınlar birbirlerinin dostlarıdır.'),
    a('Mâide', 5, '2', 'İyilik ve takva üzerinde yardımlaşın; günah ve düşmanlık üzerinde yardımlaşmayın.'),
    a('Zuhruf', 43, '67', 'O gün, takva sahipleri dışındaki dostlar birbirlerine düşmandır.'),
    h('Buhârî, Büyû 38; Müslim, Birr 146', 'İyi arkadaş ile kötü arkadaşın durumu, misk taşıyan ile körük üfleyen kimsenin durumu gibidir. Misk taşıyan ya sana ondan verir, ya sen ondan satın alırsın ya da ondan güzel bir koku duyarsın. Körük üfleyen ise ya elbiseni yakar ya da ondan kötü bir koku duyarsın.'),
    h('Ebû Dâvûd, Edeb 16; Tirmizî, Zühd 45', 'Kişi dostunun dini üzeredir. Öyleyse her biriniz kiminle dost olduğuna baksın.'),
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
  varolus: [
    a('Zâriyât', 51, '56', 'Ben cinleri ve insanları ancak bana kulluk etsinler diye yarattım.'),
    a('Mü\'minûn', 23, '115', 'Sizi sadece boş yere yarattığımızı ve gerçekten bize döndürülmeyeceğinizi mi sandınız?'),
    a('Mülk', 67, '2', 'O, hanginizin daha güzel amel yapacağını sınamak için ölümü ve hayatı yaratandır.'),
    a('Âl-i İmrân', 3, '190-191', 'Göklerin ve yerin yaratılışında, gece ile gündüzün birbiri ardınca gelişinde akıl sahipleri için elbette ibretler vardır. Onlar … "Rabbimiz! Sen bunu boş yere yaratmadın" derler.'),
    a('Fussilet', 41, '53', 'Onlara ufuklarda ve kendi nefislerinde ayetlerimizi göstereceğiz; ta ki onun hak olduğu kendilerine apaçık belli olsun.'),
    h('Hâkim, el-Müstedrek 4/341', 'Beş şey gelmeden önce beş şeyin kıymetini bil: İhtiyarlıktan önce gençliğin, hastalıktan önce sağlığın, fakirlikten önce zenginliğin, meşguliyetten önce boş vaktin ve ölümden önce hayatın.'),
    h('Tirmizî, Kıyâmet 25', 'Akıllı kişi, nefsini hesaba çeken ve ölümden sonrası için çalışandır.'),
    h('Buhârî, Bed\'ü\'l-vahy 1; Müslim, İmâre 155', 'Ameller niyetlere göredir. Herkes niyetinin karşılığını alır.'),
  ],
  sezgi: [
    a('Şems', 91, '7-10', 'Nefse ve onu düzenleyene, sonra da ona kötülük ve takva kabiliyetini verene andolsun ki, nefsini arındıran kurtuluşa ermiş, onu kötülüklere gömen ise ziyana uğramıştır.'),
    a('Enfâl', 8, '29', 'Ey iman edenler! Allah\'a karşı gelmekten sakınırsanız, O size iyiyi kötüden ayırt etme yeteneği (furkan) verir.'),
    a('Hac', 22, '46', 'Gerçek şu ki gözler kör olmaz; fakat göğüslerdeki kalpler kör olur.'),
    a('Bakara', 2, '269', 'Allah hikmeti dilediğine verir. Kime hikmet verilmişse, ona pek çok hayır verilmiştir.'),
    a('Âl-i İmrân', 3, '159', 'Kararını verdiğin zaman da Allah\'a tevekkül et.'),
    h('Buhârî, İman 39; Müslim, Müsâkât 107', 'Dikkat edin! Bedende bir et parçası vardır. O düzgün olursa bütün beden düzgün olur; o bozulursa bütün beden bozulur. Dikkat edin, o kalptir.'),
    h('Müslim, Birr 14', 'İyilik, güzel ahlaktır. Günah ise içini tırmalayan ve insanların bilmesinden hoşlanmadığın şeydir.'),
    h('Tirmizî, Kıyâmet 60; Nesâî, Eşribe 50', 'Sana şüphe veren şeyi bırak, şüphe vermeyene bak.'),
  ],
  umut: [
    a('Zümer', 39, '53', 'De ki: "Ey kendilerinin aleyhine haddi aşan kullarım! Allah\'ın rahmetinden ümidinizi kesmeyin. Şüphesiz Allah bütün günahları bağışlar."'),
    a('Âl-i İmrân', 3, '139', 'Gevşemeyin, üzülmeyin. Eğer inanıyorsanız en üstün olan sizsiniz.'),
    a('Talâk', 65, '2-3', 'Kim Allah\'a karşı gelmekten sakınırsa, Allah ona bir çıkış yolu açar ve onu hiç ummadığı yerden rızıklandırır.'),
    a('İnşirâh', 94, '5-6', 'Şüphesiz güçlükle beraber bir kolaylık vardır. Evet, güçlükle beraber bir kolaylık vardır.'),
    h('Buhârî, Tevhîd 15; Müslim, Tevbe 14', 'Allah buyuruyor ki: "Rahmetim gazabımı geçmiştir." (Kudsî hadis)'),
    h('Ahmed b. Hanbel, Müsned 3/191; Buhârî, el-Edebü\'l-müfred 479', 'Kıyamet kopuyor olsa bile, birinizin elinde bir fidan varsa ve onu dikmeye gücü yetiyorsa, diksin.'),
  ],
  pismanlik: [
    a('A\'râf', 7, '23', '(Âdem ile Havva) dediler ki: "Rabbimiz! Biz kendimize zulmettik. Eğer bizi bağışlamaz ve bize merhamet etmezsen mutlaka ziyana uğrayanlardan oluruz."'),
    a('Furkân', 25, '70', 'Ancak tövbe eden, iman eden ve salih amel işleyenler başka. Allah onların kötülüklerini iyiliklere çevirir.'),
    a('Hûd', 11, '114', 'Şüphesiz iyilikler kötülükleri giderir.'),
    a('Âl-i İmrân', 3, '135', 'Onlar bir kötülük yaptıklarında veya kendilerine zulmettiklerinde Allah\'ı anarlar ve hemen günahlarının bağışlanmasını isterler. Günahları Allah\'tan başka kim bağışlar?'),
    a('Tahrîm', 66, '8', 'Ey iman edenler! Allah\'a içtenlikle tövbe edin.'),
    h('Tirmizî, Kıyâmet 49; İbn Mâce, Zühd 30', 'Her insan hata eder. Hata edenlerin en hayırlısı ise tövbe edenlerdir.'),
    h('İbn Mâce, Zühd 30', 'Pişmanlık tövbedir.'),
    h('Tirmizî, Birr 55', 'Nerede olursan ol Allah\'tan kork. Kötülüğün ardından bir iyilik yap ki onu silsin. İnsanlara güzel ahlakla davran.'),
  ],
  yorgunluk: [
    a('Bakara', 2, '286', 'Allah hiç kimseyi gücünün yetmediği bir şeyle yükümlü kılmaz.'),
    a('İnşirâh', 94, '7-8', 'Bir işi bitirince diğerine koyul. Ve yalnız Rabbine yönel.'),
    a('Tâhâ', 20, '2', 'Biz Kur\'an\'ı sana sıkıntı çekesin diye indirmedik.'),
    a('Ra\'d', 13, '28', 'Bilesiniz ki kalpler ancak Allah\'ı anmakla huzur bulur.'),
    h('Buhârî, Savm 51', 'Rabbinin senin üzerinde hakkı vardır, nefsinin senin üzerinde hakkı vardır, ailenin de senin üzerinde hakkı vardır. Her hak sahibine hakkını ver.'),
    h('Buhârî, Rikâk 18; Müslim, Müsâfirîn 216', 'Allah katında amellerin en sevimlisi, az da olsa devamlı olanıdır.'),
    h('Buhârî, İman 29', 'Bu din kolaylıktır. Kim dini zorlaştırırsa din ona galip gelir. Orta yolu tutun, mükemmele yaklaşmaya çalışın ve müjdeleyin.'),
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
