# Mâverâ 🌙

*mavi ışıktan sarı ışığa* — MAVi + saRı → **Mâverâ** (“görünenin ötesi”). Ekranın mavi ışığından ayetin sıcak ışığına.

Spotify'da dinlediğin şarkılardan o anki ruh hâlini tahmin eden ve sana uygun bir **ayet** ve **hadis** gösteren mobil uygulama (Expo / React Native, iOS + Android).

## Nasıl çalışır?

1. Dinlediklerin iki yoldan okunabilir:
   - **Telefonumda çalanlar (Android, önerilen):** YouTube Music, Spotify, telefondaki MP3 çalar, Deezer, fizy… hangi uygulamadan dinlersen dinle çalan şarkı Android'in medya oturumlarından okunur. Hesap gerekmez; bir kez **bildirim erişimi** izni verilir. Dinleme geçmişi, uygulama kapalıyken de yalnızca telefonda tutulur (`modules/now-playing`).
   - **Spotify hesabı:** Spotify'ın geliştirici modu sınırı nedeniyle en fazla 5 kişi bağlanabilir.
2. Son dinlenen şarkıların adı, sözleri (LRCLIB) ve kişisel eğitim birlikte puanlanır; 31 hâlden en uygun 1–3'ü tahmin edilir.
3. O hâllere uygun ayet ve hadisler sırayla gösterilir. Tahmin yanlışsa düzeltilebilir; uygulama düzeltmelerden öğrenir.

## Ruh hâlleri (31)

| Grup | Hâller |
|---|---|
| Zor anlar | Hüzün · Yas/Kayıp · Ayrılık · Kaygı · Korku · Öfke · Kırgınlık · Kıskançlık · Çaresizlik · Yalnızlık · Yorgunluk · Pişmanlık · İsyan |
| Gönül | Özlem · Aşk · Şefkat · Dostluk · Aile |
| Canlılık | Neşe · Coşku/Enerji · Güç/Zafer · Şükür · Umut |
| Derinlik ve dinginlik | Huzur · Hayranlık · Hayal/Dalgınlık · Varoluş · Sezgi · Arayış · Kararsızlık · Manevi Coşku |

Liste üç kaynağın birleşimine dayanır:
- **Geneva Emotional Music Scale (GEMS)** – Zentner, Grandjean & Scherer (2008): müziğin uyandırdığı 9 duygu (hayranlık, aşkınlık, şefkat, nostalji, huzur, güç, neşeli canlılık, gerginlik, hüzün).
- **Cowen, Fang, Sauter & Keltner (PNAS, 2020)**, *What music makes us feel*: ABD ve Çin'de müziğin uyandırdığı 13 duygu boyutu (eğlence, sinir, kaygı, güzellik, sakinlik, hayalcilik, enerji, arzu, meydan okuma, neşe, hüzün, korku, zafer).
- **Gazâlî, İhyâ-u Ulûmi'd-Dîn** – Münciyât (tövbe, sabır, şükür, havf, recâ, tevekkül, muhabbet, şevk, tefekkür) ve Mühlikât (gazap, haset) bölümlerindeki kalp hâlleri.

## Ayet ve hadisler

- **Ayetler (393 referans, 287 farklı ayet; hâl başına 10–16):** `src/content.ts` içinde yalnızca sure/ayet numarası tutulur. Meal ve Arapça metin `npm run ayat` komutuyla **Diyanet İşleri Başkanlığı meali** verisinden (tanzil.net `tr.diyanet`, `quran-json` paketi) `src/data/ayat.json` dosyasına üretilir. Uzun ayetlerde gösterilen kesit mealde **kelimesi kelimesine** geçmek zorundadır; geçmezse komut hata verir. Kesitli ayetlerde Arapça metin gösterilmez (tam metin ile kısmi meal karışmasın diye).
- **Hadisler (79):** Elle derlenmiş, kaynağı (Buhârî, Müslim, Tirmizî…) yazılı özet meallerdir. Yayına almadan önce bir ilahiyatçıya kontrol ettirmen önerilir.

Ayet eklemek için `src/content.ts`'de ilgili hâle `a(sure, 'ayet')` veya `a(sure, 'ayet', 'mealden birebir kesit')` ekle, sonra:
```bash
npm run ayat
```

## Kurulum

1. https://developer.spotify.com/dashboard → **Create app**
   - Redirect URI: `ruhhali://callback`
   - API: *Web API*
2. Client ID'yi kopyala ve proje kökünde `.env` dosyası oluştur (git'e eklenmez):
   ```
   EXPO_PUBLIC_SPOTIFY_CLIENT_ID=buraya_client_id
   ```
3. Spotify uygulaman "Development mode"dayken, giriş yapacak hesabı dashboard'da **User Management** kısmına eklemelisin.
4. Çalıştır:
   ```bash
   npm install
   npx expo run:android   # veya: npx expo run:ios
   ```
   (Spotify, `ruhhali://` yönlendirmesi için geliştirme derlemesi ister; Expo Go'nun `exp://` adresi değişken olduğundan önerilmez.)

Spotify olmadan denemek için giriş ekranındaki **"Spotify olmadan dene"** bağlantısını kullanabilirsin.

## Dosyalar

| Dosya | Görev |
|---|---|
| `App.tsx` | Ekranlar: giriş, ruh hâli, ayet/hadis kartları, son dinlenenler |
| `src/spotify.ts` | PKCE ile Spotify girişi, token yenileme, dinleme geçmişi |
| `src/mood.ts` | Şarkı adı + tür + saatten ruh hâli puanlaması (TR + EN anahtar kelimeler) |
| `src/content.ts` | 31 ruh hâli ve her birine ait ayet referansları + hadisler |
| `src/ayat.ts`, `src/data/ayat.json` | Diyanet meali ve Arapça metin (üretilmiş) |
| `scripts/build-ayat.ts` | Ayet verisini üretir ve kesitleri doğrular |

## Sonraki adımlar (fikirler)

- Şarkı sözlerini (ör. Musixmatch) veya bir dil modelini kullanarak daha isabetli tahmin
- Günlük bildirim: "Bugünün ayeti"
- Favorilere ekleme ve paylaşma kartı

## İndirme (Android)

En yeni sürüm her zaman bu linkte: https://github.com/BeyzanurKarademirli/MavidenSariya/releases/latest/download/Mavera.apk

## Lisans

Telif Hakkı (c) 2026 Beyzanur Karademirli. Tüm hakları saklıdır. Ayrıntılar ve üçüncü taraf içerikler (Diyanet meali, kütüphaneler) için `LICENSE` dosyasına bakın.
