#include "extensions.h"
#include "extensions/accelerometer.h"
#include "extensions/Compass.h"
#include "extensions/Connection.h"
#include "extensions/debugconsole.h"
#include "extensions/deviceinfo.h"
#include "extensions/geolocation.h"
#include "extensions/hash.h"
#include "extensions/notification.h"
#include "extensions/App.h"
#include "extensions/utility.h"
#include "extensions/ContactManager.h"

#ifdef Q_WS_S60
#include "extensions/camera.h"
#include "extensions/memorywatcher.h"
#endif

#include "Plugin.h"

#include <QWebFrame>
#include <QDebug>



Extensions::Extensions (QWebView *webView) : QObject(webView)
{
  m_frame = webView->page ()->mainFrame ();
  connect(m_frame, SIGNAL(javaScriptWindowObjectCleared()), SLOT(attachExtensions()));

  m_extensions["device"] = new DeviceInfo (this);
  m_extensions["GapDebugConsole"] = new DebugConsole (this);
  m_extensions["GapAccelerometer"] = new Accelerometer (this);
  m_extensions["GapCompass"] = new Compass (this);
  m_extensions["GapCore"] = this;

  m_plugins["ContactManager"] = new ContactManager (this);


  m_plugins["Network Status"] = new Connection (this);

  m_extensions["GapGeolocation"] = new Geolocation(this);
  m_extensions["GapApp"] = new App (this, webView);

  //    m_extensions["GapHash"] = new Hash(this);
//    m_extensions["GapNotification"] = new Notification(this);
//   m_extensions["GapUtility"] = new Utility(this);

#ifdef Q_WS_S60
  m_extensions["GapCamera"] = new Camera(this);
  m_extensions["GapMemoryWatcher"] = new MemoryWatcher(this);
#endif

  attachExtensions();
}

void Extensions::attachExtensions()
{
  foreach (QString name, m_extensions.keys())
  {
    m_frame->addToJavaScriptWindowObject(name, m_extensions[name]);
  }
}


QVariantMap Extensions::exec (QString service, QString action, QVariantMap args, QString clbId)
{
  qDebug() << "exec -> " << service << ":" << action;

  Plugin *plugin = m_plugins [service];
  if (plugin == NULL)
  {
    PluginResult *r = new PluginResult (PGCommandStatus_CLASS_NOT_FOUND_EXCEPTION);
    return r->map;
  }
  PluginResult *r = plugin->exec (action, args, clbId);

  if (r == NULL)
  {
    qDebug() << "exec result bad";
    PluginResult *r = new PluginResult (PGCommandStatus_CLASS_NOT_FOUND_EXCEPTION);
    return r->map;
  }
  else
  {
    qDebug() << "exec result ok : " << r->map ["status"];
    qDebug() << "exec result ok : " << r->map ["message"];
    return r->map;
  }
}

