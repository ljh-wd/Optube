import * as Switch from "@radix-ui/react-switch";
import { useEffect, useId, useState } from "react";
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
    const [indeterminate, setIndeterminate] = useState(false);

    // Detect partial (half) state: if any child toggle is active but parent not fully toggled
    useEffect(() => {
        if (!children) {
            setIndeterminate(false);
            return;
        }
        // We rely on Radix structure: children may include CardWithInput components which render SwitchRoot elements
        // We'll query after render for sibling switch states
        const container = document.getElementById(id)?.closest('.nested-toggle');
        if (!container) {
            setIndeterminate(false);
            return;
        }
        const childSwitches = container.querySelectorAll('.nested-content .SwitchRoot.modern-switch');
        let anyOn = false;
        let allOn = true;
        childSwitches.forEach(sw => {
            const state = (sw as HTMLElement).getAttribute('data-state');
            if (state === 'checked') anyOn = true; else allOn = false;
        });
        if (!checked && anyOn) {
            setIndeterminate(true);
        } else if (checked && !allOn) {
            // Parent is on but some children forced off (edge case)
            setIndeterminate(true);
        } else {
            setIndeterminate(false);
        }
    }, [children, checked, id]);

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
                            type="button"
                            onClick={() => setIsExpanded((prev) => !prev)}
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
                    // apply visual indeterminate hint
                    data-state={indeterminate ? 'indeterminate' : (checked ? 'checked' : 'unchecked')}
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
