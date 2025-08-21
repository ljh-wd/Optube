import { useContext } from "react";
import { GlobalContext } from "../context/globalContext"; // adjust path if needed

export function useGlobalContext() {
    const context = useContext(GlobalContext);
    if (context === undefined) {
        throw new Error('useGlobalContext must be used within a GlobalProvider');
    }
    return context;
}