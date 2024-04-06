import {ReactElement} from "react";
import Question, {QuestionProps} from "@components/svg/Question.tsx";
import {Tooltip} from 'react-tooltip'

export default function Help({className, tooltipId, content}: Props): ReactElement {
    return (
        <div>
            <a data-tooltip-id={tooltipId} data-tooltip-html={content}>
                <Question className={className} tooltipId={tooltipId} tabIndex={-1} />
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