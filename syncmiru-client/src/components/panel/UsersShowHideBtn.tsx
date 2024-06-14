import {ReactElement} from "react";
import CollapseRight from "@components/svg/CollapseRight.tsx";
import {Clickable} from "@components/widgets/Button.tsx";
import {useMainContext} from "@hooks/useMainContext.ts";
import ExpandLeft from "@components/svg/ExpandLeft.tsx";
import {useChangeUsersShown} from "@hooks/useUsersShown.ts";

export default function UsersShowHideBtn(): ReactElement {
    const {usersShown, setUsersShown} = useMainContext()
    const changeUsersShown = useChangeUsersShown()

    function usersToggle() {
        changeUsersShown(!usersShown)
            .then(() => {
                setUsersShown(!usersShown)
            })
    }

    return (
        <Clickable className="p-2 mr-1" onClick={usersToggle}>
            {usersShown
                ? <CollapseRight className="h-7"/>
                : <ExpandLeft className="h-7"/>
            }
        </Clickable>
    )
}