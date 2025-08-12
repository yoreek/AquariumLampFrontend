import { defineStore } from "pinia";
import { useResourceLoader } from '@/composables/useResourceLoader'
import { NtpSettings } from "./models";

const initialState = (): NtpSettings => ({
  server: "pool.ntp.org",
  syncInterval: 3600,
  timeZoneId: "UTC",
})

export const useNtpStore = defineStore("ntp", () => {
  const loader = useResourceLoader<NtpSettings>({
    getUrl: '/api/ntp',
    postUrl: '/api/ntp',
    initial: initialState,
  })

  return {
    state: loader.data,
    isDirty: loader.isDirty,
    reset: loader.resetToSnapshot,
    load: loader.load,
    save: loader.save,
  };
});
