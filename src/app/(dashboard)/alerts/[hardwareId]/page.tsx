import { AlertsPageClient } from './AlertsPageClient';

export default async function AlertsPage({
  params,
  searchParams,
}: {
  params: Promise<{ hardwareId: string }>;
  searchParams: Promise<{ new?: string }>;
}) {
  const { hardwareId } = await params;
  const { new: isNew } = await searchParams;
  
  return <AlertsPageClient hardwareId={hardwareId} isNew={isNew === 'true'} />;
}