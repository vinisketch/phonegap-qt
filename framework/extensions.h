#ifndef EXTENSIONS_H
#define EXTENSIONS_H

#include <QMap>
#include <QVariant>
#include <QWebView>

class Plugin;

class Extensions : public QObject
{

Q_OBJECT

public:
  explicit Extensions(QWebView *webView = 0);

  Q_INVOKABLE QVariantMap exec (QString service, QString action, QVariantMap args, QString clbId);

protected slots:
    void attachExtensions();

private:
    QWebFrame *m_frame;
    QMap<QString, QObject *> m_extensions;
    QMap<QString, Plugin *> m_plugins;
};

#endif // EXTENSIONS_H
