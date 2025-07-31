import { defineStore } from "pinia"
import { ref, computed } from "vue"
import type {
  ScheduleSettings,
  AppSettings,
  LampState,
  DeviceInfo,
  SchedulePoint,
  WifiSettings,
  TimeSettings,
  DeviceSettings,
} from "./models"

export const useAppStore = defineStore("app", () => {
  // Connection state
  const isConnected = ref(false)

  // Lamp state
  const lampState = ref<LampState>({
    mode: "schedule",
    manualBrightness: [0, 0, 0, 0, 0],
  })

  // Schedule storage
  const scheduleSettings = ref<ScheduleSettings>({
    points: Array.from({ length: 10 }, (_, i) => ({
      enabled: i < 4,
      time: `${String(6 + i * 2).padStart(2, "0")}:00`,
      brightness: [
        Math.max(0, 100 - i * 10), // White
        Math.max(0, 80 - i * 8), // Blue
        Math.max(0, 60 - i * 6), // Red
        Math.max(0, 90 - i * 9), // Green
        Math.max(0, 70 - i * 7), // UV
      ],
    })),
  })

  // Simple reactive time format
  const timeFormat = ref<"12" | "24">("24")

  // App settings storage
  const appSettings = ref<AppSettings>({
    wifi: {
      mode: "auto",
      ap: {
        ssid: "AquariumLamp",
        ip: "192.168.4.1",
        password: "",
      },
      client: {
        selectedNetwork: "",
        password: "",
      },
    },
    time: {
      date: new Date().toISOString().split("T")[0],
      time: new Date().toTimeString().split(" ")[0].substring(0, 5),
      autoSync: true,
      ntpServer: "pool.ntp.org",
      timezone: "UTC",
      format: "24",
    },
    device: {
      apiEndpoint: "http://192.168.4.1/api",
      updateInterval: 5,
    },
  })

  // Device info storage
  const deviceInfo = ref<DeviceInfo>({
    connected: false,
    ip: "192.168.4.1",
    firmware: "v1.2.3",
    uptime: "2 days, 14 hours",
    freeMemory: "45.2 KB",
  })

  // Computed properties for easy access
  const schedulePoints = computed({
    get: () => scheduleSettings.value.points,
    set: (value: SchedulePoint[]) => {
      scheduleSettings.value.points = value
    },
  })

  const lampMode = computed({
    get: () => lampState.value.mode,
    set: (value: "schedule" | "manual" | "off") => {
      lampState.value.mode = value
    },
  })

  const manualBrightness = computed({
    get: () => lampState.value.manualBrightness,
    set: (value: number[]) => {
      lampState.value.manualBrightness = value
    },
  })

  // Utility function to convert time format
  const convertTimeFormat = (time24: string, to12Hour: boolean): string => {
    if (!to12Hour) return time24

    const [hours, minutes] = time24.split(":").map(Number)
    const period = hours >= 12 ? "PM" : "AM"
    const hours12 = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours
    return `${hours12}:${minutes.toString().padStart(2, "0")} ${period}`
  }

  const convertTimeFrom12To24 = (time12: string): string => {
    const match = time12.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i)
    if (!match) return time12

    const [, hours, minutes, period] = match
    let hour24 = Number.parseInt(hours)

    if (period.toUpperCase() === "PM" && hour24 !== 12) {
      hour24 += 12
    } else if (period.toUpperCase() === "AM" && hour24 === 12) {
      hour24 = 0
    }

    return `${hour24.toString().padStart(2, "0")}:${minutes}`
  }

  // Function to change time format
  const setTimeFormat = (format: "12" | "24") => {
    console.log("Setting time format to:", format)
    timeFormat.value = format
    appSettings.value.time.format = format
    console.log("Time format updated:", timeFormat.value)
  }

  // Mock API calls (no actual network requests)
  const makeApiCall = async (endpoint: string, options: RequestInit = {}) => {
    console.log(`Mock API call to ${endpoint}`, options)
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 100))
    return { success: true }
  }

  // Actions
  const initializeApp = async () => {
    console.log("Initializing app...")
    try {
      // No API calls, just set connected to true for demo
      isConnected.value = true
      console.log("App initialized successfully")
    } catch (error) {
      console.error("Failed to initialize app:", error)
    }
  }

  const loadLampData = async () => {
    console.log("Loading lamp data...")
    // Mock data loading
    isConnected.value = true
  }

  const setChannelBrightness = async (channel: number, brightness: number) => {
    console.log(`Setting channel ${channel} brightness to ${brightness}%`)
    lampState.value.manualBrightness[channel] = brightness
  }

  const setLampMode = async (mode: "schedule" | "manual" | "off") => {
    console.log(`Setting lamp mode to ${mode}`)
    lampState.value.mode = mode
  }

  const updateSchedulePoint = async (index: number, point: SchedulePoint) => {
    console.log(`Updating schedule point ${index}`, point)
    scheduleSettings.value.points[index] = { ...point }
  }

  const updateWifiSettings = async (settings: WifiSettings) => {
    console.log("Updating WiFi settings", settings)
    appSettings.value.wifi = { ...settings }
  }

  const updateTimeSettings = async (settings: TimeSettings) => {
    console.log("Updating time settings", settings)
    appSettings.value.time = { ...settings }
    timeFormat.value = settings.format
  }

  const updateDeviceSettings = async (settings: DeviceSettings) => {
    console.log("Updating device settings", settings)
    appSettings.value.device = { ...settings }
  }

  const scanWifiNetworks = async () => {
    console.log("Scanning WiFi networks...")
    return [
      { ssid: "HomeNetwork", signal: -45 },
      { ssid: "OfficeWiFi", signal: -60 },
      { ssid: "GuestNetwork", signal: -75 },
    ]
  }

  const getDeviceInfo = async (): Promise<DeviceInfo> => {
    console.log("Getting device info...")
    return deviceInfo.value
  }

  const getSettings = async () => {
    console.log("Getting settings...")
    return appSettings.value
  }

  const getTimezones = async () => {
    console.log("Getting timezones...")
    return [
      { id: "UTC", name: "UTC (GMT+0)" },
      { id: "America/New_York", name: "Eastern Time (GMT-5)" },
      { id: "America/Chicago", name: "Central Time (GMT-6)" },
      { id: "America/Denver", name: "Mountain Time (GMT-7)" },
      { id: "America/Los_Angeles", name: "Pacific Time (GMT-8)" },
      { id: "Europe/London", name: "London (GMT+0)" },
      { id: "Europe/Berlin", name: "Berlin (GMT+1)" },
      { id: "Asia/Tokyo", name: "Tokyo (GMT+9)" },
    ]
  }

  const rebootDevice = async () => {
    console.log("Rebooting device...")
    await new Promise((resolve) => setTimeout(resolve, 1000))
  }

  return {
    // State
    isConnected,
    lampState,
    scheduleSettings,
    appSettings,
    deviceInfo,
    timeFormat,

    // Computed
    schedulePoints,
    lampMode,
    manualBrightness,

    // Utilities
    convertTimeFormat,
    convertTimeFrom12To24,
    setTimeFormat,

    // Actions
    initializeApp,
    loadLampData,
    setChannelBrightness,
    setLampMode,
    updateSchedulePoint,
    updateWifiSettings,
    updateTimeSettings,
    updateDeviceSettings,
    scanWifiNetworks,
    getDeviceInfo,
    getSettings,
    getTimezones,
    rebootDevice,
  }
})
