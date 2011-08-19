#include <QtGui/QApplication>
#include "../framework/PhoneGapWindow.h"

int main(int argc, char *argv[])
{
#if !defined(Q_WS_S60)
    QApplication::setGraphicsSystem("raster");
#endif

    QApplication app(argc, argv);

    PhoneGapWindow window;
#ifdef Q_OS_SYMBIAN
    window.showMaximized();
#else
    window.resize(360, 640);
    window.show();
#endif

    window.showFullScreen();
    window.setAttribute(Qt::WA_LockPortraitOrientation, true);

//    viewer.setOrientation(Html5ApplicationViewer::ScreenOrientationLockPortrait);
//    viewer.showExpanded();
//    viewer.loadFile(QLatin1String("html/index.html"));

    return app.exec();
}
