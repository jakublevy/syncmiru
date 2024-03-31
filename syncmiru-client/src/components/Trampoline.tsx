import {ReactElement, useEffect} from "react";
import {useLocation, useNavigate} from "react-router-dom";

export default function Trampoline(): ReactElement {
    const navigate = useNavigate()
    const location = useLocation()

    useEffect(() => {
        let sendState = Object.assign({}, location.state)
        delete sendState['to']
        navigate(location.state.to, {state: sendState})
    }, [navigate]);

    return <></>
}