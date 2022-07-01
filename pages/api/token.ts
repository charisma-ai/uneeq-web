import jwt from "jsonwebtoken";

import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  _req: NextApiRequest,
  res: NextApiResponse,
) {
  // Environment variables loaded in from .env
  const uneeqUri = process.env.UNEEQ_URI as string;
  const uneeqWorkspace = process.env.NEXT_PUBLIC_UNEEQ_ID as string;
  const uneeqSecret = process.env.UNEEQ_SECRET as string;

  // The custom data to be associated with the session and available when asking a question to conversation service
  // const customData = { customDataExample: "Custom data example." };

  try {
    const request = {
      method: "POST",
      body: jwt.sign(
        /* The body must be signed as JWT with customers secret */
        {
          sid: "SESSION-ID",
          "fm-workspace": uneeqWorkspace,
          // "fm-custom-data": JSON.stringify(customData),
        },
        uneeqSecret,
      ),
      headers: {
        "content-type": "application/jwt",
        workspace: uneeqWorkspace,
      },
    };

    // Make the request and return the token
    const getTokenResponse = await fetch(
      `${uneeqUri}/api/v1/clients/access/tokens/`,
      request,
    );

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const json = await getTokenResponse.json();
    res.status(200);
    res.send(json);
  } catch (err) {
    // Log and return errors
    console.error(err);
    res.status(500);
    res.send(err);
  }
}
