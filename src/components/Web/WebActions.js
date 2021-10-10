import Tooltip from "@material-ui/core/Tooltip";
import IconButton from "@material-ui/core/IconButton";
import Record from "@material-ui/icons/FiberManualRecord";
import Play from "@material-ui/icons/PlayArrow";
import React from "react";
import api from "../../service/api";
import {useRecordingSearch} from "../../context/RecordingSearchContext";

const recordChannel = (channelName, channelTitle, recordingTime, authState) => {
    api.recordWebChannel(authState, channelName, channelTitle, recordingTime)
    // todo: go-forward API, saveStream is not needed anymore as separate API, it has been integrated with recordWebChannel
    //  api.saveStream(authState, channelName)
}


const playChannel = (channelName, authState) => {
    const streamInfo = api.getStreamInfo(authState, channelName);
    streamInfo.then(stream => {
        window.location.href = '/admin/player/file/' + encodeURIComponent(stream.streamInfo);
    });

}

export default (props) => {
    const {classes, channel, recordingTime, authState} = props;
    const {handleChange} = useRecordingSearch();
    return <span>
    <Tooltip
        id="tooltip-top-start"
        title="Record"
        placement="top"
        classes={{tooltip: classes.tooltip}}
    >
            <IconButton
                aria-label="Record"
                className={classes.tableActionButton}
                onClick={() => {
                    handleChange(`Recording ${channel.channel_name}`)
                    recordChannel(channel.channel_name, channel.channel_title, recordingTime, authState)
                }
                }
            >
                <Record
                    className={
                        classes.tableActionButtonIcon + " " + classes.play
                    }
                />
            </IconButton>
        </Tooltip>
        <Tooltip
            id="tooltip-top"
            title="Play"
            placement="top"
            classes={{tooltip: classes.tooltip}}
        >
            <IconButton
                aria-label="Play"
                className={classes.tableActionButton}
                onClick={() => playChannel(channel.channel_name, authState)}
            >
                <Play
                    className={
                        classes.tableActionButtonIcon + " " + classes.play
                    }
                />
            </IconButton>
        </Tooltip>
        </span>;
}
