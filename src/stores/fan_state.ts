import { defineStore } from "pinia";
import { useResourceLoader } from '@/composables/useResourceLoader'
import { FanState } from "./models";

const initialState = (): FanState => ({
  mode: "auto",
})

export const useFanStateStore = defineStore("fan_state", () => {
  const loader = useResourceLoader<FanState>({
    getUrl: '/api/fan/state',
    postUrl: '/api/fan/state',
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
