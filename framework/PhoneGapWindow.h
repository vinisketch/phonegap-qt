#ifndef PHONE_GAP_WINDOW_H
#define PHONE_GAP_WINDOW_H

#include <QMainWindow>

class QUrl;
class QWebView;

class PhoneGapWindow : public QMainWindow {

    Q_OBJECT

    QWebView *webView;

    public:
        explicit PhoneGapWindow (QWidget *parent = 0);
        virtual ~PhoneGapWindow ();
        void loadFile (const QString &fileName);
        void loadUrl (const QUrl &url);
        static QString adjustPath (const QString &path);
        void quit();
};

#endif // PHONE_GAP_WINDOW_H
