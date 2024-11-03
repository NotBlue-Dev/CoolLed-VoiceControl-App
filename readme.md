# Project Title

## Description

This project is a React Native application that integrates voice recognition, Bluetooth Low Energy (BLE) communication, and text-to-speech (TTS) functionalities. Allows users to interact with CoolLED devices through voice commands, providing a seamless experience for controlling various features such as brightness, color, text, images and animations.

This project allows me to change my LED's content while driving without ever touching the phone, also allow me to display any images which is not possible
using the coolLedX app

This project was made for fun and to learn more about BLE communication and voice recognition, it's not meant to be used by anyone else

## Backend

The backend is creating the bytes commands and spliting them into chunks to send them to the device, you can find the repo here [CoolLed-VoiceControl-Backend](https://github.com/NotBlue-Dev/CoolLed-VoiceControl-Api)

## Features

- **Voice Recognition**: Utilizes voice recognition to interpret user commands.
- **Bluetooth Connectivity**: Connects to CoolLed devices through BLE for real-time control.
- **Text-to-Speech**: Provides audio feedback to users based on their commands.
- **Logging**: Maintains a log of actions and errors for debugging purposes.
- **Commands list**: Create a list of all the commands automatically from the pico yaml file

## Technologies Used

- **React Native**: Framework for building the mobile application.
- **TypeScript**: For type safety and better development experience.
- **TTS (Text-to-Speech)**: For providing audio feedback.
- **BLE (Bluetooth Low Energy)**: For connecting and communicating with LED devices.
- **Picovoice**: For voice recognition and hotword detection.

## Demo

### Application Screenshots

<a href="https://freeimage.host/i/2x3WqGt"><img src="https://iili.io/2x3WqGt.md.jpg" alt="2x3WqGt.md.jpg" border="0" width=150></a> <a href="https://freeimage.host/i/2x3WfnI"><img src="https://iili.io/2x3WfnI.md.jpg" alt="2x3WfnI.md.jpg" border="0" width=150></a> <a href="https://freeimage.host/i/2x3WB6X"><img src="https://iili.io/2x3WB6X.md.jpg" alt="2x3WB6X.md.jpg" border="0" width=150></a>

### Video Demo

[![Video Demo](https://img.youtube.com/vi/y1z3RzcJpCc/3.jpg)](https://youtu.be/y1z3RzcJpCc)

## My device setup

I'm using an android running Termux which runs the API backend on a local server, the app is running on the same device and connects to the API to send the commands to the LED device.
This allow me to have everything working without an internet connection

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/NotBlue-Dev/CoolLed-VoiceControl-App
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   - Create a `.env` file in the root directory and add the following:
     ```
     EXPO_PUBLIC_ACCESS_KEY=your_access_key
     EXPO_PUBLIC_API_URL=your_api_url
     EXPO_PUBLIC_DEVICE_MAC_ADDRESS=your_device_mac_address
     ```

4. Run the application:
   ```bash
   npm start
   ```

## Usage

- Launch the application on your mobile device or emulator.
- Use voice commands to control the LED device. For example:
  - "Change color to red"
  - "Set brightness to 50%"
  - "Display image smiley"
See the LED.yaml for all the commands

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgements

- [CrimsonClyde](https://git.team23.org/CrimsonClyde) for his reverse engineering work on the CoolLED devices.