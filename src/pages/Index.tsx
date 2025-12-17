import { GameLayout } from '@/components/game/GameLayout';
import { Helmet } from 'react-helmet-async';

const Index = () => {
  return (
    <>
      <Helmet>
        <title>Kowloon Syndicate | Triad Strategy Game</title>
        <meta name="description" content="Command your criminal empire in the neon-lit streets of Hong Kong. Manage officers, buildings, and evade the police in this Triad strategy game." />
      </Helmet>
      <GameLayout />
    </>
  );
};

export default Index;
