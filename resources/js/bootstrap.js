import axios from "axios";
window.axios = axios;

window.axios.defaults.headers.common["X-Requested-With"] = "XMLHttpRequest";

import Echo from "laravel-echo";

import Pusher from "pusher-js";
window.Pusher = Pusher;

window.Echo = new Echo({
    broadcaster: "reverb",
    key: import.meta.env.VITE_REVERB_APP_KEY,
    wsHost: import.meta.env.VITE_REVERB_HOST,
    wsPort: import.meta.env.VITE_REVERB_PORT ?? 80,
    wssPort: import.meta.env.VITE_REVERB_PORT ?? 443,
    forceTLS: (import.meta.env.VITE_REVERB_SCHEME ?? "https") === "https",
    enabledTransports: ["ws", "wss"],
});

// Add connection state logging
window.Echo.connector.pusher.connection.bind('connected', () => {
    console.log('✅ WebSocket connected successfully');
});

window.Echo.connector.pusher.connection.bind('disconnected', () => {
    console.log('⚠️ WebSocket disconnected');
});

window.Echo.connector.pusher.connection.bind('error', (err) => {
    console.error('❌ WebSocket connection error:', err);
});

window.Echo.connector.pusher.connection.bind('state_change', (states) => {
    console.log('WebSocket state:', states.current);
});
