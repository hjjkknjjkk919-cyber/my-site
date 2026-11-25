import { Composition } from "remotion";
import { Main, TOTAL_FRAMES } from "./Main";
import { Survival, SURVIVAL_FRAMES } from "./survival/Survival";
import { ForestTest, FOREST_FRAMES } from "./forest/ForestTest";
import { TrainTest, TRAIN_TEST_FRAMES } from "./train/TrainTest";
import { GostTest, GOST_TEST_FRAMES } from "./train/Gost";
import { Ep1Test, EP1_TEST_FRAMES } from "./train/Ep1Test";
import { Ep1, EP1_FRAMES } from "./train/Ep1";
import { DontOpen1, DO1_FRAMES } from "./dontopen/DontOpen";
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
    <Composition id="DontOpen1" component={DontOpen1} width={1080} height={1920} fps={30} durationInFrames={DO1_FRAMES} />
    <Composition id="Ep1" component={Ep1} width={1080} height={1920} fps={30} durationInFrames={EP1_FRAMES} />
  </>
);
