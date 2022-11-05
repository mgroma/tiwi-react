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
// core components
import styles from "assets/jss/material-dashboard-react/components/tasksStyle.js";
import {useOktaAuth} from "@okta/okta-react";
import api from "../../service/api";
import {Done, Stop, Timer} from "@material-ui/icons";
import {useRecordingSearch} from "../../context/RecordingSearchContext";
import {LinearProgress} from "@material-ui/core";

const useStyles = makeStyles(styles);

const JobStatusMap = {
    'NOT_SCHEDULED': 'NOT_SCHEDULED',
    'SCHEDULED' : <Timer />,
    'EXECUTING': <LinearProgress style={{minWidth:50}} />,
    //later  'EXECUTING': <LinearProgress value={50} variant="determinate"/>,
    'COMPLETED': <Done style={{color: "green"}}/>,
    'ERROR': 'ERROR',
    'KILLED': 'KILLED'
}
function JobStatus(job) {
    const status = JobStatusMap[job.status];
    return <div>
        {status || job.status}
    </div>;
}

export default function ScheduleList() {
    //page formatting
    const classes = useStyles();
    const tableCellClasses = classnames(classes.tableCell);
    //jobs handling
    const [jobs, setJobs] = useState(null);
    const {authState} = useOktaAuth();
    const [jobLastCancelled, setJobLastCancelled] = useState(null);
    const {value} = useRecordingSearch();


    const cancelJob = (jobIndex) => {
        api.cancelJob(authState, jobIndex);
        setJobLastCancelled(new Date()); //todo: force refreshed; figure out how to do it idiomatically with hooks
    }
    const removeJob = (jobIndex) => {
        api.removeJob(authState, jobIndex);
        setJobLastCancelled(new Date()); //todo: force refreshed; figure out how to do it idiomatically with hooks
    }

    useEffect(() => {

        if (authState.isAuthenticated || true) {
            api.fetchSchedules(authState)
                .then(json => setJobs(json));
        }

    }, [authState, jobLastCancelled, value]);

    return (
        <Table className={classes.table}>
            <TableBody>
                {jobs && jobs.map((job, index) => (
                    <TableRow key={index} className={classes.tableRow}>
                        {[job.name,
                            JobStatus(job),
                            new Date(job.jobInfo.startTime).toLocaleString(),
                            new Date(job.jobInfo.endTime).toLocaleString(),
                        ]
                            .map((item, key) =>
                                <TableCell key={key} className={tableCellClasses}>{item}</TableCell>
                            )}
                        <TableCell className={classes.tableActions}>
                            {job.status !== "KILLED" && <Tooltip
                                id="tooltip-top-start"
                                title="Cancel"
                                placement="top"
                                classes={{tooltip: classes.tooltip}}
                            >
                                <IconButton
                                    aria-label="Close"
                                    className={classes.tableActionButton}
                                    onClick={() => cancelJob(index)}
                                >
                                    <Stop
                                        className={
                                            classes.tableActionButtonIcon + " " + classes.play
                                        }
                                    />
                                </IconButton>
                            </Tooltip>}
                            <Tooltip
                                id="tooltip-top-start"
                                title="Remove"
                                placement="top"
                                classes={{tooltip: classes.tooltip}}
                            >
                                <IconButton
                                    aria-label="Remove"
                                    className={classes.tableActionButton}
                                    onClick={() => removeJob(index)}
                                >
                                    <Close
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

ScheduleList.propTypes = {
    tasksIndexes: PropTypes.arrayOf(PropTypes.number),
    tasks: PropTypes.arrayOf(PropTypes.node),
    checkedIndexes: PropTypes.array
};
