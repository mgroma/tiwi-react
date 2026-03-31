// const HOSTNAME = window.location.protocol + '//'+ window.location.hostname + ':3001';
const HOSTNAME = process.env.API_HOSTNAME || (window.location.protocol + '//' + window.location.hostname + ':3001');


const _baseFetch = async (authState, apiPath, operationName, method = 'GET') => {
    const {accessToken} = authState;
    const apiUrl = `${HOSTNAME}/${apiPath}`
    const response = await fetch(apiUrl, {
        method: method,
        headers: {
            Authorization: `Bearer ${accessToken}`,
        }
    })
    if (!response.ok) {
        throw Error(`error executing ${operationName}: error=[${response.statusText}]`);
    }
    return await response.json();
}
const _baseFetchThirdParty = async (apiUrl, operationName, method = 'GET') => {
    const response = await fetch(`${HOSTNAME}/${apiUrl}`, {
        method: method
    })
    if (!response.ok) {
        throw Error(`error executing ${operationName}: error=[${response.error()}]`);
    }
    return response.json();
}
const scheduleEpg = async (authState) => _baseFetch(authState, 'api/schedule/epg?jobType=5', 'schedule EPG');
const fetchTvGuide = async () => _baseFetchThirdParty( 'api/tvguide', 'fetch tv guide');
// const fetchWebChannels = async (authState) => _baseFetch(authState, 'api/channels', 'fetch web channels')
const fetchWebChannels = async (authState) => {
    const channelList = await _baseFetch(authState, 'api/channels', 'fetch web channels')
        return channelList;
        // return channelList.filter(item => item.channel_name != 'canalplusssport');
}
const fetchSchedules = async (authState) => _baseFetch(authState, 'api/schedules', 'fetch schedules');
const fetchRecordings = async (authState) => _baseFetch(authState, 'api/recordings', 'fetch recordings');
const cancelJob = async (authState, jobIndex) => _baseFetch(authState, `api/cancel/${jobIndex}`, 'cancel job');
const removeJob = async (authState, jobIndex) => _baseFetch(authState, `api/removeJob/${jobIndex}`, 'remove job');
const recordWebChannel = async (authState, channelName, channelTitle, recordingTime, programKey) => {
    if (recordingTime)
        return _baseFetch(authState, `api/schedule/${channelName}?channelTitle=${channelTitle}&startTime=${recordingTime.startTime}&endTime=${recordingTime.endTime}&programKey=${programKey}`, 'record web channel ' + channelTitle);
    else
        return _baseFetch(authState, `api/schedule/${channelName}?channelTitle=${channelTitle}`, 'record web channel ' + channelTitle);
};
const getStreamInfo = async (authState, channelName) => {
    return _baseFetch(authState, `api/streamInfo/${channelName}`, 'get stream info for ' + channelName);
};
const playRecording = async (authState, recordingName) => _baseFetch(authState, `api/play/${recordingName}`, 'play recording: ' + recordingName);
const removeRecording = async (authState, recordingName) => _baseFetch(authState, `api/remove/${recordingName}`, 'remove recording: ' + recordingName);

const concatenateGroup = async (authState, recordingName) => _baseFetch(authState, `api/edit/concatenate/${recordingName}`, 'concatenate recording: ' + recordingName);
const streamRecording = async (authState, recordingName) => _baseFetch(authState, `api/stream/${recordingName}`, 'stream recording: ' + recordingName);
const saveStream = async (authState, channelName, recordingTime) => _baseFetch(authState, `api/stream/save/${channelName}?startTime=${recordingTime && recordingTime.startTime}&endTime=${recordingTime && recordingTime.endTime}`, 'save stream : ' + channelName);

//converts json object to query params, skipping empty fields
const jsonToQueryParams = (json) => Object
    .keys(json)
    .filter(x => json[x] != null)
    .map(x => `${x}=${encodeURI(json[x])}&`)
    .reduce((x, s) => x + s, '')

/*
editParams : {
     name,
    startTime,
    duration
}
 */
const editRecording = async (authState,
                                recordingName,
                                editParams
) => _baseFetch(authState, `api/edit/${recordingName}?${jsonToQueryParams(editParams)}`, `edit recording name : ${recordingName}`);

const getRecordingInfo = async (authState, recordingName) => _baseFetch(authState, `api/recordings/${recordingName}`, 'get recording info : ' + recordingName);

const getWeebAccountStatus = async () => _baseFetchThirdParty('api/weebAccountStatus', 'get Weeb account status');

// SSE connection for job updates
let eventSource = null;
let reconnectTimeout = null;
const RECONNECT_DELAY = 1000; // 1 second

const connectToJobUpdates = (onMessage) => {
    console.log('Setting up SSE connection...');
    
    const setupEventSource = () => {
        if (eventSource) {
            console.log('Closing existing SSE connection');
            eventSource.close();
        }

        console.log('Creating new SSE connection to:', `${HOSTNAME}/api/epg-events`);
        eventSource = new EventSource(`${HOSTNAME}/api/epg-events`);
        
        eventSource.onopen = () => {
            console.log('SSE connection established');
            if (reconnectTimeout) {
                clearTimeout(reconnectTimeout);
                reconnectTimeout = null;
            }
        };
        
        eventSource.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                console.log('Received SSE message:', data);
                onMessage(data);
            } catch (error) {
                console.error('Error parsing SSE message:', error);
            }
        };

        eventSource.onerror = (error) => {
            console.error('SSE Error:', error);
            if (eventSource) {
                eventSource.close();
                eventSource = null;
                
                // Attempt to reconnect
                if (!reconnectTimeout) {
                    console.log('Scheduling SSE reconnection...');
                    reconnectTimeout = setTimeout(() => {
                        console.log('Attempting to reconnect SSE...');
                        reconnectTimeout = null;
                        setupEventSource();
                    }, RECONNECT_DELAY);
                }
            }
        };
    };

    setupEventSource();

    return () => {
        console.log('Cleaning up SSE connection');
        if (eventSource) {
            eventSource.close();
            eventSource = null;
        }
        if (reconnectTimeout) {
            clearTimeout(reconnectTimeout);
            reconnectTimeout = null;
        }
    };
};

export default {
    fetchWebChannels,
    fetchSchedules,
    fetchRecordings,
    recordWebChannel,
    cancelJob,
    removeJob,
    playRecording,
    removeRecording,
    streamRecording,
    getStreamInfo,
    saveStream,
    fetchTvGuide,
    editRecording,
    getRecordingInfo,
    concatenateGroup,
    scheduleEpg,
    connectToJobUpdates,
    getWeebAccountStatus
}
