import React from "react";

const RecordingSearchContext = React.createContext()

const RecordingSearchContextProvider = ({children}) => {
    const [searchCriteria, setSearchCriteria] = React.useState("No Recording");
    const [playerUrl, setPlayerUrl] = React.useState(null);
    const [anchorElement, setAnchorElement] = React.useState(null);
    return (
        <RecordingSearchContext.Provider value={[searchCriteria, setSearchCriteria, playerUrl, setPlayerUrl,
            anchorElement, setAnchorElement]} >
            {children}
        </RecordingSearchContext.Provider>
    )
}
const useRecordingSearch = () => {
    const [searchCriteria, setSearchCriteria, playerUrl, setPlayerUrl,
        anchorElement, setAnchorElement] = React.useContext(RecordingSearchContext);

    const handleChange = (newValue) => {
        setSearchCriteria(newValue)
    };
    const changePlayerUrl = (newUrl, event) => {
        setPlayerUrl(newUrl)
        if (event) {
        setAnchorElement(event.target)
        }
    }
    const closePlayer = () => setAnchorElement(null)

    return {value: searchCriteria, handleChange, playerUrl, changePlayerUrl, closePlayer, anchorElement}

};

export { RecordingSearchContextProvider, useRecordingSearch}
