const HOSTNAME = 'http://localhost:3001';


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
const recordWebChannel = async (authState, channelName, channelTitle) => _baseFetch(authState, `api/schedule/${channelName}?channelTitle=${channelTitle}`, 'record web channel ' + channelTitle);
const playRecording = async (authState, recordingName) => _baseFetch(authState, `api/play/${recordingName}`, 'play recording: ' + recordingName);

export default {
    fetchWebChannels,
    fetchSchedules,
    fetchRecordings,
    recordWebChannel,
    cancelJob,
    playRecording
}
