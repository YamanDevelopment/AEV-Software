#include <QApplication>
#include <QMainWindow>
#include <QLabel>
#include <QSerialPort>
#include <QTimer>

class MainWindow : public QMainWindow {
public:
    MainWindow() {
        label.setTextFormat(Qt::PlainText);
        setCentralWidget(&label);
        connect(&serialPort, &QSerialPort::readyRead, this, &MainWindow::readData);
        connect(&timer, &QTimer::timeout, this, &MainWindow::writeData);
        serialPort.setPortName("/dev/ttyUSB0");
        serialPort.setBaudRate(QSerialPort::Baud115200);
        if (!serialPort.open(QIODevice::ReadWrite)) {
            label.setText("Connection Failed");
        } else {
            timer.start(1000);
        }
    }

private slots:
    void readData() {
        label.setText(serialPort.readAll());
    }

    void writeData() {
        serialPort.write("sh\n");
    }

private:
    QLabel label;
    QSerialPort serialPort;
    QTimer timer;
};

int main(int argc, char *argv[]) {
    QApplication app(argc, argv);
    MainWindow window;
    window.show();
    return app.exec();
}