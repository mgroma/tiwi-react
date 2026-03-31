import React, {useState, useEffect, useMemo} from 'react';
import PropTypes from "prop-types";
import classnames from "classnames";
// @material-ui/core components
import {makeStyles} from "@material-ui/core/styles";
import Tooltip from "@material-ui/core/Tooltip";
import IconButton from "@material-ui/core/IconButton";
import Table from "@material-ui/core/Table";
import TableRow from "@material-ui/core/TableRow";
import TableHead from "@material-ui/core/TableHead";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
// @material-ui/icons
import Close from "@material-ui/icons/Close";
import {ArrowDownward, ArrowUpward, Refresh} from "@material-ui/icons";
// core components
import styles from "assets/jss/material-dashboard-react/components/tasksStyle.js";
import {useOktaAuth} from "@okta/okta-react";
import api from "../../service/api";
import {Done, Stop, Timer} from "@material-ui/icons";
import {useRecordingSearch} from "../../context/RecordingSearchContext";
import {LinearProgress} from "@material-ui/core";
import moment from "moment/moment";
import {useJobs} from "../../context/JobsProvider";

const useStyles = makeStyles(styles);

const TABLE_HEAD = ["Name", "Status", "Start", "End"];

/**
 * Sortable column header with ascending/descending indicator.
 */
const SortableHeader = ({
    headerName,
    setSortByField,
    setSortOrder,
    sortOrder,
    sortByField,
}) => {
    const classes = useStyles();
    const headerClasses = classnames(classes.tableCell, classes.tableHeadCell);
    const arrowClasses = classnames(classes.tableCell, classes.tableHeadCellArrow);
    const arrowIconClasses = classnames(classes.tableCell, classes.tableHeadCellArrowIcon);
    const arrowIcon = sortOrder === "asc" ? (
        <ArrowUpward className={arrowIconClasses} />
    ) : (
        <ArrowDownward className={arrowIconClasses} />
    );
    return (
        <TableCell
            className={headerClasses}
            onClick={() => {
                setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
                setSortByField(headerName);
            }}
        >
            {headerName}
            {sortByField === headerName && (
                <Tooltip title="Sort" placement="top" classes={{ tooltip: classes.tooltip }}>
                    <IconButton aria-label="Sort" className={arrowClasses} size="small">
                        {arrowIcon}
                    </IconButton>
                </Tooltip>
            )}
        </TableCell>
    );
};

const JobStatusMap = {
    'NOT_SCHEDULED': 'NOT_SCHEDULED',
    'SCHEDULED': <Timer/>,
    'EXECUTING': null,
    'COMPLETED': <Done style={{color: "green"}}/>,
    'ERROR': 'ERROR',
    'KILLED': 'KILLED'
}

function getJobProgress(job) {
    if (job.status === 'EXECUTING' && job.jobInfo.startTime && job.jobInfo.endTime) {
        const now = moment();
        const end = moment(job.jobInfo.endTime);
        const start = moment(job.jobInfo.startTime);
        const total = end.diff(start);
        const elapsed = now.diff(start);
        const progress = Math.min(Math.max(Math.round((elapsed / total) * 100), 0), 100);
        return progress;
    }
    return 0;
}

function getJobTitle(job) {
    if (job.status === 'EXECUTING') {
        const progress = getJobProgress(job);
        return `${progress}% complete`;
    }
    return job.status;
}

function JobStatus(job) {
    const status = JobStatusMap[job.status];
    const title = getJobTitle(job);
    
    if (job.status === 'EXECUTING') {
        const progress = getJobProgress(job);
        return (
            <Tooltip
                id="tooltip-top"
                title={title}
                placement="top"
            >
                <div style={{ minWidth: 100 }}>
                    <LinearProgress 
                        variant="determinate" 
                        value={progress} 
                        style={{ height: 4, borderRadius: 2 }}
                    />
                </div>
            </Tooltip>
        );
    }
    
    return (
        <Tooltip
            id="tooltip-top"
            title={title}
            placement="top"
        >
            <div>
                {status || job.status}
            </div>
        </Tooltip>
    );
}

const isCronFormat = str => {
    // A cron expression should have either 5 or 6 space-separated fields
    const parts = str.trim().split(' ');
    if (parts.length < 5
        || parts.length > 7
        || str.includes('GMT')
    ) {
        return false;
    }
    // Check that each field is a valid cron value
    /*
        const validCronRegex = /((((\d+,)+\d+|(\d+(\/|-)\d+)|\d+|\*|.) ?){5,7})/;
        for (const part of parts) {
            if (!validCronRegex.test(part)) {
                return false;
            }
        }
    */
    return true;
}

function getStartDate(job) {
    const startTime = job.jobInfo.startTime;
    return isCronFormat(startTime)? startTime : new Date(startTime).toLocaleString();
}

function getEndDate(job) {
    return isCronFormat(job.jobInfo.startTime)? "" : new Date(job.jobInfo.endTime).toLocaleString();
}

