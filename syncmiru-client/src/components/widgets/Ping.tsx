import {ReactElement} from "react";
import {Tooltip} from "react-tooltip";
import Signal3 from "@components/svg/Signal3.tsx";
import Signal2 from "@components/svg/Signal2.tsx";
import Signal1 from "@components/svg/Signal1.tsx";

export default function Ping({id, ping, className}: Props): ReactElement {
    const tooltipBgColor = ping <= 50 ? '#1c7f21' : ping <= 100 ? '#f97316' : '#dc3545'
    return (
        <div>
            <a data-tooltip-id={id} data-tooltip-content={`${ping.toFixed(0)} ms`}>
                {ping <= 50
                    ? <Signal3 className={className} tooltipId={id} tabIndex={-1} />
                    : <> {ping <= 100
                         ? <Signal2 className={className} tooltipId={id} tabIndex={-1} />
                         : <Signal1 className={className} tooltipId={id} tabIndex={-1} />}
                      </>
                }
            </a>
            <Tooltip
                id={id}
                place="top"
                openEvents={{mousedown: true, mouseenter: true}}
                opacity={1}
                style={{color: "#eeeeee", backgroundColor: tooltipBgColor}} />
        </div>
    )
}

interface Props {
    id: string
    ping: number
    className?: string
}