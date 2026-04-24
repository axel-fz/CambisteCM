export type Role = "echangeur" | "changeur";

export type ChangerStatus = "online" | "busy" | "offline";

export interface ChangerListingInput {
  currency?: unknown;
  rate?: unknown;
  neighborhood?: unknown;
  phone?: unknown;
  status?: unknown;
  isActive?: unknown;
}

export interface NormalizedChangerListingInput {
  currency: string;
  rate: string;
  neighborhood: string;
  phone: string;
  status: ChangerStatus;
  isActive: boolean;
}

const VALID_STATUSES: ChangerStatus[] = ["online", "busy", "offline"];

function toTrimmedUppercaseString(value: unknown, fallback = "") {
  return typeof value === "string" ? value.trim().toUpperCase() || fallback : fallback;
}

function toTrimmedString(value: unknown, fallback = "") {
  return typeof value === "string" ? value.trim() : fallback;
}

export function buildInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .slice(0, 2)
    .join("");
}

export function normalizeChangerListingInput(
  input: ChangerListingInput,
  defaults: Partial<NormalizedChangerListingInput> = {}
): NormalizedChangerListingInput {
  const currency = toTrimmedUppercaseString(
    input.currency,
    defaults.currency ?? "EUR"
  );
  const rate = toTrimmedString(input.rate, defaults.rate ?? "");
  const neighborhood = toTrimmedString(
    input.neighborhood,
    defaults.neighborhood ?? ""
  );
  const phone = toTrimmedString(input.phone, defaults.phone ?? "");

  const status =
    typeof input.status === "string" && VALID_STATUSES.includes(input.status as ChangerStatus)
      ? (input.status as ChangerStatus)
      : defaults.status ?? "online";

  const isActive =
    typeof input.isActive === "boolean" ? input.isActive : defaults.isActive ?? true;

  if (!currency) {
    throw new Error("La devise est requise.");
  }

  return {
    currency,
    rate,
    neighborhood,
    phone,
    status,
    isActive,
  };
}
