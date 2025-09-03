import { useState } from "react"

export const useLocalStorage = (key, initialValue) => {
     const [state, setState] = useState(() => {
        const persistedStateSerialized = localStorage.getItem(key);
        if (persistedStateSerialized) {
            const persistedState = JSON.parse(persistedStateSerialized);

           return persistedState;
        }

        return initialValue;
    });

    const setLocalStorageState = (value) => {
        // Support functional updates - used in ProfilePassword to partially update the state with hasPassword
        const valueToStore = typeof value === 'function' ? value(state) : value;
        setState(valueToStore);
        localStorage.setItem(key, JSON.stringify(valueToStore));
    };

    return [
        state,
        setLocalStorageState,
    ];
};