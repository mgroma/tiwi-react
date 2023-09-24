import React, {useEffect, useState} from 'react';
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
import {ArrowDownward, Close, Edit, PlayArrowOutlined, Refresh} from "@material-ui/icons";
import moment from "moment";
import {RecordingEditDialog} from "./RecordingEditDialog";
import ArrowUpward from "@material-ui/icons/ArrowUpward";

const useStyles = makeStyles(styles);

//create a function that return reactjs component that displays a column header with up and down arrow icon for sorting; add onClick handler that will set state of sortByField and toggle setSortOrder
const SortableHeader = ({index, headerName, setSortByField, setSortOrder, sortOrder, sortbyField}
) => {
    const classes = useStyles();
    const headerClasses = classnames(classes.tableCell, classes.tableHeadCell);
    const arrowClasses = classnames(classes.tableCell, classes.tableHeadCellArrow);
    const arrowIconClasses = classnames(classes.tableCell, classes.tableHeadCellArrowIcon);
    const arrowIcon = (sortOrder === "asc") ? <ArrowUpward className={arrowIconClasses}/> :
        <ArrowDownward className={arrowIconClasses}/>;
    return (
        <TableCell
            key={index}
            className={headerClasses}
            onClick={() => {
                setSortOrder((sortOrder === "asc") ? "desc" : "asc");
                setSortByField(headerName);
            }}>
            {headerName}
            {
                sortbyField === headerName
                &&
                <Tooltip
                    id="tooltip-top"
                    title="Sort"
                    placement="top"
                    classes={{tooltip: classes.tooltip}}
                >
                    <IconButton aria-label="Sort" className={arrowClasses}>
                        {arrowIcon}
                    </IconButton>
                </Tooltip>
            }
        </TableCell>
    );
}
export default function RecordingList(props) {
    //page formatting
    const classes = useStyles();
    const tableCellClasses = classnames(classes.tableCell);
    const tableHeaderColor = "primary";
    const tableHead = ["Name", "Modified", "Size"];
    // alternative list: const tableHead = ["Name", "Created", "Modified", "Size"];
    const {listLength} = props;

    //state
    const [sortByField, setSortByField] = useState("Modified");
    const [sortOrder, setSortOrder] = useState("asc");
    //jobs handling
    const [recordingForEditDialog, setRecordingForEditDialog] = useState(false);
    const [recordingsApiResponse, setRecordingsApisResponse] = useState(null);
    const [recordings, setRecordings] = useState(null);
    const {authState} = useOktaAuth();
    var jobLastPLayed = null;

    const playRecording = (recordingName) => {
        api.playRecording(authState, recordingName);
        jobLastPLayed = new Date(); //todo: force refreshed; figure out how to do it idiomatically with hooks
    }
    const streamRecording = (fileName) => {
        api.streamRecording(authState, fileName);
        startPlayer(fileName);
    }

    const rename = async (fileName, index) => {
        const extractPrefix = fileName => {
            const matchGroups = fileName.match(/(?<prefix>.* - \d{4}-\d{2}-\d{2})/gm)
            if (matchGroups && matchGroups.length > 0)
                return matchGroups[0] + " - "
            return "";
        };

        const extractedPrefix = extractPrefix(fileName)
        const newSuffix = prompt("Enter New Description", extractedPrefix ? "" : fileName)
        if (!newSuffix) return;
        const newFileName = `${extractedPrefix}${newSuffix}.ts`
        await api.editRecording(
            authState,
            fileName,
            {
                name: newFileName
            }
        );
        refresh()
        console.log(` rrenaming [${fileName}] to ${newFileName}`)
    }


    const refresh = () => {
        fetchRecordings();
        return undefined;
    }
    const startPlayer = (file) => {
        window.location.href = `/admin/player/${file}`;
        // props.history.push(`/admin/player/${file}`);
    }

    const sortListByFieldAndOrder = (list) => {
        if (!list) return;
        // debugger
        const sortedList = [...list];
        //map sortByField to a field in the api response
        const sortByFieldMap = {
            "Name": "file",
            "Modified": "modified",
            "Size": "size"
        }
        const fieldToSortBy = sortByFieldMap[sortByField];
        sortedList.sort((a, b) => {
            if (a[fieldToSortBy] < b[fieldToSortBy]) return sortOrder === "asc" ? -1 : 1;
            if (a[fieldToSortBy] > b[fieldToSortBy]) return sortOrder === "asc" ? 1 : -1;
            return 0;
        });
        return sortedList;
    }
    const sortAndSlice = (list) => {
        const sortedList = sortListByFieldAndOrder(list);
        return listLength ? sortedList.slice(0, listLength) : sortedList;
    }

    const fetchRecordings = () => {
        if (authState.isAuthenticated || true) {
            api.fetchRecordings(authState)
                .then(json => setRecordingsApisResponse(sortAndSlice(json)))
        }
    }

    useEffect(() => {
        fetchRecordings();

    }, [authState, jobLastPLayed]);

    useEffect(() => {
        setRecordings(sortAndSlice(recordingsApiResponse));
    }, [sortOrder, sortByField, recordingsApiResponse])

    const removeRecording = file => {
        api.removeRecording(authState, file)
            .then(() => fetchRecordings())
    };

    const getRowClass = (job) => {
        const dateModified = moment(job.modified)
        const isToday = moment().isSame(dateModified, 'day');
        const fromLastHour = moment().subtract(1, 'minutes').isBefore(dateModified);
        if (fromLastHour) return classes.tableRowLastHour;
        return isToday ?
            classes.tableRowToday :
            classes.tableRow
    }

    return (
        <>
            {
                recordingForEditDialog &&
                <RecordingEditDialog
                    job={recordingForEditDialog}
                    closeDialog={() => setRecordingForEditDialog(null)}
                    authState
                />
            }
            <Table className={classes.table}>
                <TableHead className={classes[tableHeaderColor + "TableHeader"]}>
                    <TableRow
                        className={classes.tableHeadRow}
                    >
                        {tableHead.map((prop, key) => {
                            return (
                                <SortableHeader
                                    key={key}
                                    headerName={prop}
                                    setSortByField={setSortByField}
                                    setSortOrder={setSortOrder}
                                    sortOrder={sortOrder}
                                    sortbyField={sortByField}
                                />
                            );
                            /*
                            todo remove it
                                    <TableCell
                                        className={classes.tableCell + " " + classes.tableHeadCell}
                                        key={key}
                                        onclick={() => {
                                            alert(prop)
                                        }}
                                    >
                                        [{prop}]
                                    </TableCell>
    */

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
                            className={getRowClass(job)}>
                            <TableCell
                                onClick={() => rename(job.file, index)}
                                className={tableCellClasses}
                            >{job.file}</TableCell>
                            {[
                                // new Date(job.created).toLocaleString(),
                                new Date(job.modified).toLocaleString(),
                                readableBytes(job.size)
                            ].map((item, index) => (
                                <TableCell key={index} className={tableCellClasses}>{item}</TableCell>
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
                                <Tooltip
                                    id="tooltip-top-start"
                                    title="Edit"
                                    placement="top"
                                    classes={{tooltip: classes.tooltip}}
                                >
                                    <IconButton
                                        aria-label="Edit"
                                        className={classes.tableActionButton}
                                        onClick={() => setRecordingForEditDialog(job)}
                                    >
                                        <Edit
                                            className={
                                                classes.tableActionButtonIcon + " " + classes.play
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
                                        aria-label="Remove"
                                        className={classes.tableActionButton}
                                        onClick={() => removeRecording(job.file)}
                                    >
                                        <Close
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
        </>
    );
}

RecordingList.propTypes = {
    tasksIndexes: PropTypes.arrayOf(PropTypes.number),
    tasks: PropTypes.arrayOf(PropTypes.node),
    checkedIndexes: PropTypes.array
};
