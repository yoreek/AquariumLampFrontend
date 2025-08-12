import { ref } from "vue";
import { defineStore } from "pinia";
import type { LampState, LampMode, Schedule } from "./models";
import { makeApiCall } from "@/utils/api";

export const useLampStore = defineStore("lamp", () => {
  const lampState = ref<LampState>({
    mode: "schedule",
    manualBrightness: [0, 0, 0, 0, 0],
    schedules: Array.from({ length: 10 }, (_, i) => ({
      enabled: i < 4,
      from: `${String(6 + i * 2).padStart(2, "0")}:00`,
      brightness: [
        Math.max(0, 100 - i * 10), // Blue
        Math.max(0, 80 - i * 8), // Blue/Violet
        Math.max(0, 60 - i * 6), // Blue/Green
        Math.max(0, 90 - i * 9), // White
        Math.max(0, 70 - i * 7), // White/Yellow/Magenta
      ],
    })),
  });

  const loadLampData = async () => {
    console.log("Loading lamp data...");
    try {
      // Get current lamp state
      const lampData: LampState = await makeApiCall("/api/lamp/state");
      if (lampData.mode) {
        lampState.value.mode = lampData.mode;
      }
      if (lampData.manualBrightness) {
        lampState.value.manualBrightness = lampData.manualBrightness;
      }
      if (lampData.schedules) {
        lampState.value.schedules = lampData.schedules;
      }
    } catch (error) {
      console.error("Failed to load lamp data:", error);
      throw error;
    }
  };

  const setLampMode = async (mode: LampMode) => {
    console.log(`Setting lamp mode to ${mode}`);

    // Update local state immediately
    lampState.value.mode = mode;

    try {
      await makeApiCall("/api/lamp/mode", {
        method: "POST",
        body: JSON.stringify({ mode }),
      });
    } catch (error) {
      console.error("Failed to set lamp mode:", error);
      // Revert local change on error
      await loadLampData();
    }
  };

  const updateSchedule = async (index: number, schedule: Schedule) => {
    console.log(`Updating schedule ${index}`, schedule);

    // Update local state immediately
    lampState.value.schedules[index] = { ...schedule };

    try {
      await makeApiCall("/api/lamp/schedules", {
        method: "POST",
        body: JSON.stringify({
          index,
          schedule,
        }),
      });
    } catch (error) {
      console.error("Failed to update schedule point:", error);
      // Revert local change on error
      await loadLampData();
    }
  };
  const setChannelBrightness = async (channel: number, brightness: number) => {
    console.log(`Setting channel ${channel} brightness to ${brightness}%`);

    // Update local state immediately for responsiveness
    lampState.value.manualBrightness[channel] = brightness;

    try {
      await makeApiCall("/api/lamp/brightness", {
        method: "POST",
        body: JSON.stringify({
          channel,
          brightness,
        }),
      });
    } catch (error) {
      console.error("Failed to set channel brightness:", error);
      // Revert local change on error
      await loadLampData();
    }
  };

  return {
    lampState,
    loadLampData,
    setLampMode,
    updateSchedule,
    setChannelBrightness,
  };
});
