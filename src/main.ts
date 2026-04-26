import { createApp } from "vue";
import PrimeVue from "primevue/config";
import Aura from "@primeuix/themes/aura";

import App from "./App.vue";
import router from "./router";

import Button from "primevue/button";
import Card from "primevue/card";
import Column from "primevue/column";
import DataTable from "primevue/datatable";
import Divider from "primevue/divider";
import Dropdown from "primevue/dropdown";
import FileUpload from "primevue/fileupload";
import InputText from "primevue/inputtext";
import InputNumber from "primevue/inputnumber";
import Message from "primevue/message";
import Password from "primevue/password";
import ProgressBar from "primevue/progressbar";
import RadioButton from "primevue/radiobutton";
import Tag from "primevue/tag";
import Tooltip from "primevue/tooltip";
import AppIcon from "./components/ui/AppIcon.vue";

import "./styles/variables.css";
import "./styles/base.css";
import "./styles/layout.css";
import "./styles/admin-views.css";
import "./styles/app-ui.css";

const app = createApp(App);

app.use(router);
app.use(PrimeVue, {
  theme: {
    preset: Aura,
    options: {
      darkModeSelector: "none",
      cssLayer: false,
    },
  },
  ripple: false,
});

app.component("PvButton", Button);
app.component("PvCard", Card);
app.component("PvColumn", Column);
app.component("PvDataTable", DataTable);
app.component("PvDivider", Divider);
app.component("PvDropdown", Dropdown);
app.component("PvFileUpload", FileUpload);
app.component("PvInputText", InputText);
app.component("PvInputNumber", InputNumber);
app.component("PvMessage", Message);
app.component("PvPassword", Password);
app.component("PvProgressBar", ProgressBar);
app.component("PvRadioButton", RadioButton);
app.component("PvTag", Tag);
app.component("AppIcon", AppIcon);

app.directive("tooltip", Tooltip);

app.mount("#app");
