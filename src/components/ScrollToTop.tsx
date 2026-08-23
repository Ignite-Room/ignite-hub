import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// React Router doesn't reset scroll position on navigation, so a page opened while
// scrolled partway down another page (e.g. the chapter portal transition firing from
// the middle of the homepage) mounts still scrolled down instead of at the top.
export default function ScrollToTop() {
    const { pathname } = useLocation();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [pathname]);

    return null;
}
