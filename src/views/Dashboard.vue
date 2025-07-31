<template>
  <v-container fluid class="pa-4" :key="componentKey">
    <!-- Header -->
    <v-row class="mb-4">
      <v-col cols="12">
        <v-card class="pa-4" color="#16213e">
          <v-row align="center">
            <v-col cols="auto">
              <v-icon color="yellow" size="32">mdi-lightbulb</v-icon>
              <span class="text-h5 ml-2 text-white">Aquarium Lamp</span>
            </v-col>
            <v-spacer />
            <v-col cols="auto">
              <div class="text-body-1 text-white">{{ currentDateTime }}</div>
            </v-col>
            <v-col cols="auto">
              <v-btn icon @click="$router.push('/settings')" color="white">
                <v-icon>mdi-cog</v-icon>
              </v-btn>
            </v-col>
          </v-row>
        </v-card>
      </v-col>
    </v-row>

    <!-- Chart Section -->
    <v-row class="mb-4">
      <v-col cols="12">
        <v-card class="pa-4" color="#16213e">
          <v-card-title class="text-white">Daily Brightness Schedule</v-card-title>
          <div class="mb-4">
            <v-row>
              <v-col v-for="(channel, index) in channels" :key="index" cols="auto">
                <v-chip :color="channel.color" variant="flat" size="small">
                  {{ channel.name }}
                </v-chip>
              </v-col>
            </v-row>
          </div>
          <div class="chart-container">
            <canvas ref="chartCanvas" width="800" height="300"></canvas>
          </div>
          <div class="text-center mt-2" :class="connectionStatus.color">
            {{ connectionStatus.text }}
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- Manual Control -->
    <v-row class="mb-4">
      <v-col cols="12">
        <v-card class="pa-4" color="#16213e">
          <v-card-title class="text-white">Manual Control</v-card-title>
          <v-row class="mb-4">
            <v-col cols="12" md="8">
              <v-row>
                <v-col v-for="(channel, index) in channels" :key="index" cols="12" sm="6" md="4">
                  <div class="mb-2">
                    <v-chip :color="channel.color" variant="flat" size="small" class="mb-2">
                      {{ channel.name }}
                    </v-chip>
                    <v-slider
                        v-model="appStore.manualBrightness[index]"
                        :color="channel.color"
                        min="0"
                        max="100"
                        step="1"
                        thumb-label
                        :disabled="appStore.lampMode !== 'manual'"
                        @update:model-value="updateManualBrightness(index, $event)"
                    >
                      <template #append>
                        <span class="text-white">{{ appStore.manualBrightness[index] }}%</span>
                      </template>
                    </v-slider>
                  </div>
                </v-col>
              </v-row>
            </v-col>
            <v-col cols="12" md="4">
              <div class="text-white mb-2">Mode</div>
              <v-btn-toggle
                  v-model="appStore.lampMode"
                  color="primary"
                  mandatory
                  @update:model-value="updateLampMode"
              >
                <v-btn value="schedule" size="small">Schedule</v-btn>
                <v-btn value="manual" size="small">Manual</v-btn>
                <v-btn value="off" size="small">Off</v-btn>
              </v-btn-toggle>
            </v-col>
          </v-row>
        </v-card>
      </v-col>
    </v-row>

    <!-- Schedule Settings -->
    <v-row>
      <v-col cols="12">
        <v-card class="pa-4" color="#16213e">
          <v-card-title class="text-white">
            Schedule Settings
            <small class="ml-2">(Format: {{ appStore.timeFormat }}H)</small>
          </v-card-title>
          <v-row>
            <v-col v-for="(point, index) in appStore.schedulePoints" :key="`schedule-${index}-${componentKey}`" cols="12" md="6" xl="4">
              <v-card class="pa-3 mb-3" color="#0f1419">
                <v-row align="center" class="mb-2">
                  <v-col cols="auto">
                    <v-switch
                        v-model="point.enabled"
                        color="primary"
                        density="compact"
                        hide-details
                        @update:model-value="updateSchedulePoint(index)"
                    />
                  </v-col>
                  <v-col cols="auto">
                    <span class="text-white font-weight-medium">{{ index + 1 }}</span>
                  </v-col>
                  <v-col>
                    <!-- Always use text input to avoid browser time formatting -->
                    <v-text-field
                        :model-value="getDisplayTime(point.time)"
                        type="text"
                        variant="outlined"
                        density="compact"
                        hide-details
                        :disabled="!point.enabled"
                        :placeholder="appStore.timeFormat === '24' ? '06:00' : '6:00 AM'"
                        @update:model-value="updateTimeValue(index, $event)"
                        @blur="validateTimeInput(index, $event)"
                    />
                  </v-col>
                </v-row>

                <!-- 5 Channel Sliders -->
                <div v-for="(channel, channelIndex) in channels" :key="channelIndex" class="mb-2">
                  <v-row align="center" no-gutters>
                    <v-col cols="2">
                      <v-chip
                          :color="channel.color"
                          variant="flat"
                          size="x-small"
                          class="text-caption"
                      >
                        {{ channel.name.charAt(0) }}
                      </v-chip>
                    </v-col>
                    <v-col cols="8">
                      <v-slider
                          v-model="point.brightness[channelIndex]"
                          :color="channel.color"
                          min="0"
                          max="100"
                          step="1"
                          density="compact"
                          hide-details
                          :disabled="!point.enabled"
                          @update:model-value="updateSchedulePoint(index)"
                      />
                    </v-col>
                    <v-col cols="2" class="text-right">
                      <span class="text-caption text-white">{{ point.brightness[channelIndex] }}%</span>
                    </v-col>
                  </v-row>
                </div>
              </v-card>
            </v-col>
          </v-row>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import { useAppStore } from '../stores/app'

