# Aquarium Lamp Manager

A Vue.js web application for controlling an ESP32-based aquarium lamp with 5 LED channels (Blue, Blue/Violet, Blue/Green, White, White/Yellow/Magenta).

## Features

- **Real-time Control**: Manual brightness control for each LED channel
- **Schedule Management**: Create and manage daily lighting schedules with up to 10 time points
- **WiFi Configuration**: Setup WiFi connection in AP or Client mode
- **Time Synchronization**: NTP time sync with timezone support
- **Device Management**: Monitor device status, memory usage, and uptime
- **Responsive Design**: Works on desktop and mobile devices
- **12/24 Hour Format**: Toggle between time formats

## Technology Stack

- **Frontend**: Vue 3 + TypeScript + Vuetify 3
- **State Management**: Pinia
- **Build Tool**: Vite
- **Styling**: Vuetify Material Design + Custom CSS

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd aquarium-lamp-manager
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start development server:
   ```bash
   npm run dev
   ```

4. Build for production:
   ```bash
   npm run build
   ```

## Project Structure

```
src/
├── components/          # Reusable Vue components
├── stores/             # Pinia stores
│   ├── app.ts         # Main application store
│   └── models.ts      # TypeScript interfaces
├── views/             # Page components
│   ├── Dashboard.vue  # Main control interface
│   └── Settings.vue   # Configuration page
├── router/            # Vue Router configuration
└── main.ts           # Application entry point
```

## API Integration

The application automatically detects the ESP32 IP address from the browser URL and makes API calls to the same host. No manual endpoint configuration required.

### Automatic API Endpoint Detection

- If UI is accessed at \`http://192.168.4.1:3000\` → API calls go to \`http://192.168.4.1\`
- If UI is accessed at \`http://192.168.1.100:8080\` → API calls go to \`http://192.168.1.100\`

## ESP32 API Specification

### Base URL
The API base URL is automatically determined from the current browser location.

### Authentication
Currently no authentication is required. All endpoints are publicly accessible.

### Content Type
All requests and responses use \`application/json\` content type.

---

## API Endpoints

### 🔆 Lamp Control

#### Get Lamp State
```http
GET /api/lamp/state
```

**Response:**
```json
{
    "mode": "schedule|manual|off",
    "brightness": [0, 25, 50, 75, 100]
}
```

#### Set Lamp Mode
```http
POST /api/lamp/mode
Content-Type: application/json

{
    "mode": "schedule|manual|off"
}
```

**Response:**
```json
{
    "success": true,
    "mode": "manual"
}
```

#### Set Channel Brightness
```http
POST /api/lamp/brightness
Content-Type: application/json

{
    "channel": 0,
    "brightness": 75
}
```

**Parameters:**
- \`channel\`: 0-4 (Blue, Blue/Violet, Blue/Green, White, White/Yellow/Magenta)
- \`brightness\`: 0-100

**Response:**
```json
{
    "success": true,
    "channel": 0,
    "brightness": 75
}
```

---

### 📅 Schedule Management

#### Get Schedule
```http
GET /api/schedule
```

**Response:**
```json
{
  "points": [
    {
        "enabled": true,
        "time": "06:00",
        "brightness": [10, 20, 30, 40, 50]
    },
    {
        "enabled": true,
        "time": "12:00",
        "brightness": [80, 90, 70, 100, 60]
    }
  ]
}
```

#### Update Schedule Point
```http
POST /api/schedule/point
Content-Type: application/json

{
    "index": 0,
    "point": {
        "enabled": true,
        "time": "06:30",
        "brightness": [15, 25, 35, 45, 55]
    }
}
```

**Response:**
```json
{
    "success": true,
    "index": 0
}
```

---

### 📶 WiFi Management

#### Scan WiFi Networks
```http
GET /api/wifi/scan
```

**Response:**
```json
{
  "networks": [
    {
        "ssid": "HomeNetwork",
        "signal": -45
    },
    {
        "ssid": "OfficeWiFi",
        "signal": -60
    }
  ]
}
```

#### Configure WiFi
```http
POST /api/wifi/config
Content-Type: application/json

