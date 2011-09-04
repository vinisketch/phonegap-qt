#include "App.h"
#include <QCoreApplication>
#include <QWebView>

App::App (QObject *parent, QWebView *_webView) : QObject(parent),
  webView (_webView)
{
}

void App::exit ()
{
  qApp->quit();
}

void App::gapInit ()
{
  webView->setVisible (true);
}
