import {useTranslation} from "react-i18next";
import {useMainContext} from "@hooks/useMainContext.ts";
import {ReactElement, useEffect} from "react";
import {SocketIoAck, SocketIoAckType} from "@models/socketio.ts";
import {RegTkn} from "@models/srv.ts";
import {showPersistentErrorAlert} from "src/utils/alert.ts";

export default function RegTknInactiveList(p: Props): ReactElement {
    const {t} = useTranslation()
    const {socket} = useMainContext()

    useEffect(() => {
        if (socket !== undefined) {
            socket.on("inactive_reg_tkns", onInactiveRegTkns)

            socket.emitWithAck("inactive_reg_tkns")
                .then((ack: SocketIoAck<RegTkn>) => {
                    if(ack.status === SocketIoAckType.Err)
                        showPersistentErrorAlert(t('modal-inactive-reg-tkn-fetch-error'))

                    // TODO: set the value somewhere
                    console.log(JSON.stringify(ack.payload))
                })
                .catch(() => {
                    showPersistentErrorAlert(t('modal-inactive-reg-tkn-fetch-error'))
                })
                .finally(() => {
                    p.setLoading(false)
                })
        }
    }, [socket]);

    function onInactiveRegTkns(regTkns: Array<RegTkn>) {
        // TODO: implement
    }

    return (
        <div>ahoj inactive</div>
    )
}

interface Props {
    setLoading: (b: boolean) => void
}