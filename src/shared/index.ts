/** Shared module — componenti, provider e utilità cross-cutting. */
export * from "@/shared/components/ui/Button";
export * from "@/shared/components/ui/Card";
export * from "@/shared/components/ui/Modal";
export * from "@/shared/components/ui/Toast";
export * from "@/shared/components/ui/Spinner";
export * from "@/shared/components/ui/EmptyState";

export { DashboardLayout } from "@/shared/components/layout/DashboardLayout";
export { Sidebar } from "@/shared/components/layout/Sidebar";
export { TopBar } from "@/shared/components/layout/TopBar";
export { PageHeader } from "@/shared/components/layout/PageHeader";

export { AppProviders } from "@/shared/providers/AppProviders";

export {
  profiloBadgeBase,
  profiloContentWrap,
  profiloSectionStack,
  profiloSectionLabel,
  profiloItemCard,
  profiloIconBox,
} from "@/shared/utils/profilo-ui";

export { navItems } from "@/config/navigation";
export { getSupabaseClient } from "@/config/supabase";
