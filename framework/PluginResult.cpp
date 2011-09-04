#include "PluginResult.h"

PluginResult::PluginResult (PGCommandStatus status) : QObject (0), map ()
{
  map.insert ("status", status);
}

PluginResult::PluginResult (PGCommandStatus status, int result) : QObject (0), map ()
{
  map.insert ("status", status);
  map.insert ("message", result);
}

PluginResult::PluginResult (PGCommandStatus status, QString &result) : QObject (0), map ()
{
  map.insert ("status", status);
  map.insert ("message", result);;
}

PluginResult::PluginResult (PGCommandStatus status, QVariantList &result) : QObject (0), map ()
{
  map.insert ("status", status);
  map.insert ("message", result);
}

PluginResult::PluginResult (PGCommandStatus status, QVariantMap &result) : QObject (0), map ()
{
  map.insert ("status", status);
  map.insert ("message", result);
}

PluginResult::PluginResult (PGCommandStatus status, bool result) : QObject (0), map ()
{
  map.insert ("status", status);
  map.insert ("message", result);
}

PluginResult::PluginResult (PGCommandStatus status, double result) : QObject (0), map ()
{
  map.insert ("status", status);
  map.insert ("message", result);
}

void PluginResult::setKeepCallbackAsBool (bool bKeepCallback)
{
  map.insert ("keepCallback", bKeepCallback);
}
