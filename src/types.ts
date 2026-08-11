export type ReportKind = 'person' | 'pet';
export type ReportStatus = 'missing' | 'found';

export interface Report {
  id: string;
  kind: ReportKind;
  status: ReportStatus;
  name: string | null;
  description: string | null;
  photoUrl: string | null;
  city: string;
  neighborhood: string | null;
  locationDetail: string | null;
  eventAt: string | null;
  approxAge: number | null;
  clothing: string | null;
  healthStatus: string | null;
  species: string | null;
  color: string | null;
  contactName: string;
  contactEmail: string | null;
  contactPhone: string | null;
  isMine: boolean;
  resolvedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ReportInput {
  kind: ReportKind;
  status: ReportStatus;
  name?: string;
  city: string;
  neighborhood?: string;
  locationDetail?: string;
  eventAt?: string;
  description?: string;
  approxAge?: number | string;
  clothing?: string;
  healthStatus?: string;
  species?: string;
  color?: string;
  photoUrl?: string;
  photoPublicId?: string;
  contactName: string;
  contactEmail?: string;
  contactPhone?: string;
}

export interface ReportStats {
  personsMissing: number;
  personsFound: number;
  petsMissing: number;
  petsFound: number;
  resolved: number;
  total: number;
}

export const MESSAGE_CATEGORIES = [
  'water',
  'food',
  'shelter',
  'medical',
  'volunteers',
  'transport',
  'info',
] as const;

export type MessageCategory = (typeof MESSAGE_CATEGORIES)[number];

export interface CommunityMessage {
  id: string;
  city: string;
  authorName: string | null;
  category: MessageCategory;
  content: string;
  contact: string | null;
  isMine: boolean;
  createdAt: string;
}

export interface CommunityMessageInput {
  city: string;
  content: string;
  category: MessageCategory;
  authorName?: string;
  contact?: string;
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface User {
  id: string;
  email: string;
  name: string | null;
  role: 'user' | 'admin';
  createdAt: string;
}

export interface AuthResult {
  token: string;
  user: User;
}

/**
 * `cloudinary`: el navegador sube la foto directamente al CDN.
 * `database`: la foto se envía a la API y se guarda en PostgreSQL.
 */
export type UploadMode = 'cloudinary' | 'database';

export interface UploadStatus {
  enabled: boolean;
  mode: UploadMode;
  maxBytes: number;
}

export interface UploadSignature {
  cloudName: string;
  apiKey: string;
  timestamp: number;
  folder: string;
  signature: string;
  uploadUrl: string;
}
