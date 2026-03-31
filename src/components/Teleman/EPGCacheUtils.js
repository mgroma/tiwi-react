import {Modal, Box, Typography, Button, Link} from '@mui/material';
import {useQueryClient} from 'react-query';
import React, {useState} from "react";
import api from "../../service/api";
import QueryDetailsGrid from "./QueryDetailsGrid";

const debugQueries = (queryClient) => {
    const queryCache = queryClient.getQueryCache()
    const queries = queryCache.getAll()

    const now = Date.now()

    return queries.map(query => {
        const expiresAt = query.state.dataUpdatedAt + query.cacheTime
        const remainingTime = expiresAt - now

        return {
            queryKey: query.queryKey,
            status: query.state.status,
            isStale: query.isStale(),
            lastUpdated: new Date(query.state.dataUpdatedAt).toLocaleString(),
            expiresAt: new Date(expiresAt).toLocaleString(),
            remainingTimeInSeconds: Math.round(remainingTime / 1000),
            cacheTimeInMinutes: query.cacheTime / 60000
        }
    })
}
export const showReactQueryStats = (queryClient) => {
    //show output from debugQueries() in a modal popup
    const queries = debugQueries(queryClient)

};

const listStyle = {
    color: '#FFFFFF',
    borderLeft: '1px solid #FFFFFF',
    paddingLeft: '10px',
    paddingRight: '10px',
}

// add refresh component with some icon add onClick to invoke "/api/schedule/epg?jobType=5" call
export const RefreshEpg = (authState) => {
    const queryClient = useQueryClient()
    return (
        <>
            <Link
                sx={listStyle}
                onClick={() => {
                    api.scheduleEpg(authState)
                        .then((response) => {
                            console.log(response);
                        })
                        .catch((error) => {
                            console.error(error);
                        });
                }}>Schedule EPG</Link>
            |
            <Link
                sx={listStyle}
                onClick={async () => {
                    try {
                        // Invalidate all EPG-related queries (raw + derived) so UI shows fresh data
                        await Promise.all([
                            queryClient.invalidateQueries(['webTvData']),
                            queryClient.invalidateQueries(['epgData']),
                            queryClient.invalidateQueries(['epgCombinedData']),
                            queryClient.invalidateQueries(['epgFilteredChannels']),
                            queryClient.invalidateQueries(['epgSchedules'])
                        ]);
                        await Promise.all([
                            queryClient.refetchQueries(['webTvData']),
                            queryClient.refetchQueries(['epgData'])
                        ]);
                    } catch (e) {
                        console.error('Error refreshing EPG data:', e);
                    }
                }}> Refresh Client</Link>
            <QueryDebugModal />
        </>
    );
};


// Modal style
const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '80%',
    maxHeight: '80vh',
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
    overflow: 'auto'
};

export const QueryDebugModal = () => {
    const [open, setOpen] = useState(false);
    const queryClient = useQueryClient();
    const [queryDetails, setQueryDetails] = useState([]);

    const handleOpen = () => {
        const details = debugQueries();
        setQueryDetails(details);
        setOpen(true);
    };

    const handleClose = () => setOpen(false);

    const debugQueries = () => {
        const queryCache = queryClient.getQueryCache();
        const queries = queryCache.getAll();
        const now = Date.now();

        return queries.map(query => {
            const expiresAt = query.state.dataUpdatedAt + query.cacheTime;
            const remainingTime = expiresAt - now;

            return {
                queryKey: query.queryKey,
                status: query.state.status,
                isStale: query.isStale(),
                lastUpdated: new Date(query.state.dataUpdatedAt).toLocaleString(),
                expiresAt: new Date(expiresAt).toLocaleString(),
                remainingTimeInSeconds: Math.round(remainingTime / 1000),
                cacheTimeInMinutes: query.cacheTime / 60000
            };
        });
    };

    return (
        <>
            <Button onClick={handleOpen} variant="contained" color="primary">
                Debug Queries
            </Button>

            <Modal
                open={open}
                onClose={handleClose}
                aria-labelledby="query-debug-modal"
                aria-describedby="query-cache-information"
            >
                <Box sx={modalStyle}>
                    <Typography variant="h6" component="h2" gutterBottom>
                        Query Cache Status
                    </Typography>
                    <Box sx={{
                        backgroundColor: '#f5f5f5',
                        p: 2,
                        borderRadius: 1,
                        fontFamily: 'monospace',
                        whiteSpace: 'pre-wrap'
                    }}>
                        <QueryDetailsGrid queryDetails={queryDetails} />
                    </Box>
                    <Box sx={{mt: 2, display: 'flex', justifyContent: 'flex-end'}}>
                        <Button onClick={handleClose} variant="contained">
                            Close
                        </Button>
                    </Box>
                </Box>
            </Modal>
        </>
    );
};
