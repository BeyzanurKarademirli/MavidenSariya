package expo.modules.nowplaying

import android.content.Context
import android.content.Intent
import android.net.Uri
import android.provider.Settings
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class NowPlayingModule : Module() {
  private val ctx: Context
    get() = requireNotNull(appContext.reactContext) { "React context hazır değil" }

  override fun definition() = ModuleDefinition {
    Name("NowPlaying")

    Function("isPermissionGranted") {
      NowPlayingStore.isGranted(ctx)
    }

    Function("openPermissionSettings") {
      val intent = Intent(Settings.ACTION_NOTIFICATION_LISTENER_SETTINGS).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
      ctx.startActivity(intent)
    }

    Function("openAppSettings") {
      val intent = Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS, Uri.parse("package:" + ctx.packageName))
        .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
      ctx.startActivity(intent)
    }

    Function("getHistory") {
      NowPlayingStore.record(ctx)
      NowPlayingStore.history(ctx)
    }

    Function("clearHistory") {
      NowPlayingStore.clear(ctx)
    }
  }
}
