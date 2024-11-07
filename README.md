<p align="center"><img width="350px" src="https://github.com/user-attachments/assets/9dd29f8b-2a3f-4396-8a89-0f8790b1d894" /></p>

# <p align="center">Alset Solar Cybersedan Dashboard Demo</p>

[![Documentation](https://img.shields.io/badge/docs-online-brightgreen.svg)](https://aev.zachl.tech) [![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

This website serves as a DEMO of the Alset Solar Cybersedans dashboard system including details on all visuals and extra info/easter eggs here and there. For more info and context, below is the github readme outlining the entire project

P.S. Mobile is NOT supported for simulations. But feel free to check out the gallery though :D - Also, you can find screenshots of what the simulations & pages look like [here](https://zipline.zachl.tech/folder/2)

The Alset Solar Cybersedan Software is a comprehensive full-stack ecosystem developed for the FAUHS AEV solar car, enabling seamless integration and operation of various hardware components such as the Thunderstruck BMS, cameras, GPS module, and custom sound horn. This project was undertaken as part of the Advanced Experimental Vehicles program at FAU High School.

## Overview

The Alset Solar Cybersedan Software is designed to interface with the FAUHS AEV solar car, providing a Tesla-style dashboard experience. This project was a collaborative effort involving a team of dedicated students who spent a year building the car after three years of planning from us and prior students. The software integrates various hardware components and offers a user-friendly interface to monitor and control the vehicle's systems via a touchscreen dashboard inside our car. It was also interfaceable on any device from anywhere in the world with a proper VPN configuration per client. 

For more information on the Solar Car Challenge, visit the [Solar Car Challenge website](https://www.solarcarchallenge.org/challenge/).

ℹ️ A live demo of what the software looked like during the race as well as pictures of the dashboard in use is coming soon... 

## Development and Collaboration

The project was a collaborative effort within the solar car club's coding subteam. As part of this team, we focused on building a robust and interactive frontend interface, integrating backend services, and ensuring smooth communication between all components.

## Key Features

- **Frontend Interface**: Developed using Nuxt.js and TailwindCSS, providing a sleek, modern user interface.
- **Backend Infrastructure**: Using Javascript, websockets, and RESTAPI libraries, this is what manages and stores all telemetry
- **Realtime Data Display**: Displays speed, BMS data, lap timings, and camera feeds live from anywhere in the world via a VPN.
- **Camera Integration**: Access to three cameras (rear and two blind spots) with full-screen viewing options.
- **Custom Soundboard and Playlist**: Features for custom horn sounds and a music playlist.
- **Settings and Debugging Tools**: Includes settings for WiFi and Bluetooth, along with a debug terminal for developers.
- **Data Management**: Capabilities to send data to Google Sheets and restart key components directly from the interface.

## Technical Details

### Languages and Tools

- **Frontend**: Nuxt.js, TailwindCSS, Electron
- **Backend**: JavaScript, ExpressJS, Websockets
- **3D Visualization**: ThreeJS
- **Documentation**: Docus (Nuxt.js-based)

### System Architecture

- **Hardware**: Raspberry Pi 5 with 8GB RAM
- **Operating System**: Arch Linux ARM
- **Navigation**: Hyprland compositor and Aylur's GTK Shell
- **Communication Interfaces**: USB serial ports, gpsd, Wireguard VPN
- **Redundancy**: Multiple MicroSD card backups & Version control on all important functionality

## Documentation

Currently primitive documentation built for our team members so they can understand and properly operate the dashboard system. Visit the [Alset Solar Cybersedan Documentation](https://aev.zachl.tech) for more details.

## Contributors

The coding subteam members who contributed to the software and the solar car project:

- [Zach Lopez (Frontend/Unix)](https://github.com/ZachLTech)
- [Thandi Menelas - Str1ke (Backend/Unix)](https://github.com/RealStr1ke)
- [Jossaya Camille (Frontend/Backend)](https://github.com/jcamille2023)
- [Amarnath Patel (Unix/Documentation)](https://github.com/jeebuscrossaint)

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Acknowledgments

We acknowledge the support of the FAU High School Advanced Experimental Vehicles program as well as all of our sponsors and the Solar Car Challenge organizers. Their guidance and resources were invaluable to the success of this project.


![CarRacing](https://github.com/user-attachments/assets/48044884-80c2-424a-8b2b-e2ced255b7f2)
