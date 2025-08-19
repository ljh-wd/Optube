import * as Switch from "@radix-ui/react-switch";
import { useId, useState } from "react";
import type { ReactNode } from "react";
import { PlusIcon, MinusIcon } from '@heroicons/react/24/solid';

import '../App.css';

type Props = {
    label: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
    children?: ReactNode;
    disabled?: boolean;
};

const NestedToggle = ({ label, checked, onChange, children, disabled = false }: Props) => {
    const id = useId();
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div className="nested-toggle">
            <div className="card-section item-row">
                <div className="nested-toggle-header">
                    <label htmlFor={id} className={`Label toggle-label ${disabled ? 'disabled' : ''}`}>
                        {label}
                    </label>
                    {children && (
                        <button
                            className="expand-button"
                            onClick={() => setIsExpanded(!isExpanded)}
                            type="button"
                            aria-label={isExpanded ? "Collapse" : "Expand"}
                        >
                            {isExpanded ? (
                                <MinusIcon className="expand-icon" />
                            ) : (
                                <PlusIcon className="expand-icon" />
                            )}
                        </button>
                    )}
                </div>
                <Switch.Root
                    id={id}
                    className="SwitchRoot modern-switch"
                    checked={checked}
                    onCheckedChange={onChange}
                    disabled={disabled}
                >
                    <Switch.Thumb className="SwitchThumb" />
                </Switch.Root>
            </div>

            {children && (
                <div className={`nested-content ${isExpanded ? 'expanded' : 'collapsed'}`}>
                    {children}
                </div>
            )}
        </div>
    );
};

export default NestedToggle;
