# aev-software

_____

## Description

This repository contains the software for the Advanced Experimental Vehicles :car: (AEV) club at Florida Atlantic University Highschool :school:. The software is a Tauri application (a Rust framework for applications) and its frontend is written in JavaScript. The software is used to control the AEV's hardware, such as the motors, sensors, and other components. The software is also used to collect data from the AEV's sensors and store it. The software is written by, in no specific order, Amarnath Patel, Zachary Lopez, Jossaya Camille, and Thandi Menelas. 

## Building
This application was specifically written to be used on Arch Linux, specifically the ARM Arch Linux project, due to the CPU architecture of Raspberry Pi. The software can be built on other systems, but the Tauri preqrequesits may vary. On Arch Linux ARM, the following packages are required:
```
sudo pacman -Syu
sudo pacman -S --needed \
    webkit2gtk \
    base-devel \
    curl \
    wget \
    file \
    openssl \
    appmenu-gtk-module \
    gtk3 \
    libappindicator-gtk3 \
    librsvg \
    libvips
```

You will also need `rust` installed. Usually distrubuted with either `rustup` or the generic `rust` package on the Arch repositories through pacman or what ever helper of your choice.

Clone the repository, and run the following commands:
`npm install && npm run tauri dev`
