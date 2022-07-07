import { useEffect, useRef, useState } from "react";
import { ClientState, useSpeechContext } from "@speechly/react-client";
import classNames from "classnames";
import {
  Conversation,
  createConversation,
  createPlaythroughToken,
  Playthrough,
} from "@charisma-ai/sdk";
import { BsFillPlayFill } from "react-icons/bs";

import createUneeqPlayer from "../lib/uneeq";
import Spinner from "./Spinner";

const STORY_ID = 5507;

const Player = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isUneeqLoaded, setIsUneeqLoaded] = useState(false);

  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const avatarVideoContainerElement = useRef<HTMLDivElement>(null);
  const localVideoContainerElement = useRef<HTMLDivElement>(null);
  const [conversation, setConversation] = useState<Conversation>();
  const startExperience = async () => {
    if (
      !avatarVideoContainerElement.current ||
      !localVideoContainerElement.current
    ) {
      return;
    }

    setIsLoading(true);

    const initialPlaythroughToken = await createPlaythroughToken({
      storyId: STORY_ID,
    });
    const initialConversationId = await createConversation(
      initialPlaythroughToken,
    );

    const playthrough = new Playthrough(initialPlaythroughToken);
    await playthrough.connect();

    let sessionId: string;
    const newConversation = playthrough.joinConversation(initialConversationId);
    newConversation.setSpeechConfig({
      encoding: "pcm",
      output: "url",
    });
    newConversation.on("message", (message) => {
      console.log("CHARISMA MESSAGE:");
      console.log(message);
      if (message.type === "character" && message.message.speech) {
        fetch(
          "https://charisma-uneeq-orchestration.herokuapp.com/api/v1/custom/charisma/pushWav",
          {
            method: "POST",
            body: JSON.stringify({
              uneeqSessionId: sessionId,
              wavURL: message.message.speech.audio,
              instructions: { displayHtml: { html: "" } },
            }),
            headers: {
              "Content-Type": "application/json",
            },
          },
        ).catch((err) => {
          console.error(err);
        });
      }
    });
    setConversation(newConversation);

    let hasStarted = false;
    const uneeq = await createUneeqPlayer({
      avatarVideoContainerElement: avatarVideoContainerElement.current,
      localVideoContainerElement: localVideoContainerElement.current,
      messageHandler: (message: {
        uneeqMessageType: string;
        [key: string]: any;
      }) => {
        if (message.uneeqMessageType === "WebRtcData" && !hasStarted) {
          hasStarted = true;
          sessionId = uneeq.sessionId as string;
          setIsUneeqLoaded(true);
          newConversation.start();
        } else if (message.uneeqMessageType !== "WebRtcData") {
          console.log("UNEEQ MESSAGE:");
          console.log(message);

          if (message.uneeqMessageType === "StartedSpeaking") {
            setIsSpeaking(true);
          } else if (message.uneeqMessageType === "FinishedSpeaking") {
            setIsSpeaking(false);
          }
        }
      },
    });
  };

  const { clientState, startContext, stopContext, segment } =
    useSpeechContext();

  useEffect(() => {
    if (isListening && !isSpeaking) {
      startContext().catch(() => setIsListening(false));
    } else {
      stopContext().catch(() => {
        // this is likely to be because it wasn't started!
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSpeaking, isListening]);

  const [text, setText] = useState("");

  useEffect(() => {
    if (!segment || !isListening || isSpeaking) {
      return;
    }

    const words = segment.words
      .map((word) => word.value)
      .filter((_) => _)
      .join(" ");

    setText(words);

    if (segment.isFinal) {
      conversation?.reply({ text: words.toLowerCase() });
      setText("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [segment]);

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        background: "#131316",
        padding: !isUneeqLoaded ? 25 : 0,
        transition: "padding 0.8s ease-in-out",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          border: "1px solid rgb(61 58 58)",
          borderRadius: !isUneeqLoaded ? 6 : 0,
          overflow: "hidden",
          backgroundImage: "url('/static/digital-human-2.png')",
          backgroundSize: "cover",
          backgroundPosition: "50% 50%",
          boxShadow: "0 0 4px black",
        }}
      >
        <div
          className="play"
          style={{
            position: "relative",
          }}
        >
          <div
            className="step step-0"
            style={{
              opacity: !isUneeqLoaded ? 1 : 0,
              pointerEvents: !isUneeqLoaded ? "all" : "none",
            }}
          >
            <h1 className="gradient-text">Charisma x UneeQ</h1>
            <h2 style={{ textAlign: "center" }}>
              The ultimate conversational digital human
            </h2>
            <button
              type="button"
              disabled={isLoading}
              className="play-button"
              onClick={() => {
                startExperience();
              }}
            >
              {isLoading && <Spinner />}
              {!isLoading && <BsFillPlayFill color="white" size={64} />}
            </button>
          </div>
        </div>
        <div
          ref={avatarVideoContainerElement}
          style={{
            position: "absolute",
            width: "100%",
            top: 0,
            height: "100%",
            pointerEvents: "none",
          }}
        />
        <div
          ref={localVideoContainerElement}
          style={{ display: "none", visibility: "hidden" }}
        />
        <div className={isUneeqLoaded ? "controls ready" : "controls"}>
          <input
            placeholder="Speak or type..."
            onChange={(event) => setText(event.currentTarget.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                conversation?.reply({ text });
                setText("");
              }
            }}
            value={text}
          />
          <button
            type="button"
            id="mic"
            className={classNames({
              on: clientState === ClientState.Recording,
              paused: isListening && isSpeaking,
            })}
            onClick={() => setIsListening(!isListening)}
          >
            {isListening ? (
              <img src="/static/icon-mic-on.png" alt="Microphone on" />
            ) : (
              <img src="/static/icon-mic-off.png" alt="Microphone off" />
            )}
          </button>
        </div>
      </div>
      <style jsx>{`
        .controls {
          position: absolute;
          width: 80%;
          left: 10%;
          bottom: 50px;
          font-size: 20px;
          font-family: "Roboto Mono", sans-serif;
          display: flex;
          align-items: center;
          opacity: 0;
          visibility: hidden;
          transition: opacity 0.5s ease-in-out;
          z-index: 10;
        }

        .controls.ready {
          opacity: 1;
          visibility: visible;
        }

        input {
          flex: 1;
          color: #f5f8fa;
          background: rgba(40, 40, 40, 0.5);
          backdrop-filter: blur(10px);
          border-radius: 4px;
          border: 1px solid rgba(200, 200, 200, 0.2);
          box-shadow: 0px 2px 1px -1px rgb(0 0 0 / 20%),
            0px 1px 1px 0px rgb(0 0 0 / 14%), 0px 1px 3px 0px rgb(0 0 0 / 12%);
          padding: 0px 8px;
          height: 60px;
          box-sizing: border-box;
        }

        button {
          backdrop-filter: blur(10px);
          border: 1px solid rgba(200, 200, 200, 0.8);
          background: rgba(40, 40, 40, 0.5);
          border-radius: 4px;
          transition: background 0.2s ease-in-out;
          cursor: pointer;
          padding: 4px 8px;
          color: #f5f8fa;
        }

        button:disabled {
          cursor: not-allowed;
          opacity: 0.5;
        }

        button:not(:disabled):hover {
          background: rgb(37 207 118 / 35%);
        }

        button.minimal {
          padding: 3px 6px;
          border: 1px solid rgba(200, 200, 200, 0.4);
          font-size: 14px;
          color: #fffb;
        }

        button#mic {
          color: #f5f8fa;
          background: rgba(40, 40, 40, 0.5);
          border-radius: 4px;
          border: 1px solid rgba(200, 200, 200, 0.2);
          box-shadow: 0px 2px 1px -1px rgb(0 0 0 / 20%),
            0px 1px 1px 0px rgb(0 0 0 / 14%), 0px 1px 3px 0px rgb(0 0 0 / 12%);
          padding: 4px 8px;
          cursor: pointer;
          margin-left: 4px;
          width: 60px;
          display: flex;
          align-items: center;
          justify-content: center;
          height: 60px;
        }

        button#mic img {
          width: 34px;
          height: 34px;
        }

        button#mic.on {
          background: rgb(255 0 0 / 60%);
        }

        button#mic.paused {
          background: rgb(255 255 0 / 60%);
        }

        .play-button {
          width: 96px;
          height: 96px;
          border-radius: 50%;
          margin-bottom: 75px;
          padding: 0;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .play {
          width: 100%;
          height: 100%;
          font-family: "Source Sans Pro";
          color: white;
        }

        .step {
          width: 100%;
          height: 100%;
          position: absolute;
          top: 0;
          transition: opacity 0.5s ease-in-out;
        }

        .step-0 {
          background: linear-gradient(0deg, black, transparent);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-end;
        }

        .step-1,
        .step-2,
        .step-4 {
          background: #000000bb;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          font-size: 19px;
          line-height: 28px;
        }

        .step-3 {
          background: black;
        }

        h1 {
          font-family: "Alata";
          font-size: 80px;
          filter: drop-shadow(0 0 12px black);
          margin: 0;
        }

        h2 {
          display: flex;
          align-items: center;
          filter: drop-shadow(0 0 4px black);
          font-size: 32px;
        }

        .gradient-text {
          background-image: linear-gradient(to bottom, #1ad1b6, #7aed81);
          background-size: cover;
          -webkit-text-fill-color: transparent;
          -webkit-background-clip: text;
          white-space: nowrap;
        }

        p {
          opacity: 0;
          transform: none;
          animation: 1s ease-out 0s 1 slideUpFromBottom;
          animation-fill-mode: forwards;
        }

        p:nth-child(2) {
          animation-delay: 3s;
        }

        p:nth-child(3) {
          animation-delay: 6s;
        }

        p:nth-child(4) {
          animation-delay: 9s;
        }

        p:nth-child(5) {
          animation-delay: 12s;
        }

        .step-1 button {
          opacity: 0;
          transform: none;
          animation: 1s ease-out 0s 1 slideUpFromBottom;
          animation-fill-mode: forwards;
          animation-delay: 15s;
        }

        @keyframes slideUpFromBottom {
          0% {
            transform: translateY(20px);
            opacity: 0;
          }
          100% {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default Player;
