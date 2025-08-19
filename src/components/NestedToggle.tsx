import * as Switch from "@radix-ui/react-switch";
import { useId, useState } from "react";
import type { ReactNode } from "react";

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
            <div className="card-section">
                <div className="nested-toggle-header">
                    <label htmlFor={id} className={`Label ${disabled ? 'disabled' : ''}`}>
                        {label}
                    </label>
                    {children && (
                        <button
                            className="expand-button"
                            onClick={() => setIsExpanded(!isExpanded)}
                            type="button"
                            aria-label={isExpanded ? "Collapse" : "Expand"}
                        >
                            <svg
                                width="12"
                                height="12"
                                viewBox="0 0 12 12"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                                className={`expand-icon ${isExpanded ? 'expanded' : ''}`}
                            >
                                <path d="M6 3V9M3 6H9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                            </svg>
                        </button>
                    )}
                </div>
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

            {children && isExpanded && (
                <div className="nested-content visible">
                    {children}
                </div>
            )}
        </div>
    );
};

export default NestedToggle;
