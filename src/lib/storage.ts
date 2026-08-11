const CONTACT_KEY = 'manoamiga.contact';

export interface SavedContact {
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  city?: string;
}

/**
 * Quien reporta suele publicar varias veces (una persona, luego su mascota).
 * Recordar sus datos de contacto en el propio dispositivo ahorra tiempo.
 */
export const contactStorage = {
  read(): SavedContact {
    try {
      const raw = localStorage.getItem(CONTACT_KEY);
      return raw ? (JSON.parse(raw) as SavedContact) : {};
    } catch {
      return {};
    }
  },

  save(contact: SavedContact): void {
    try {
      localStorage.setItem(CONTACT_KEY, JSON.stringify(contact));
    } catch {
      /* almacenamiento no disponible: no es crítico */
    }
  },
};
