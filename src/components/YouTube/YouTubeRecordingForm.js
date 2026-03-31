import React, { useState } from 'react';
import {
    Button,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Grid,
    Typography,
    Box,
    Collapse,
    IconButton
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { YouTube, Schedule, PlayArrow, ExpandMore, ExpandLess } from '@material-ui/icons';
import moment from 'moment';
import Card from '../Card/Card';
import CardHeader from '../Card/CardHeader';
import CardBody from '../Card/CardBody';
import CardFooter from '../Card/CardFooter';
import CircularProgress from '@material-ui/core/CircularProgress';

const useStyles = makeStyles((theme) => ({
    card: {
        marginBottom: theme.spacing(1),
        border: '1px solid #ddd', // Add border to make it visible
        backgroundColor: '#fff', // Ensure background is white
    },
    formControl: {
        minWidth: 120,
        width: '100%',
    },
    button: {
        margin: theme.spacing(0.5),
    },
    alert: {
        marginTop: theme.spacing(1),
        padding: theme.spacing(1),
        borderRadius: theme.shape.borderRadius,
        '&.success': {
            backgroundColor: '#d4edda',
            color: '#155724',
            border: '1px solid #c3e6cb',
        },
        '&.error': {
            backgroundColor: '#f8d7da',
            color: '#721c24',
            border: '1px solid #f5c6cb',
        },
    },
    loadingContainer: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: theme.spacing(1),
    },
    headerContent: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
    },
    headerLeft: {
        display: 'flex',
        alignItems: 'center',
    },
    expandButton: {
        marginLeft: 'auto',
    },
    testDiv: {
        padding: theme.spacing(1),
        backgroundColor: '#f0f0f0',
        border: '1px solid #ccc',
        marginBottom: theme.spacing(1),
    },
}));

const QUALITY_OPTIONS = [
    { value: 'low', label: 'Low (360p)', description: 'Fast, small files' },
    { value: 'medium', label: 'Medium (720p)', description: 'Good balance' },
    { value: 'high', label: 'High (1080p)', description: 'Best quality' },
    { value: 'ultra', label: 'Ultra (1080p VP9)', description: 'Maximum quality' },
];

const DURATION_OPTIONS = [
    { value: '00:05:00', label: '5 minutes' },
    { value: '00:15:00', label: '15 minutes' },
    { value: '00:30:00', label: '30 minutes' },
    { value: '01:00:00', label: '1 hour' },
    { value: '02:00:00', label: '2 hours' },
    { value: '04:00:00', label: '4 hours' },
];

