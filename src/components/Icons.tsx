import type { SVGProps } from 'react';

/**
 * Iconos en línea: evitan una librería completa y mantienen el bundle pequeño.
 * Todos heredan el color del texto y el tamaño desde `className`.
 */
type IconProps = SVGProps<SVGSVGElement>;

function Icon({ children, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      {children}
    </svg>
  );
}

export const PersonSearchIcon = (props: IconProps) => (
  <Icon {...props}>
    <circle cx="10" cy="7" r="3.5" />
    <path d="M4 20c0-3.3 2.7-6 6-6 1.2 0 2.3.3 3.2.9" />
    <circle cx="17" cy="17" r="3" />
    <path d="m19.2 19.2 2.3 2.3" />
  </Icon>
);

export const PawIcon = (props: IconProps) => (
  <Icon {...props}>
    <ellipse cx="6.5" cy="10" rx="2" ry="2.6" />
    <ellipse cx="10.5" cy="6.5" rx="2" ry="2.6" />
    <ellipse cx="15" cy="6.5" rx="2" ry="2.6" />
    <ellipse cx="18.5" cy="10.5" rx="2" ry="2.6" />
    <path d="M12.5 12c2.8 0 5 2 5 4.4 0 2-1.6 3.1-3.4 3.1-.9 0-1.3-.3-1.9-.3s-1 .3-1.9.3c-1.8 0-3.4-1.1-3.4-3.1C7 14 9.7 12 12.5 12Z" />
  </Icon>
);

export const HandHeartIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M11.5 8.5a2.3 2.3 0 0 1 3.4-3 2.3 2.3 0 0 1 3.4 3L14.9 12 11.5 8.5Z" />
    <path d="M3 13.5 6 12l4.5 2 3 .6a1.4 1.4 0 0 1 0 2.8H9" />
    <path d="M3 20h4l3.5 1H16l4.5-3.2a1.5 1.5 0 0 0-1.8-2.4l-3 1.9" />
  </Icon>
);

export const ListIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M8 6h13M8 12h13M8 18h13" />
    <circle cx="3.5" cy="6" r="1" />
    <circle cx="3.5" cy="12" r="1" />
    <circle cx="3.5" cy="18" r="1" />
  </Icon>
);

export const MegaphoneIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M3 11v2a1 1 0 0 0 1 1h2l9 4V6L6 10H4a1 1 0 0 0-1 1Z" />
    <path d="M18 9a3.5 3.5 0 0 1 0 6" />
    <path d="M6.5 14.5 8 21" />
  </Icon>
);

export const HomeIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-4v-6H9v6H5a1 1 0 0 1-1-1v-9.5Z" />
  </Icon>
);

export const UserIcon = (props: IconProps) => (
  <Icon {...props}>
    <circle cx="12" cy="8" r="3.5" />
    <path d="M5 20c0-3.6 3.1-6.5 7-6.5s7 2.9 7 6.5" />
  </Icon>
);

export const SearchIcon = (props: IconProps) => (
  <Icon {...props}>
    <circle cx="11" cy="11" r="6.5" />
    <path d="m16 16 4.5 4.5" />
  </Icon>
);

export const MapPinIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M12 21s6.5-6 6.5-11a6.5 6.5 0 1 0-13 0C5.5 15 12 21 12 21Z" />
    <circle cx="12" cy="10" r="2.3" />
  </Icon>
);

export const ClockIcon = (props: IconProps) => (
  <Icon {...props}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 7.5V12l3 2" />
  </Icon>
);

export const PhoneIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M6 3.5h3l1.5 4-2 1.5a11 11 0 0 0 5.5 5.5l1.5-2 4 1.5v3a2 2 0 0 1-2.2 2A16 16 0 0 1 4 5.7 2 2 0 0 1 6 3.5Z" />
  </Icon>
);

export const MailIcon = (props: IconProps) => (
  <Icon {...props}>
    <rect x="3" y="5.5" width="18" height="13" rx="2" />
    <path d="m3.5 7 8.5 6 8.5-6" />
  </Icon>
);

