#include <QApplication>
#include <QPushButton>
#include <fstream>
#include <termios.h>
#include <iostream>

int main(int argc, char **argv)
{
    
    
    QApplication app(argc, argv);

    QPushButton button("Hello, World!");

    QObject::connect(&button, &QPushButton::clicked, &app, &QApplication::quit);

    button.show();

    return app.exec();
}

int serialport() {
    int serialport = open("/dev/ttyUSB0", O_RDWR | O_NOCTTY | O_NDELAY);
    struct termios options; 
    std::string line;
    if(serialport == -1)
    {
        std::cout << "Error opening serial port" << std::endl;
        return 1;
    }
    cfsetospeed(&tty,B116200);
    cfsetispeed(&tty,B116200);

    tty.c_cflag &= ~PARENB; // Clear parity bit
    tty.c_cflag &= ~CSTOPB; // Clear stop field, only one stop bit used in communication
    tty.c_cflag &= ~CSIZE; // Clear all the size bits
    tty.c_cflag |= CS8; // 8 bits per byte

    if(tcsetattr(serialport, TCSANOW, &options) != 0)
    {
        std::cout << "Error setting serial port options" << std::endl;
        return 1;
    }
    if(tcsetattr(serialport, TCSANOW, &options) != 0)
    {
        std::cout << "Error setting serial port options" << std::endl;
        return 1;
    }
    std::ifstream in("/dev/ttyUSB0");
    while(std::getline(in, line))
    {
        std::cout << line << std::endl;
    }
    in.close():
    close(fd);
    return 0;
    
    
}