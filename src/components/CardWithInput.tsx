import * as Switch from "@radix-ui/react-switch";
import '../App.css'


type Props = {
    label: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
};



const CardWithInput = ({ label, checked, onChange }: Props) => {
    return (
        <div className="card-section">
            <span className="Label">{label}</span>
            <Switch.Root
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
