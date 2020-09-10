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
// core components
import styles from "assets/jss/material-dashboard-react/components/tasksStyle.js";
import {useOktaAuth} from "@okta/okta-react";
import api from "../../service/api";
import readableBytes from "../Utils/ReadableBytes";
import TableHead from "@material-ui/core/TableHead";

const useStyles = makeStyles(styles);


export default function RecordingList(props) {
    //page formatting
    const classes = useStyles();
    const tableCellClasses = classnames(classes.tableCell);
    const tableHeaderColor = "primary";
    const tableHead = ["Name", "Created", "Modified", "Size"];
    const {listLength} = props;

    //jobs handling
    const [recordings, setRecordings] = useState(null);
    const {authState} = useOktaAuth();
    var jobLastPLayed = null;

    const playRecording = (recordingName) => {
        api.playRecording(authState, recordingName);
        jobLastPLayed = new Date(); //todo: force refreshed; figure out how to do it idiomatically with hooks
    }

    useEffect(() => {

        if (authState.isAuthenticated) {
            api.fetchRecordings(authState)
                .then(json => setRecordings(listLength ? json.slice(0, listLength) : json));
        }

    }, [authState, jobLastPLayed]);

    return (
        <Table className={classes.table}>
                <TableHead className={classes[tableHeaderColor + "TableHeader"]}>
                    <TableRow className={classes.tableHeadRow}>
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
                    </TableRow>
                </TableHead>
            <TableBody>
                {recordings && recordings.map((job, index) => (
                    <TableRow key={index} className={classes.tableRow}>
                        <TableCell className={tableCellClasses}>{job.file}</TableCell>
                        <TableCell className={tableCellClasses}>{new Date(job.created).toLocaleString()}</TableCell>
                        <TableCell className={tableCellClasses}>{new Date(job.modified).toLocaleString()}</TableCell>
                        <TableCell className={tableCellClasses}>{readableBytes(job.size)}</TableCell>
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
