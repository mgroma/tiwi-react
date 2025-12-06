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
        // Store previous state for rollback
        let previousJobs = null;
        
        try {
            setLoading('removingJob', true);
            
            // Optimistically remove job from local state
            previousJobs = jobs;
            setJobs(prevJobs => {
                if (!prevJobs) return prevJobs;
                return prevJobs.filter((job, index) => index !== jobId);
            });
            
            // Attempt to remove job on server
            console.log(`[removeJob] Attempting to remove job at index ${jobId}`);
            const response = await api.removeJob(authState, jobId);
            console.log(`[removeJob] API response:`, response);
            
            // Check if response indicates success (backend returns {status: 0} on success)
            if (response && response.status !== undefined && response.status !== 0) {
                console.warn(`[removeJob] API returned non-zero status: ${response.status} for jobId ${jobId}`);
            }
            
            // Refetch schedules to ensure UI is in sync with server state
            console.log(`[removeJob] Refetching schedules after removal`);
            try {
                await fetchSchedules();
                console.log(`[removeJob] Successfully refetched schedules`);
            } catch (fetchError) {
                console.error(`[removeJob] Failed to refetch schedules after removal:`, fetchError);
                // Don't throw here - the job removal might have succeeded even if refetch failed
                // The rollback will happen if the removeJob API call itself failed
            }
            
            return true;
        } catch (error) {
            console.error(`[removeJob] Error removing job ${jobId}:`, error);
            // Rollback optimistic update on error
            if (previousJobs !== null) {
                console.log(`[removeJob] Rolling back optimistic update for job ${jobId}`);
                setJobs(previousJobs);
            }
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
