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
import Play from "@material-ui/icons/PlayArrow";
import Record from "@material-ui/icons/FiberManualRecord";
// core components
import styles from "assets/jss/material-dashboard-react/components/tasksStyle.js";
import {useOktaAuth} from "@okta/okta-react";
import api from "../../service/api";
import readableBytes from "../Utils/ReadableBytes";
import TableHead from "@material-ui/core/TableHead";
import {PlayArrowOutlined, Refresh} from "@material-ui/icons";

const useStyles = makeStyles(styles);


export default function RecordingList(props) {
    //page formatting
    const classes = useStyles();
    const tableCellClasses = classnames(classes.tableCell);
    const tableHeaderColor = "primary";
    const tableHead = ["Name", "Modified", "Size"];
    // const tableHead = ["Name", "Created", "Modified", "Size"];
    const {listLength} = props;

    //jobs handling
    const [recordings, setRecordings] = useState(null);
    const {authState} = useOktaAuth();
    var jobLastPLayed = null;

    const playRecording = (recordingName) => {
        api.playRecording(authState, recordingName);
        jobLastPLayed = new Date(); //todo: force refreshed; figure out how to do it idiomatically with hooks
    }
    const streamRecording = (fileName) => {
        api.streamRecording(authState, fileName);
        // startPlayer(fileName);
    }


    const refresh = () => {
        fetchRecordings();
        return undefined;
    }
    const startPlayer = (file) => {
        window.location.href = `/admin/player/${file}`;
        // props.history.push(`/admin/player/${file}`);
    }


    const fetchRecordings = () => {
        if (authState.isAuthenticated || true) {
            api.fetchRecordings(authState)
                .then(json => setRecordings(listLength ? json.slice(0, listLength) : json));
        }
    }

    useEffect(() => {
        fetchRecordings();

    }, [authState, jobLastPLayed]);

    return (
        <Table className={classes.table}>
            <TableHead className={classes[tableHeaderColor + "TableHeader"]}>
                <TableRow
                    className={classes.tableHeadRow}
                >
                    {tableHead.map((prop, key) => {
                        return (
                            <TableCell
                                className={classes.tableCell + " " + classes.tableHeadCell}
                                key={key}
                            >
                                {prop}
                            </TableCell>
                        );
                    })}
                    <TableCell
                        className={classes.tableCell + " " + classes.tableHeadCell}
                        onClick={() => refresh()}
                    >
                        <IconButton>
                            <Refresh/>
                        </IconButton>
                    </TableCell>

                </TableRow>
            </TableHead>
            <TableBody>
                {recordings && recordings.map((job, index) => (
                    <TableRow
                        hover
                        key={index}
                        className={classes.tableRow}>
                        {[job.file,
                            // new Date(job.created).toLocaleString(),
                            new Date(job.modified).toLocaleString(),
                            readableBytes(job.size)
                        ].map((item) => (
                            <TableCell className={tableCellClasses}>{item}</TableCell>
                        ))}
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
                                    onClick={() => playRecording(job.file)}
                                >
                                    <Play
                                        className={
                                            classes.tableActionButtonIcon + " " + classes.play
                                        }
                                    />
                                </IconButton>
                            </Tooltip>
                            {!job.stream &&
                            <Tooltip
                                id="tooltip-top-start"
                                title="Stream"
                                placement="top"
                                classes={{tooltip: classes.tooltip}}
                            >
                                <IconButton
                                    aria-label="Stream"
                                    className={classes.tableActionButton}
                                    onClick={() => streamRecording(job.file)}
                                >
                                    <Record
                                        className={
                                            classes.tableActionButtonIcon + " " + classes.play
                                        }
                                    />
                                </IconButton>
                            </Tooltip>
                            }
                            {job.stream &&
                            <Tooltip
                                id="tooltip-top-start"
                                title="Player"
                                placement="top"
                                classes={{tooltip: classes.tooltip}}
                            >
                                <IconButton
                                    aria-label="Player"
                                    className={classes.tableActionButton}
                                    onClick={() => startPlayer(job.file)}
                                >
                                    <PlayArrowOutlined
                                        className={
                                            classes.tableActionButtonIcon + " " + classes.play
                                        }
                                    />
                                </IconButton>
                            </Tooltip>
                            }
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}

RecordingList.propTypes = {
    tasksIndexes: PropTypes.arrayOf(PropTypes.number),
    tasks: PropTypes.arrayOf(PropTypes.node),
    checkedIndexes: PropTypes.array
};
