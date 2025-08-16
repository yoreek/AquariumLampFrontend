import { defineStore } from "pinia";
import type { WifiSettings } from "./models";
// import type { WifiSettings, WifiScanResult, WifiNetwork } from "./models";
// import { makeApiCall, deepClone } from "./utils";
import { useResourceLoader } from '@/composables/useResourceLoader'

const initialState = (): WifiSettings => ({
  ap: {
    enabled: true,
    ssid: 'AquariumLamp',
    password: '12345678',
    ip: '192.168.4.1',
    gateway: '0.0.0.0',
    subnet: '0.0.0.0',
  },
  sta: Array.from({ length: 2 }, () => ({
    enabled: false,
    ssid: '',
    password: '',
    hostname: '',
    ip: '0.0.0.0',
    gateway: '0.0.0.0',
    subnet: '0.0.0.0',
    dns1: '0.0.0.0',
    dns2: '0.0.0.0',
    dhcp: true,
    autoDns: true,
  })),
})

export const useWifiStore = defineStore("wifi", () => {
  const loader = useResourceLoader<WifiSettings, WifiSettings, Partial<WifiSettings>>({
    getUrl: '/api/wifi/config',
    postUrl: '/api/wifi/config',
    initial: initialState,
  })


  // const scanWifiNetworks = async (): Promise<WifiNetwork[]> => {
  //   console.log("Scanning WiFi networks...")
  //   try {
  //     const response: WifiScanResult = await makeApiCall("/api/wifi/scan")
  //     return response.networks || []
  //   } catch (error) {
  //     console.error("Failed to scan WiFi networks:", error)
  //     throw error
  //   }
  // }
  //
  // const startScanWifiNetworks = async () => {
  //   console.log("Start scanning WiFi networks...")
  //   try {
  //     await makeApiCall("/api/wifi/scan", {
  //       method: "POST"
  //     })
  //   } catch (error) {
  //     console.error("Failed to start scan Wi-Fi networks:", error)
  //     throw error
  //   }
  // }

  return {
    state: loader.data,
    isDirty: loader.isDirty,
    reset: loader.resetToSnapshot,
    load: loader.load,
    save: loader.save,
    // scanWifiNetworks,
    // startScanWifiNetworks
  };
});
