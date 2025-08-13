import { ref } from "vue";
import { defineStore } from "pinia";
import { makeApiCall } from "@/utils/api";
import { TimeSettings } from "./models";

export const useTimeStore = defineStore("time", () => {
  const state = ref<TimeSettings>({
    date: new Date().toISOString().split("T")[0],
    time: new Date().toTimeString().split(" ")[0].substring(0, 5),
  });

  const save = async () => {
    console.log("Update time")

    try {
      const isoString = `${state.value.date}T${state.value.time}:00`;
      await makeApiCall("/api/device/time", {
        method: "POST",
        body: JSON.stringify({ date: isoString }),
      })
    } catch (error) {
      console.error("Failed to set manual time:", error)
      throw error
    }
  }

  return { state, save };
});
