import { defineStore } from "pinia"
import { useDeviceStore } from "./device";
import { useLampStore } from "./lamp";
import { useCurrentTempStore} from "@/stores/current_temp";

export const useAppStore = defineStore("app", () => {
  // Actions
  const initializeApp = async () => {
    console.log("Initializing app...")
    try {
      // Try to connect and get initial data
      await lampStore.loadLampData()
      await deviceStore.getDeviceInfo()
      console.log("App initialized successfully")
    } catch (error) {
      console.error("Failed to initialize app:", error)
      // Continue with offline mode
    }
  }

  // Auto-refresh device data periodically
  const startAutoRefresh = () => {
    setInterval(async () => {
      try {
        await lampStore.loadLampData()
        await deviceStore.getDeviceInfo()
        await currentTempStore.load()
      } catch (error) {
        console.log("Auto-refresh failed, device may be offline")
      }
    }, 30_000)
  }


  const lampStore = useLampStore();
  const deviceStore = useDeviceStore();
  const currentTempStore = useCurrentTempStore();

  return {
    // Actions
    initializeApp,
    startAutoRefresh,
  }
})
