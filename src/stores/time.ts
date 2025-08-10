import { ref, computed, toRaw } from "vue";
import { defineStore } from "pinia";
import { makeApiCall } from "./utils";
import { TimeSettings } from "./models";

export const useTimeStore = defineStore("time", () => {
  const timeSettings = ref<TimeSettings>({
    date: new Date().toISOString().split("T")[0],
    time: new Date().toTimeString().split(" ")[0].substring(0, 5),
  });

  const deepClone = <T>(x: T): T =>
    (globalThis as any).structuredClone
      ? structuredClone(toRaw(x))
      : JSON.parse(JSON.stringify(toRaw(x)))

  const savedSnapshot = ref<TimeSettings>(deepClone(timeSettings.value))

  const isDirty = computed(() =>
    JSON.stringify(timeSettings.value) !== JSON.stringify(savedSnapshot.value)
  )

  const save = async () => {
    console.log("Update time")

    try {
      await makeApiCall("/api/time", {
        method: "POST",
        body: JSON.stringify(timeSettings.value),
      })
      savedSnapshot.value = deepClone(timeSettings.value)
    } catch (error) {
      console.error("Failed to set manual time:", error)
      throw error
    }
  }

  const reset = () => {
    timeSettings.value = deepClone(savedSnapshot.value)
  }

  return { timeSettings, save, isDirty, reset };
});
