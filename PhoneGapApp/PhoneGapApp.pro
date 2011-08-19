# Add more folders to ship with the application, here
folder_01.source = ../html
folder_01.target = .
DEPLOYMENTFOLDERS = folder_01

# Define TOUCH_OPTIMIZED_NAVIGATION for touch optimization and flicking
#DEFINES += TOUCH_OPTIMIZED_NAVIGATION

symbian:TARGET.UID3 = 0xE4FA51E7

# Allow network access on Symbian
symbian:TARGET.CAPABILITY += NetworkServices

# Smart Installer package's UID
# This UID is from the protected range and therefore the package will
# fail to install if self-signed. By default qmake uses the unprotected
# range value if unprotected UID is defined for the application and
# 0x2002CCCF value if protected UID is given to the application
#symbian:DEPLOYMENT.installer_header = 0x2002CCCF

# If your application uses the Qt Mobility libraries, uncomment the following
# lines and add the respective components to the MOBILITY variable.
CONFIG   += mobility
MOBILITY += sensors location multimedia systeminfo

# The .cpp file which was generated for your project. Feel free to hack it.
SOURCES += \
    ../framework/extensions/utility.cpp \
    ../framework/extensions/hash.cpp \
    ../framework/extensions/geolocation.cpp \
    ../framework/extensions/deviceinfo.cpp \
    ../framework/extensions/debugconsole.cpp \
    ../framework/extensions/accelerometer.cpp \
    ../framework/webpage.cpp \
    ../framework/networkaccessmanager.cpp \
    ../framework/extensions.cpp \
    ../framework/cookiejar.cpp \
    ../framework/PhoneGapWindow.cpp \
    main.cpp \
    ../framework/extensions/notification.cpp \
    ../framework/extensions/Compass.cpp

# Please do not modify the following two lines. Required for deployment.
include(html5applicationviewer/html5applicationviewer.pri)
qtcAddDeployment()

OTHER_FILES += \
    qtc_packaging/debian_harmattan/rules \
    qtc_packaging/debian_harmattan/README \
    qtc_packaging/debian_harmattan/copyright \
    qtc_packaging/debian_harmattan/control \
    qtc_packaging/debian_harmattan/compat \
    qtc_packaging/debian_harmattan/changelog

HEADERS += \
    ../framework/extensions/utility.h \
    ../framework/extensions/notification.h \
    ../framework/extensions/hash.h \
    ../framework/extensions/geolocation.h \
    ../framework/extensions/deviceinfo.h \
    ../framework/extensions/debugconsole.h \
    ../framework/extensions/accelerometer.h \
    ../framework/webpage.h \
    ../framework/networkaccessmanager.h \
    ../framework/extensions.h \
    ../framework/cookiejar.h \
    ../framework/PhoneGapWindow.h \
    ../framework/extensions/Compass.h
