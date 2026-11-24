import { AbsoluteFill, Sequence } from "remotion";
import { Scene01 } from "./scenes/Scene01";
import { Scene02 } from "./scenes/Scene02";
import { Scene03 } from "./scenes/Scene03";
import { Scene04 } from "./scenes/Scene04";
import { Scene05 } from "./scenes/Scene05";
import { Scene06 } from "./scenes/Scene06";
import { Scene07 } from "./scenes/Scene07";
import { Scene08 } from "./scenes/Scene08";
import { Scene09 } from "./scenes/Scene09";
import { Scene10 } from "./scenes/Scene10";
import { Scene11 } from "./scenes/Scene11";
import { Scene12 } from "./scenes/Scene12";
import { Scene13 } from "./scenes/Scene13";

const FPS = 30;
// [секунд, сцена] — длительности подогнаны под записанные голоса; сумма ровно 120 с.
export const SCENES: [number, React.FC][] = [
  [5, Scene01],
  [11.8, Scene02],
  [9.3, Scene03],
  [8.9, Scene04],
  [14.4, Scene05],
  [9.2, Scene06],
  [15.6, Scene07],
  [7.6, Scene08],
  [9.8, Scene09],
  [10, Scene10],
  [9, Scene11],
  [4.7, Scene12],
  [4.7, Scene13],
];

export const Main = () => {
  let from = 0;
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {SCENES.map(([sec, C], i) => {
        const f = from;
        const d = Math.round(sec * FPS);
        from += d;
        return (
          <Sequence key={i} from={f} durationInFrames={d} layout="none">
            <C />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
