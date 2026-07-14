import type { OrganizationId } from "./ids";

export type OrganizationStatus = "active" | "suspended" | "archived";

export interface Organization {
  id: OrganizationId;
  name: string;
  slug: string;
  status: OrganizationStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrganizationInput {
  name: string;
  slug: string;
}

export interface UpdateOrganizationInput {
  name?: string;
  slug?: string;
  status?: OrganizationStatus;
}
