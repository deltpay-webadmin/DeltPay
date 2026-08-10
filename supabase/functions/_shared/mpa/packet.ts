// Square / OrderOut boarding packet: a plain-text rendering of the
// application for copy-paste into the OrderOut reseller portal
// (https://reseller.orderout.co/portal/links?org=delt&iso=all), which has no
// API. By default sensitive values render masked; the packet action can be
// asked for the full values (gated on merchants.edit) since the portal form
// needs them.

import type { ApplicationData, Masks, SecureData } from "./schema.ts";

export interface PacketOptions {
  includeSensitive: boolean;
  secure?: SecureData; // required when includeSensitive
}

const OWNERSHIP_LABELS: Record<string, string> = {
  sole_prop: "Sole Proprietorship",
  partnership: "Partnership",
  corporation: "Corporation",
  llc: "LLC",
  non_profit: "Non-Profit",
  government: "Government",
};

export function squarePacketText(data: ApplicationData, masks: Masks, opts: PacketOptions): string {
  const { includeSensitive, secure } = opts;
  const b = data.business;
  const loc = data.locationAddress;
  const p = data.profile;
  const lines: string[] = [];
  const add = (label: string, value: string | number | null | undefined) => {
    const s = value === null || value === undefined ? "" : String(value).trim();
    if (s) lines.push(`${label}: ${s}`);
  };

  lines.push("=== MERCHANT BOARDING PACKET (Square / OrderOut) ===");
  lines.push("");
  lines.push("— Business —");
  add("Legal name", b.legalName);
  add("DBA", b.dba);
  add("EIN", b.ein); // EIN is business data, always shown
  add("Entity type", OWNERSHIP_LABELS[b.ownershipType] ?? b.ownershipType);
  add("Started", b.establishedDate);
  add("Phone", b.phone);
  add("Email", b.email);
  add("Website", b.website);
  add("Address", `${loc.line1}, ${loc.city}, ${loc.state} ${loc.zip}`);
  add("Contact", `${b.contactFirstName} ${b.contactLastName}`.trim());
  lines.push("");
  lines.push("— Processing profile —");
  add("Products/services", p.productsDescription);
  add("MCC", p.mcc);
  add("Monthly volume", p.monthlyVolume);
  add("Average ticket", p.averageTicket);
  add("Highest ticket", p.highestTicket);
  add(
    "Card mix",
    `${p.pctCardPresent}% swiped / ${p.pctKeyedCardPresent}% keyed / ${p.pctMoto}% moto / ${p.pctInternet}% online`,
  );
  lines.push("");
  lines.push("— Owners —");
  data.owners.forEach((o, i) => {
    const m = masks.owners[i];
    const s = secure?.owners[i];
    add(`Owner ${i + 1}`, `${o.firstName} ${o.lastName} (${o.title}, ${o.equityPct}%)`);
    add("  Email", o.email);
    add("  Phone", o.cellPhone);
    add("  Home", `${o.homeAddress}, ${o.city}, ${o.state} ${o.zip}`);
    if (includeSensitive && s) {
      add("  SSN", s.ssn);
      add("  DOB", s.dob);
    } else if (m) {
      add("  SSN", m.ssnLast4 ? `•••-••-${m.ssnLast4}` : "");
      add("  DOB year", m.dobYear);
    }
  });
  lines.push("");
  lines.push("— Banking —");
  add("Bank", data.bank.bankName);
  if (includeSensitive && secure) {
    add("Routing", secure.bank.routingNumber);
    add("Account", secure.bank.accountNumber);
  } else if (masks.bank) {
    add("Routing", masks.bank.routingLast4 ? `•••••${masks.bank.routingLast4}` : "");
    add("Account", masks.bank.accountLast4 ? `•••••${masks.bank.accountLast4}` : "");
  }
  return lines.join("\n");
}
