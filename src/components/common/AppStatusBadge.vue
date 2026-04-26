<template>
  <Tag :value="statusText" :severity="severity" class="status-badge" />
</template>

<script setup lang="ts">
import { computed } from "vue";
import Tag from "primevue/tag";
import type {
  PurchaseOrderStatus,
  ProviderStatus,
  ValidationStatus,
  CdrStatus,
} from "@/types/common.types";

const props = defineProps<{
  status:
    | PurchaseOrderStatus
    | ProviderStatus
    | ValidationStatus
    | CdrStatus
    | string;
}>();

const severity = computed(() => {
  switch (props.status) {
    case "ACTIVE":
    case "APPROVED":
    case "VALIDATED":
    case "PASSED":
    case "READY_FOR_MAIN_PPTO":
      return "success";
    case "CREATED":
    case "LINK_GENERATED":
    case "UPLOADED":
    case "VIEWED_BY_PROVIDER":
      return "info";
    case "DOCUMENTS_PENDING":
    case "REQUIRED_PENDING":
    case "PENDING":
    case "VALIDATING":
      return "warn";
    case "OBSERVED":
    case "INACTIVE":
    case "FAILED":
    case "CANCELLED":
    case "INVALID":
      return "danger";
    case "NOT_REQUIRED":
      return "secondary";
    default:
      return "info";
  }
});

const statusText = computed(() => {
  if (!props.status) return "DESCONOCIDO";
  return props.status.replace(/_/g, " ");
});
</script>

<style scoped>
.status-badge {
  font-size: 0.75rem;
  letter-spacing: 0.5px;
}
</style>