const appStore = useAppStore()

const chartCanvas = ref<HTMLCanvasElement>()
const currentDateTime = ref('')
const componentKey = ref(0)

const channels = [
  { name: 'White', color: '#ffffff' },
  { name: 'Blue', color: '#2196f3' },
  { name: 'Red', color: '#f44336' },
  { name: 'Green', color: '#4caf50' },
  { name: 'UV', color: '#9c27b0' }
]

const connectionStatus = computed(() => {
  if (appStore.isConnected) {
    return { text: 'Connected to ESP32', color: 'text-green' }
  }
  return { text: 'Disconnected - Check ESP32 connection', color: 'text-red' }
})

let timeInterval: NodeJS.Timeout

const updateDateTime = () => {
  const now = new Date()
  const format = appStore.timeFormat === '12' ? {
    hour12: true
  } : {
    hour12: false
  }

  const dateStr = now.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  const timeStr = now.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    ...format
  })

  currentDateTime.value = `${dateStr}, ${timeStr}`
}

const getDisplayTime = (time24: string) => {
  if (appStore.timeFormat === '24') {
    return time24
  } else {
    return appStore.convertTimeFormat(time24, true)
  }
}

const validateTimeInput = (index: number, event: Event) => {
  const target = event.target as HTMLInputElement
  const value = target.value

  // Validate time format
  if (appStore.timeFormat === '24') {
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
    if (!timeRegex.test(value)) {
      // Reset to original value if invalid
      target.value = getDisplayTime(appStore.schedulePoints[index].time)
      return
    }
  } else {
    const timeRegex = /^(1[0-2]|[1-9]):[0-5][0-9]\s*(AM|PM)$/i
    if (!timeRegex.test(value)) {
      // Reset to original value if invalid
      target.value = getDisplayTime(appStore.schedulePoints[index].time)
      return
    }
  }
}

const updateTimeValue = (index: number, value: string) => {
  console.log(`updateTimeValue: index=${index}, value=${value}, format=${appStore.timeFormat}`)

  if (appStore.timeFormat === '24') {
    // Validate 24-hour format
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
    if (timeRegex.test(value)) {
      appStore.schedulePoints[index].time = value
      updateSchedulePoint(index)
    }
  } else {
    // Validate 12-hour format and convert
    const timeRegex = /^(1[0-2]|[1-9]):[0-5][0-9]\s*(AM|PM)$/i
    if (timeRegex.test(value)) {
      const time24 = appStore.convertTimeFrom12To24(value)
      appStore.schedulePoints[index].time = time24
      updateSchedulePoint(index)
    }
  }
}

