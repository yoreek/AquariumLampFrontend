import { defineStore } from "pinia";
import { useResourceLoader } from '@/composables/useResourceLoader'
import { TempSettings } from "./models";

const initialState = (): TempSettings => ({
  address: "01:02:03:04:05:06:07:08",
  exp_filter_wight: 1,
  approx_factor: 1,
  approx_offset: 0,
})

export const useTempStore = defineStore("temp", () => {
  const loader = useResourceLoader<TempSettings>({
    getUrl: '/api/temp/config',
    postUrl: '/api/temp/config',
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
