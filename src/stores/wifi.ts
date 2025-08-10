import { ref, computed, toRaw } from "vue";
import { defineStore } from "pinia";
import type { WifiSettings, WifiScanResult, WifiNetwork } from "./models";
import { makeApiCall } from "./utils";

export const useWifiStore = defineStore("wifi", () => {
  const wifiSettings = ref<WifiSettings>({
    ap: {
      enabled: true,
      ssid: "AquariumLamp",
      password: "12345678",
      ip: "192.168.4.1",
      gateway: "0.0.0.0",
      subnet: "0.0.0.0",
    },
    sta: Array.from({ length: 2 }, () => ({
      enabled: false,
      ssid: "",
      password: "",
      hostname: "",
      ip: "0.0.0.0",
      gateway: "0.0.0.0",
      subnet: "0.0.0.0",
      dns1: "0.0.0.0",
      dns2: "0.0.0.0",
    })),
  });

  const deepClone = <T>(x: T): T =>
    (globalThis as any).structuredClone
      ? structuredClone(toRaw(x))
      : JSON.parse(JSON.stringify(toRaw(x)))

  const savedSnapshot = ref<WifiSettings>(deepClone(wifiSettings.value))

  const isWifiDirty = computed(() =>
    JSON.stringify(wifiSettings.value) !== JSON.stringify(savedSnapshot.value)
  )
  const loadWifiSettings = async () => {
    console.log("Loading wifi settings...")
    try {
      // Get current lamp state
      const response: WifiSettings = await makeApiCall("/api/wifi/config")
      if (response.ap) {
        wifiSettings.value.ap = response.ap
      }
      if (response.sta) {
        wifiSettings.value.sta = response.sta
      }
      savedSnapshot.value = deepClone(wifiSettings.value)
    } catch (error) {
      console.error("Failed to load wifi settings:", error)
      throw error
    }
  }

  const updateWifiSettings = async () => {
    console.log("Updating WiFi settings")

    try {
      await makeApiCall("/api/wifi/config", {
        method: "POST",
        body: JSON.stringify(wifiSettings.value),
      })
      savedSnapshot.value = deepClone(wifiSettings.value)
    } catch (error) {
      console.error("Failed to update WiFi settings:", error)
      throw error
    }
  }

  const resetWifiSettings = () => {
    wifiSettings.value = deepClone(savedSnapshot.value)
  }

  const scanWifiNetworks = async (): Promise<WifiNetwork[]> => {
    console.log("Scanning WiFi networks...")
    try {
      const response: WifiScanResult = await makeApiCall("/api/wifi/scan")
      return response.networks || []
    } catch (error) {
      console.error("Failed to scan WiFi networks:", error)
      throw error
    }
  }

  const startScanWifiNetworks = async () => {
    console.log("Start scanning WiFi networks...")
    try {
      await makeApiCall("/api/wifi/scan", {
        method: "POST"
      })
    } catch (error) {
      console.error("Failed to start scan WiFi networks:", error)
      throw error
    }
  }

  return {
    wifiSettings,
    isWifiDirty,
    resetWifiSettings,
    loadWifiSettings,
    updateWifiSettings,
    scanWifiNetworks,
    startScanWifiNetworks
  };
});
