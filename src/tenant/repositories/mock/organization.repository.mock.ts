import { createOrganization } from "@/tenant/models";
import type { IOrganizationRepository } from "@/tenant/interfaces";
import type {
  CreateOrganizationInput,
  Organization,
  OrganizationId,
  UpdateOrganizationInput,
} from "@/tenant/types";
import { DEFAULT_ORGANIZATION } from "@/tenant/mock/tenant.seed";

export class OrganizationRepositoryError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "OrganizationRepositoryError";
  }
}

export class MockOrganizationRepository implements IOrganizationRepository {
  private store = new Map<OrganizationId, Organization>();

  constructor(seed = true) {
    if (seed) {
      this.store.set(DEFAULT_ORGANIZATION.id, { ...DEFAULT_ORGANIZATION });
    }
  }

  async findById(id: OrganizationId): Promise<Organization | null> {
    const organization = this.store.get(id);
    return organization ? { ...organization } : null;
  }

  async findBySlug(slug: string): Promise<Organization | null> {
    const normalized = slug.trim().toLowerCase();
    for (const organization of this.store.values()) {
      if (organization.slug === normalized) {
        return { ...organization };
      }
    }
    return null;
  }

  async list(): Promise<Organization[]> {
    return [...this.store.values()].map((organization) => ({ ...organization }));
  }

  async create(input: CreateOrganizationInput): Promise<Organization> {
    const existing = await this.findBySlug(input.slug);
    if (existing) {
      throw new OrganizationRepositoryError(
        `Organization slug "${input.slug}" already exists`,
      );
    }

    const organization = createOrganization(input);
    this.store.set(organization.id, organization);
    return { ...organization };
  }

  async update(
    id: OrganizationId,
    input: UpdateOrganizationInput,
  ): Promise<Organization> {
    const current = this.store.get(id);
    if (!current) {
      throw new OrganizationRepositoryError(`Organization "${id}" not found`);
    }

    if (input.slug && input.slug !== current.slug) {
      const existing = await this.findBySlug(input.slug);
      if (existing && existing.id !== id) {
        throw new OrganizationRepositoryError(
          `Organization slug "${input.slug}" already exists`,
        );
      }
    }

    const updated: Organization = {
      ...current,
      ...input,
      slug: input.slug?.trim().toLowerCase() ?? current.slug,
      name: input.name?.trim() ?? current.name,
      updatedAt: new Date().toISOString(),
    };

    this.store.set(id, updated);
    return { ...updated };
  }

  async delete(id: OrganizationId): Promise<void> {
    if (!this.store.has(id)) {
      throw new OrganizationRepositoryError(`Organization "${id}" not found`);
    }
    this.store.delete(id);
  }
}

export const organizationRepository = new MockOrganizationRepository();
