/** Modulo Dashboard — API pubblica analytics operative. */
export * from "@/types/dashboard";

export {
  getDashboardData,
  searchDashboard,
  invalidateDashboardCache,
} from "@/services/dashboard.service";

export * from "@/domain";
