import { Composition } from "remotion";
import { Main, TOTAL_FRAMES } from "./Main";
import { Survival, SURVIVAL_FRAMES } from "./survival/Survival";
import { ForestTest, FOREST_FRAMES } from "./forest/ForestTest";
import { TrainTest, TRAIN_TEST_FRAMES } from "./train/TrainTest";

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
  </>
);
