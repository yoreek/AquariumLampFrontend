import { defineStore } from "pinia";
import type { OneWireDeviceScanResult } from "./models";
import { makeApiCall } from "@/utils/api";

export const useOneWireDeviceStore = defineStore("one_wire_device", () => {
  const scanOneWireDevices = async (): Promise<OneWireDeviceScanResult> => {
    console.log("Scanning OneWire devices...")
    try {
      return await makeApiCall("/api/one_wire_device/scan")
    } catch (error) {
      console.error("Failed to scan OneWire devices:", error)
      throw error
    }
  }

  const startScanOneWireDevices = async () => {
    console.log("Start scanning OneWire devices...")
    try {
      await makeApiCall("/api/one_wire_device/scan", {
        method: "POST"
      })
    } catch (error) {
      console.error("Failed to start scan OneWire devices:", error)
      throw error
    }
  }

  return {
    scanOneWireDevices,
    startScanOneWireDevices
  };
});
