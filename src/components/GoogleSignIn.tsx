import { useEffect, useRef } from 'react';

interface GoogleSignInProps {
  clientId: string;
  onCredential: (credential: string) => void;
}

interface GoogleIdentity {
  accounts: {
    id: {
      initialize: (options: {
        client_id: string;
        callback: (response: { credential?: string }) => void;
      }) => void;
      renderButton: (parent: HTMLElement, options: Record<string, string | number>) => void;
    };
  };
}

declare global {
  interface Window {
    google?: GoogleIdentity;
  }
}

const SCRIPT_ID = 'google-identity-services';

/**
 * Carga Google Identity Services sólo cuando esta pantalla se abre, para no
 * añadir peso a la primera carga de la app.
 */
export function GoogleSignIn({ clientId, onCredential }: GoogleSignInProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const callbackRef = useRef(onCredential);
  callbackRef.current = onCredential;

  useEffect(() => {
    let cancelled = false;

    function render() {
      if (cancelled || !window.google || !containerRef.current) return;
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: ({ credential }) => credential && callbackRef.current(credential),
      });
      window.google.accounts.id.renderButton(containerRef.current, {
        theme: 'outline',
        size: 'large',
        text: 'continue_with',
        locale: 'es',
        width: 320,
      });
    }

    const existing = document.getElementById(SCRIPT_ID);
    if (existing) {
      window.google ? render() : existing.addEventListener('load', render);
    } else {
      const script = document.createElement('script');
      script.id = SCRIPT_ID;
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = render;
      document.head.appendChild(script);
    }

    return () => {
      cancelled = true;
    };
  }, [clientId]);

  return <div ref={containerRef} className="flex justify-center" />;
}
