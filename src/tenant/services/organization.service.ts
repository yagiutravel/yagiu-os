import type { IOrganizationRepository } from "@/tenant/interfaces";
import { organizationRepository } from "../repositories";
import type {
  CreateOrganizationInput,
  Organization,
  OrganizationId,
  TenantContext,
  UpdateOrganizationInput,
} from "@/tenant/types";

export class OrganizationServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "OrganizationServiceError";
  }
}

export class OrganizationService {
  constructor(
    private readonly repository: IOrganizationRepository = organizationRepository,
  ) {}

  async getById(id: OrganizationId): Promise<Organization | null> {
    return this.repository.findById(id);
  }

  async getBySlug(slug: string): Promise<Organization | null> {
    return this.repository.findBySlug(slug);
  }

  async list(): Promise<Organization[]> {
    return this.repository.list();
  }

  async getForContext(context: TenantContext): Promise<Organization | null> {
    return this.repository.findById(context.organizationId);
  }

  async create(input: CreateOrganizationInput): Promise<Organization> {
    return this.repository.create(input);
  }

  async update(
    id: OrganizationId,
    input: UpdateOrganizationInput,
  ): Promise<Organization> {
    return this.repository.update(id, input);
  }

  async delete(id: OrganizationId): Promise<void> {
    const organization = await this.repository.findById(id);
    if (!organization) {
      throw new OrganizationServiceError(`Organization "${id}" not found`);
    }
    return this.repository.delete(id);
  }
}

export const organizationService = new OrganizationService();
