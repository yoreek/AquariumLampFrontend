import { createApp } from "vue"
import { createPinia } from "pinia"
import { createVuetify } from "vuetify"
import * as components from "vuetify/components"
import * as directives from "vuetify/directives"
import "vuetify/styles"

import App from "./App.vue"
import router from "./router"

const vuetify = createVuetify({
  components,
  directives,
  icons: {
    defaultSet: "mdi",
  },
  theme: {
    defaultTheme: "dark",
    themes: {
      dark: {
        colors: {
          primary: "#4CAF50",
          secondary: "#2196F3",
          accent: "#FF9800",
          error: "#F44336",
          warning: "#FF5722",
          info: "#00BCD4",
          success: "#4CAF50",
          background: "#1a1a2e",
          surface: "#16213e",
        },
      },
    },
  },
})

const pinia = createPinia()
const app = createApp(App)

app.use(pinia)
app.use(router)
app.use(vuetify)

app.mount("#app")
