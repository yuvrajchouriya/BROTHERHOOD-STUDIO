import { useEffect } from "react";

/**
 * BackgroundPreloader
 * This component runs silently after the home page is loaded.
 * It preloads the most important routes during idle time.
 */
const BackgroundPreloader = () => {
    useEffect(() => {
        // Start preloading after 2 seconds of idle time
        const timer = setTimeout(() => {
            const routesToPreload = [
                () => import("../pages/Gallery"),
                () => import("../pages/ServicesPage"),
                () => import("../pages/Films"),
                () => import("../pages/AboutUs"),
                () => import("../pages/Plans"),
                () => import("../pages/BookUs"),
            ];

            // Preload routes one by one to not saturate the network
            routesToPreload.forEach((preloadFn, index) => {
                setTimeout(preloadFn, index * 1000);
            });
        }, 2000);

        return () => clearTimeout(timer);
    }, []);

    return null; // Silent component
};

export default BackgroundPreloader;
