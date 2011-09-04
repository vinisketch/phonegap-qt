#ifndef CONTACTMANAGER_H
#define CONTACTMANAGER_H

#include "../Plugin.h"
#include "../PluginResult.h"

#include <qmobilityglobal.h>

class ContactRequest;

QTM_BEGIN_NAMESPACE
  class QContact;
QTM_END_NAMESPACE

QTM_USE_NAMESPACE

class ContactManager : public Plugin
{
  Q_OBJECT
friend class ContactRequest;
private:
  QMap<QString, ContactRequest*> requests;

public:
  explicit ContactManager (QObject *parent = 0);
  ~ContactManager ();

  Q_INVOKABLE PluginResult *create (QVariantMap &args, QString &clbId);
  Q_INVOKABLE PluginResult *find (QVariantMap &args, QString &clbId);

private:
  void returnResult (ContactRequest *request);
  QVariantList *generateResult (QList<QContact*> contacts);
  QVariantMap *generateContact (QContact* contacts);
  QVariantMap *genName (QContact* contacts);
  QVariantList *genPhoneNumbers (QContact* contacts);
  QVariantList *genEmails (QContact* contacts);
  QVariantList *genAddresses (QContact* contacts);
  QVariantList *genIMS (QContact* contacts);
  QVariantList *genOrganizations (QContact* contacts);
  QVariantList *genPhotos (QContact* contacts);
  QVariantList *genUrls (QContact* contacts);
  QVariantList *genCategories (QContact* contacts);
};

#endif // CONTACTMANAGER_H
