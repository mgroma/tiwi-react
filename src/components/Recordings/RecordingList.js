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
import {SearchOffRounded} from "@mui/icons-material";

const useStyles = makeStyles(styles);

/**
 * reacjJs component that allows user to type in a search string and filter the list of recordings. applies filter after typing at least 2 characters, and after a delay of 300ms.
 * @param props {setFilter, filter}
 * @returns {JSX.Element}
 * @constructor
 */
const SearchFilter = ({setFilter}) => {
    const classes = useStyles();
    const [filterTimeout, setFilterTimeout] = useState(null);
    const filterDelay = 30;
    const [filterLength, setFilterLength] = useState(0);
    const [filterActive, setFilterActive] = useState(false);
    const [localFilter, setLocalFilter] = useState('');

    useEffect(() => {
        if (filterTimeout) clearTimeout(filterTimeout);
        if (filterLength < 2 && filterLength > 0) return;
        const timeout = setTimeout(() => {
                setFilter(localFilter);
            }
            , filterDelay);
        setFilterTimeout(timeout);
        return () => {
            if (timeout) clearTimeout(timeout);
        }
    }, [localFilter]);
    return (
        <div className={classes.searchWrapper}
             style={{
                 display: "flex",
                 justifyContent: "center",
                 alignItems: "center",
             }}>
            <input
                type="text"
                className={classes.searchInput}
                placeholder="Search"
                value={localFilter}
                onChange={(e) => {
                    setLocalFilter(e.target.value);
                    setFilterLength(e.target.value.length);
                }
                }
                onFocus={() => {
                    setFilterActive(true);
                }
                }
                onBlur={() => {
                    setFilterActive(false);
                }
                }
                style={{
                    width: "100%",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    backgroundColor: (filterActive) ? "#fafafa" : "transparent",
                    border: (filterActive) ? "1px solid #ccc" : "1px solid transparent",
                    borderRadius: "4px",
                    fontSize: "14px",
                    color: "#333"
                }
                }
            />
            <IconButton
                aria-label="Search"
                className={classes.searchIcon}
                onClick={() => {
                    setLocalFilter('');
                    setFilter('');
                }
                }
            >
                <SearchOffRounded />
            </IconButton>
        </div>
    )
}

/*create a function that return reactjs component that displays a column header with up and down arrow icon for sorting; add onClick handler that will set state of sortByField and toggle setSortOrder
 */
const SortableHeader = ({index, headerName, setSortByField, setSortOrder, sortOrder, sortbyField, filter, setFilter}
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

/**
 * RecordingList component that displays a list of recordings in a table.
 * @param props {listLength, setFilter, filter}
 * @returns {JSX.Element}
 * @constructor
 */
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
    const [filter, setFilter] = useState(null);
    const [sortOrder, setSortOrder] = useState("desc");
    //jobs handling
    const [recordingForEditDialog, setRecordingForEditDialog] = useState(false);
    const [recordingsApiResponse, setRecordingsApisResponse] = useState(null);
    const [recordings, setRecordings] = useState(null);
    const [jobLastPlayed, setJobLastPlayed] = useState(null);
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
        const filteredList = list.filter(item => {
            if (filter) {
                const lowerCaseName = item.file.toLowerCase();
                const lowerCaseFilter = filter.toLowerCase();
                return lowerCaseName.includes(lowerCaseFilter);
            }
            return true;
        })
        const sortedList = [...filteredList];
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
        return listLength ? sortedList?.slice(0, listLength) : sortedList;
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
    }, [sortOrder, sortByField, recordingsApiResponse,filter])

    const removeRecording = file => {
        api.removeRecording(authState, file)
            .then(() => fetchRecordings())
    };
    const getRowClass = ({job, isLastPlayed}) => {
        const dateModified = moment(job.modified)
        const classLastPlayed = isLastPlayed ? classes.tableRowLastPlayed : "";
        const isToday = moment().isSame(dateModified, 'day');
        const fromLastHour = moment().subtract(1, 'minutes').isBefore(dateModified);
        if (fromLastHour) return classnames(classLastPlayed, classes.tableRowLastHour);
        return isToday ?
            classnames(classLastPlayed, classes.tableRowToday) :
            classnames(classLastPlayed, classes.tableRow)
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
            <SearchFilter setFilter={setFilter}/>
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
                                    filter={filter}
                                    setFilter={setFilter}
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
                            className={getRowClass({job, isLastPlayed: jobLastPlayed === index})}>
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
                                        onClick={() => {
                                            playRecording(job.file)
                                            setJobLastPlayed(index)
                                        }}
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
