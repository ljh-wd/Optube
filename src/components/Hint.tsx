import { InformationCircleIcon } from "@heroicons/react/24/solid";

export default function Hint() {
    return (
        <div className='hint-container'>
            <InformationCircleIcon className='hint-icon' />
            <p className="hint">Enable filters to customize your view</p>
        </div>
    )
}