<script setup lang="ts">
import { computed, type Component } from 'vue';
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Briefcase,
  Building2,
  CheckCircle2,
  ChevronRight,
  CircleHelp,
  ClipboardList,
  Clock3,
  Copy,
  Download,
  Eye,
  ExternalLink,
  FileCheck2,
  FilePlus2,
  FileText,
  Inbox,
  LayoutDashboard,
  Link,
  Loader2,
  LogOut,
  Mail,
  Paperclip,
  Pencil,
  Plus,
  ReceiptText,
  RefreshCw,
  Save,
  Search,
  Sparkles,
  Upload,
  User,
  Users,
  X,
} from 'lucide-vue-next';

interface Props {
  name: string;
  size?: number;
  strokeWidth?: number;
  spin?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  size: 18,
  strokeWidth: 1.75,
  spin: false,
});

const iconMap: Record<string, Component> = {
  // Semantic aliases.
  briefcase: Briefcase,
  dashboard: LayoutDashboard,
  sparkles: Sparkles,
  providers: Users,
  provider: User,
  'purchase-orders': ClipboardList,
  'purchase-order': ReceiptText,
  'new-order': FilePlus2,
  plus: Plus,
  'chevron-right': ChevronRight,
  directory: ClipboardList,
  inbox: Inbox,
  building: Building2,
  mail: Mail,
  file: FileText,
  pdf: FileText,
  attachment: Paperclip,
  external: ExternalLink,
  copy: Copy,
  refresh: RefreshCw,
  link: Link,
  upload: Upload,
  validation: FileCheck2,
  pending: Clock3,
  error: AlertCircle,
  approved: CheckCircle2,
  edit: Pencil,
  save: Save,
  cancel: X,
  close: X,
  back: ArrowLeft,
  continue: ArrowRight,
  logout: LogOut,
  download: Download,
  search: Search,
  detail: Eye,
  spinner: Loader2,
  loading: Loader2,
};

const normalizedName = computed(() => props.name.toLowerCase().replace(/\s+/g, ' ').trim());

const iconComponent = computed(() => iconMap[normalizedName.value] || CircleHelp);
</script>

<template>
  <component
    :is="iconComponent"
    :size="size"
    :stroke-width="strokeWidth"
    :class="['app-icon', { 'app-icon--spin': spin }]"
    aria-hidden="true"
  />
</template>

<style scoped>
.app-icon {
  display: inline-block;
  flex-shrink: 0;
  vertical-align: middle;
}

.app-icon--spin {
  animation: app-icon-spin 0.9s linear infinite;
}

@keyframes app-icon-spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
