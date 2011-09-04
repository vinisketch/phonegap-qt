#ifndef PLUGIN_H
#define PLUGIN_H

#include <QObject>
#include <QVariant>

class PluginResult;

class Plugin : public QObject
{
  Q_OBJECT
public:
  explicit Plugin(QObject *parent = 0);

  PluginResult *exec (QString &method, QVariantMap &params, QString &clbId);

signals:

public slots:

};

#endif // PLUGIN_H
