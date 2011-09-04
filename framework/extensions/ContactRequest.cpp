#include "ContactRequest.h"

#include <QContact>
#include <QContactDetailFilter>
#include <QContactManager>
#include <QDebug>
#include <QContactName>
#include <QContactFetchRequest>

#include "ContactManager.h"

QTM_USE_NAMESPACE

ContactRequest::ContactRequest (QString &clbId, QString &filter, bool multiple, ContactManager *parent) : QObject(parent),
  fetchRequest (NULL), filter (filter), clbId (clbId), multiple (multiple), results (), filterQueue ()
{
  fetchRequest = new QContactFetchRequest (this);
  connect (fetchRequest, SIGNAL(resultsAvailable()), this, SLOT(searchResult()));

  QContactManager *manager = QContactManager::fromUri ("qtcontacts:tracker:"); //"qtcontacts:memory:"

  fetchRequest->setManager (manager);
}

bool ContactRequest::start ()
{
  QContactDetailFilter *qFilter = NULL;
  if (filter.compare ("") != 0)
  {
    qFilter = new QContactDetailFilter ();
    qFilter->setDetailDefinitionName (QContactName::DefinitionName, QContactName::FieldLastName);
    qFilter->setValue (filter);
    qFilter->setMatchFlags(QContactFilter::MatchContains);

    filterQueue.push_front (qFilter);

    qFilter = new QContactDetailFilter ();
    qFilter->setDetailDefinitionName (QContactName::DefinitionName, QContactName::FieldFirstName);
    qFilter->setValue (filter);
    qFilter->setMatchFlags(QContactFilter::MatchContains);
  }

  return this->sendRequest (qFilter);
}

bool ContactRequest::sendRequest (QContactDetailFilter *qFilter)
{
  if (qFilter != NULL)
  {
    fetchRequest->setFilter (*qFilter);
  }

  return fetchRequest->start ();
}

void ContactRequest::searchResult ()
{
  QList<QContact> contacts = fetchRequest->contacts ();
  foreach (QContact contact, contacts)
  {
    results.push_back (&contact);
  }

  if (filterQueue.isEmpty ())
  {
    this->returnResult ();
  }
  else
  {
    QContactDetailFilter *qFilter = filterQueue.first ();
    filterQueue.pop_front ();

    this->sendRequest (qFilter);
  }
}

QList<QContact*> ContactRequest::getContacts ()
{
  return results;
}

void ContactRequest::returnResult ()
{
  ContactManager *parent = (ContactManager*) this->parent ();
  parent->returnResult (this);
}
