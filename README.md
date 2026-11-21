# Ruh Hâli 🌙

Spotify'da dinlediğin şarkılardan o anki ruh hâlini tahmin eden ve sana uygun bir **ayet** ve **hadis** gösteren mobil uygulama (Expo / React Native, iOS + Android).

## Nasıl çalışır?

1. Spotify hesabınla bağlanırsın (yalnızca okuma izni: son dinlenenler + şu an çalan).
2. Uygulama son ~30 şarkının adını, sanatçı türlerini ve dinleme saatini puanlar ve 6 hâlden birini tahmin eder:
   Hüzünlü · Kaygılı · Öfkeli · Özlem/Yalnızlık · Neşeli · Huzurlu
3. O hâle uygun, elle derlenmiş listeden en az bir ayet ve bir hadis gösterir. Tahmin yanlışsa tek dokunuşla düzeltebilirsin.

> Not: Spotify, Kasım 2024'ten beri yeni uygulamalara şarkıların "valence/energy" verisini (audio-features) vermiyor. Bu yüzden tahmin şarkı adları ve türlere dayanıyor ve kesin değil; uygulama nedenini "Neden böyle düşündüm?" bölümünde gösteriyor.

Ayet ve hadis metinleri `src/content.ts` içinde **sabit** bir listedir, yapay zekâ ile üretilmez. Her hadisin kaynağı (Buhârî, Müslim, Tirmizî…) yazılıdır; ayetler acikkuran.com'da farklı meallerle açılabilir. Yayına almadan önce metinleri bir ilahiyatçıya kontrol ettirmen önerilir.

## Kurulum

1. https://developer.spotify.com/dashboard → **Create app**
   - Redirect URI: `ruhhali://callback`
   - API: *Web API*
2. Client ID'yi kopyala ve proje kökünde `.env` dosyası oluştur:
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
| `src/content.ts` | Ruh hâline göre ayet ve hadis listesi |

## Sonraki adımlar (fikirler)

- Şarkı sözlerini (ör. Musixmatch) veya bir dil modelini kullanarak daha isabetli tahmin
- Günlük bildirim: "Bugünün ayeti"
- Favorilere ekleme ve paylaşma kartı
