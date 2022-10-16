import { createApp } from "vue";
import { createPinia } from "pinia";

import App from "./App.vue";
import router from "./router";

import "./assets/main.css";
import "element-plus/dist/index.css"; // 引入 Element Plus

import ElementPlus from "element-plus";
import zhCn from "element-plus/dist/locale/zh-cn.mjs";

const app = createApp(App);

app.use(createPinia());

app.use(router);

// 使用全局中文
app.use(ElementPlus, {
  locale: zhCn,
});

app.mount("#app");
