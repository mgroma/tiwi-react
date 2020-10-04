import Tooltip from "@material-ui/core/Tooltip";
import IconButton from "@material-ui/core/IconButton";
import Record from "@material-ui/icons/FiberManualRecord";
import React from "react";
import api from "../../service/api";

const recordChannel = (channelName, channelTitle, authState) => {
    api.recordWebChannel(authState, channelName, channelTitle)
}


export default (classes, channel, authState) => {
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
                onClick={() => recordChannel(channel.channel_name, channel.channel_title, authState)}
            >
                <Record
                    className={
                        classes.tableActionButtonIcon + " " + classes.play
                    }
                />
            </IconButton>
        </Tooltip>
        {/*<Tooltip
            id="tooltip-top"
            title="Play"
            placement="top"
            classes={{tooltip: classes.tooltip}}
        >
            <IconButton
                aria-label="Play"
                className={classes.tableActionButton}
            >
                <Play
                    className={
                        classes.tableActionButtonIcon + " " + classes.play
                    }
                />
            </IconButton>
        </Tooltip>*/}
        </span>;
}
