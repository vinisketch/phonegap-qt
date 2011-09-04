#ifndef APP_H
#define APP_H

#include <QObject>

class QWebView;

class App : public QObject
{
  Q_OBJECT

  QWebView *webView;

  public:
    App (QObject *parent, QWebView *webView);
    Q_INVOKABLE void exit ();
    Q_INVOKABLE void gapInit ();
};

#endif // APP_H
