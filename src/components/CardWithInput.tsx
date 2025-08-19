import * as Switch from "@radix-ui/react-switch";
import { useId } from "react";

import '../App.css';


type Props = {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
};



const CardWithInput = ({ label, checked, onChange, disabled = false }: Props) => {

  const id = useId()

  return (
    <div className="card-section">
      <label htmlFor={id} className={`Label ${disabled ? 'disabled' : ''}`}>{label}</label>
      <Switch.Root
        id={id}
        className="SwitchRoot"
        checked={checked}
        onCheckedChange={onChange}
        disabled={disabled}
      >
        <Switch.Thumb className="SwitchThumb" />
      </Switch.Root>
    </div>
  );
};

export default CardWithInput;
