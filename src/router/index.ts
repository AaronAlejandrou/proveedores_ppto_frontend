import { createRouter, createWebHistory, type RouteRecordRaw } from "vue-router";

import AdminLayout from "../layouts/AdminLayout.vue";
import PublicProviderLayout from "../layouts/PublicProviderLayout.vue";
import DashboardView from "../views/admin/DashboardView.vue";
import LoginView from "../views/admin/LoginView.vue";
import ProviderAccessView from "../views/provider/ProviderAccessView.vue";
import ProvidersView from "../views/admin/ProvidersView.vue";
import ProviderDetailView from "../views/admin/ProviderDetailView.vue";
import ProviderFormView from "../views/admin/ProviderFormView.vue";
import PurchaseOrdersView from "../views/admin/PurchaseOrdersView.vue";
import PurchaseOrderDetailView from "../views/admin/PurchaseOrderDetailView.vue";
import PurchaseOrderFormView from "../views/admin/PurchaseOrderFormView.vue";

const routes: RouteRecordRaw[] = [
  {
    path: "/",
    redirect: "/admin/login",
  },
  {
    path: "/admin",
    component: AdminLayout,
    children: [
      {
        path: "login",
        name: "admin-login",
        component: LoginView,
      },
      {
        path: "dashboard",
        name: "admin-dashboard",
        component: DashboardView,
      },
      {
        path: "providers",
        name: "admin-providers",
        component: ProvidersView,
      },
      {
        path: "providers/new",
        name: "admin-providers-new",
        component: ProviderFormView,
      },
      {
        path: "providers/:id/edit",
        name: "admin-providers-edit",
        component: ProviderFormView,
      },
      {
        path: "providers/:id",
        name: "admin-providers-detail",
        component: ProviderDetailView,
      },
      {
        path: "purchase-orders",
        name: "admin-purchase-orders",
        component: PurchaseOrdersView,
      },
      {
        path: "purchase-orders/new",
        name: "admin-purchase-orders-new",
        component: PurchaseOrderFormView,
      },
      {
        path: "purchase-orders/:id/edit",
        name: "admin-purchase-orders-edit",
        component: PurchaseOrderFormView,
      },
      {
        path: "purchase-orders/:id",
        name: "admin-purchase-orders-detail",
        component: PurchaseOrderDetailView,
      },
      {
        path: "",
        redirect: "/admin/login",
      },
    ],
  },
  {
    path: "/p/:token",
    component: PublicProviderLayout,
    children: [
      {
        path: "",
        name: "provider-access",
        component: ProviderAccessView,
      },
    ],
  },
  {
    path: "/:pathMatch(.*)*",
    redirect: "/admin/login",
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
