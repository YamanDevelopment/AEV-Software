#include <QApplication>
#include <QSerialPort>

int main(int argc, char *argv[])
{
    QApplication a(argc, argv);

    QSerialPort serialPort;
    serialPort.setPortName("/dev/ttyUSB0");
    serialPort.setBaudRate(QSerialPort::Baud115200); // jossaya beggin chatgpt fo dis fr
    serialPort.setDataBits(QSerialPort::Data8);
    serialPort.setParity(QSerialPort::NoParity);
    serialPort.setStopBits(QSerialPort::OneStop);
    serialPort.setFlowControl(QSerialPort::NoFlowControl);

    if (serialPort.open(QIODevice::ReadWrite)) {
        serialPort.write("sh\n");
    } else {
        qDebug() << "Error: " << serialPort.errorString();
    }

    return a.exec();
}