import * as Switch from "@radix-ui/react-switch";
import '../App.css'
import { useId } from "react";


type Props = {
    label: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
};



const CardWithInput = ({ label, checked, onChange }: Props) => {

    const id = useId()

    return (
        <div className="card-section">
            <label htmlFor={id} className="Label">{label}</label>
            <Switch.Root
                id={id}
                className="SwitchRoot"
                checked={checked}
                onCheckedChange={onChange}
            >
                <Switch.Thumb className="SwitchThumb" />
            </Switch.Root>
        </div>
    );
};

export default CardWithInput;
