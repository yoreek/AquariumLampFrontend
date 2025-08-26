import { defineStore } from "pinia";
import { useResourceLoader } from '@/composables/useResourceLoader'
import { CoolingManagerSettings } from "./models";

const initialState = (): CoolingManagerSettings => ({
  temperature: 0,
  hysteresis: 0,
})

export const useCoolingManagerStore = defineStore("cooling_manager", () => {
  const loader = useResourceLoader<CoolingManagerSettings>({
    getUrl: '/api/fan/cooling_manager/config',
    postUrl: '/api/fan/cooling_manager/config',
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
