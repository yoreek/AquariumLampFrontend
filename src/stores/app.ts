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

  const timeFormat = computed(() => appSettings.value.time.format)

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

  // API calls
  const makeApiCall = async (endpoint: string, options: RequestInit = {}) => {
    try {
      const response = await fetch(`${appSettings.value.device.apiEndpoint}${endpoint}`, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      isConnected.value = true
      return await response.json()
    } catch (error) {
      isConnected.value = false
      console.error("API call failed:", error)
      throw error
    }
  }

  // Actions
  const initializeApp = async () => {
    try {
      await loadLampData()
    } catch (error) {
      console.error("Failed to initialize app:", error)
    }
  }

  const loadLampData = async () => {
    try {
      const data = await makeApiCall("/status")
      if (data.mode) lampState.value.mode = data.mode
      if (data.brightness) lampState.value.manualBrightness = data.brightness
      if (data.schedule) scheduleSettings.value.points = data.schedule
    } catch (error) {
      console.error("Failed to load lamp data:", error)
    }
  }

  const setChannelBrightness = async (channel: number, brightness: number) => {
    lampState.value.manualBrightness[channel] = brightness

    try {
      await makeApiCall("/brightness", {
        method: "POST",
        body: JSON.stringify({ channel, brightness }),
      })
    } catch (error) {
      console.error("Failed to sync brightness to device:", error)
    }
  }

  const setLampMode = async (mode: "schedule" | "manual" | "off") => {
    lampState.value.mode = mode

    try {
      await makeApiCall("/mode", {
        method: "POST",
        body: JSON.stringify({ mode }),
      })
    } catch (error) {
      console.error("Failed to sync mode to device:", error)
    }
  }

  const updateSchedulePoint = async (index: number, point: SchedulePoint) => {
    scheduleSettings.value.points[index] = { ...point }

    try {
      await makeApiCall("/schedule", {
        method: "POST",
        body: JSON.stringify({ index, point }),
      })
    } catch (error) {
      console.error("Failed to sync schedule to device:", error)
    }
  }

  const updateWifiSettings = async (settings: WifiSettings) => {
    appSettings.value.wifi = { ...settings }

    try {
      await makeApiCall("/wifi/config", {
        method: "POST",
        body: JSON.stringify(settings),
      })
    } catch (error) {
      console.error("Failed to sync WiFi settings to device:", error)
    }
  }

  const updateTimeSettings = async (settings: TimeSettings) => {
    appSettings.value.time = { ...settings }

    try {
      await makeApiCall("/time/config", {
        method: "POST",
        body: JSON.stringify(settings),
      })
    } catch (error) {
      console.error("Failed to sync time settings to device:", error)
    }
  }

  const updateDeviceSettings = async (settings: DeviceSettings) => {
    appSettings.value.device = { ...settings }

    try {
      await makeApiCall("/advanced", {
        method: "POST",
        body: JSON.stringify(settings),
      })
    } catch (error) {
      console.error("Failed to sync device settings to device:", error)
    }
  }

  const scanWifiNetworks = async () => {
    const response = await makeApiCall("/wifi/scan")
    return response.networks || []
  }

  const getDeviceInfo = async (): Promise<DeviceInfo> => {
    const response = await makeApiCall("/device/info")
    deviceInfo.value = { ...deviceInfo.value, ...response }
    return deviceInfo.value
  }

  const getSettings = async () => {
    const response = await makeApiCall("/settings")
    return response
  }

  const getTimezones = async () => {
    const response = await makeApiCall("/timezones")
    return response.timezones || []
  }

  const rebootDevice = async () => {
    await makeApiCall("/device/reboot", {
      method: "POST",
    })
  }

  return {
    // State
    isConnected,
    lampState,
    scheduleSettings,
    appSettings,
    deviceInfo,

    // Computed
    schedulePoints,
    lampMode,
    manualBrightness,
    timeFormat,

    // Utilities
    convertTimeFormat,
    convertTimeFrom12To24,

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
