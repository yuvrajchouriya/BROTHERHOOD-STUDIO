import { useLayoutEffect } from "react";
import { useLocation } from "react-router-dom";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const ScrollToTop = () => {
    const { pathname } = useLocation();

    useLayoutEffect(() => {
        // 0. Kill all existing ScrollTriggers to prevent conflicts with previous page's animations
        ScrollTrigger.getAll().forEach(t => t.kill());

        // 1. Force immediate scroll reset before paint
        document.documentElement.scrollTo(0, 0);
        document.body.scrollTo(0, 0);
        window.scrollTo(0, 0);

        // 2. Refresh ScrollTrigger to ensure start/end positions are recalculated for the new page
        // Passing true forces a refresh immediately
        ScrollTrigger.refresh(true);

        // 3. Double check after a tiny delay for mobile browsers or heavy renders
        const timeoutId = setTimeout(() => {
            window.scrollTo(0, 0);
            ScrollTrigger.refresh();
        }, 50);

        return () => clearTimeout(timeoutId);
    }, [pathname]);

    return null;
};

export default ScrollToTop;
