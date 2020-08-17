import React, {useState, useEffect} from 'react';
import PropTypes from "prop-types";
import classnames from "classnames";
// @material-ui/core components
import {makeStyles} from "@material-ui/core/styles";
import Tooltip from "@material-ui/core/Tooltip";
import IconButton from "@material-ui/core/IconButton";
import Table from "@material-ui/core/Table";
import TableRow from "@material-ui/core/TableRow";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
// @material-ui/icons
import Close from "@material-ui/icons/Close";
import Play from "@material-ui/icons/PlayArrow";
import Record from "@material-ui/icons/PlaylistPlay";
// core components
import styles from "assets/jss/material-dashboard-react/components/tasksStyle.js";
import {useOktaAuth} from "@okta/okta-react";
import {fetchWebChannels} from "../../service/api";

const useStyles = makeStyles(styles);

export default function WebList() {
    //page formatting
    const classes = useStyles();
    const tableCellClasses = classnames(classes.tableCell);
    //channels handling
    const [channels, setChannels] = useState(null);
    const {authState} = useOktaAuth();

    useEffect(() => {

        if (authState.isAuthenticated && !channels) {
            fetchWebChannels(authState)
                .then(json => setChannels(json.filter((i,index)=> index < 5)));
        }

    }, [authState]);

    return (
        <Table className={classes.table}>
            <TableBody>
                {channels && channels.map((channel, index) => (
                    <TableRow key={index} className={classes.tableRow}>
                        <TableCell className={tableCellClasses}>{channel.channel_title}</TableCell>
                        <TableCell className={classes.tableActions}>
                            <Tooltip
                                id="tooltip-top-start"
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
                            </Tooltip>
                            <Tooltip
                                id="tooltip-top"
                                title="Record"
                                placement="top"
                                classes={{tooltip: classes.tooltip}}
                            >
                                <IconButton
                                    aria-label="Record"
                                    className={classes.tableActionButton}
                                >
                                    <Record
                                        className={
                                            classes.tableActionButtonIcon + " " + classes.record
                                        }
                                    />
                                </IconButton>
                            </Tooltip>
                            <Tooltip
                                id="tooltip-top-start"
                                title="Remove"
                                placement="top"
                                classes={{tooltip: classes.tooltip}}
                            >
                                <IconButton
                                    aria-label="Close"
                                    className={classes.tableActionButton}
                                >
                                    <Close
                                        className={
                                            classes.tableActionButtonIcon + " " + classes.close
                                        }
                                    />
                                </IconButton>
                            </Tooltip>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}

WebList.propTypes = {
    tasksIndexes: PropTypes.arrayOf(PropTypes.number),
    tasks: PropTypes.arrayOf(PropTypes.node),
    rtlActive: PropTypes.bool,
    checkedIndexes: PropTypes.array
};
