import { ref } from "vue";
import { defineStore } from "pinia";
import type { DeviceInfo } from "./models";
import { makeApiCall } from "@/utils/api";

export const useDeviceStore = defineStore("device", () => {
  const deviceInfo = ref<DeviceInfo>({
    connected: false,
    firmware: "",
    ip: "",
    subnet: "",
    gateway: "",
    rssi: 0,
    macAddress: "",
    heapSize: 0,
    heapUsage: 0,
    maxFreeBlockSize: 0,
    uptime: "",
    time: "",
    timezone: "",
  });

  const getDeviceInfo = async (): Promise<DeviceInfo> => {
    console.log("Getting device info...");
    try {
      const response: DeviceInfo = await makeApiCall("/api/device/info");

      const info: DeviceInfo = {
        ...response,
        connected: true,
      };

      deviceInfo.value = info;
      return info;
    } catch (error) {
      console.error("Failed to get device info:", error);
      deviceInfo.value.connected = false;
      return deviceInfo.value;
    }
  };

  const rebootDevice = async () => {
    console.log("Rebooting device...");
    try {
      await makeApiCall("/api/device/reboot", {
        method: "POST",
      });

      setTimeout(async () => {
        try {
          await getDeviceInfo();
        } catch (error) {
          console.log("Device still rebooting...");
        }
      }, 10000);
    } catch (error) {
      console.error("Failed to reboot device:", error);
      throw error;
    }
  };

  const factoryReset = async () => {
    console.log("Factory reset...");
    try {
      await makeApiCall("/api/device/factory_reset", {
        method: "POST",
      });
    } catch (error) {
      console.error("Failed to reset device:", error);
      throw error;
    }
  };

  return {
    deviceInfo,
    getDeviceInfo,
    rebootDevice,
    factoryReset
  };
});