export default function ScheduleList() {
    //page formatting
    const classes = useStyles();
    const tableCellClasses = classnames(classes.tableCell);
    //jobs handling
    // const [jobs, setJobs] = useState(null);
    const {authState} = useOktaAuth();
    const [jobLastCancelled, setJobLastCancelled] = useState(null);
    const {value} = useRecordingSearch();
    const {
        jobs,
        removeJob,
        isLoading,
        fetchSchedules
    } = useJobs()

    const [sortByField, setSortByField] = useState("Start");
    const [sortOrder, setSortOrder] = useState("desc");

    const filterOldCompletedJobs = (jobs) => {
        const sixHoursAgo = moment().subtract(6, 'hours');
        return jobs.filter(job => {
            if (job.status === 'COMPLETED' && job.jobInfo?.endTime) {
                return moment(job.jobInfo.endTime).isAfter(sixHoursAgo);
            }
            return true;
        });
    };

    const getSortValue = (job, field) => {
        switch (field) {
            case "Name":
                return (job.name || "").toLowerCase();
            case "Status":
                return (job.status || "").toLowerCase();
            case "Start": {
                const start = job.jobInfo?.startTime;
                if (!start) return "";
                return isCronFormat(start) ? start : new Date(start).getTime();
            }
            case "End": {
                const end = job.jobInfo?.endTime;
                if (!end) return "";
                return isCronFormat(job.jobInfo?.startTime) ? "" : new Date(end).getTime();
            }
            default:
                return "";
        }
    };

    const sortedJobs = useMemo(() => {
        const filtered = jobs ? filterOldCompletedJobs(jobs) : [];
        if (!filtered.length) return filtered;
        const sorted = [...filtered];
        const isAsc = sortOrder === "asc";
        sorted.sort((a, b) => {
            const va = getSortValue(a, sortByField);
            const vb = getSortValue(b, sortByField);
            if (va === vb) return 0;
            if (va === "") return 1;
            if (vb === "") return -1;
            const cmp = typeof va === "number" && typeof vb === "number"
                ? va - vb
                : String(va).localeCompare(String(vb));
            return isAsc ? cmp : -cmp;
        });
        return sorted;
    }, [jobs, sortByField, sortOrder]);

    // Find the actual index of a job in the original jobs array
    const findJobIndexInOriginalArray = (job) => {
        if (!jobs) return -1;
        // First try to find by object reference (most reliable)
        const indexByReference = jobs.findIndex(j => j === job);
        if (indexByReference !== -1) return indexByReference;
        
        // Fall back to property matching if reference doesn't match
        // (can happen if jobs array was recreated)
        return jobs.findIndex(j => 
            j.name === job.name && 
            j.jobInfo?.startTime === job.jobInfo?.startTime &&
            j.jobInfo?.endTime === job.jobInfo?.endTime &&
            j.status === job.status
        );
    };

    const cancelJob = async (job) => {
        try {
            const originalIndex = findJobIndexInOriginalArray(job);
            if (originalIndex === -1) {
                console.error('Could not find job in original array:', job);
                return;
            }
            await removeJob(originalIndex);
        } catch (error) {
            console.error('Error cancelling job:', error);
        }
    }
    const removeJobHandler = async (job) => {
        try {
            const originalIndex = findJobIndexInOriginalArray(job);
            if (originalIndex === -1) {
                console.error('Could not find job in original array:', job);
                return;
            }
            await removeJob(originalIndex);
        } catch (error) {
            console.error('Error removing job:', error);
        }
    }

    useEffect(() => {
        fetchSchedules();
    }, []);
/*
    const cancelJob = (jobIndex) => {
        api.cancelJob(authState, jobIndex);
        setJobs([])
        setJobLastCancelled(new Date()); //todo: force refreshed; figure out how to do it idiomatically with hooks
    }
    const removeJob = (jobIndex) => {
        api.removeJob(authState, jobIndex);
        setJobs([])
        setJobLastCancelled(new Date()); //todo: force refreshed; figure out how to do it idiomatically with hooks
    }

    useEffect(() => {

        if (authState.isAuthenticated || true) {
            api.fetchSchedules(authState)
                .then(json => setJobs(json));
        }

    }, [authState, jobLastCancelled, value]);
*/

     const tableHeaderColor = "primary";

    return (
        <Table className={classes.table}>
            <TableHead className={classes[tableHeaderColor + "TableHeader"]}>
                <TableRow className={classes.tableHeadRow}>
                    {TABLE_HEAD.map((headerName) => (
                        <SortableHeader
                            key={headerName}
                            headerName={headerName}
                            setSortByField={setSortByField}
                            setSortOrder={setSortOrder}
                            sortOrder={sortOrder}
                            sortByField={sortByField}
                        />
                    ))}
                    <TableCell
                        className={classes.tableCell + " " + classes.tableHeadCell}
                        onClick={() => fetchSchedules()}
                    >
                        <IconButton aria-label="Refresh" size="small">
                            <Refresh />
                        </IconButton>
                    </TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
                {sortedJobs && sortedJobs.map((job, index) => (
                    <TableRow key={index} className={classes.tableRow}>
                        {[job.name,
                            JobStatus(job),
                            getStartDate(job),
                            getEndDate(job),
                        ]
                            .map((item, key) =>
                                key === 0 ?
                                    <TableCell key={key}
                                               className={tableCellClasses}
                                               onClick={() => {
                                                   api.playRecording(authState, job?.scheduledJob?.name);
                                               }}
                                    >
                                        <Tooltip title={job?.scheduledJob?.name}>
                                            {/*<Tooltip title={JSON.stringify(job)}>*/}
                                            <span className={'no name '}>
                                            {item}
                                                </span>
                                        </Tooltip>
                                    </TableCell>
                                    :
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
                                    onClick={() => cancelJob(job)}
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
                                    onClick={() => removeJobHandler(job)}
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
