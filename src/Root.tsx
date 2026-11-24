import { Composition } from "remotion";
import { Main } from "./Main";

// Серия 1 «Улыбка»: ровно 2:00
export const Root = () => <Composition id="Everest" component={Main} width={1080} height={1920} fps={30} durationInFrames={3600} />;
