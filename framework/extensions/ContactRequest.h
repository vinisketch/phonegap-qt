#ifndef CONTACTREQUEST_H
#define CONTACTREQUEST_H

#include <QObject>
#include <qmobilityglobal.h>

QTM_BEGIN_NAMESPACE
  class QContact;
  class QContactFetchRequest;
  class QContactDetailFilter;
QTM_END_NAMESPACE

QTM_USE_NAMESPACE

class ContactManager;

class ContactRequest : public QObject
{
  Q_OBJECT

private:
  QContactFetchRequest *fetchRequest;
  QString filter;
  QString clbId;
  bool multiple;
  QList<QContact*> results;
  QList<QContactDetailFilter*> filterQueue;

public:
  explicit ContactRequest (QString &clbId, QString &filter, bool multiple, ContactManager *parent);
  bool start ();
  QList<QContact*> getContacts ();

signals:

private slots:
  void searchResult ();

private:
  bool sendRequest (QContactDetailFilter* qFilter);
  void returnResult ();

};

#endif // CONTACTREQUEST_H
