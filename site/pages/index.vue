<script setup>
    useSeoMeta({
        title: 'AEV Software - Solar Car Dashboard DEMO',
        ogTitle: 'AEV Software - Solar Car Dashboard DEMO',
        description: 'This is the software demo for the Alset Solar Cybersedan dashboard system which includes details, images, simulations, and more.',
        ogDescription: 'This is the software demo for the Alset Solar Cybersedan dashboard system which includes details, images, simulations, and more.',
        ogImage: 'https://private-user-images.githubusercontent.com/109718204/354929556-48044884-80c2-424a-8b2b-e2ced255b7f2.png?jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTUiLCJleHAiOjE3MzA2OTgyMjIsIm5iZiI6MTczMDY5NzkyMiwicGF0aCI6Ii8xMDk3MTgyMDQvMzU0OTI5NTU2LTQ4MDQ0ODg0LTgwYzItNDI0YS04YjJiLWUyY2VkMjU1YjdmMi5wbmc_WC1BbXotQWxnb3JpdGhtPUFXUzQtSE1BQy1TSEEyNTYmWC1BbXotQ3JlZGVudGlhbD1BS0lBVkNPRFlMU0E1M1BRSzRaQSUyRjIwMjQxMTA0JTJGdXMtZWFzdC0xJTJGczMlMkZhd3M0X3JlcXVlc3QmWC1BbXotRGF0ZT0yMDI0MTEwNFQwNTI1MjJaJlgtQW16LUV4cGlyZXM9MzAwJlgtQW16LVNpZ25hdHVyZT0zNTAzNmEyZmU1ODQyZThkN2E0MTgwNjc4NGJlMTY4YjA1ODA0OWNlZGRkZDE0NDdiZmQxOTdhNzE5YmQwZTRmJlgtQW16LVNpZ25lZEhlYWRlcnM9aG9zdCJ9.3AMQc6Dgp8PZ9mQT6FuSgpezhMnI1-Z8LkbKqDqBL8s',
    });
</script>

