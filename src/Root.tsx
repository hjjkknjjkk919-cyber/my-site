import { Composition } from "remotion";
import { Main, TOTAL_FRAMES } from "./Main";

// Серия 1 «Улыбка»: длина = сумма сцен (~2:20)
export const Root = () => <Composition id="Everest" component={Main} width={1080} height={1920} fps={30} durationInFrames={TOTAL_FRAMES} />;