export default function YouTubeRecordingForm() {
    const classes = useStyles();
    const [expanded, setExpanded] = useState(true); // Changed to true to be expanded by default
    const [formData, setFormData] = useState({
        videoId: '',
        quality: 'medium',
        duration: '00:30:00',
        channelTitle: '',
        startTime: moment().add(1, 'minute').format('YYYY-MM-DDTHH:mm'),
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const handleExpandClick = () => {
        setExpanded(!expanded);
    };

    const handleInputChange = (field) => (event) => {
        setFormData({
            ...formData,
            [field]: event.target.value,
        });
    };

    const extractVideoId = (url) => {
        if (!url) return '';
        
        // Handle different YouTube URL formats
        const patterns = [
            /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
            /youtube\.com\/watch\?.*v=([^&\n?#]+)/,
        ];
        
        for (const pattern of patterns) {
            const match = url.match(pattern);
            if (match) return match[1];
        }
        
        // If no pattern matches, assume it's already a video ID
        return url.trim();
    };

    const handleVideoIdChange = (event) => {
        const input = event.target.value;
        const videoId = extractVideoId(input);
        setFormData({
            ...formData,
            videoId: videoId,
        });
    };

    const validateForm = () => {
        if (!formData.videoId) {
            setMessage({ type: 'error', text: 'Please enter a YouTube video ID or URL' });
            return false;
        }
        if (!formData.channelTitle) {
            setMessage({ type: 'error', text: 'Please enter a title for the recording' });
            return false;
        }
        return true;
    };

    const scheduleRecording = async () => {
        if (!validateForm()) return;

        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            const response = await fetch(`https://localhost:3001/api/schedule/${formData.videoId}?jobType=6&channelTitle=${encodeURIComponent(formData.channelTitle)}&quality=${formData.quality}&startTime=${encodeURIComponent(formData.startTime)}&endTime=${encodeURIComponent(moment(formData.startTime).add(moment.duration(formData.duration)).toISOString())}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                const result = await response.json();
                setMessage({ 
                    type: 'success', 
                    text: `YouTube recording scheduled successfully! Video: ${formData.channelTitle}, Quality: ${formData.quality}, Duration: ${formData.duration}` 
                });
                
                // Reset form
                setFormData({
                    videoId: '',
                    quality: 'medium',
                    duration: '00:30:00',
                    channelTitle: '',
                    startTime: moment().add(1, 'minute').format('YYYY-MM-DDTHH:mm'),
                });
            } else {
                const errorData = await response.json();
                setMessage({ type: 'error', text: `Failed to schedule recording: ${errorData.message || 'Unknown error'}` });
            }
        } catch (error) {
            setMessage({ type: 'error', text: `Error scheduling recording: ${error.message}` });
        } finally {
            setLoading(false);
        }
    };

    const testVideoAccess = async () => {
        if (!formData.videoId) {
            setMessage({ type: 'error', text: 'Please enter a YouTube video ID or URL first' });
            return;
        }

        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            const response = await fetch(`https://localhost:3001/api/test-youtube/${formData.videoId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                const result = await response.json();
                if (result.accessible) {
                    setMessage({ 
                        type: 'success', 
                        text: `Video accessible! Title: ${result.title}, Available formats: ${result.formats}` 
                    });
                    // Auto-fill the title if not already set
                    if (!formData.channelTitle && result.title) {
                        setFormData({
                            ...formData,
                            channelTitle: result.title,
                        });
                    }
                } else {
                    setMessage({ type: 'error', text: `Video not accessible: ${result.error}` });
                }
            } else {
                setMessage({ type: 'error', text: 'Failed to test video access' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: `Error testing video: ${error.message}` });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <div className={classes.testDiv}>
                <Typography variant="body2">YouTube Recording Form - Component is rendering</Typography>
            </div>
            <Card className={classes.card}>
                <CardHeader
                    avatar={<YouTube />}
                    title={
                        <div className={classes.headerContent}>
                            <div className={classes.headerLeft}>
                                <Typography variant="h6">YouTube Recording</Typography>
                            </div>
                            <IconButton
                                className={classes.expandButton}
                                onClick={handleExpandClick}
                                aria-expanded={expanded}
                                aria-label="show more"
                            >
                                {expanded ? <ExpandLess /> : <ExpandMore />}
                            </IconButton>
                        </div>
                    }
                    subheader="Schedule YouTube video recordings with quality control"
                />
                <Collapse in={expanded} timeout="auto" unmountOnExit>
                    <CardBody>
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="YouTube Video ID or URL"
                                    value={formData.videoId}
                                    onChange={handleVideoIdChange}
                                    placeholder="e.g., JknHfcRahkc or https://www.youtube.com/watch?v=JknHfcRahkc"
                                    helperText="Enter YouTube video ID or full URL"
                                    variant="outlined"
                                    size="small"
                                />
                            </Grid>
                            
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Recording Title"
                                    value={formData.channelTitle}
                                    onChange={handleInputChange('channelTitle')}
                                    placeholder="Enter a descriptive title for the recording"
                                    variant="outlined"
                                    size="small"
                                />
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <FormControl className={classes.formControl} variant="outlined" size="small">
                                    <InputLabel>Quality</InputLabel>
                                    <Select
                                        value={formData.quality}
                                        onChange={handleInputChange('quality')}
                                        label="Quality"
                                    >
                                        {QUALITY_OPTIONS.map((option) => (
                                            <MenuItem key={option.value} value={option.value}>
                                                <div>
                                                    <Typography variant="body2">{option.label}</Typography>
                                                    <Typography variant="caption" color="textSecondary">
                                                        {option.description}
                                                    </Typography>
                                                </div>
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <FormControl className={classes.formControl} variant="outlined" size="small">
                                    <InputLabel>Duration</InputLabel>
                                    <Select
                                        value={formData.duration}
                                        onChange={handleInputChange('duration')}
                                        label="Duration"
                                    >
                                        {DURATION_OPTIONS.map((option) => (
                                            <MenuItem key={option.value} value={option.value}>
                                                {option.label}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>

                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Start Time"
                                    type="datetime-local"
                                    value={formData.startTime}
                                    onChange={handleInputChange('startTime')}
                                    InputLabelProps={{
                                        shrink: true,
                                    }}
                                    variant="outlined"
                                    size="small"
                                />
                            </Grid>
                        </Grid>

                        {message.text && (
                            <div className={`${classes.alert} ${message.type === 'success' ? 'success' : 'error'}`}>
                                {message.text}
                            </div>
                        )}

                        {loading && (
                            <Box className={classes.loadingContainer}>
                                <CircularProgress size={20} />
                                <Typography variant="body2" style={{ marginLeft: 8 }}>
                                    Processing...
                                </Typography>
                            </Box>
                        )}
                    </CardBody>
                    
                    <CardFooter>
                        <Button
                            variant="outlined"
                            color="primary"
                            startIcon={<PlayArrow />}
                            onClick={testVideoAccess}
                            disabled={loading || !formData.videoId}
                            className={classes.button}
                            size="small"
                        >
                            Test Video
                        </Button>
                        <Button
                            variant="contained"
                            color="primary"
                            startIcon={<Schedule />}
                            onClick={scheduleRecording}
                            disabled={loading || !formData.videoId || !formData.channelTitle}
                            className={classes.button}
                            size="small"
                        >
                            Schedule Recording
                        </Button>
                    </CardFooter>
                </Collapse>
            </Card>
        </div>
    );
} 