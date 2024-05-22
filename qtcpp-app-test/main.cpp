#include <QApplication>
#include <QSerialPort>

int main(int argc, char *argv[])
{
    QApplication a(argc, argv);

    QSerialPort serialPort;
    serialPort.setPortName("/dev/ttyUSB0");
    serialPort.setBaudRate(QSerialPort::Baud9600);
    serialPort.setDataBits(QSerialPort::Data8);
    serialPort.setParity(QSerialPort::NoParity);
    serialPort.setStopBits(QSerialPort::OneStop);
    serialPort.setFlowControl(QSerialPort::NoFlowControl);

    if (serialPort.open(QIODevice::ReadWrite)) {
        serialPort.write("sh\n");
    } else {
        // handle error
    }

    return a.exec();
}