export const CopyIcon = (props: IconProps) => (
  <Icon {...props}>
    <rect x="9" y="9" width="11" height="11" rx="2" />
    <path d="M15 5.5A1.5 1.5 0 0 0 13.5 4H6a2 2 0 0 0-2 2v7.5A1.5 1.5 0 0 0 5.5 15" />
  </Icon>
);

export const CheckIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="m5 13 4.5 4.5L19 7" />
  </Icon>
);

export const ShareIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M12 15V4" />
    <path d="m8 7.5 4-3.5 4 3.5" />
    <path d="M5 13v6a1.5 1.5 0 0 0 1.5 1.5h11A1.5 1.5 0 0 0 19 19v-6" />
  </Icon>
);

/* Logotipos de marca: van rellenos, no con trazo, para que se reconozcan. */

export const WhatsAppIcon = (props: IconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false" {...props}>
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.966 1.164-.198.198-.396.223-.694.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.05-.52-.099-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347Z" />
    <path d="M20.52 3.449A11.87 11.87 0 0 0 12.045 0C5.463 0 .104 5.334.101 11.893c0 2.096.549 4.14 1.595 5.945L0 24l6.335-1.652a11.94 11.94 0 0 0 5.71 1.445h.006c6.585 0 11.946-5.336 11.949-11.896 0-3.176-1.24-6.165-3.48-8.448Zm-8.475 18.297h-.005a9.9 9.9 0 0 1-5.064-1.385l-.36-.214-3.766.982 1.008-3.653-.239-.375a9.86 9.86 0 0 1-1.529-5.303c.002-5.492 4.492-9.958 10.012-9.958a9.9 9.9 0 0 1 7.075 2.93 9.83 9.83 0 0 1 2.929 7.061c-.003 5.492-4.493 9.958-10.012 9.958Z" />
  </svg>
);

export const FacebookIcon = (props: IconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false" {...props}>
    <path d="M24 12.073C24 5.446 18.627 0 12 0S0 5.446 0 12.073c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073Z" />
  </svg>
);

export const AlertIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M12 4.5 21 19.5H3L12 4.5Z" />
    <path d="M12 10v4" />
    <circle cx="12" cy="16.8" r=".6" fill="currentColor" />
  </Icon>
);

export const TrashIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M4.5 7h15M9.5 7V5a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v2" />
    <path d="M6.5 7l.8 12a1 1 0 0 0 1 .9h7.4a1 1 0 0 0 1-.9l.8-12" />
  </Icon>
);

export const PencilIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M5 19h3l10-10-3-3L5 16v3Z" />
    <path d="m14.5 5.5 3 3" />
  </Icon>
);

export const CameraIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M4 8.5h3l1.5-2h7L17 8.5h3a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-8a1 1 0 0 1 1-1Z" />
    <circle cx="12" cy="13.5" r="3" />
  </Icon>
);

export const ArrowLeftIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M19 12H5" />
    <path d="m10 7-5 5 5 5" />
  </Icon>
);

export const GoogleIcon = (props: IconProps) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" {...props}>
    <path
      fill="#4285F4"
      d="M21.6 12.2c0-.7-.1-1.4-.2-2H12v3.9h5.4a4.6 4.6 0 0 1-2 3v2.5h3.2c1.9-1.7 3-4.3 3-7.4Z"
    />
    <path
      fill="#34A853"
      d="M12 22c2.7 0 4.9-.9 6.6-2.4l-3.2-2.5c-.9.6-2 1-3.4 1a5.9 5.9 0 0 1-5.6-4.1H3.1v2.6A10 10 0 0 0 12 22Z"
    />
    <path fill="#FBBC05" d="M6.4 14a6 6 0 0 1 0-3.9V7.5H3.1a10 10 0 0 0 0 9l3.3-2.5Z" />
    <path
      fill="#EA4335"
      d="M12 5.9c1.5 0 2.8.5 3.8 1.5l2.9-2.9A10 10 0 0 0 3.1 7.5l3.3 2.6A5.9 5.9 0 0 1 12 5.9Z"
    />
  </svg>
);
