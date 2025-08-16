// Модели данных
export interface Schedule {
  enabled: boolean
  from: string
  brightness: number[]
}

export interface MqttSettings {
  enabled: boolean,
  ip: string,
  port: number,
  clientId: string,
  username: string,
  password: string
}

export interface WifiApSettings {
  enabled: boolean,
  ssid: string,
  password: string,
  ip: string,
  gateway: string,
  subnet: string
}

export interface WifiStaSettings {
  enabled: boolean,
  ssid: string,
  password: string,
  hostname: string,
  ip: string,
  gateway: string,
  subnet: string
  dns1: string,
  dns2: string,
  dhcp: boolean,
  autoDns: boolean
}

export interface WifiSettings {
  ap: WifiApSettings,
  sta: WifiStaSettings[]
}

export interface WifiNetwork {
  ssid: string
  signal: number
  secure: boolean
}

export interface WifiScanResult {
  scanning: boolean,
  lastUpdatedAt: string,
  networks: WifiNetwork[]
}

export interface NtpSettings {
  server: string
  syncInterval: number
  timezone: string
}

export interface TempSettings {
  address: string
  exp_filter_wight: number
  approx_factor: number
  approx_offset: number
}

export interface CurrentTemp {
  ready: boolean
  temperature: number | null
}

export type FanMode = "auto" | "on" | "off" | "pause"

export interface FanState {
  mode: FanMode
}

export interface ThermostatSettings {
  temperature: number
  hysteresis: number
}

export interface TimeSettings {
  date: string
  time: string
}

export interface DeviceInfo {
  connected: boolean
  firmware: string
  ip: string
  subnet: string
  gateway: string
  rssi: number
  macAddress: string
  heapSize: number
  heapUsage: number
  maxFreeBlockSize: number
  uptime: string
  time: string
  timezone: string
}

export type LampMode = "scheduled" | "manual"

export interface LampState {
  mode: LampMode
  manualBrightness: number[],
  schedules: Schedule[]
}

export interface AppSettings {
  wifi: WifiSettings
  time: TimeSettings
  ntp: NtpSettings
}
