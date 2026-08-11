import type { ReportInput, ReportKind, ReportStatus } from '../types';

export const REPORT_VARIANTS = [
  'persona-desaparecida',
  'mascota-perdida',
  'persona-encontrada',
  'mascota-encontrada',
] as const;

export type ReportVariant = (typeof REPORT_VARIANTS)[number];

export type FieldName = Exclude<keyof ReportInput, 'kind' | 'status' | 'photoUrl' | 'photoPublicId'>;

export interface FieldDef {
  name: FieldName;
  label: string;
  type: 'text' | 'number' | 'textarea' | 'select' | 'datetime' | 'email' | 'tel';
  required?: boolean;
  placeholder?: string;
  help?: string;
  options?: string[];
  autoComplete?: string;
  maxLength?: number;
}

export interface FormSection {
  legend: string;
  fields: FieldDef[];
}

export interface ReportFormConfig {
  variant: ReportVariant;
  kind: ReportKind;
  status: ReportStatus;
  title: string;
  subtitle: string;
  accent: 'brand' | 'gold';
  photoHelp: string;
  sections: FormSection[];
  submitLabel: string;
}

const SPECIES = ['Perro', 'Gato', 'Ave', 'Conejo', 'Otro'];

/** Sección de contacto: idéntica en los cuatro formularios. */
function contactSection(what: string): FormSection {
  return {
    legend: 'Cómo contactarte',
    fields: [
      {
        name: 'contactName',
        label: 'Tu nombre',
        type: 'text',
        required: true,
        placeholder: 'Nombre y apellido',
        autoComplete: 'name',
      },
      {
        name: 'contactEmail',
        label: 'Tu correo',
        type: 'email',
        placeholder: 'nombre@correo.com',
        autoComplete: 'email',
      },
      {
        name: 'contactPhone',
        label: 'Tu teléfono o WhatsApp',
        type: 'tel',
        placeholder: '+57 300 000 0000',
        autoComplete: 'tel',
        help: `Indica al menos un correo o un teléfono para que puedan avisarte sobre ${what}.`,
      },
    ],
  };
}

const cityField: FieldDef = {
  name: 'city',
  label: 'Ciudad',
  type: 'text',
  required: true,
  placeholder: 'Armenia, Pereira, Manizales…',
  autoComplete: 'address-level2',
};

const neighborhoodField: FieldDef = {
  name: 'neighborhood',
  label: 'Barrio o vereda',
  type: 'text',
  placeholder: 'La Fachada, Centro…',
};

