import api from "../../service/api";


export const playChannel = (channelName, changePlayerUrl, event, authState) => {
    const streamInfo = api.getStreamInfo(authState, channelName);
    streamInfo.then(stream => {
        //todo: re-enable it later
        changePlayerUrl(encodeURIComponent(stream.streamInfo.rtmpLink), event)
        // window.location.href = '/admin/player/file/' + encodeURIComponent(stream.streamInfo.rtmpLink);
    });

}
