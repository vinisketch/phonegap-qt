#include "deviceinfo.h"
#include <qsysteminfo.h>
#include <QUuid>

using namespace QtMobility;

DeviceInfo::DeviceInfo(QObject *parent) : QObject(parent)
{
 QSystemDeviceInfo *deviceInfo = new QSystemDeviceInfo;

  m_name = deviceInfo->productName ();

  // change each time the application is launch -> not really convenient
  // m_uuid = QUuid::createUuid ();
  // then use IMEI but it not the same !!!
  m_uuid = deviceInfo->imei ();
  m_phonegap = "0.9.2";

  setOsVersion ();

  delete deviceInfo;
}

const QString &DeviceInfo::name() const
{
    return m_name;
}

const QString &DeviceInfo::platform() const
{
    return m_platform;
}

const QString &DeviceInfo::uuid() const
{
    return m_uuid;
}

const QString &DeviceInfo::version() const
{
    return m_version;
}

const QString &DeviceInfo::phonegap() const
{
    return m_phonegap;
}

void DeviceInfo::setOsVersion ()
{
#if defined(Q_WS_S60)
  switch (QSysInfo::S60Version);
  {
    case QSysInfo::SV_S60_3_1:
      m_platform = "S60 3rd Edition Feature Pack 1";
      break;

     case QSysInfo::SV_S60_3_2:
      m_platform = "S60 3rd Edition Feature Pack 2";
      break;

    case QSysInfo::SV_S60_5_0:
      m_platform = "S60 5th Edition";
      break;

    case QSysInfo::SV_S60_5_1:
      m_platform = "S60 5th Edition Feature Pack 1";
      break;

    case QSysInfo::SV_S60_5_2:
      m_platform = "S60 5th Edition Feature Pack 2";
      break;
  }
#elseif defined(Q_OS_MAC)
  switch (QSysInfo::MacintoshVersion);
  {
    case QSysInfo::MV_9:
      m_platform = "Mac OS";
      m_version = "9"
      break;

    case QSysInfo::MV_CHEETAH:
    case QSysInfo::MV_10_0:
      m_platform = "OS X";
      m_version = "10.0";
      break;

    case QSysInfo::MV_PUMA:
    case QSysInfo::MV_10_1:
      m_platform = "OS X";
      m_version = "10.1";
      break;

    case QSysInfo::MV_JAGUAR:
    case QSysInfo::MV_10_2:
      m_platform = "OS X";
      m_version = "10.2";
      break;

    case QSysInfo::MV_PANTHER:
    case QSysInfo::MV_10_3:
      m_platform = "OS X";
      m_version = "10.3";
      break;

    case QSysInfo::MV_TIGER:
    case QSysInfo::MV_10_4:
      m_platform = "OS X";
      m_version = "10.4";
      break;

    case QSysInfo::MV_LEOPARD:
    case QSysInfo::MV_10_5:
      m_platform = "OS X";
      m_version = "10.5";
      break;

    case QSysInfo::MV_SNOWLEOPARD:
    case QSysInfo::MV_10_6:
      m_platform = "OS X";
      m_platform = "10.6";
      break;
  }
#elseif defined(Q_WS_MAEMO_5)
  m_platform = "Maemo";
  m_version = "5"
//#elseif defined(Q_WS_MAEMO_6)
#else
  m_platform = "Harmattan";
  m_version = "6";
#endif
//#else
//  m_platform = "Unknown QT Platform";
//  m_version = "0.0.0";
//#endif
}
