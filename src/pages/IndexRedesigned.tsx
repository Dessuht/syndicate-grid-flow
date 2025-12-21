import { GameLayout } from '@/components/game/redesigned/GameLayout';
import { Helmet } from 'react-helmet-async';

const IndexRedesigned = () => {
  return (
    <>
      <Helmet>
        <title>Kowloon Syndicate | Strategic Crime Empire Game</title>
        <meta name="description" content="Build your criminal empire through strategic decisions, resource management, and tactical operations in this deep strategy game set in Hong Kong." />
      </Helmet>
      <GameLayout />
    </>
  );
};

export default IndexRedesigned;