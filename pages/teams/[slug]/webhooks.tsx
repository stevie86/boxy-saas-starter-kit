import { Error, Loading } from '@/components/shared';
import { TeamTab } from '@/components/team';
import { Webhooks } from '@/components/webhook';
import useTeam from '@/hooks/useTeam';
import { GetServerSidePropsContext } from 'next';
import env from '@/lib/env';

// Mock translation hook
const useTranslation = (ns: string) => ({ t: (key: string) => key });

const WebhookList = ({
  teamFeatures,
}: { teamFeatures: any }) => {
  const { t } = useTranslation('common');
  const { isLoading, isError, team } = useTeam();

  if (isLoading) {
    return <Loading />;
  }

  if (isError) {
    return <Error message={isError.message} />;
  }

  if (!team) {
    return <Error message={t('team-not-found')} />;
  }

  return (
    <>
      <TeamTab activeTab="webhooks" team={team} teamFeatures={teamFeatures} />
      <Webhooks team={team} />
    </>
  );
};

export async function getServerSideProps({
  locale,
}: GetServerSidePropsContext) {
  if (!env.teamFeatures.webhook) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      teamFeatures: env.teamFeatures,
    },
  };
}

export default WebhookList;
