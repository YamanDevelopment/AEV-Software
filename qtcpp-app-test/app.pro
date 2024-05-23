QT       += core gui serialport waylandcompositor 3dcore 3drender 3dinput 3dextras 3dquick

greaterThan(QT_MAJOR_VERSION, 4): QT += widgets

TARGET = host
TEMPLATE = app

DEFINES += QT_DEPRECATED_WARNINGS

SOURCES += \
        mainwindow.cpp

# Default rules for deployment.
qnx: target.path = /tmp/$${TARGET}/bin
else: unix:!android: target.path = /opt/$${TARGET}/bin
!isEmpty(target.path): INSTALLS += target