import { useState } from 'react';
import type { ReactNode } from 'react';
import '../App.css';

type SettingsGroupProps = {
    title: string;
    children: ReactNode;
    defaultOpen?: boolean;
};

const SettingsGroup = ({ title, children, defaultOpen = false }: SettingsGroupProps) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <div className="settings-group">
            <div
                className="settings-group-header"
                onClick={() => setIsOpen(prev => !prev)}
            >
                <h3>{title}</h3>
                <div className={`chevron ${isOpen ? 'open' : ''}`}>
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M6 9L1 4H11L6 9Z" fill="currentColor" />
                    </svg>
                </div>
            </div>
            {isOpen && (
                <div className="settings-group-content">
                    {children}
                </div>
            )}
        </div>
    );
};

export default SettingsGroup;
