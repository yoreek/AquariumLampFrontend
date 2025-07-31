// Модели данных
export interface SchedulePoint {
  enabled: boolean
  time: string
  brightness: number[] // Массив из 5 значений для каждого канала
}

export interface ScheduleSettings {
  points: SchedulePoint[]
}

export interface WifiSettings {
  mode: "ap" | "client" | "auto"
  ap: {
    ssid: string
    ip: string
    password: string
  }
  client: {
    selectedNetwork: string
    password: string
  }
}

export interface TimeSettings {
  date: string
  time: string
  autoSync: boolean
  ntpServer: string
  timezone: string
  format: "12" | "24"
}

export interface DeviceSettings {
  apiEndpoint: string
  updateInterval: number
}

export interface DeviceInfo {
  connected: boolean
  ip: string
  firmware: string
  uptime: string
  freeMemory: string
}

export interface LampState {
  mode: "schedule" | "manual" | "off"
  manualBrightness: number[]
}

export interface AppSettings {
  wifi: WifiSettings
  time: TimeSettings
  device: DeviceSettings
}
