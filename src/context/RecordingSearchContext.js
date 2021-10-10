import React from "react";

const RecordingSearchContext = React.createContext()

const RecordingSearchContextProvider = ({children}) => {
    const [searchCriteria, setSearchCriteria] = React.useState("No Recording");
    return (
        <RecordingSearchContext.Provider value={[searchCriteria, setSearchCriteria]} >
            {children}
        </RecordingSearchContext.Provider>
    )
}
const useRecordingSearch = () => {
    const [searchCriteria, setSearchCriteria] = React.useContext(RecordingSearchContext);

    const handleChange = (newValue) => {
        setSearchCriteria(newValue)
    };
    return {value: searchCriteria, handleChange}

};

export { RecordingSearchContextProvider, useRecordingSearch}
