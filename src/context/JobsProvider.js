import React, {createContext, useState, useContext} from 'react';
import api from "../service/api";
import {useOktaAuth} from "@okta/okta-react";

const JobsContext = createContext();

export function JobsProvider({children}) {
    const {authState} = useOktaAuth();
    const [jobs, setJobs] = useState(null);
    const [loadingStates, setLoadingStates] = useState({
        fetchingSchedules: false,
        removingJob: false,
        recordingChannel: false
    });

    const setLoading = (operation, isLoading) => {
        setLoadingStates(prev => ({
            ...prev,
            [operation]: isLoading
        }));
    };

    const fetchSchedules = async () => {
        try {
            setLoading('fetchingSchedules', true);
            const response = await api.fetchSchedules(authState);
            const data = response;
            setJobs(data);
            return data;
        } catch (error) {
            console.error('Error fetching schedules:', error);
            throw error;
        } finally {
            setLoading('fetchingSchedules', false);
        }
    };

    const removeJob = async (jobId) => {
        try {
            setLoading('removingJob', true);
            const response = await api.removeJob(authState, jobId);
            // filter out item from prevJobs array whose index = jobId
            setJobs(prevJobs => prevJobs.filter((job, index) => index !== jobId));
            return true;
        } catch (error) {
            console.error('Error removing job:', error);
            throw error;
        } finally {
            setLoading('removingJob', false);
        }
    };

    const recordWebChannel = async (channelName, channelTitle, recordingTime) => {
        try {
            setLoading('recordingChannel', true);
            const response = await api.recordWebChannel(authState, channelName, channelTitle, recordingTime)

            const newChannel = response;
            await fetchSchedules();
            return newChannel;
        } catch (error) {
            console.error('Error recording web channel:', error);
            throw error;
        } finally {
            setLoading('recordingChannel', false);
        }
    };

    const contextValue = {
        jobs,
        setJobs,
        fetchSchedules,
        removeJob,
        recordWebChannel,
        isLoading: {
            fetchingSchedules: loadingStates.fetchingSchedules,
            removingJob: loadingStates.removingJob,
            recordingChannel: loadingStates.recordingChannel
        },
        // Helper to check if any operation is loading
        isAnyLoading: Object.values(loadingStates).some(Boolean)
    };

    return (
        <JobsContext.Provider value={contextValue}>
            {children}
        </JobsContext.Provider>
    );
}

export function useJobs() {
    const context = useContext(JobsContext);
    if (context === undefined) {
        throw new Error('useJobs must be used within a JobsProvider');
    }
    return context;
}
