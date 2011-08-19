#include "Compass.h"

Compass::Compass(QObject *parent) : QObject(parent),
  m_azimuth(0),
  m_calibrationLevel(0)
{
  m_compass = new QCompass (this);
  m_compass->connectToBackend ();
  m_compass->start ();

  connect (m_compass, SIGNAL(readingChanged()), SLOT(updateSensor()));
}

Compass::~Compass ()
{
  delete m_compass;
}

QVariantMap Compass::getCurrentHeading () const
{
  QVariantMap map;
  map["azimuth"] = m_azimuth;
  map["calibrationLevel"] = m_calibrationLevel;
  return map;
}

void Compass::updateSensor()
{
  QCompassReading *reading = m_compass->reading ();
  m_azimuth = reading->azimuth ();
  m_calibrationLevel = reading->calibrationLevel ();
}
