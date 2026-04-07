export interface ValidationErrors {
  [key: string]: string;
}

export function validateOrgNr(orgNr: string): string | null {
  if (!orgNr) return 'Organisationsnummer krävs';
  if (!/^\d{6}-\d{4}$/.test(orgNr)) return 'Format: 556000-0000';
  return null;
}

export function validateEmail(email: string): string | null {
  if (!email) return 'E-post krävs';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Ogiltig e-post';
  return null;
}

export function validatePnr(pnr: string): string | null {
  if (!pnr) return null; // optional unless ROT
  if (!/^\d{6,8}-?\d{4}$/.test(pnr)) return 'Ogiltigt personnummer';
  return null;
}

export function validatePhone(phone: string): string | null {
  if (!phone) return 'Telefonnummer krävs';
  if (!/^[\d\s\-+()]{7,}$/.test(phone)) return 'Ogiltigt telefonnummer';
  return null;
}

export function validateJobNotes(notes: string): string | null {
  if (!notes || notes.trim().length === 0) return 'Beskriv jobbet';
  return null;
}

export interface LineItemForValidation {
  desc: string;
  qty: number;
  unit: number;
}

export function validateLineItems(items: LineItemForValidation[]): string | null {
  const hasComplete = items.some(
    (item) => item.desc.trim().length > 0 && item.qty > 0 && item.unit > 0
  );
  if (!hasComplete) return 'Lägg till minst en komplett rad';
  return null;
}

export function validateQuoteForm(data: {
  orgNr: string;
  companyEmail: string;
  phone: string;
  customerEmail: string;
  jobNotes: string;
  items: LineItemForValidation[];
  rotEnabled: boolean;
  pnr: string;
}): ValidationErrors {
  const errors: ValidationErrors = {};

  const orgNrErr = validateOrgNr(data.orgNr);
  if (orgNrErr) errors.orgNr = orgNrErr;

  const emailErr = validateEmail(data.companyEmail);
  if (emailErr) errors.companyEmail = emailErr;

  const phoneErr = validatePhone(data.phone);
  if (phoneErr) errors.phone = phoneErr;

  const custEmailErr = validateEmail(data.customerEmail);
  if (custEmailErr) errors.customerEmail = custEmailErr;

  const jobErr = validateJobNotes(data.jobNotes);
  if (jobErr) errors.jobNotes = jobErr;

  const itemsErr = validateLineItems(data.items);
  if (itemsErr) errors.items = itemsErr;

  if (data.rotEnabled) {
    const pnrErr = validatePnr(data.pnr);
    if (pnrErr) errors.pnr = pnrErr;
  }

  return errors;
}
