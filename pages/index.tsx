import { SpeechProvider } from "@speechly/react-client";

import Player from "../components/LightweightPlayer";

const HomePage = () => {
  return (
    <main>
      <SpeechProvider appId={process.env.NEXT_PUBLIC_SPEECHLY_APP_ID}>
        <Player />
      </SpeechProvider>
    </main>
  );
};

export default HomePage;
