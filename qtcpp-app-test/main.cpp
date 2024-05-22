#include <QApplication>
#include <QMainWindow>
#include <QPlainTextEdit>
#include <QSerialPort>
#include <QTimer>

class MainWindow : public QMainWindow {
public:
    MainWindow() {
        setCentralWidget(&textEdit);
        connect(&serialPort, &QSerialPort::readyRead, this, &MainWindow::readData);
        connect(&timer, &QTimer::timeout, this, &MainWindow::writeData);
        serialPort.setPortName("/dev/ttyUSB0");
        serialPort.setBaudRate(QSerialPort::Baud115200);
        if (!serialPort.open(QIODevice::ReadWrite)) {
            textEdit.appendPlainText("Connection Failed");
        } else {
            timer.start(1000);
        }
    }

private slots:
    void readData() {
        textEdit.appendPlainText(serialPort.readAll());
    }

    void writeData() {
        serialPort.write("sh\n");
    }

private:
    QPlainTextEdit textEdit;
    QSerialPort serialPort;
    QTimer timer;
};

int main(int argc, char *argv[]) {
    QApplication app(argc, argv);
    MainWindow window;
    window.show();
    return app.exec();
}