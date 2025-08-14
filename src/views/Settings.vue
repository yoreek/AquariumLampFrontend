<template>
  <v-container fluid class="pa-0">
    <!-- Header -->
    <v-row class="mb-1">
      <v-col cols="12">
        <v-card class="pa-2" color="#16213e">
          <v-row align="center">
            <v-col cols="auto">
              <v-btn icon @click="router.push('/')" color="white" density="compact">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20,11V13H8L13.5,18.5L12.08,19.92L4.16,12L12.08,4.08L13.5,5.5L8,11H20Z"/>
                </svg>
              </v-btn>
            </v-col>
            <v-col cols="auto">
              <v-row align="center" no-gutters class="ml-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="#FFC107">
                  <path d="M12,2A7,7 0 0,0 5,9C5,11.38 6.19,13.47 8,14.74V17A1,1 0 0,0 9,18H15A1,1 0 0,0 16,17V14.74C17.81,13.47 19,11.38 19,9A7,7 0 0,0 12,2M9,21A1,1 0 0,0 10,22H14A1,1 0 0,0 15,21V20H9V21Z"/>
                </svg>
                <span class="text-h6 ml-2 text-white">Aquarium Lamp</span>
                <span class="text-caption ml-2 text-grey-darken-1">v{{ version }}</span>
              </v-row>
            </v-col>
          </v-row>
        </v-card>
      </v-col>
    </v-row>


    <v-expansion-panels>
      <v-expansion-panel>
        <v-expansion-panel-title class="text-white" style="background:#16213e;">
          WiFi Configuration
        </v-expansion-panel-title>
        <v-expansion-panel-text style="background:#16213e;" class="pa-0">
          <WifiSection />
        </v-expansion-panel-text>
      </v-expansion-panel>
      <v-expansion-panel>
        <v-expansion-panel-title class="text-white" style="background:#16213e;">
          Time
        </v-expansion-panel-title>
        <v-expansion-panel-text style="background:#16213e;">
          <TimeSection />
        </v-expansion-panel-text>
      </v-expansion-panel>
      <v-expansion-panel>
        <v-expansion-panel-title class="text-white" style="background:#16213e;">
          NTP Configuration
        </v-expansion-panel-title>
        <v-expansion-panel-text style="background:#16213e;">
          <NtpSection />
        </v-expansion-panel-text>
      </v-expansion-panel>
      <v-expansion-panel>
        <v-expansion-panel-title class="text-white" style="background:#16213e;">
          Device Information
        </v-expansion-panel-title>
        <v-expansion-panel-text style="background:#16213e;">
          <DeviceInfoSection />
        </v-expansion-panel-text>
      </v-expansion-panel>
      <v-expansion-panel>
        <v-expansion-panel-title class="text-white" style="background:#16213e;">
          Advanced
        </v-expansion-panel-title>
        <v-expansion-panel-text style="background:#16213e;">
          <AdvancedSection />
        </v-expansion-panel-text>
      </v-expansion-panel>
    </v-expansion-panels>
  </v-container>
</template>

<style scoped>
::v-deep(.v-expansion-panel-text__wrapper) {
  padding: 4px 8px !important;
}
</style>

<script setup lang="ts">
import pkg from '../../package.json'
import { useRouter } from 'vue-router'
import WifiSection from '@/components/settings/WifiSection.vue'
import TimeSection from '@/components/settings/TimeSection.vue'
import NtpSection from '@/components/settings/NtpSection.vue'
import DeviceInfoSection from '@/components/settings/DeviceInfoSection.vue'
import AdvancedSection from "@/components/settings/AdvancedSection.vue";

const router = useRouter()
const version = pkg.version
</script>
