import { useLayoutEffect } from "react";
import { useLocation } from "react-router-dom";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const ScrollToTop = () => {
    const { pathname } = useLocation();

    useLayoutEffect(() => {
        // 1. Force immediate scroll reset before paint
        document.documentElement.scrollTo(0, 0);
        document.body.scrollTo(0, 0);
        window.scrollTo(0, 0);

        // 2. Refresh ScrollTrigger to ensure start/end positions are recalculated for the new page
        // We delay slightly to allow the new page architecture to settle
        const timeoutId = setTimeout(() => {
            window.scrollTo(0, 0);
            ScrollTrigger.refresh();
        }, 100);

        return () => clearTimeout(timeoutId);
    }, [pathname]);

    return null;
};

export default ScrollToTop;
