import {computed, ref, toRaw} from "vue";
import { defineStore } from "pinia";
import { makeApiCall } from "./utils";
import { NtpSettings } from "./models";

export const useNtpStore = defineStore("ntp", () => {
  const ntpSettings = ref<NtpSettings>({
    server: "pool.ntp.org",
    syncInterval: 3600,
    timeZoneId: "UTC",
  });

  const deepClone = <T>(x: T): T =>
    (globalThis as any).structuredClone
      ? structuredClone(toRaw(x))
      : JSON.parse(JSON.stringify(toRaw(x)))

  const savedSnapshot = ref<NtpSettings>(deepClone(ntpSettings.value))

  const isDirty = computed(() =>
    JSON.stringify(ntpSettings.value) !== JSON.stringify(savedSnapshot.value)
  )

  const save = async () => {
    console.log("Update NTP")

    try {
      await makeApiCall("/api/ntp", {
        method: "POST",
        body: JSON.stringify(ntpSettings.value),
      })
      savedSnapshot.value = deepClone(ntpSettings.value)
    } catch (error) {
      console.error("Failed to set NTP:", error)
      throw error
    }
  }

  const reset = () => {
    ntpSettings.value = deepClone(savedSnapshot.value)
  }

  return { ntpSettings, save, isDirty, reset };
});
