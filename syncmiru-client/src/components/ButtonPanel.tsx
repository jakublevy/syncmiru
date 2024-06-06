import {ReactElement} from "react";
import Plus from "@components/svg/Plus.tsx";
import UploadCloud from "@components/svg/UploadCloud.tsx";
import DockBottom from "@components/svg/DockBottom.tsx";
import CollapseRight from "@components/svg/CollapseRight.tsx";
import ExpandLeft from "@components/svg/ExpandLeft.tsx";
import BubbleCrossed from "@components/svg/BubbleCrossed.tsx";
import Bubble from "@components/svg/Bubble.tsx";
import SubtitlesCrossed from "@components/svg/SubtitlesCrossed.tsx";
import Subtitles from "@components/svg/Subtitles.tsx";

export default function ButtonPanel(): ReactElement {
    return (
        <div className="flex items-center h-12 border-b gap-x-4">
            <Plus className="ml-2 w-8"/>
            <UploadCloud className="w-8"/>
            <DockBottom className="w-8"/>
            <CollapseRight className="w-8"/>
            <ExpandLeft className="w-8"/>
            <BubbleCrossed className="w-8"/>
            <Bubble className="w-8"/>
            <SubtitlesCrossed className="w-8"/>
            <Subtitles className="w-8"/>
        </div>
    )
}