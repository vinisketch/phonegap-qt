#include "ContactManager.h"

#include <qmobilityglobal.h>

#include <QContact>
#include <QContactDetailFilter>
#include <QContactManager>
#include <QDebug>
#include <QContactFetchRequest>


#include <QContactName>
#include <QContactPhoneNumber>
#include <QContactNote>
#include <QContactBirthday>

#include "ContactRequest.h"

QTM_USE_NAMESPACE

ContactManager::ContactManager (QObject *parent) : Plugin (parent),
  requests ()
{

}

ContactManager::~ContactManager ()
{

}

PluginResult *ContactManager::create (QVariantMap &args, QString &clbId)
{
//  QStringList strlist = QContactManager::availableManagers();
//  for(int i = 0 ;i<strlist.count();i++)

//  { QString data = strlist.at(i); }
//  // Construct contact manager for default contact backend
//  QContactManager* cm = new QContactManager(strlist.at(1)); //if the manager is "memory" it works well but contacts are not getting updated.
//  // Create example contact
//  QContact example;
//  // Add contact name
//  QContactName name;
//  name.setFirstName("John");
//  name.setLastName("Doe");
//  example.saveDetail(&name);

//  // Add contact email address

//  //QContactEmailAddress email;
//  // email.setContexts(QContactDetail::ContextHome);
//  //email.setEmailAddress("john.doe@example.com");
//  // example.saveDetail(&email);

//  // Finally, save the contact details
//  cm->saveContact(&example);
//  delete cm;


  PluginResult *r = new PluginResult (PGCommandStatus_OK, "Salut");

  return r;
}

PluginResult *ContactManager::find (QVariantMap &args, QString &clbId)
{
  QList<QVariant> values = args.values ();
  QVariantList fields = values [0].toList ();
  QVariantMap options = values [1].toMap ();

  QString filter = "";
  if (options.contains ("filter"))
  {
    filter = options.take ("filter").toString ();
  }

  bool multiple = false;
  if (options.contains ("multiple"))
  {
    multiple = options.take ("multiple").toBool ();
  }

  ContactRequest *request = new ContactRequest (clbId, filter, multiple, this);
  requests.insert (clbId, request);

  PluginResult *r;
  if (!request->start())
  {
    qDebug() << "Unable to request contacts!";
    r = new PluginResult (PGCommandStatus_ERROR, "Unable to request contacts!");
  } else
  {
    qDebug() << "Requested contacts; awaiting results...";
    r = new PluginResult (PGCommandStatus_OK, "Salut");
  }
  return r;
}

void ContactManager::returnResult (ContactRequest *request)
{
  QList<QContact*> contacts = request->getContacts ();

  QVariantList * list = this->generateResult (contacts);

  PluginResult *r = new PluginResult (PGCommandStatus_OK, *list);
}

QVariantList *ContactManager::generateResult (QList<QContact*> contacts)
{
  QVariantList * list = new QVariantList ();
  foreach (QContact *contact, contacts)
  {
    qDebug() << "ContactManager.displayLabel():" << contact->displayLabel () << endl;
    list->append (*this->generateContact (contact));
  }

  return list;
}

QVariantMap *ContactManager::generateContact (QContact* contact)
{
  QVariantMap *map = new QVariantMap ();
  map->insert ("id", contact->localId ());
  map->insert ("displayName", contact->displayLabel());

  map->insert ("name", *this->genName (contact));
  map->insert ("nickname", "");
  map->insert ("phoneNumbers", *this->genPhoneNumbers (contact));
  map->insert ("emails", *this->genEmails (contact));
  map->insert ("addresses", *this->genAddresses (contact));
  map->insert ("ims", *this->genIMS (contact));
  map->insert ("organizations", *this->genOrganizations (contact));

  QContactBirthday birthday = contact->detail<QContactBirthday> ();
  map->insert ("birthday", birthday.date ());

  QContactNote note = contact->detail<QContactNote> ();
  map->insert ("note", note.note ());
  map->insert ("photos", *this->genPhotos (contact));
  map->insert ("categories", *this->genCategories (contact));
  map->insert ("urls", *this->genUrls (contact));

  return map;
}

QVariantMap* ContactManager::genName (QContact* contact)
{
  QVariantMap *map = new QVariantMap ();

  QContactName name = contact->detail<QContactName> ();

  *map->insert ("formatted", name.customLabel ());
  *map->insert ("familyName", name.lastName ());
  *map->insert ("givenName", name.firstName ());
  *map->insert ("middleName", name.middleName ());
  *map->insert ("honorificPrefix", name.prefix ());
  *map->insert ("honorificSuffix", name.suffix ());

  return map;
}

QVariantList *ContactManager::genPhoneNumbers (QContact* contact)
{
  QVariantList *list = new QVariantList ();

  QList<QContactPhoneNumber> phoneNumbers = contact->details<QContactPhoneNumber> ();

  foreach (QContactPhoneNumber phoneNumber, phoneNumbers)
  {
    QVariantMap *map = new QVariantMap ();

    QStringList types = phoneNumber.subTypes ();

    map->insert ("value", phoneNumber.number ());
    if (!types.isEmpty())
    {
      map->insert ("type", types [0]);
    }
    map->insert ("pref", false);

    list->append (*map);
  }

  return list;
}

QVariantList *ContactManager::genEmails (QContact* contact)
{
  QVariantList *list = new QVariantList ();

  return list;
}

QVariantList *ContactManager::genAddresses (QContact* contact)
{
  QVariantList *list = new QVariantList ();

  return list;
}

QVariantList *ContactManager::genIMS (QContact* contact)
{
  QVariantList *list = new QVariantList ();

  return list;
}

QVariantList *ContactManager::genOrganizations (QContact* contact)
{
  QVariantList *list = new QVariantList ();

  return list;
}

QVariantList *ContactManager::genPhotos (QContact* contact)
{
  QVariantList *list = new QVariantList ();

  return list;
}

QVariantList *ContactManager::genUrls (QContact* contact)
{
  QVariantList *list = new QVariantList ();

  return list;
}

QVariantList *ContactManager::genCategories (QContact* contact)
{
  QVariantList *list = new QVariantList ();

  return list;
}

