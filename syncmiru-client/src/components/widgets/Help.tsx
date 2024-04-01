import {ReactElement} from "react";
import Question, {QuestionProps} from "@components/svg/Question.tsx";
import {Tooltip} from 'react-tooltip'

export default function Help({width, height, tooltipId, content}: Props): ReactElement {
    return (
        <div>
            <a data-tooltip-id={tooltipId} data-tooltip-html={content}>
                <Question width={width} height={height} tooltipId={tooltipId} />
            </a>
            <Tooltip
                id={tooltipId}
                place="top"
                openEvents={{mousedown: true, mouseenter: true}}
                style={{color: "#eeeeee", backgroundColor: "#4338ca"}} />
        </div>
    )
}

interface Props extends QuestionProps {
    tooltipId: string
    content: string
}