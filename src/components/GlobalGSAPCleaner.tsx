import { useLayoutEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * GlobalGSAPCleaner
 *
 * The black screen problem happens because:
 * 1. Old page has active GSAP ScrollTriggers (especially scrubbed ones) that hold
 *    elements at partially-transformed states (e.g. yPercent: 60, opacity: 0).
 * 2. When you navigate, React FIRST renders the new page, THEN unmounts the old one.
 * 3. This means the new page's <main> is briefly "behind" or affected by the old
 *    page's zombie transforms.
 *
 * Solution: On every route change, BEFORE the new paint, kill ALL ScrollTriggers
 * and reset all transforms. Then, AFTER the page settles, refresh ScrollTrigger
 * so the new page's triggers calculate correctly.
 */
const GlobalGSAPCleaner = () => {
    const { pathname } = useLocation();
    const isFirstRender = useRef(true);

    useLayoutEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }

        // 1. Kill ALL existing ScrollTriggers immediately - this prevents zombie triggers
        //    from the old page from interfering with the new page's layout
        ScrollTrigger.getAll().forEach((trigger) => trigger.kill(true));
        ScrollTrigger.clearScrollMemory();

        // 2. Kill all lingering GSAP tweens on all elements
        gsap.globalTimeline.clear();

        // 3. Reset scroll position before paint
        window.scrollTo(0, 0);

        // 4. After a brief delay, allow new page components to mount their triggers,
        //    then refresh to recalculate positions
        const t = setTimeout(() => {
            window.scrollTo(0, 0);
            ScrollTrigger.refresh(true);
        }, 200);

        return () => clearTimeout(t);
    }, [pathname]);

    return null;
};

export default GlobalGSAPCleaner;
