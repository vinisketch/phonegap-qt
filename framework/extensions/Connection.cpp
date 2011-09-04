#include "Connection.h"

Connection::Connection (QObject *parent) : Plugin(parent)
{
}

Connection::~Connection ()
{
}


PluginResult *Connection::getConnectionInfo (QVariantMap &args, QString &clbId) const
{
  PluginResult *r = new PluginResult (PGCommandStatus_OK, "Salut");


  //r = new PluginResult ();
  return r;
}
