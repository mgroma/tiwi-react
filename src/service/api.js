const HOSTNAME = window.location.protocol + '//'+ window.location.hostname + ':3001';


const _baseFetch = async (authState, apiPath, operationName) => {
    const {accessToken} = authState;
    const apiUrl = `${HOSTNAME}/${apiPath}`
    const response = await fetch(apiUrl, {
        headers: {
            Authorization: `Bearer ${accessToken}`,
        }
    })
    if (!response.ok) {
        throw Error(`error executing ${operationName}: error=[${response.error()}]`);
    }
    return await response.json();
}
const fetchWebChannels = async (authState) => _baseFetch(authState, 'api/channels', 'fetch web channels');
const fetchSchedules = async (authState) => _baseFetch(authState, 'api/schedules', 'fetch schedules');
const fetchRecordings = async (authState) => _baseFetch(authState, 'api/recordings', 'fetch recordings');
const cancelJob = async (authState, jobIndex) => _baseFetch(authState, `api/cancel/${jobIndex}`, 'cancel job');
const recordWebChannel = async (authState, channelName, channelTitle, recordingTime) => {
    if (recordingTime)
    return    _baseFetch(authState, `api/schedule/${channelName}?channelTitle=${channelTitle}&startTime=${recordingTime.startTime}&endTime=${recordingTime.endTime}`, 'record web channel ' + channelTitle);
    else
    return    _baseFetch(authState, `api/schedule/${channelName}?channelTitle=${channelTitle}`, 'record web channel ' + channelTitle);
};
const playRecording = async (authState, recordingName) => _baseFetch(authState, `api/play/${recordingName}`, 'play recording: ' + recordingName);
const streamRecording = async (authState, recordingName) => _baseFetch(authState, `api/stream/${recordingName}`, 'stream recording: ' + recordingName);

export default {
    fetchWebChannels,
    fetchSchedules,
    fetchRecordings,
    recordWebChannel,
    cancelJob,
    playRecording,
    streamRecording,
}
