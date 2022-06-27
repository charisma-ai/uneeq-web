import type { UneeqOptions } from "uneeq-js";

const createUneeqPlayer = async (
  options: Partial<UneeqOptions> &
    Pick<
      UneeqOptions,
      "avatarVideoContainerElement" | "localVideoContainerElement"
    >,
) => {
  const { Uneeq } = await import("uneeq-js");

  const uneeq = new Uneeq({
    ...options,
    url: "https://api.us.uneeq.io",
    conversationId: "053b0b36-d650-4404-a326-e3f1bf41781a",
    sendLocalAudio: false,
    sendLocalVideo: false,
    // logging: true,
  });

  const response = await fetch("/api/token");
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const json: { token: string } = await response.json();

  await uneeq.initWithToken(json.token);
  return uneeq;
};

export default createUneeqPlayer;
