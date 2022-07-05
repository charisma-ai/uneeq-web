import { AppProps } from "next/app";
import Head from "next/head";
import { DefaultSeo } from "next-seo";

import "normalize.css/normalize.css";
import "../lib/styles.css";

const App = ({ Component, pageProps }: AppProps) => (
  <>
    <Head>
      <meta charSet="utf-8" />
      <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
      <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/normalize/7.0.0/normalize.min.css"
      />
    </Head>
    <DefaultSeo
      title="Charisma x UneeQ — Ultimate digital humans"
      description="Interactive digital humans with the best in conversational technology."
      openGraph={{
        images: [
          {
            url: "https://uneeq-web.vercel.app/static/og.png",
            width: 1200,
            height: 630,
            alt: "Logos for Charisma and UneeQ.",
            type: "image/png",
          },
        ],
      }}
      twitter={{
        cardType: "summary_large_image",
        site: "@AiCharisma",
      }}
    />
    <Component {...pageProps} />
  </>
);

export default App;
