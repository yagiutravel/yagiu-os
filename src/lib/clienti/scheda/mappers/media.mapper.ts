import type { ClienteAllegato, ClienteMedia } from "@/types/cliente-scheda/media";
import { EMPTY_MEDIA } from "@/models/cliente-scheda/defaults";

export function mapAllegatiToMedia(
  allegati: ClienteAllegato[] = [],
  avatarUrl: string | null = null,
): ClienteMedia {
  return {
    avatarUrl,
    allegati,
  };
}

export function mapMediaOverrides(overrides?: Partial<ClienteMedia>): ClienteMedia {
  if (!overrides) return EMPTY_MEDIA;

  return {
    avatarUrl: overrides.avatarUrl ?? EMPTY_MEDIA.avatarUrl,
    allegati: overrides.allegati ?? EMPTY_MEDIA.allegati,
  };
}

export function countAllegati(media: ClienteMedia): number {
  return media.allegati.length;
}

export function hasAvatar(media: ClienteMedia): boolean {
  return Boolean(media.avatarUrl?.trim());
}
