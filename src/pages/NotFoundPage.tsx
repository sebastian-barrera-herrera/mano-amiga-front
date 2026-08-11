import { ButtonLink } from '../components/Button';
import { EmptyState } from '../components/Feedback';
import { SearchIcon } from '../components/Icons';

export default function NotFoundPage() {
  return (
    <EmptyState
      icon={<SearchIcon className="h-7 w-7" />}
      title="Esta página no existe"
      description="Puede que el enlace esté incompleto o que la publicación se haya eliminado."
      action={
        <ButtonLink to="/" size="lg" className="mt-2">
          Volver al inicio
        </ButtonLink>
      }
    />
  );
}
