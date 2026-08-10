// Single indirection point for the shared MPA domain model. The types and
// pure helpers live with the edge functions (supabase/functions/_shared/mpa)
// so the exact same validation runs client- and server-side. If this
// cross-root import ever fights tooling, inline the module here.

export type {
  Address,
  ApplicationData,
  FullApplication,
  LuqraPricing,
  Masks,
  Month,
  Owner,
  OwnershipType,
  PaysafePricing,
  PricingBundle,
  ProcessorChannel,
  RefundPolicy,
  SecureData,
  SecureOwner,
} from '../../../supabase/functions/_shared/mpa/schema.ts';

export {
  MONTHS,
  buildMasks,
  cardMixTotal,
  emptyApplicationData,
  emptyOwner,
  emptySecureData,
  isAbaRouting,
  isEin,
  isSsn,
  needsCnpSection,
  validateForSubmit,
} from '../../../supabase/functions/_shared/mpa/schema.ts';
