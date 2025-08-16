import { defineStore } from "pinia";
import { useResourceLoader } from '@/composables/useResourceLoader'
import { ThermostatSettings } from "./models";

const initialState = (): ThermostatSettings => ({
  temperature: 0,
  hysteresis: 0,
})

export const useThermostatStore = defineStore("thermostat", () => {
  const loader = useResourceLoader<ThermostatSettings>({
    getUrl: '/api/fan/thermostat/config',
    postUrl: '/api/fan/thermostat/config',
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
