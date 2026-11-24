import { INK, Svg } from "./fx";
import { DIMA, GENA, Hero, LERA, onGround, SHERPA, STAS } from "./Hero";
import { Foreground, Landscape } from "./landscape";

type Props = {
  t: number;
  cam: number;
  wind: number;
  /** рот Димы по голосу 0..1 */
  dimaTalk?: number;
  /** все смеются (сцена 6) */
  laugh?: boolean;
  stasSmile?: boolean;
  /** рот шерпы по голосу 0..1 */
  sherpaTalk?: number;
  /** куда смотрит шерпа */
  sherpaLook?: [number, number];
  /** качание головой «нет», градусы */
  no?: number;
};

/** Базовый лагерь: компания разного роста стоит прямо перед шерпой, который сидит у камня. */
export const Camp = ({ t, cam, wind, dimaTalk, laugh, stasSmile, sherpaTalk, sherpaLook = [0, 0], no = 0 }: Props) => {
  return (
    <>
      <Landscape t={t} cam={cam} wind={wind} fog={0.15} camp />
      <Svg>
        <g transform={`translate(${cam * 0.75} 0)`}>
          <Hero cfg={GENA} x={975} y={onGround(GENA, 1330, 0.27)} s={0.27} flip={-1} t={t + 1.9} emotion={laugh ? "laugh" : "calm"} look={[18, 2]} full wind={wind} lightLeft={false} blinks={[6.2]} />
          <Hero cfg={STAS} x={700} y={onGround(STAS, 1320, 0.24)} s={0.24} flip={-1} t={t + 0.7} emotion={stasSmile ? "laugh" : "calm"} lid={0.3} look={stasSmile ? [16, 4] : [22, -2]} full wind={wind} lightLeft={false} blinks={[3.1, 9.4]} />
          <Hero cfg={LERA} x={845} y={onGround(LERA, 1345, 0.23)} s={0.23} flip={-1} t={t + 1.1} emotion={laugh ? "laugh" : "skeptic"} look={[18, 0]} full wind={wind} lightLeft={false} blinks={[4.8]} />
          <Hero cfg={DIMA} x={540} y={onGround(DIMA, 1350, 0.25)} s={0.25} flip={-1} t={t} emotion={laugh ? "laugh" : dimaTalk ? "smile" : "calm"} mouth={dimaTalk} look={[18, 2]} full wind={wind} lightLeft={false} blinks={[7.6]} />
        </g>
        <g transform={`translate(${cam * 0.85} 0)`}>
          <Hero cfg={SHERPA} x={270} y={960} s={0.62} t={t} emotion="calm" mouth={sherpaTalk} look={sherpaLook} lid={0.3} headTurn={no} blinks={[2.2, 11.4]} frost={0.1} wind={wind} />
          <g filter="url(#rough)">
            <path d="M-60 1920 L-40 1420 L120 1330 L420 1350 L560 1480 L600 1920 Z" fill="#3a424a" stroke={INK} strokeWidth="10" />
            <path d="M-40 1420 L120 1330 L420 1350 L380 1400 L100 1390 Z" fill="#e3e9ed" />
            <path d="M420 1350 L560 1480 L600 1920 L470 1920 L460 1480 Z" fill="#000" opacity="0.3" />
          </g>
        </g>
      </Svg>
      <Foreground cam={cam * 1.2} />
    </>
  );
};