{
    "mode": "client|ap|auto",
    "ap": {
        "ssid": "AquariumLamp",
        "ip": "192.168.4.1",
        "password": "12345678"
    },
    "client": {
        "selectedNetwork": "HomeNetwork",
        "password": "wifi_password"
    }
}
```

**Response:**
```json
{
    "success": true,
    "message": "WiFi configuration updated"
}
```

---

### ⏰ Time Management

#### Get Available Timezones
```http
GET /api/time/timezones
```

**Response:**
```json
{
    "timezones": [
        {
            "id": "UTC",
            "name": "UTC (GMT+0)"
        },
        {
            "id": "America/New_York",
            "name": "Eastern Time (GMT-5)"
        }
    ]
}
```

#### Configure Time Settings
```http
POST /api/time/config
Content-Type: application/json

{
    "date": "2025-07-31",
    "time": "18:30",
    "autoSync": true,
    "ntpServer": "pool.ntp.org",
    "timezone": "UTC",
    "format": "24"
}
```

**Response:**
```json
{
    "success": true,
    "message": "Time configuration updated"
}
```

---

### 🔧 Device Management

#### Get Device Information
```http
GET /api/device/info
```

**Response:**
```json
{
    "ip": "192.168.4.1",
    "firmware": "v1.2.3",
    "uptime": "2 days, 14 hours",
    "freeMemory": "45.2 KB"
}
```

#### Configure Device Settings
```http
POST /api/device/config
Content-Type: application/json

{
    "updateInterval": 5
}
```

**Response:**
```json
{
    "success": true,
    "message": "Device configuration updated"
}
```

#### Reboot Device
```http
POST /api/device/reboot
```

**Response:**
```json
{
    "success": true,
    "message": "Device rebooting..."
}
```

---

### ⚙️ Settings Management

#### Get All Settings
```http
GET /api/settings
```

**Response:**
```json
{
    "wifi": {
        "mode": "client",
        "ap": {
        "ssid": "AquariumLamp",
        "ip": "192.168.4.1",
        "password": ""
        },
        "client": {
            "selectedNetwork": "HomeNetwork",
            "password": "wifi_password"
        }
    },
    "time": {
        "date": "2025-07-31",
        "time": "18:30",
        "autoSync": true,
        "ntpServer": "pool.ntp.org",
        "timezone": "UTC",
        "format": "24"
    },
    "device": {
      "updateInterval": 5
    }
}
```

---

## Error Handling

All API endpoints should return appropriate HTTP status codes:

- \`200\` - Success
- \`400\` - Bad Request (invalid parameters)
- \`404\` - Not Found (invalid endpoint)
- \`500\` - Internal Server Error

**Error Response Format:**
```json
{
    "success": false,
    "error": "Error message description",
    "code": "ERROR_CODE"
}
```

## LED Channel Mapping

| Channel | Color | Description |
|---------|-------|-------------|
| 0 | Blue | Pure blue LEDs |
| 1 | Blue/Violet | Blue-violet spectrum |
| 2 | Blue/Green | Cyan/teal spectrum |
| 3 | White | Cool white LEDs |
| 4 | White/Yellow/Magenta | Warm white/full spectrum |

## Development Notes

### Auto-refresh
The application automatically refreshes lamp data and device info every 5 seconds (configurable).

### Offline Mode
If the ESP32 is unreachable, the app continues to work with cached data and shows connection status.

### Optimistic Updates
UI updates immediately when user makes changes, then syncs with the device. If sync fails, changes are reverted.

### Time Format
The app supports both 12-hour and 24-hour time formats. All API communication uses 24-hour format internally.

## Browser Compatibility

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## License

MIT License - see LICENSE file for details.
