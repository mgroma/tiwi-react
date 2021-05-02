import React, {useState, useEffect} from 'react';
import PropTypes from "prop-types";
import classnames from "classnames";
// @material-ui/core components
import {makeStyles} from "@material-ui/core/styles";
import Table from "@material-ui/core/Table";
import TableRow from "@material-ui/core/TableRow";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
// @material-ui/icons
//fiber_manual_record
// core components
import styles from "assets/jss/material-dashboard-react/components/tasksStyle.js";
import {useOktaAuth} from "@okta/okta-react";
import api from "../../service/api";
import WebActions from "./WebActions";
import RecordDateTimePicker from "./RecordDateTimePicker";
import moment from "moment";

const useStyles = makeStyles(styles);


const getChannels = (jsonChannels, props) => {
    if (props && props.keyword)
        return jsonChannels
            .filter((i) => i.channel_title
                && i.channel_title
                    .toUpperCase()
                    .includes(props.keyword.toUpperCase()));
    else
        return jsonChannels;
}
export default function WebList(props) {
    //page formatting
    const classes = useStyles();
    const tableCellClasses = classnames(classes.tableCell);
    //date picker state...
    const [startDateTime, onChangeStartDateTime] = useState(new Date());
    const [endDateTime, onChangeEndDateTime] = useState(moment().add(4, 'hours').toDate());
    //channels handling
    const [channels, setChannels] = useState(null);
    const {authState} = useOktaAuth();
    useEffect(() => {

        if ((authState.isAuthenticated || true) && !channels) {
            api.fetchWebChannels(authState)
                .then(json => setChannels(getChannels(json, props)));
        }

    }, [authState]);

    return (
        <>
            <RecordDateTimePicker
                name="startDateTime"
                className={classes.tableCell}
                onChange={onChangeStartDateTime}
                value={startDateTime}
            />
            <RecordDateTimePicker
                name="endDateTime2"
                className={classes.tableCell}
                onChange={onChangeEndDateTime}
                value={endDateTime}
            />
            <Table className={classes.table}>
                <TableBody>
                    {channels && channels.map((channel, index) => (
                        <TableRow key={index} className={classes.tableRow}>
                            <TableCell className={tableCellClasses}>{channel.channel_title}</TableCell>
                            <TableCell className={classes.tableActions}>
                                <WebActions
                                    classes={classes}
                                    channel={channel}
                                    recordingTime={{
                                        startTime: startDateTime,
                                        endTime: endDateTime
                                    }}
                                    authState={authState}
                                />
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </>
    );
}

WebList.propTypes = {
    keyword: PropTypes.string
};
