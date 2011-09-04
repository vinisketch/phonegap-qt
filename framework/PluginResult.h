#ifndef PLUGINRESULT_H
#define PLUGINRESULT_H

#include <QVariantMap>

typedef enum {
  PGCommandStatus_NO_RESULT = 0,
  PGCommandStatus_OK,
  PGCommandStatus_CLASS_NOT_FOUND_EXCEPTION,
  PGCommandStatus_ILLEGAL_ACCESS_EXCEPTION,
  PGCommandStatus_INSTANTIATION_EXCEPTION,
  PGCommandStatus_MALFORMED_URL_EXCEPTION,
  PGCommandStatus_IO_EXCEPTION,
  PGCommandStatus_INVALID_ACTION,
  PGCommandStatus_JSON_EXCEPTION,
  PGCommandStatus_ERROR
} PGCommandStatus;

class PluginResult : public QObject
{
  Q_OBJECT

public:
  explicit PluginResult (PGCommandStatus status);
  explicit PluginResult (PGCommandStatus status, int result);
  explicit PluginResult (PGCommandStatus status, QString &result);
  explicit PluginResult (PGCommandStatus status, QVariantList &result);
  explicit PluginResult (PGCommandStatus status, QVariantMap &result);
  explicit PluginResult (PGCommandStatus status, bool result);
  explicit PluginResult (PGCommandStatus status, double result);

  void setKeepCallbackAsBool (bool bKeepCallback);

public:
  QVariantMap map;

};

#endif // PLUGINRESULT_H
