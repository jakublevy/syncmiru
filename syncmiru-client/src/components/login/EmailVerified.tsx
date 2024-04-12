import {ReactElement, useEffect} from "react";
import Card from "@components/widgets/Card.tsx";
import Party from "@components/svg/Party.tsx";
import {useLocation} from "wouter";

export default function EmailVerified(): ReactElement {
    const [_, navigate] = useLocation()

    useEffect(() => {
        setTimeout(() => {
            navigate('/login-form/main')
        }, 3000)
    }, []);

    return (
        <div className="flex justify-centersafe items-center w-dvw">
            <Card className="w-[26rem] m-3">
                <div className="flex items-start">
                    <h1 className="text-4xl mb-4 mr-4">Účet byl aktivován</h1>
                    <Party className="w-12"/>
                </div>
                <p>Brzy budete přesměrováni na přihlašovací stránku.</p>
            </Card>
        </div>
    )
}