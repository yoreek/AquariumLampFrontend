import { defineStore } from "pinia"
import { useDeviceStore } from "./device";
import { useLampStore } from "./lamp";
import { useCurrentTempStore} from "@/stores/current_temp";

export const useAppStore = defineStore("app", () => {
  const lampStore = useLampStore();
  const deviceStore = useDeviceStore();
  const currentTempStore = useCurrentTempStore();

  const refreshData = async () => {
    try {
      // Try to connect and get initial data
      await lampStore.loadLampData()
      await deviceStore.getDeviceInfo()
      await currentTempStore.load(true)
      console.log("Date refreshed successfully")
    } catch (error) {
      console.error("Failed to refresh data:", error)
    }
  }

  const initializeApp = async () => {
    console.log("Initializing app...")
    await refreshData()
  }

  // Auto-refresh device data periodically
  const startAutoRefresh = () => {
    setInterval(refreshData, 5_000)
  }

  return {
    initializeApp,
    startAutoRefresh,
  }
})
