import { InformationCircleIcon } from "@heroicons/react/24/solid";
import type {PropsWithChildren} from "react";

export default function Hint({children}: PropsWithChildren) {
    return (
        <div className='hint-container'>
            <InformationCircleIcon className='hint-icon' />
            <p className="hint">{children}</p>
        </div>
    )
}