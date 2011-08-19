#ifndef COMPOASS_H
#define COMPOASS_H

#include <QCompass>
#include <QObject>

QTM_USE_NAMESPACE

class Compass : public QObject
{
  Q_OBJECT

  public:
    explicit Compass (QObject *parent = 0);
    ~Compass ();

    Q_INVOKABLE QVariantMap getCurrentHeading () const;

  protected slots:
    void updateSensor();

  private:
    QCompass *m_compass;

    double m_azimuth;
    double m_calibrationLevel;
};

#endif // COMPOASS_H
