#include "networkaccessmanager.h"
#include "webpage.h"

#include <QDebug>
#include <QMessageBox>
#include <QWebFrame>


WebPage::WebPage (QObject *parent) :
  QWebPage(parent) {

  setNetworkAccessManager (new NetworkAccessManager(this));

  connect (this, SIGNAL(loadFinished(bool)), SLOT(loadFinished(bool)));
}

void WebPage::javaScriptConsoleMessage (const QString &message, int lineNumber, const QString &sourceId) {
  Q_UNUSED (lineNumber);
  Q_UNUSED (sourceId);

  qDebug() << message;
}

void WebPage::loadFinished(bool ok)
{
  if (!ok) {
    QMessageBox::warning(0, "Error", "There was an error loading the page " + mainFrame()->url().toString());
  }
  else
  {
    QWebFrame *frame = mainFrame ();
    frame->evaluateJavaScript ("javascript:try{ PhoneGap.onNativeReady.fire();}catch(e){_nativeReady = true;}");
    frame->evaluateJavaScript ("javascript:try{ PhoneGap.onPhoneGapInfoReady.fire();}catch(e){console.log (e);}");
    frame->evaluateJavaScript ("javascript:try{ PhoneGap.onPhoneGapConnectionReady.fire();}catch(e){console.log (e);}");
  }
}
