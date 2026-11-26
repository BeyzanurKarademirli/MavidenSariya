package expo.modules.nowplaying

import android.content.ComponentName
import android.content.Context
import android.media.MediaMetadata
import android.media.session.MediaSessionManager
import android.media.session.PlaybackState
import android.provider.Settings
import org.json.JSONArray
import org.json.JSONObject

/**
 * Telefonda çalan şarkıyı (hangi uygulamadan olursa olsun) Android medya oturumlarından okur
 * ve son dinlenenlerin geçmişini telefonun kendi hafızasında (SharedPreferences) tutar.
 */
object NowPlayingStore {
  private const val PREFS = "ruhhali_now_playing"
  private const val KEY = "history"
  private const val MAX = 60

  fun listenerComponent(ctx: Context) = ComponentName(ctx, NowPlayingListenerService::class.java)

  fun isGranted(ctx: Context): Boolean {
    val flat = Settings.Secure.getString(ctx.contentResolver, "enabled_notification_listeners") ?: return false
    return flat.split(":").any { ComponentName.unflattenFromString(it)?.packageName == ctx.packageName }
  }

  /** Şu an çalan (ya da duraklatılmış) şarkı; izin yoksa ya da çalan yoksa null. */
  fun current(ctx: Context): JSONObject? {
    if (!isGranted(ctx)) return null
    val msm = ctx.getSystemService(Context.MEDIA_SESSION_SERVICE) as? MediaSessionManager ?: return null
    val controllers = try {
      msm.getActiveSessions(listenerComponent(ctx))
    } catch (e: SecurityException) {
      return null
    }
    // Önce gerçekten çalanlar
    val ordered = controllers.sortedByDescending { if (it.playbackState?.state == PlaybackState.STATE_PLAYING) 1 else 0 }
    for (c in ordered) {
      if (c.packageName == ctx.packageName) continue
      val md = c.metadata ?: continue
      val title = md.getString(MediaMetadata.METADATA_KEY_TITLE)
        ?: md.getString(MediaMetadata.METADATA_KEY_DISPLAY_TITLE)
        ?: continue
      if (title.isBlank()) continue
      val artist = md.getString(MediaMetadata.METADATA_KEY_ARTIST)
        ?: md.getString(MediaMetadata.METADATA_KEY_ALBUM_ARTIST)
        ?: md.getString(MediaMetadata.METADATA_KEY_DISPLAY_SUBTITLE)
        ?: ""
      return JSONObject().apply {
        put("title", title)
        put("artist", artist)
        put("album", md.getString(MediaMetadata.METADATA_KEY_ALBUM) ?: "")
        put("duration", md.getLong(MediaMetadata.METADATA_KEY_DURATION))
        put("package", c.packageName)
        put("playing", c.playbackState?.state == PlaybackState.STATE_PLAYING)
      }
    }
    return null
  }

  /** Çalan şarkıyı geçmişe ekler (aynı şarkı art arda tekrar eklenmez, yalnızca "son görülme" güncellenir). */
  @Synchronized
  fun record(ctx: Context) {
    val cur = current(ctx) ?: return
    if (!cur.optBoolean("playing")) return
    val prefs = ctx.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
    val arr = try { JSONArray(prefs.getString(KEY, "[]")) } catch (e: Exception) { JSONArray() }
    val now = System.currentTimeMillis()
    if (arr.length() > 0) {
      val last = arr.getJSONObject(arr.length() - 1)
      if (last.optString("title") == cur.optString("title") && last.optString("artist") == cur.optString("artist")) {
        last.put("lastSeen", now)
        prefs.edit().putString(KEY, arr.toString()).apply()
        return
      }
    }
    cur.put("startedAt", now)
    cur.put("lastSeen", now)
    arr.put(cur)
    val trimmed = JSONArray()
    for (i in maxOf(0, arr.length() - MAX) until arr.length()) trimmed.put(arr.get(i))
    prefs.edit().putString(KEY, trimmed.toString()).apply()
  }

  fun history(ctx: Context): String =
    ctx.getSharedPreferences(PREFS, Context.MODE_PRIVATE).getString(KEY, "[]") ?: "[]"

  fun clear(ctx: Context) {
    ctx.getSharedPreferences(PREFS, Context.MODE_PRIVATE).edit().remove(KEY).apply()
  }
}
