import { defineStore } from "pinia"
import { ref, computed } from "vue"
import type {
  ScheduleSettings,
  AppSettings,
  LampState,
  DeviceInfo,
  SchedulePoint,
  WifiSettings,
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
        Math.max(0, 100 - i * 10), // Blue
        Math.max(0, 80 - i * 8), // Blue/Violet
        Math.max(0, 60 - i * 6), // Blue/Green
        Math.max(0, 90 - i * 9), // White
        Math.max(0, 70 - i * 7), // White/Yellow/Magenta
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
      timezone: "UTC"
    },
    device: {
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

  // Computed API base URL based on current window location
  const apiBaseUrl = computed(() => {
    if (typeof window !== "undefined") {
      const protocol = window.location.protocol
      const hostname = window.location.hostname
      const port = window.location.port

      // If running on standard HTTP/HTTPS ports, don't include port
      if ((protocol === "http:" && port === "80") || (protocol === "https:" && port === "443") || !port) {
        return `${protocol}//${hostname}`
      }

      return `${protocol}//${hostname}:${port}`
    }

    // Fallback for SSR or when window is not available
    return "http://192.168.4.1"
  })

    // API helper function
  const makeApiCall = async (endpoint: string, options: RequestInit = {}) => {
    const baseUrl = apiBaseUrl.value
    const url = `${baseUrl}${endpoint}`

    console.log(`API call to ${url}`, options)

    // Create AbortController for timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30000)

    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
        ...options,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      isConnected.value = true
      return data
    } catch (error) {
      clearTimeout(timeoutId)
      console.error(`API call failed:`, error)
      isConnected.value = false
      throw error
    }
  }

  // Actions
  const initializeApp = async () => {
    console.log("Initializing app...")
    try {
      // Try to connect and get initial data
      await loadLampData()
      await getDeviceInfo()
      console.log("App initialized successfully")
    } catch (error) {
      console.error("Failed to initialize app:", error)
      // Continue with offline mode
      isConnected.value = false
    }
  }

  const loadLampData = async () => {
    console.log("Loading lamp data...")
    try {
      // Get current lamp state
      const lampData = await makeApiCall("/api/lamp/state")
      lampState.value = {
        mode: lampData.mode || "schedule",
        manualBrightness: lampData.brightness || [0, 0, 0, 0, 0],
      }

      // Get schedule data
      const scheduleData = await makeApiCall("/api/schedule")
      if (scheduleData.points) {
        scheduleSettings.value.points = scheduleData.points
      }

      isConnected.value = true
    } catch (error) {
      console.error("Failed to load lamp data:", error)
      throw error
    }
  }

  const setChannelBrightness = async (channel: number, brightness: number) => {
    console.log(`Setting channel ${channel} brightness to ${brightness}%`)

    // Update local state immediately for responsiveness
    lampState.value.manualBrightness[channel] = brightness

    try {
      await makeApiCall("/api/lamp/brightness", {
        method: "POST",
        body: JSON.stringify({
          channel,
          brightness,
        }),
      })
    } catch (error) {
      console.error("Failed to set channel brightness:", error)
      // Revert local change on error
      await loadLampData()
    }
  }

  const setLampMode = async (mode: "schedule" | "manual" | "off") => {
    console.log(`Setting lamp mode to ${mode}`)

    // Update local state immediately
    lampState.value.mode = mode

    try {
      await makeApiCall("/api/lamp/mode", {
        method: "POST",
        body: JSON.stringify({ mode }),
      })
    } catch (error) {
      console.error("Failed to set lamp mode:", error)
      // Revert local change on error
      await loadLampData()
    }
  }

  const updateSchedulePoint = async (index: number, point: SchedulePoint) => {
    console.log(`Updating schedule point ${index}`, point)

    // Update local state immediately
    scheduleSettings.value.points[index] = { ...point }

    try {
      await makeApiCall("/api/schedule/point", {
        method: "POST",
        body: JSON.stringify({
          index,
          point,
        }),
      })
    } catch (error) {
      console.error("Failed to update schedule point:", error)
      // Revert local change on error
      await loadLampData()
    }
  }

  const updateWifiSettings = async (settings: WifiSettings) => {
    console.log("Updating WiFi settings", settings)

    // Update local state immediately
    appSettings.value.wifi = { ...settings }

    try {
      await makeApiCall("/api/wifi/config", {
        method: "POST",
        body: JSON.stringify(settings),
      })
    } catch (error) {
      console.error("Failed to update WiFi settings:", error)
      throw error
    }
  }

  const updateDeviceSettings = async (settings: DeviceSettings) => {
    console.log("Updating device settings", settings)

    // Update local state immediately
    appSettings.value.device = { ...settings }

    try {
      await makeApiCall("/api/device/config", {
        method: "POST",
        body: JSON.stringify(settings),
      })
    } catch (error) {
      console.error("Failed to update device settings:", error)
      throw error
    }
  }

  const scanWifiNetworks = async () => {
    console.log("Scanning WiFi networks...")
    try {
      const response = await makeApiCall("/api/wifi/scan")
      return response.networks || []
    } catch (error) {
      console.error("Failed to scan WiFi networks:", error)
      // Return mock data on error
      return [
        { ssid: "HomeNetwork", signal: -45 },
        { ssid: "OfficeWiFi", signal: -60 },
        { ssid: "GuestNetwork", signal: -75 },
      ]
    }
  }

  const getDeviceInfo = async (): Promise<DeviceInfo> => {
    console.log("Getting device info...")
    try {
      const response = await makeApiCall("/api/device/info")

      const info: DeviceInfo = {
        connected: true,
        ip: response.ip || deviceInfo.value.ip,
        firmware: response.firmware || deviceInfo.value.firmware,
        uptime: response.uptime || deviceInfo.value.uptime,
        freeMemory: response.freeMemory || deviceInfo.value.freeMemory,
      }

      deviceInfo.value = info
      return info
    } catch (error) {
      console.error("Failed to get device info:", error)
      deviceInfo.value.connected = false
      return deviceInfo.value
    }
  }

  const getSettings = async () => {
    console.log("Getting settings...")
    try {
      const response = await makeApiCall("/api/settings")

      if (response.wifi) appSettings.value.wifi = response.wifi
      if (response.time) {
        appSettings.value.time = response.time
      }
      if (response.device) appSettings.value.device = response.device

      return appSettings.value
    } catch (error) {
      console.error("Failed to get settings:", error)
      return appSettings.value
    }
  }

  const getTimezones = async () => {
    console.log("Getting timezones...")
    try {
      const response = await makeApiCall("/api/time/timezones")
      return (
          response.timezones || [
            { id: "UTC", name: "UTC (GMT+0)" },
            { id: "America/New_York", name: "Eastern Time (GMT-5)" },
            { id: "America/Chicago", name: "Central Time (GMT-6)" },
            { id: "America/Denver", name: "Mountain Time (GMT-7)" },
            { id: "America/Los_Angeles", name: "Pacific Time (GMT-8)" },
            { id: "Europe/London", name: "London (GMT+0)" },
            { id: "Europe/Berlin", name: "Berlin (GMT+1)" },
            { id: "Asia/Tokyo", name: "Tokyo (GMT+9)" },
          ]
      )
    } catch (error) {
      console.error("Failed to get timezones:", error)
      // Return default timezones on error
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
  }

  const rebootDevice = async () => {
    console.log("Rebooting device...")
    try {
      await makeApiCall("/api/device/reboot", {
        method: "POST",
      })

      // Set disconnected state as device will reboot
      isConnected.value = false

      // Try to reconnect after 10 seconds
      setTimeout(async () => {
        try {
          await getDeviceInfo()
        } catch (error) {
          console.log("Device still rebooting...")
        }
      }, 10000)
    } catch (error) {
      console.error("Failed to reboot device:", error)
      throw error
    }
  }

  // Auto-refresh device data periodically
  const startAutoRefresh = () => {
    setInterval(async () => {
      if (isConnected.value) {
        try {
          await loadLampData()
          await getDeviceInfo()
        } catch (error) {
          console.log("Auto-refresh failed, device may be offline")
        }
      }
    }, appSettings.value.device.updateInterval * 1000)
  }

  const setManualTime = async (timeData: { date: string; time: string }) => {
    console.log("Setting manual time", timeData)

    try {
      await makeApiCall("/api/time/set", {
        method: "POST",
        body: JSON.stringify(timeData),
      })
    } catch (error) {
      console.error("Failed to set manual time:", error)
      throw error
    }
  }

  const updateTimeConfiguration = async (config: {
    autoSync: boolean
    ntpServer: string
    timezone: string
  }) => {
    console.log("Updating time configuration", config)

    // Update local state immediately
    appSettings.value.time.autoSync = config.autoSync
    appSettings.value.time.ntpServer = config.ntpServer
    appSettings.value.time.timezone = config.timezone

    try {
      await makeApiCall("/api/time/config", {
        method: "POST",
        body: JSON.stringify(config),
      })
    } catch (error) {
      console.error("Failed to update time configuration:", error)
      throw error
    }
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
    apiBaseUrl,

    // Actions
    initializeApp,
    loadLampData,
    setChannelBrightness,
    setLampMode,
    updateSchedulePoint,
    updateWifiSettings,
    setManualTime,
    updateTimeConfiguration,
    updateDeviceSettings,
    scanWifiNetworks,
    getDeviceInfo,
    getSettings,
    getTimezones,
    rebootDevice,
    startAutoRefresh,
  }
})
