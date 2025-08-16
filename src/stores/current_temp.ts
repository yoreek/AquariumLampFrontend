import { defineStore } from "pinia";
import { useResourceLoader } from '@/composables/useResourceLoader'
import { CurrentTemp } from "./models";

const initialState = (): CurrentTemp => ({
  ready: false,
  temperature: 0,
})

export const useCurrentTempStore = defineStore("current_temp", () => {
  const loader = useResourceLoader<CurrentTemp>({
    getUrl: '/api/temp/current',
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
