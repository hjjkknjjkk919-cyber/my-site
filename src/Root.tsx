import { Composition, Still } from "remotion";
import { Main, TOTAL_FRAMES } from "./Main";
import { Survival, SURVIVAL_FRAMES } from "./survival/Survival";
import { ForestTest, FOREST_FRAMES } from "./forest/ForestTest";
import { TrainTest, TRAIN_TEST_FRAMES } from "./train/TrainTest";
import { GostTest, GOST_TEST_FRAMES } from "./train/Gost";
import { Ep1Test, EP1_TEST_FRAMES } from "./train/Ep1Test";
import { Ep1, EP1_FRAMES } from "./train/Ep1";
import { DontOpen1, DO1_FRAMES } from "./dontopen/DontOpen";
import { Pelmeni43, PEL_FRAMES } from "./pelmeni/Pelmeni43";
import { PUSH_FRAMES, Pushistik1 } from "./compositions/Pushistik/Pushistik1";
import { Avatar } from "./compositions/Avatar/Avatar";
import { CLINIC_FRAMES, ClinicAnime } from "./compositions/ClinicAnime/ClinicAnime";
import { SLEEP_FRAMES, Sleep } from "./compositions/Sleep/Sleep";
import { HYPER_SCENES, Scene00 as Hyper00 } from "./compositions/Hyper/scenes";
import { HyperThumb } from "./compositions/Hyper/Thumb";
import { ChannelBanner } from "./compositions/Banner/ChannelBanner";
import { SCENES as HYPER_TL } from "./compositions/Hyper/engine";
import { REMAKE_FRAMES, Remake90s } from "./compositions/Remake90s/Remake90s";
import { NUANS2_FRAMES, NuansEp2 } from "./compositions/NuansEp2/NuansEp2";
import { AVITO_DEFAULT_FRAMES, AvitoWardrobe, calcAvitoMetadata } from "./compositions/AvitoWardrobe/AvitoWardrobe";
import { Choice3D, Pov3D, Station3D } from "./train/Pov3D";

// Серия 1 «Улыбка»: длина = сумма сцен (~2:20)
export const Root = () => (
  <>
    <Composition id="Everest" component={Main} width={1080} height={1920} fps={30} durationInFrames={TOTAL_FRAMES} />
    {/* отдельный ролик «Один на 6000 метров» */}
    <Composition id="Survival" component={Survival} width={1080} height={1920} fps={30} durationInFrames={SURVIVAL_FRAMES} />
    {/* слои для своих «шейдеров»: картинка отдельно, надписи отдельно */}
    <Composition id="SurvivalWorld" component={Survival} defaultProps={{ layer: "world" as const }} width={1080} height={1920} fps={30} durationInFrames={SURVIVAL_FRAMES} />
    <Composition id="SurvivalUI" component={Survival} defaultProps={{ layer: "ui" as const }} width={1080} height={1920} fps={30} durationInFrames={SURVIVAL_FRAMES} />
    {/* пробные кадры «лес ночью» (2D-рисовка в 3D-пространстве) */}
    <Composition id="ForestTest" component={ForestTest} width={1080} height={1920} fps={30} durationInFrames={FOREST_FRAMES} />
    <Composition id="TrainTest" component={TrainTest} width={1080} height={1920} fps={30} durationInFrames={TRAIN_TEST_FRAMES} />
    <Composition id="GostTest" component={GostTest} width={1080} height={1920} fps={30} durationInFrames={GOST_TEST_FRAMES} />
    <Composition id="Ep1Test" component={Ep1Test} width={1080} height={1920} fps={30} durationInFrames={EP1_TEST_FRAMES} />
    <Composition id="Pov3DTest" component={Pov3D} width={1080} height={1920} fps={30} durationInFrames={870} defaultProps={{ post: true }} />
    <Composition id="Station3DTest" component={Station3D} width={1080} height={1920} fps={30} durationInFrames={240} />
    <Composition id="Choice3DTest" component={Choice3D} width={1080} height={1920} fps={30} durationInFrames={225} defaultProps={{ font: "sans-serif" }} />
    <Composition id="Avatar" component={Avatar} width={1080} height={1080} fps={30} durationInFrames={1} />
    <Composition id="ClinicAnime" component={ClinicAnime} width={1080} height={1920} fps={30} durationInFrames={CLINIC_FRAMES} />
    <Composition id="Pushistik1" component={Pushistik1} width={1080} height={1920} fps={30} durationInFrames={PUSH_FRAMES} />
    <Composition id="SleepParalysis" component={Sleep} width={1080} height={1920} fps={30} durationInFrames={SLEEP_FRAMES} />
    <Still id="ChannelBanner" component={ChannelBanner} width={2560} height={1440} />
    <Still id="HyperThumb" component={HyperThumb} width={1280} height={720} />
    <Composition id="Hyper00" component={Hyper00} width={1920} height={1080} fps={30} durationInFrames={HYPER_TL.find((s) => s.n === 0)?.frames ?? 30} />
    {HYPER_SCENES.map((C, i) => <Composition key={i} id={`Hyper${String(i + 1).padStart(2, "0")}`} component={C} width={1920} height={1080} fps={30} durationInFrames={HYPER_TL.find((s) => s.n === i + 1)!.frames} />)}
    <Composition id="Remake90s" component={Remake90s} width={1080} height={1920} fps={30} durationInFrames={REMAKE_FRAMES} />
    <Composition id="NuansEp2" component={NuansEp2} width={1080} height={1920} fps={30} durationInFrames={NUANS2_FRAMES} />
    <Composition id="AvitoWardrobe" component={AvitoWardrobe} width={1080} height={1920} fps={30} durationInFrames={AVITO_DEFAULT_FRAMES} defaultProps={{ durs: [] as number[] }} calculateMetadata={calcAvitoMetadata} />
    <Composition id="Pelmeni43" component={Pelmeni43} width={1080} height={1920} fps={30} durationInFrames={PEL_FRAMES} />
    <Composition id="DontOpen1" component={DontOpen1} width={1080} height={1920} fps={30} durationInFrames={DO1_FRAMES} />
    <Composition id="Ep1" component={Ep1} width={1080} height={1920} fps={30} durationInFrames={EP1_FRAMES} />
  </>
);