const drawChart = () => {
  if (!chartCanvas.value) return

  const canvas = chartCanvas.value
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const width = canvas.width
  const height = canvas.height

  // Clear canvas
  ctx.fillStyle = '#16213e'
  ctx.fillRect(0, 0, width, height)

  // Draw grid
  ctx.strokeStyle = '#333'
  ctx.lineWidth = 1

  // Horizontal lines
  for (let i = 0; i <= 4; i++) {
    const y = (height / 4) * i
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(width, y)
    ctx.stroke()
  }

  // Vertical lines (every 4 hours)
  for (let i = 0; i <= 6; i++) {
    const x = (width / 6) * i
    ctx.beginPath()
    ctx.moveTo(x, 0)
    ctx.lineTo(x, height)
    ctx.stroke()
  }

  // Draw time labels
  ctx.fillStyle = '#fff'
  ctx.font = '12px Arial'
  ctx.textAlign = 'center'
  for (let i = 0; i <= 6; i++) {
    const x = (width / 6) * i
    const hour = i * 4
    const timeLabel = appStore.timeFormat === '12'
        ? appStore.convertTimeFormat(`${hour}:00`, true)
        : `${hour}:00`
    ctx.fillText(timeLabel, x, height - 5)
  }

  // Draw brightness labels
  ctx.textAlign = 'right'
  for (let i = 0; i <= 4; i++) {
    const y = (height / 4) * i
    const brightness = 100 - (i * 25)
    ctx.fillText(`${brightness}%`, width - 5, y + 4)
  }

  // Draw current time line
  const now = new Date()
  const currentHour = now.getHours() + now.getMinutes() / 60
  const currentX = (currentHour / 24) * width

  ctx.strokeStyle = '#ff6b6b'
  ctx.lineWidth = 2
  ctx.setLineDash([5, 5])
  ctx.beginPath()
  ctx.moveTo(currentX, 0)
  ctx.lineTo(currentX, height)
  ctx.stroke()
  ctx.setLineDash([])

  // Draw brightness curves for each channel
  channels.forEach((channel, channelIndex) => {
    ctx.strokeStyle = channel.color
    ctx.lineWidth = 3
    ctx.beginPath()

    const enabledPoints = appStore.schedulePoints
        .map((point, index) => ({ ...point, index }))
        .filter(point => point.enabled)
        .sort((a, b) => {
          const timeA = parseInt(a.time.split(':')[0]) * 60 + parseInt(a.time.split(':')[1])
          const timeB = parseInt(b.time.split(':')[0]) * 60 + parseInt(b.time.split(':')[1])
          return timeA - timeB
        })

    if (enabledPoints.length > 0) {
      // Add start and end points for smooth 24h cycle
      const points = [
        { time: '00:00', brightness: enabledPoints[enabledPoints.length - 1].brightness[channelIndex] },
        ...enabledPoints.map(p => ({ time: p.time, brightness: p.brightness[channelIndex] })),
        { time: '24:00', brightness: enabledPoints[0].brightness[channelIndex] }
      ]

      points.forEach((point, index) => {
        const [hours, minutes] = point.time.split(':').map(Number)
        const timeInHours = hours + minutes / 60
        const x = (timeInHours / 24) * width
        const y = height - (point.brightness / 100) * height

        if (index === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }
      })
    }

    ctx.stroke()
  })
}

const updateManualBrightness = async (channelIndex: number, value: number) => {
  try {
    await appStore.setChannelBrightness(channelIndex, value)
  } catch (error) {
    console.error('Failed to update brightness:', error)
  }
}

const updateLampMode = async (mode: string) => {
  try {
    await appStore.setLampMode(mode as 'schedule' | 'manual' | 'off')
  } catch (error) {
    console.error('Failed to update lamp mode:', error)
  }
}

const updateSchedulePoint = async (index: number) => {
  try {
    await appStore.updateSchedulePoint(index, appStore.schedulePoints[index])
  } catch (error) {
    console.error('Failed to update schedule point:', error)
  }
}

// Watch for time format changes and force component re-render
watch(
    () => appStore.timeFormat,
    (newFormat) => {
      console.log('Dashboard: Time format changed to', newFormat)
      componentKey.value++
      updateDateTime()
      setTimeout(() => {
        drawChart()
      }, 100)
    }
)

watch(
    () => appStore.schedulePoints,
    () => {
      setTimeout(() => {
        drawChart()
      }, 50)
    },
    { deep: true }
)

onMounted(() => {
  timeInterval = setInterval(updateDateTime, 1000)

  setTimeout(() => {
    drawChart()
  }, 100)

  // Load initial data
  appStore.initializeApp().then(() => {
    drawChart()
  })
})

onUnmounted(() => {
  if (timeInterval) {
    clearInterval(timeInterval)
  }
})
</script>

<style scoped>
.chart-container {
  position: relative;
  width: 100%;
  height: 300px;
  overflow: hidden;
}

canvas {
  width: 100%;
  height: 100%;
  background: #16213e;
}
</style>