const CONFIGS: Record<ReportVariant, ReportFormConfig> = {
  'persona-desaparecida': {
    variant: 'persona-desaparecida',
    kind: 'person',
    status: 'missing',
    title: 'Reportar persona desaparecida',
    subtitle:
      'Entre más detalles compartas, más fácil será que alguien la reconozca. Puedes publicar sin crear cuenta.',
    accent: 'brand',
    photoHelp: 'Una foto reciente del rostro ayuda muchísimo a identificarla.',
    submitLabel: 'Publicar reporte',
    sections: [
      {
        legend: 'Sobre la persona',
        fields: [
          {
            name: 'name',
            label: 'Nombre completo',
            type: 'text',
            required: true,
            placeholder: 'Nombre y apellidos',
          },
          {
            name: 'approxAge',
            label: 'Edad aproximada',
            type: 'number',
            placeholder: 'Ej: 34',
          },
          {
            name: 'description',
            label: 'Descripción física',
            type: 'textarea',
            placeholder: 'Estatura, contextura, cabello, señales particulares…',
            maxLength: 2000,
          },
          {
            name: 'clothing',
            label: 'Ropa que llevaba',
            type: 'text',
            placeholder: 'Camisa azul, jean y tenis blancos',
          },
          {
            name: 'healthStatus',
            label: 'Estado de salud (opcional)',
            type: 'text',
            placeholder: 'Diabético, necesita medicamentos, embarazada…',
            help: 'Si requiere atención urgente, indícalo aquí.',
          },
        ],
      },
      {
        legend: 'Dónde y cuándo desapareció',
        fields: [
          cityField,
          neighborhoodField,
          {
            name: 'locationDetail',
            label: 'Última ubicación conocida',
            type: 'text',
            placeholder: 'Cerca del parque principal, edificio Torres del Café',
          },
          {
            name: 'eventAt',
            label: 'Fecha y hora de la desaparición',
            type: 'datetime',
          },
        ],
      },
      contactSection('esta persona'),
    ],
  },

  'mascota-perdida': {
    variant: 'mascota-perdida',
    kind: 'pet',
    status: 'missing',
    title: 'Reportar mascota perdida',
    subtitle: 'Publica su foto y los detalles para que los vecinos puedan reconocerla.',
    accent: 'brand',
    photoHelp: 'Sube una foto donde se vean bien su color y su tamaño.',
    submitLabel: 'Publicar reporte',
    sections: [
      {
        legend: 'Sobre la mascota',
        fields: [
          { name: 'name', label: 'Nombre', type: 'text', placeholder: 'Nube, Toby…' },
          {
            name: 'species',
            label: 'Especie',
            type: 'select',
            options: SPECIES,
            placeholder: 'Selecciona',
          },
          {
            name: 'color',
            label: 'Color',
            type: 'text',
            placeholder: 'Blanco con manchas cafés',
          },
          {
            name: 'description',
            label: 'Descripción',
            type: 'textarea',
            placeholder: 'Tamaño, raza, collar, comportamiento…',
            maxLength: 2000,
          },
        ],
      },
      {
        legend: 'Dónde y cuándo se perdió',
        fields: [
          cityField,
          neighborhoodField,
          {
            name: 'locationDetail',
            label: 'Lugar donde desapareció',
            type: 'text',
            placeholder: 'Se escapó de la casa en la carrera 18',
          },
          { name: 'eventAt', label: 'Fecha y hora', type: 'datetime' },
        ],
      },
      contactSection('tu mascota'),
    ],
  },

  'persona-encontrada': {
    variant: 'persona-encontrada',
    kind: 'person',
    status: 'found',
    title: 'Reportar persona encontrada',
    subtitle:
      'Si encontraste a alguien que puede estar siendo buscado, publícalo aquí. No hace falta saber su nombre.',
    accent: 'gold',
    photoHelp: 'Publica una foto sólo si la persona lo autoriza o si no puede identificarse.',
    submitLabel: 'Publicar hallazgo',
    sections: [
      {
        legend: 'Sobre la persona',
        fields: [
          {
            name: 'name',
            label: 'Nombre (si lo conoces)',
            type: 'text',
            placeholder: 'Déjalo vacío si no se sabe',
          },
          { name: 'approxAge', label: 'Edad aproximada', type: 'number', placeholder: 'Ej: 70' },
          {
            name: 'description',
            label: 'Descripción física',
            type: 'textarea',
            placeholder: 'Estatura, contextura, señales particulares…',
            maxLength: 2000,
          },
          { name: 'clothing', label: 'Ropa que lleva', type: 'text', placeholder: 'Suéter café' },
          {
            name: 'healthStatus',
            label: 'Estado de salud',
            type: 'text',
            placeholder: 'Estable, herida leve, atendida por la brigada…',
            help: 'Ayuda a que su familia sepa cómo está.',
          },
        ],
      },
      {
        legend: 'Dónde la encontraste',
        fields: [
          cityField,
          neighborhoodField,
          {
            name: 'locationDetail',
            label: 'Lugar donde fue encontrada',
            type: 'text',
            required: true,
            placeholder: 'Albergue del coliseo del sur',
          },
          { name: 'eventAt', label: 'Fecha y hora del hallazgo', type: 'datetime' },
        ],
      },
      contactSection('esta persona'),
    ],
  },

  'mascota-encontrada': {
    variant: 'mascota-encontrada',
    kind: 'pet',
    status: 'found',
    title: 'Reportar mascota encontrada',
    subtitle: 'Cuéntanos dónde está para que su familia pueda reconocerla y recogerla.',
    accent: 'gold',
    photoHelp: 'Una foto actual es la forma más rápida de que su familia la reconozca.',
    submitLabel: 'Publicar hallazgo',
    sections: [
      {
        legend: 'Sobre la mascota',
        fields: [
          {
            name: 'name',
            label: 'Nombre (si lo sabes)',
            type: 'text',
            placeholder: 'Déjalo vacío si no se sabe',
          },
          {
            name: 'species',
            label: 'Especie',
            type: 'select',
            options: SPECIES,
            placeholder: 'Selecciona',
          },
          { name: 'color', label: 'Color', type: 'text', placeholder: 'Naranja' },
          {
            name: 'description',
            label: 'Descripción',
            type: 'textarea',
            placeholder: 'Tamaño, collar, estado en que se encuentra…',
            maxLength: 2000,
          },
        ],
      },
      {
        legend: 'Dónde la encontraste',
        fields: [
          cityField,
          neighborhoodField,
          {
            name: 'locationDetail',
            label: 'Lugar donde la encontraste',
            type: 'text',
            required: true,
            placeholder: 'Techo de una casa en la carrera 24',
          },
          { name: 'eventAt', label: 'Fecha y hora del hallazgo', type: 'datetime' },
        ],
      },
      contactSection('esta mascota'),
    ],
  },
};

export function getFormConfig(variant: string | undefined): ReportFormConfig | null {
  if (!variant) return null;
  return CONFIGS[variant as ReportVariant] ?? null;
}

export function variantFor(kind: ReportKind, status: ReportStatus): ReportVariant {
  if (kind === 'person') return status === 'missing' ? 'persona-desaparecida' : 'persona-encontrada';
  return status === 'missing' ? 'mascota-perdida' : 'mascota-encontrada';
}
