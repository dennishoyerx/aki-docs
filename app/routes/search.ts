import type { Route } from './+types/search';
import { searchServer } from '@/lib/search';

export async function loader({ request }: Route.LoaderArgs) {
  return searchServer.GET(request);
}
