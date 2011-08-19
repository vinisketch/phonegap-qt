#include "extensions.h"
#include "PhoneGapWindow.h"
#include "webpage.h"

#include <QDebug>
#include <QDir>
#include <QUrl>
#include <QWebSettings>
#include <QWebView>
#include <QCoreApplication>


PhoneGapWindow::PhoneGapWindow(QWidget *parent) : QMainWindow(parent)
{
    webView = new QWebView(this);
    webView->setPage(new WebPage());

    setCentralWidget(webView);
    webView->page()->settings()->setAttribute(QWebSettings::LocalContentCanAccessRemoteUrls, true);

    new Extensions(webView);

    QDir templateDir = QDir::current();
#ifdef Q_WS_SIMULATOR
//    templateDir.cdUp();
#endif
//    templateDir.cd("template");

 //   qDebug() << "Loading file: " << templateDir.filePath("html/index.html");

    loadFile(QLatin1String("html/index.html"));

//    webView->load(QUrl::fromUserInput(templateDir.filePath("index.html")));
//    webView->settings()->enablePersistentStorage();

    setAttribute(Qt::WA_LockPortraitOrientation, true);
}

void PhoneGapWindow::loadFile (const QString &fileName)
{
    webView->setUrl (QUrl (PhoneGapWindow::adjustPath(fileName)));
}

void PhoneGapWindow::loadUrl (const QUrl &url)
{
    webView->setUrl(url);
}

QString PhoneGapWindow::adjustPath (const QString &path)
{
#ifdef Q_OS_UNIX
#ifdef Q_OS_MAC
    if (!QDir::isAbsolutePath(path))
        return QCoreApplication::applicationDirPath()
                + QLatin1String("/../Resources/") + path;
#else
    const QString pathInInstallDir = QCoreApplication::applicationDirPath()
        + QLatin1String("/../") + path;
    if (pathInInstallDir.contains(QLatin1String("opt"))
            && pathInInstallDir.contains(QLatin1String("bin"))
            && QFileInfo(pathInInstallDir).exists()) {
        return pathInInstallDir;
    }
#endif
#endif
    return path;
}

void PhoneGapWindow::quit()
{
//    emit quitRequested();
}

PhoneGapWindow::~PhoneGapWindow() {
}
