import { useEffect } from "react";


const hashToTitle = (hash) => {
    const titleMap = {
        '#home': 'Home',
        '#about': 'About',
        '#contact': 'Contact'
    }
    return titleMap[hash] || hash;
}
const useTitleHeader = (defaultTitle = 'Tiwi') => {

    useEffect(() => {
        const setTitleHeader = () => {
            const currentHash = window.location.hash;
            const titleHeader = hashToTitle(currentHash);
            if (titleHeader) {
                document.title = titleHeader || defaultTitle;
            }
        }
        setTitleHeader();
        //listen for hash changes
        window.addEventListener('hashchange', setTitleHeader);
        return () => {
            window.removeEventListener('hashchange', setTitleHeader);
        }
    }, [])
}

export default useTitleHeader;