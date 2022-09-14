import { createApp } from "vue";
import ElementPlus from 'element-plus'
import { createRouter, createWebHashHistory } from 'vue-router'
import 'element-plus/dist/index.css'
import { createPinia } from "pinia";
import App from "./App.vue";
import Document from "./components/Document.vue"
import Main from "./components/Main.vue"


const routes = [
  { path: '/', component: Main },
  { path: '/document/:documentId', component: Document },
]
const router = createRouter({
    history: createWebHashHistory(),
    routes, // short for `routes: routes`
})



import "./assets/main.css";

const app = createApp(App)
app.use(createPinia());
app.use(ElementPlus)
app.use(router)
app.mount("#app");
