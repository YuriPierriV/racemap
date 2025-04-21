# RaceMap 🏁

_[README em Português](README.md)_

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/YuriPierriV/racemap)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)

A real-time race mapping system that combines a modern web interface with IoT devices to provide live tracking and analysis of racing events. RaceMap leverages ESP8266-based GPS devices to transmit location data in real-time to a powerful Next.js web application, allowing for precise tracking, visualization, and analysis of race performances.

<div align="center">
  <img src="public/logo_dark.png" alt="RaceMap Logo" width="300"/>
</div>

## Overview

RaceMap is a comprehensive racing management and tracking solution that enables:

- Real-time GPS tracking of racing vehicles
- Live race visualization and monitoring
- Track creation and management
- Driver and device management
- Detailed race statistics and analysis

## Technologies

### Frontend

- **Next.js 15** - React framework for web applications
- **React 19** - UI component library
- **TailwindCSS** - Utility-first CSS framework

### Backend

- **PostgreSQL** - Primary database for storing tracks, races, and user data
- **Node.js** - Runtime environment
- **Docker** - Containerization for development environment

### IoT Devices

- **ESP8266** - WiFi-enabled microcontroller
- **GPS Module** - For precise location tracking
- **MQTT Protocol** - For real-time data transmission

## Features

### Real-time Tracking

- Live GPS data transmission via MQTT
- Configurable update rates (1Hz, 10Hz, 20Hz)
- Automatic reconnection handling
- Secure data transmission

### Track Management

- Track creation and editing
- Support for inner and outer track boundaries
- Track rotation and padding adjustment
- Curve intensity configuration

### Driver Management

- Driver profiles and statistics
- Performance comparison tools
- Historical race data analysis

### Device Management

- Easy device configuration via captive portal interface
- Automatic WiFi configuration
- Real-time device status monitoring
- Device registration and management

### Race Analysis

- Real-time position tracking
- Lap time calculations
- Speed analysis
- Race replay functionality

### User Interface

- Modern, responsive design
- Dark/Light theme support
- Interactive dashboard
- Real-time updates

## Project Structure

- **`arduino/`**: ESP8266 integrated GPS tracking device code
  - `kart/` - Specific code for the tracking prototype
- **`infra/`**: Docker infrastructure configurations for database and MQTT services
- **`migrations/`**: Database migration scripts
- **`pages/`**: React components for the frontend
- **`styles/`**: TailwindCSS styling configurations
- **`tests/`**: Automated tests with Jest

## Development Setup

### Prerequisites

- Node.js and npm installed
- Docker and Docker Compose configured
- ESP8266 configured with the firmware from `arduino/kart` directory

### Installation Steps

1. **Clone the repository:**

```bash
git clone https://github.com/YuriPierriV/racemap.git
cd racemap
```

2. **Install dependencies:**

```bash
npm install
```

3. **Start Docker services:**

```bash
npm run services:up
```

4. **Start development environment:**

```bash
npm run dev
```

5. **Run tests:**

```bash
npm run test
```

## IoT Device Setup

### Hardware Requirements

- ESP8266 NodeMCU
- NEO-6M GPS Module
- USB cable for programming
- Power source (battery or USB)

#### Wiring Configuration:

- 🚧🚧 Working... 🚧🚧

### Device Configuration

1. **Install Arduino IDE Dependencies:**

   - ESP8266 board manager
   - TinyGPS++ library
   - PubSubClient library
   - ArduinoJson library

2. **Upload Firmware:**

   - Open `arduino/kart/kart.ino` in Arduino IDE
   - Select your ESP8266 board
   - Configure the MQTT broker credentials
   - Upload the code to your device

3. **Initial Setup:**
   - Power on the device
   - Press and hold the setup button for 3 seconds to enter configuration mode
   - The device will indicate configuration mode is active via serial output
   - Connect to the "ConfigWiFi" network (no password required)
   - Navigate to 192.168.4.1 in your browser
   - Configure your WiFi credentials
   - The device will automatically connect and start transmitting data
   - Configuration mode will automatically exit after 2 minutes if no changes are made

## Available Scripts

### Development

- **`npm run dev`**: Starts the complete development environment (services, database migrations, Next.js server)
- **`npm run services:up`**: Launches required Docker services (PostgreSQL, etc.)
- **`npm run services:down`**: Stops all Docker services
- **`npm run services:wait:database`**: Waits for PostgreSQL to be ready (used by other scripts)

### Database

- **`npm run migrations:up`**: Applies all pending database migrations
- **`npm run migrations:create`**: Creates a new migration file

### Code Quality

- **`npm run lint:prettier:check`**: Checks code formatting without making changes
- **`npm run lint:prettier:fix`**: Automatically fixes code formatting issues
- **`npm run lint:eslint:check`**: Runs ESLint to check code quality

### Testing

- **`npm run test`**: Runs all automated tests with services
- **`npm run test:watch`**: Runs tests in watch mode for development

### Version Control

- **`npm run commit`**: Uses commitizen for standardized commit messages
- **`npm run prepare`**: Sets up husky git hooks (runs automatically after install)

## Contributing

1. Fork the project
2. Create your feature branch:

```bash
git checkout -b my-new-feature
```

3. Stage your changes and commit using commitizen:

```bash
git add .
npm run commit  # This will guide you through creating a standardized commit message
```

4. Push to your branch:

```bash
git push origin my-new-feature
```

5. Submit a pull request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
