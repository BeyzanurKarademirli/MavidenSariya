package expo.modules.nowplaying

import android.app.Notification
import android.media.MediaMetadata
import android.media.session.MediaController
import android.media.session.MediaSessionManager
import android.media.session.PlaybackState
import android.service.notification.NotificationListenerService
import android.service.notification.StatusBarNotification

/**
 * Kullanıcı "bildirim erişimi" verince Android bu servisi arka planda çalıştırır. Servis yalnızca
 * medya oturumlarını (çalan şarkı) izler ve değiştikçe geçmişe yazar; uygulama kapalıyken de çalışır.
 * Diğer bildirimlerin içeriği okunmaz ve saklanmaz.
 */
class NowPlayingListenerService : NotificationListenerService() {
  private var msm: MediaSessionManager? = null
  private val watched = mutableListOf<Pair<MediaController, MediaController.Callback>>()

  private val sessionsListener = MediaSessionManager.OnActiveSessionsChangedListener { list -> watch(list) }

  override fun onListenerConnected() {
    super.onListenerConnected()
    val manager = getSystemService(MEDIA_SESSION_SERVICE) as? MediaSessionManager ?: return
    msm = manager
    try {
      manager.addOnActiveSessionsChangedListener(sessionsListener, NowPlayingStore.listenerComponent(this))
      watch(manager.getActiveSessions(NowPlayingStore.listenerComponent(this)))
    } catch (e: SecurityException) {
      // İzin geri alınmış olabilir
    }
  }

  override fun onListenerDisconnected() {
    try {
      msm?.removeOnActiveSessionsChangedListener(sessionsListener)
    } catch (e: Exception) {
    }
    unwatchAll()
    super.onListenerDisconnected()
  }

  override fun onNotificationPosted(sbn: StatusBarNotification?) {
    // Yalnızca medya (müzik çalar) bildirimleriyle ilgileniriz
    val extras = sbn?.notification?.extras ?: return
    if (extras.containsKey(Notification.EXTRA_MEDIA_SESSION)) NowPlayingStore.record(this)
  }

  private fun unwatchAll() {
    watched.forEach { (c, cb) ->
      try {
        c.unregisterCallback(cb)
      } catch (e: Exception) {
      }
    }
    watched.clear()
  }

  private fun watch(list: List<MediaController>?) {
    unwatchAll()
    list?.forEach { c ->
      val cb = object : MediaController.Callback() {
        override fun onMetadataChanged(metadata: MediaMetadata?) {
          NowPlayingStore.record(this@NowPlayingListenerService)
        }

        override fun onPlaybackStateChanged(state: PlaybackState?) {
          NowPlayingStore.record(this@NowPlayingListenerService)
        }
      }
      c.registerCallback(cb)
      watched.add(c to cb)
    }
    NowPlayingStore.record(this)
  }
}
