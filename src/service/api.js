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
const recordWebChannel = async (authState, channelName, channelTitle, recordingTime) => {
    if (recordingTime)
        return _baseFetch(authState, `api/schedule/${channelName}?channelTitle=${channelTitle}&startTime=${recordingTime.startTime}&endTime=${recordingTime.endTime}`, 'record web channel ' + channelTitle);
    else
        return _baseFetch(authState, `api/schedule/${channelName}?channelTitle=${channelTitle}`, 'record web channel ' + channelTitle);
};
const getStreamInfo = async (authState, channelName) => {
    return _baseFetch(authState, `api/streamInfo/${channelName}`, 'get stream info for ' + channelName);
};
const playRecording = async (authState, recordingName) => _baseFetch(authState, `api/play/${recordingName}`, 'play recording: ' + recordingName);
const removeRecording = async (authState, recordingName) => _baseFetch(authState, `api/remove/${recordingName}`, 'remove recording: ' + recordingName);
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
    getRecordingInfo
}
