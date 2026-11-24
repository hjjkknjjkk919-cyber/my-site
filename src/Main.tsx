import { AbsoluteFill, Sequence } from "remotion";
import { Gust } from "./components/fx";
import { Sfx } from "./components/audio";
import { DUR as D01, Scene01 } from "./scenes/Scene01";
import { DUR as D02, Scene02 } from "./scenes/Scene02";
import { DUR as D03, Scene03 } from "./scenes/Scene03";
import { DUR as D04, Scene04 } from "./scenes/Scene04";
import { DUR as D05, Scene05 } from "./scenes/Scene05";
import { DUR as D06, Scene06 } from "./scenes/Scene06";
import { DUR as D07, Scene07 } from "./scenes/Scene07";
import { DUR as D08, Scene08 } from "./scenes/Scene08";
import { DUR as D09, Scene09 } from "./scenes/Scene09";
import { DUR as D10, Scene10 } from "./scenes/Scene10";
import { DUR as D11, Scene11 } from "./scenes/Scene11";
import { DUR as D12, Scene12 } from "./scenes/Scene12";
import { DUR as D13, Scene13 } from "./scenes/Scene13";
import { DUR as D14, Scene14 } from "./scenes/Scene14";

const FPS = 30;
// [секунд, сцена] — каждая сцена сама считает свою длину по записанным репликам и паузам.
export const SCENES: [number, React.FC][] = [
  [D01, Scene01],
  [D02, Scene02],
  [D03, Scene03],
  [D04, Scene04],
  [D05, Scene05],
  [D06, Scene06],
  [D07, Scene07],
  [D08, Scene08],
  [D09, Scene09],
  [D10, Scene10],
  [D11, Scene11],
  [D12, Scene12],
  [D13, Scene13],
  [D14, Scene14],
];
export const TOTAL_FRAMES = SCENES.reduce((s, [sec]) => s + Math.round(sec * FPS), 0);

// порыв снега на склейках между обычными сценами (не у вспышки, хука, зума и финала)
const GUST = 14;
const starts = SCENES.map((_, i) => SCENES.slice(0, i).reduce((s, [sec]) => s + Math.round(sec * FPS), 0));
const GUST_AT = starts.slice(3, 12);

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
      {GUST_AT.map((f) => (
        <Sequence key={f} from={f - GUST / 2} durationInFrames={GUST} layout="none">
          <Gust dur={GUST} />
          <Sfx name="sfx/gust" vol={0.5} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
