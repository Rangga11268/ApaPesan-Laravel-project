import React from "react";

export const EventBusContext = React.createContext();

export const EventBusProvider = ({ children }) => {
    const eventsRef = React.useRef({});

    const emit = (name, data) => {
        if (eventsRef.current[name]) {
            // Create a copy of the callbacks array to avoid issues during iteration
            const callbacks = [...eventsRef.current[name]];
            for (let cb of callbacks) {
                cb(data);
            }
        }
    };

    const on = (name, cb) => {
        if (!eventsRef.current[name]) {
            eventsRef.current[name] = [];
        }
        eventsRef.current[name].push(cb);

        return () => {
            if (eventsRef.current[name]) {
                eventsRef.current[name] = eventsRef.current[name].filter((callback) => callback !== cb);
                // Clean up empty arrays
                if (eventsRef.current[name].length === 0) {
                    delete eventsRef.current[name];
                }
            }
        };
    };
    
    return (
        <EventBusContext.Provider value={{ emit, on }}>
            {children}
        </EventBusContext.Provider>
    );
};

export const useEventBus = () => {
    return React.useContext(EventBusContext);
};
