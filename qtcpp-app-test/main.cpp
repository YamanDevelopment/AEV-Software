/* #include <QApplication>
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
} */

#include <QApplication>
#include <QMainWindow>
#include <QLabel>
#include <QSerialPort>
#include <QTimer>
#include <QSplitter>
#include <Qt3DExtras/Qt3DWindow>
#include <Qt3DExtras/QOrbitCameraController>
#include <Qt3DRender/QCamera>
#include <Qt3DRender/QMesh>
#include <Qt3DExtras/QPhongMaterial>
#include <Qt3DCore/QEntity>
#include <QWidget>
#include <QVBoxLayout>
#include <Qt3DRender/QPointLight>
#include <Qt3DCore/QTransform>

class MainWindow : public QMainWindow {
public:
    MainWindow() {
        // Create a splitter
        QSplitter *splitter = new QSplitter(this);
        setCentralWidget(splitter);

        // Create a container for 3D view
        QWidget *container = QWidget::createWindowContainer(&view, this);
        splitter->addWidget(container);

        // Create a label for serial port output
        label.setTextFormat(Qt::PlainText);
        splitter->addWidget(&label);

        // Set up 3D view
        setup3DView();

        // Set up serial port
        setupSerialPort();
    }

private slots:
    void readData() {
        label.setText(serialPort.readAll());
    }

    void writeData() {
        serialPort.write("sh\n");
    }

    void setup3DView() {
        // Root entity
        Qt3DCore::QEntity rootEntity;

        // Camera
        Qt3DRender::QCamera *cameraEntity = view.camera();
        cameraEntity->lens()->setPerspectiveProjection(45.0f, 16.0f/9.0f, 0.1f, 1000.0f);
        cameraEntity->setPosition(QVector3D(0, 0, 0));
        cameraEntity->setUpVector(QVector3D(0, 1, 0));
        cameraEntity->setViewCenter(QVector3D(0, 0, 0));

        // For camera controls
        Qt3DExtras::QOrbitCameraController *camController = new Qt3DExtras::QOrbitCameraController(&rootEntity);
        camController->setLinearSpeed(50.0f);
        camController->setLookSpeed(180.0f);
        camController->setCamera(cameraEntity);

        // 3D model
        Qt3DCore::QEntity *modelEntity = new Qt3DCore::QEntity(&rootEntity);
        Qt3DRender::QMesh *mesh = new Qt3DRender::QMesh;
        mesh->setSource(QUrl::fromLocalFile("./car.glb"));
        modelEntity->addComponent(mesh);

        // Material
        Qt3DExtras::QPhongMaterial *material = new Qt3DExtras::QPhongMaterial(&rootEntity);
        modelEntity->addComponent(material);

        // Set root object of the scene
        view.setRootEntity(&rootEntity);

        // Lighting
        Qt3DCore::QEntity *lightEntity = new Qt3DCore::QEntity(&rootEntity);
        Qt3DRender::QPointLight *light = new Qt3DRender::QPointLight(lightEntity);
        light->setColor("white");
        light->setIntensity(1);
        lightEntity->addComponent(light);
        Qt3DCore::QTransform *lightTransform = new Qt3DCore::QTransform(lightEntity);
        lightTransform->setTranslation(cameraEntity->position());
        lightEntity->addComponent(lightTransform);
    }

    void setupSerialPort() {
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

private:
    QLabel label;
    QSerialPort serialPort;
    QTimer timer;
    Qt3DExtras::Qt3DWindow view;
};

int main(int argc, char *argv[]) {
    QApplication app(argc, argv);

    MainWindow mainWindow;
    mainWindow.show();

    return app.exec();
}