<template>
    <div class="fixed top-[45%] left-24 z-[9999]">← Use these to navigate!</div>
    <demoNav class="fixed top-[40%] left-5 z-[9999]" />
    <div class="w-screen flex justify-center items-center pt-16">
        <section class="container mx-auto px-4 pt-8 max-w-[1200px]">
            <div class="flex justify-center">
                <img
                class="w-[350px] mb-6"
                src="/alsetOnlyLogo.png"
                alt="Alset Solar Cybersedan Software Logo"
                />
            </div>
        
            <h1 class="text-3xl font-semibold text-center">Alset Solar Cybersedan Dashboard Demo</h1>
        
            <hr class="my-6 border-t border-gray-300" />
        
            <div class="flex justify-center space-x-4 mb-8">
                <a
                class="text-green-500 font-medium hover:underline"
                href="https://aev.zachl.tech"
                target="_blank"
                rel="noopener noreferrer"
                >
                <img src="https://img.shields.io/badge/docs-online-brightgreen.svg" alt="Documentation" />
                </a>
                <a
                class="text-blue-500 font-medium hover:underline"
                href="LICENSE"
                target="_blank"
                rel="noopener noreferrer"
                >
                <img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="License" />
                </a>
            </div>
        
            <p class="text-gray-700 leading-relaxed mb-8">
                This website serves as a DEMO of the Alset Solar Cybersedans dashboard system including details on all visuals and extra info/easter eggs here and there. For more info and context, below is the github readme outlining the entire project :) <br><br>P.S. Mobile is NOT supported<br><br> The Alset Solar Cybersedan Software is a comprehensive full-stack ecosystem developed for the FAUHS AEV solar car, enabling seamless integration and operation of various hardware components such as the Thunderstruck BMS, cameras, GPS module, and custom sound horn. This project was undertaken as part of the Advanced Experimental Vehicles program at FAU High School.
            </p>
        
            <h2 class="text-2xl font-semibold mb-4">Overview</h2>
            <hr class="my-3 border-t border-gray-300" />
            <p class="text-gray-700 leading-relaxed mb-8">
                The Alset Solar Cybersedan Software is designed to interface with the FAUHS AEV solar car, providing a Tesla-style dashboard experience. This project was a collaborative effort involving a team of dedicated students who spent a year building the car after three years of planning. The software integrates various hardware components and offers a user-friendly interface to monitor and control the vehicle's systems via a touchscreen dashboard inside our car. It was also interfaceable on any device from anywhere in the world with a proper VPN configuration per client.
            </p>
        
            <p class="mb-8">
                For more information on the Solar Car Challenge, visit the <a href="https://www.solarcarchallenge.org/challenge/" class="underline text-blue-500" target="_blank" rel="noopener noreferrer">Solar Car Challenge website</a>.
            </p>

            <h2 class="text-2xl font-semibold mb-4">Development and Collaboration</h2>
            <hr class="my-3 border-t border-gray-300" />
            <p class="text-gray-700 leading-relaxed mb-8">
                The project was a collaborative effort within the solar car club's coding subteam. As part of this team, we focused on building a robust and interactive frontend interface, integrating backend services, and ensuring smooth communication between all components.
            </p>
        
            <h2 class="text-2xl font-semibold mb-4">Key Features</h2>
            <hr class="my-3 border-t border-gray-300" />
            <ul class="list-disc pl-5 text-gray-700 leading-relaxed mb-8 space-y-2 ml-5">
                <li><strong>Frontend Interface</strong>: Developed using Nuxt.js and TailwindCSS, providing a sleek, modern user interface.</li>
                <li><strong>Backend Infrastructure</strong>: Using Javascript, websockets, and RESTAPI libraries, this manages and stores all telemetry.</li>
                <li><strong>Realtime Data Display</strong>: Displays speed, BMS data, lap timings, and camera feeds live from anywhere via a VPN.</li>
                <li><strong>Camera Integration</strong>: Access to three cameras (rear and two blind spots) with full-screen viewing options.</li>
                <li><strong>Custom Soundboard and Playlist</strong>: Features for custom horn sounds and a music playlist.</li>
                <li><strong>Settings and Debugging Tools</strong>: Includes settings for WiFi and Bluetooth, along with a debug terminal for developers.</li>
                <li><strong>Data Management</strong>: Capabilities to send data to Google Sheets and restart key components directly from the interface.</li>
            </ul>
        
            <h2 class="text-2xl font-semibold mb-4">Technical Details</h2>
            <hr class="my-3 border-t border-gray-300" />
            <div class="mb-8">
                <h3 class="text-xl font-semibold mb-2">Languages and Tools</h3>
                <ul class="list-disc pl-5 text-gray-700 space-y-1 ml-5">
                    <li><strong>Frontend</strong>: Nuxt.js, TailwindCSS, Electron</li>
                    <li><strong>Backend</strong>: JavaScript, ExpressJS, Websockets</li>
                    <li><strong>3D Visualization</strong>: ThreeJS</li>
                    <li><strong>Documentation</strong>: Docus (Nuxt.js-based)</li>
                </ul>
            </div>
        
            <div class="mb-8">
                <h3 class="text-xl font-semibold mb-2">System Architecture</h3>
                <ul class="list-disc pl-5 text-gray-700 space-y-1 ml-5">
                    <li><strong>Hardware</strong>: Raspberry Pi 5 with 8GB RAM</li>
                    <li><strong>Operating System</strong>: Arch Linux ARM</li>
                    <li><strong>Navigation</strong>: Hyprland compositor and Aylur's GTK Shell</li>
                    <li><strong>Communication Interfaces</strong>: USB serial ports, gpsd, Wireguard VPN</li>
                    <li><strong>Redundancy</strong>: Multiple MicroSD card backups & Version control on all important functionality</li>
                </ul>
            </div>
        
            <h2 class="text-2xl font-semibold mb-4">Documentation</h2>
            <hr class="my-3 border-t border-gray-300" />
            <p class="text-gray-700 leading-relaxed mb-8">
                Currently primitive documentation built for our team members so they can understand and properly operate the dashboard system. Visit the <a href="https://aev.zachl.tech" class="text-blue-500 underline" target="_blank" rel="noopener noreferrer">Alset Solar Cybersedan Documentation</a> for more details.
            </p>
        
            <h2 class="text-2xl font-semibold mb-4">Contributors</h2>
            <hr class="my-3 border-t border-gray-300" />
            <ul class="list-disc pl-5 text-gray-700 space-y-1 mb-8 ml-5">
                <li><a href="https://github.com/ZachLTech" class="text-blue-500 underline" target="_blank">Zach Lopez (Frontend/Unix)</a></li>
                <li><a href="https://github.com/RealStr1ke" class="text-blue-500 underline" target="_blank">Thandi Menelas - Str1ke (Backend/Unix)</a></li>
                <li><a href="https://github.com/jcamille2023" class="text-blue-500 underline" target="_blank">Jossaya Camille (Frontend/Backend)</a></li>
                <li><a href="https://github.com/jeebuscrossaint" class="text-blue-500 underline" target="_blank">Amarnath Patel (Unix/Documentation)</a></li>
            </ul>
        
            <h2 class="text-2xl font-semibold mb-4">License</h2>
            <hr class="my-3 border-t border-gray-300" />
            <p class="text-gray-700 leading-relaxed mb-8">
                This project is licensed under the MIT License. See the <a href="LICENSE" class="text-blue-500 underline">LICENSE</a> file for details.
            </p>
        
            <h2 class="text-2xl font-semibold mb-4">Acknowledgments</h2>
            <hr class="my-3 border-t border-gray-300" />
            <p class="text-gray-700 leading-relaxed mb-8">
                We acknowledge the support of the FAU High School Advanced Experimental Vehicles program as well as all of our sponsors and the Solar Car Challenge organizers. Their guidance and resources were invaluable to the success of this project.
            </p>
            <img
                class="w-full mt-6"
                src="https://github.com/user-attachments/assets/48044884-80c2-424a-8b2b-e2ced255b7f2"
                alt="Car Racing Image"
            />
        </section>
    </div>
    <div class="w-screen py-12 flex justify-center items-center">
        <p class="py-2 px-4 bg-black text-white rounded-lg">
            Demo site made with ♡ by&nbsp;<a class="underline bg-gradient-to-r from-green-400 to-green-700 inline-block text-transparent bg-clip-text" href="https://zachl.tech" target="_blank">ZachLTech</a>
        </p>
    </div>
  </template>
  