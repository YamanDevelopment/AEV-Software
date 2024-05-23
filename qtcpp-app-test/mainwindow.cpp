#include <QApplication>
#include <QMainWindow>
#include <Qt3DExtras/Qt3DWindow>
#include <Qt3DExtras/QOrbitCameraController>
#include <Qt3DRender/QCamera>
#include <Qt3DCore/QEntity>
#include <Qt3DRender/QMesh>
#include <Qt3DExtras/QPhongMaterial>
#include <Qt3DCore/QTransform>

int main(int argc, char *argv[])
{
    QApplication app(argc, argv);
    Qt3DExtras::Qt3DWindow view;

    // Root entity
    Qt3DCore::QEntity *rootEntity = new Qt3DCore::QEntity;

    // Load the .glb file
    Qt3DRender::QMesh *carMesh = new Qt3DRender::QMesh(rootEntity);
    carMesh->setSource(QUrl::fromLocalFile("car.glb"));

    // Material
    Qt3DExtras::QPhongMaterial *material = new Qt3DExtras::QPhongMaterial(rootEntity);

    // Car entity
    Qt3DCore::QEntity *carEntity = new Qt3DCore::QEntity(rootEntity);
    carEntity->addComponent(carMesh);
    carEntity->addComponent(material);

    // Camera
    Qt3DRender::QCamera *camera = view.camera();
    camera->lens()->setPerspectiveProjection(45.0f, 16.0f/9.0f, 0.1f, 1000.0f);
    camera->setPosition(QVector3D(0, 0, 20.0f));
    camera->setViewCenter(QVector3D(0, 0, 0));

    // For camera controls
    Qt3DExtras::QOrbitCameraController *camController = new Qt3DExtras::QOrbitCameraController(rootEntity);
    camController->setCamera(camera);

    // Set root object of the scene
    view.setRootEntity(rootEntity);
    view.show();

    return app.exec();
}