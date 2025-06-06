# Unphone Game Controller
## Project Overview

This project configures an Unphone device (ESP32-S3 based) to act as a game controller. It can trigger a "jump" action in a game running on a local computer by:

1.  Detecting a physical "flick up" gesture using its onboard IMU (accelerometer and gyroscope).
2.  Responding to a "JUMP" button press on button 1.

When either trigger occurs, the Unphone sends an HTTP GET request to a specified endpoint (`/jump` and `/jump2` for player1 and player2 respectively) on a game server running on the local network.

## Features

* **Contextual Flick-to-Jump:** Utilises the LSM6DS3TRC IMU to detect an upward flicking motion. This feature is **only active when the "DinoGame Controller" UI screen is displayed**
    * Configurable sensitivity thresholds for gyroscope and accelerometer.
    * Cooldown period to prevent multiple triggers from a single flick.
* **Button-Based Jump Trigger:**
    * Utilises Unphone’s Button 1 to trigger jump manually.
    * Button 3 is made to be as a TV remote control, specifically LG TV, power button. (This functionality is made for fun utilising external library by [crankyoldgit](https://github.com/crankyoldgit/IRremoteESP8266) )
* **Network Communication:**
    * Connects to Wi-Fi using `WiFiMulti`.
    * Sends a "jump" command to a configurable game server via an HTTP GET request using `HTTPClient`.
* **Custom Unphone UI:**
    * A new "DinoGame Controller" screen was added to the Unphone's main menu system.
    * Integrates with the Unphone's existing GFX-based UI framework (`unPhoneUI0` from `everything`).
    * This screen features a visual indicator with player number.
    * Demonstrates adding new screens and menu items.

## Hardware Requirements

* Unphone device (unphone 9).
* Onboard IMU (specifically configured for Adafruit_LSM6DS3TRC).

## Software Components (ESP32 - Unphone Side)

The project is primarily structured around the main sketch (`sketch.ino`) and the `unPhoneLibrary` (consisting of `unPhone.h`, `unPhone.cpp`, `unPhoneUI0.h`, `unPhoneUI0.cpp`).

### 1. Main Sketch (`sketch.ino`)

* **Wi-Fi Setup:** Initializes and manages Wi-Fi connection using `WiFiMulti` and credentials (ideally from `private.h`).
* **IMU Initialization:** Sets up the `Adafruit_LSM6DS3TRC` sensor, including I2C communication, accelerometer range, and gyroscope range in `setup()`.
* **Flick Detection Logic:**
    * Continuously reads accelerometer and gyroscope data in the main `loop()`.
    * Compares primary gyroscope axis data (e.g., `gyro_event.gyro.x`) against `FLICK_GYRO_X_THRESHOLD`.
    * Compares primary accelerometer axis data (e.g., `accel_event.acceleration.y`) against `FLICK_ACCEL_Y_THRESHOLD`.
    * Implements `FLICK_COOLDOWN_MS` to prevent rapid re-triggering.
* **Button Press Detection:**
    * In the `loop()`, call `u.button1()` (a method of the `unPhone` class) to check if the UI jump button was pressed.
    * u.button3() is called to fire a burst of infrared signal matching command to power on/off a TV that is receiving NEC protocol.
* **HTTP Client Logic:**
    * Uses `HTTPClient.h`.
    * When either a flick is detected or the button1 is pressed, it constructs an HTTP GET request (e.g., to `http://<host>:<port>/jump`).
    * Sends the request and handles the response code.
    * Calls `http.end()` to release resources.

### 2. Unphone Core Library (`unPhone.h`, `unPhone.cpp`)

* Provides hardware abstraction for various Unphone features (display, touch, buttons, power, etc.).
* **Jump Trigger Mechanism:**
    * `bool m_dinoGameStarted`: A private member variable to store the state of the UI.
    * `void setDinoGameFlag(bool)`: Public method called by the UI to set `m_dinoGameStarted` to true/false.
    * `bool getDinoGameFlag()`: Public method called by `sketch.ino` to check if `m_dinoGameStarted` is true.

### 3. Unphone UI (`unPhoneUI0.h`, `unPhoneUI0.cpp`)

This module manages the Unphone's graphical user interface using a custom framework built on Adafruit GFX derived from `everything`.

* **`UIController` Class:** Manages different UI "modes" or screens.
* **Menu Item Addition:**
    * `UIController::ui_mode_names[]`: Array updated with "DinoGame Controller".
    * `UIController::NUM_UI_ELEMENTS`: Incremented to reflect the new item.
    * `ui_modes_t` enum (in `unPhoneUI0.h`): A new enum member (e.g., `ui_dino_controller`) added, corresponding to the new menu item's index.
* **`DinoGameControllerUIElement` Class:**
    * A new class derived from `UIElement`.
    * **`draw()` method:** Renders the custom game controller screen using Adafruit GFX commands (e.g., displays a title, draws a visual "Player[num]" area). Includes a "switcher" icon to return to the main menu.
    * **`handleTouch()` method:** Processes touch input on this screen.
        * Handles touches on the "switcher" icon to return to the main menu.
    * `runEachTurn()`: For any periodic logic specific to this screen.
* **`UIController::allocateUIElement()`:** Modified with a new `case` statement to create an instance of `DinoGameControllerUIElement` when the corresponding menu item is selected.

## Setup and Configuration (ESP32 - Unphone Side)

1.  **Wi-Fi Credentials:** Configure your Wi-Fi SSID and password. This is done in a `private.h` file (which should be in the same directory as `sketch.ino`.
    Example `private.h` content:
    ```c++
    #define _MULTI_SSID1 "Your_WiFi_SSID"
    #define _MULTI_KEY1  "Your_WiFi_Password"
    // other wifi connections
    ```
2.  **Game Server IP Address and Port:** In `sketch.ino` (or a configuration file), set:
    * `const char* host = "YOUR_COMPUTER_LAN_IP";` (e.g., "192.168.1.100")
    * `const int port = 3000;` (or the port the game websocket server's HTTP `/jump` endpoint is listening on default on 3000)
3.  **Flick Detection Thresholds:** In `sketch.ino`, adjust these constants based on testing:
    * `FLICK_GYRO_X_THRESHOLD` (e.g., -2.5 rad/s)
    * `FLICK_ACCEL_Y_THRESHOLD` (e.g., 6.0 m/s²)
    * `FLICK_COOLDOWN_MS` (e.g., 1000 milliseconds)
4.  **PlatformIO Setup (`platformio.ini`):**
    Ensure your `platformio.ini` includes dependencies for the libraries used. Key libraries directly used or complete dependencies for unphone 9 can be downloaded here:
    * `Adafruit GFX Library` (likely a dependency of `Adafruit_HX8357`)
    * `Adafruit HX8357 Library`
    * `XPT2046_Touchscreen`
    * `Adafruit LSM6DS Library` (for LSM6DS3TRC)
    * `IRremoteESP8266` (part of the original template)
    * `HTTPClient` (built-in with ESP32 core)
    * `WiFi` (built-in)

    Your `unPhone.h`, `unPhone.cpp`, `unPhoneUI0.h`, and `unPhoneUI0.cpp` files should be placed in your project's `.pio\libdeps\unphone9` directory so PlatformIO can compile and link.

## Game Server Side

### NVM (Node Version Manager) Installation

#### Windows

1. **Download the Installer**  
   Visit the [nvm-windows releases page](https://github.com/coreybutler/nvm-windows/releases) and download the latest `nvm-setup.zip`.

2. **Run the Installer**  
   Extract the archive and run `nvm-setup.exe`. Follow the installation wizard to complete the setup.

3. **Verify Installation**  
   Open a new Command Prompt or PowerShell window and run:

   ```bash
   nvm version
   ```
#### macOS / Linux

1. **Install NVM**
   Open a terminal and run:

   ```bash
   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
   ```

2. **Activate NVM**
   Add the following lines to your shell profile (`~/.bashrc`, `~/.zshrc`, or similar):

   ```bash
   export NVM_DIR="$HOME/.nvm"
   [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
   ```

   Then reload your terminal or run the above commands manually to activate NVM.

## Node.js Installation

Once NVM is installed, install and use Node.js:

```bash
nvm install 18
nvm use 18
nvm alias default 18
```

## Setting Up the WebSocket Server

1. Navigate to the server directory:

   ```bash
   cd jump-server
   ```

2. Start the WebSocket server:
    ```bash
   node server.js
   ```

   Make sure port `3000` is available and not blocked by a firewall.


* The game runs on a PC, served locally (e.g., by VS Code Live Server on port 5500 and WebSocket server on 3000).
* This server environment must be configured to **listen for HTTP GET requests on the `/jump` path** (or whatever path you configure in the Unphone sketch).
* Upon receiving this `GET /jump` request, the server-side logic (or the game itself, if it can directly interpret server logs or has a backend) needs to trigger the "jump" action in the game.

## How to Use

1.  **Configure:** Set up your Wi-Fi credentials, and the `host` IP address and `port` for your game server in the Unphone sketch.
2.  **Tune:** Adjust flick detection thresholds by observing sensor data during test flicks.
3.  **Upload:** Compile and upload the sketch to your Unphone device using PlatformIO or Arduino IDE.
4.  **Run Game Server:** Start your game and its associated server on your computer. Ensure it's accessible on your local network at the IP and port configured in the Unphone sketch.
5.  **Play:**
    * Perform the "flick up" gesture with the Unphone.
    * Alternatively, navigate to the "DinoGame Controller" screen on the Unphone and tap the "JUMP" button area.
    * The Unphone should send an HTTP GET request to your game server, triggering the jump action.

## Troubleshooting/Notes

* **Serial Monitor:** Use the Arduino Serial Monitor extensively for debugging. Check for Wi-Fi connection status, IMU readings, flick detection messages, HTTP request attempts, and response codes.
* **Flick Thresholds:** Find the right thresholds for personal comfort (or use the button1).
* **Server IP Address:** Ensure the `host` IP address in the Unphone sketch is the correct current **Local Area Network (LAN)** IP address of the computer running the game server.
* **Server Port and Path:** Double-check that the port and the path (e.g., `/jump`) match exactly what your game server is expecting for the HTTP GET request.
* **Firewall:** Ensure your computer's firewall is not blocking incoming connections to the game server port from other devices on your local network (like the Unphone).
* **HTTP vs. WebSocket:** This project currently uses the Unphone as an HTTP client to send the jump command. The game is hosted on http server and listening to WebSocket server on another port. Unphone should request GET command in the websocket port instead.
* **Library dependencies issue** If for some reason you keep getting build errors on dependencies (especially AsyncWebServer). Try:
  * Clear all download dependencies `rm -rf .pio/libdeps/unphone9/*`
  * Unzip “libraries9.zip” into libdeps `unzip libraries9.zip -d .pio/libdeps/unphone9` (Make sure to skip the unPhoneLibrary folder as this project derived some bit and pieces for the functionality)
  * Then upon compiling again it re-downloaded any missing dependencies and the error went away

## Gambar Sini (GUI ke apa2 ke) 

## Link video demonstration
Youtube LINK

## Acknowledgements

* The core Unphone class structure, including the GFX-based UI framework (`UIController`, `MenuUIElement`, etc. in `unPhoneUI0.cpp` and `unPhoneUI0.h`), is derived from or inspired by the examples and library provided by Hamish Cunningham for the unPhone project, available at
 [unphoneLibrary](https://gitlab.com/hamishcunningham/unphonelibrary).

* The game mechanic, design, art sprites is derived from or inspired by a git repository available at 
[CodingWith-Adam](https://github.com/CodingWith-Adam/dino-game.git) 

* The Switching TV off feature is inspired by a git repository available at [crankyoldgit](https://github.com/crankyoldgit/IRremoteESP8266) 
