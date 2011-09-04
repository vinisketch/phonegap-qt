#ifndef CONNECTION_H
#define CONNECTION_H

#include "../Plugin.h"
#include "../PluginResult.h"

class Connection : public Plugin
{
  Q_OBJECT

public:
  explicit Connection (QObject *parent = 0);
  ~Connection ();

  Q_INVOKABLE PluginResult *getConnectionInfo (QVariantMap &args, QString &clbId) const;

signals:

public slots:

};

#endif // CONNECTION_H
