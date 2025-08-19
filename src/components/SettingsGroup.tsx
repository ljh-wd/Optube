import { useState } from 'react';
import type { ReactNode } from 'react';
import { PlusIcon, MinusIcon } from '@heroicons/react/24/solid';
import '../App.css';

type SettingsGroupProps = {
    title: string;
    children: ReactNode;
    defaultOpen?: boolean;
};

const SettingsGroup = ({ title, children, defaultOpen = false }: SettingsGroupProps) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <section className="settings-group" aria-label={title}>
            <header
                className="settings-group-header" role="button" tabIndex={0}
                onClick={() => setIsOpen(prev => !prev)}
                aria-expanded={isOpen}
            >
                <h3 className="group-title">{title}</h3>
                <div className={`chevron ${isOpen ? 'open' : ''}`}>
                    {isOpen ? (
                        <MinusIcon className="expand-icon" />
                    ) : (
                        <PlusIcon className="expand-icon" />
                    )}
                </div>
            </header>
            <div className="settings-group-inner" data-open={isOpen}>
                {isOpen && (
                    <div className="settings-group-content">
                        {children}
                    </div>
                )}
            </div>
        </section>
    );
};

export default SettingsGroup;
