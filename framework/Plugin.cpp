#include "Plugin.h"

Plugin::Plugin(QObject *parent) : QObject(parent)
{
}


PluginResult *Plugin::exec (QString &method, QVariantMap &params, QString &clbId)
{
  PluginResult *r;
  const char* c_method = method.toStdString().c_str();

  QMetaObject::invokeMethod (this, c_method,
                             Q_RETURN_ARG (PluginResult*, r),
                             Q_ARG (QVariantMap&, params),
                             Q_ARG (QString&, clbId));
  return r;
}
