package com.vaikhanasanidhi.app;

import android.content.Intent;
import android.webkit.WebView;
import com.getcapacitor.Bridge;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
  @Override
  public void onNewIntent(Intent intent) {
    super.onNewIntent(intent);
    setIntent(intent);
  }

  @Override
  public void onStart() {
    super.onStart();
    configureWebView();
  }

  @Override
  public void onResume() {
    super.onResume();
    configureWebView();
  }

  private void configureWebView() {
    Bridge bridge = getBridge();
    if (bridge == null) return;
    WebView webView = bridge.getWebView();
    if (webView == null) return;
    // Let the in-app <main> scroll; WebView scrollbar was stuck and misleading.
    webView.setVerticalScrollBarEnabled(false);
    webView.setHorizontalScrollBarEnabled(false);
    webView.setNestedScrollingEnabled(true);
    webView.setOverScrollMode(WebView.OVER_SCROLL_NEVER);
    webView.setLongClickable(false);
  }
}
