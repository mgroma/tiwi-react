import React, { useEffect, useState } from 'react';
import { Chip, LinearProgress, Box, Typography, Fade } from '@mui/material';
import { useQueryClient } from 'react-query';
import api from '../../service/api.js';

interface JobStatus {
    name: string;
    type: string;
    status: 'started' | 'completed' | 'error' | 'cancelled' | 'removed' | 'executing' | 'scheduled';
    progress: number;
    error?: string;
    timestamp: string;
    channel?: string;
    program?: string;
}

export const JobStatus: React.FC = () => {
    const [jobStatus, setJobStatus] = useState<JobStatus | null>(null);
    const [show, setShow] = useState(false);
    const queryClient = useQueryClient();

    useEffect(() => {
        console.log('JobStatus: Setting up SSE subscription');
        
        const unsubscribe = api.connectToJobUpdates((data) => {
            console.log('JobStatus: Received event:', data);
            if (data.type === 'JOB_UPDATED' && data.jobDetails) {
                console.log('JobStatus: Processing job update:', data.jobDetails);
                setJobStatus(data.jobDetails);
                setShow(true);
                
                // If the job is completed, cancelled, or failed, invalidate relevant queries
                if (['completed', 'cancelled', 'error', 'removed'].includes(data.jobDetails.status)) {
                    console.log('JobStatus: Invalidating queries for status:', data.jobDetails.status);
                    if (data.jobDetails.type === 'SEED_EPG') {
                        // Invalidate raw EPG and all derived caches so UI shows fresh data
                        queryClient.invalidateQueries(['epgData']);
                        queryClient.invalidateQueries(['epgCombinedData']);
                        queryClient.invalidateQueries(['epgFilteredChannels']);
                    } else if (data.jobDetails.type === 'RECORD') {
                        queryClient.invalidateQueries(['epgSchedules']);
                    }
                    
                    // Hide the status after 5 seconds
                    setTimeout(() => {
                        console.log('JobStatus: Hiding status after timeout');
                        setShow(false);
                    }, 5000);
                }
            }
        });

        return () => {
            console.log('JobStatus: Cleaning up SSE subscription');
            unsubscribe();
        };
    }, [queryClient]);

    if (!jobStatus || !show) {
        console.log('JobStatus: Not rendering - status:', jobStatus, 'show:', show);
        return null;
    }

    console.log('JobStatus: Rendering with status:', jobStatus);

    const getStatusColor = () => {
        switch (jobStatus.status) {
            case 'started':
            case 'executing':
            case 'scheduled':
                return 'info';
            case 'completed':
                return 'success';
            case 'error':
                return 'error';
            case 'cancelled':
                return 'warning';
            case 'removed':
                return 'default';
            default:
                return 'default';
        }
    };

    const getStatusLabel = () => {
        const jobType = jobStatus.type === 'SEED_EPG' ? 'EPG' : 'Recording';
        const status = jobStatus.status.charAt(0).toUpperCase() + jobStatus.status.slice(1);
        
        let label = `${jobType} ${status}`;
        if (jobStatus.name) {
            label += ` - ${jobStatus.name}`;
        }
        if (jobStatus.channel) {
            label += ` (${jobStatus.channel})`;
        }
        if (jobStatus.program) {
            label += `: ${jobStatus.program}`;
        }
        return label;
    };

    return (
        <Fade in={show}>
            <Box sx={{ 
                position: 'fixed', 
                top: 16, 
                right: 16, 
                zIndex: 1000, 
                maxWidth: 300,
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                borderRadius: 1,
                p: 1,
                boxShadow: 3
            }}>
                <Chip
                    label={getStatusLabel()}
                    color={getStatusColor()}
                    sx={{ mb: 1 }}
                />
                {(jobStatus.status === 'started' || jobStatus.status === 'executing') && (
                    <LinearProgress 
                        variant="determinate" 
                        value={jobStatus.progress} 
                        sx={{ height: 4, borderRadius: 2 }}
                    />
                )}
                {jobStatus.error && jobStatus.error !== 'no errors' && (
                    <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
                        {jobStatus.error}
                    </Typography>
                )}
            </Box>
        </Fade>
    );
}; 