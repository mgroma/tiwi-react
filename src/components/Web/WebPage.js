import React, {useEffect, useState} from "react";
// @material-ui/core components
import {makeStyles} from "@material-ui/core/styles";
// core components
import GridItem from "components/Grid/GridItem.js";
import GridContainer from "components/Grid/GridContainer.js";
import Card from "components/Card/Card.js";
import CardHeader from "components/Card/CardHeader.js";
import CardBody from "components/Card/CardBody.js";
import api from "../../service/api";
import {useOktaAuth} from "@okta/okta-react";
import WebActions from "./WebActions";
import styles from "assets/jss/material-dashboard-react/components/tasksStyle.js";
import moment from "moment";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import RecordDateTimePicker from "./RecordDateTimePicker";
import SearchWrapper from "../Search/SearchWrapper";


const useStyles = makeStyles(styles);


export default function WebPage() {
    const classes = useStyles();
    const [channels, setChannels] = useState(null);
    const {authState} = useOktaAuth();
    const [channelFilter, setChannelFilter] = useState("");
    const handleChannelFilterChange = (e => {
        setChannelFilter(e.target.value);
    });
    //date picker state...
    const [startDateTime, onChangeStartDateTime] = useState(new Date());
    const [endDateTime, onChangeEndDateTime] = useState(moment().add(4, 'hours').toDate());

    useEffect(() => {
        if (authState.isAuthenticated || true) {
            api.fetchWebChannels(authState)
                .then(channelList => setChannels(channelList
                    .filter(channel => {
                        if (channelFilter) {
                            const {channel_title} = channel;
                            return channel_title && channel_title.toUpperCase().match(channelFilter.toUpperCase());
                        }
                        return true;
                    })
                ));
        }
    }, [authState, channelFilter]);

    return (
        <GridContainer>
            <GridItem xs={12} sm={12} md={12}>
                <Card>
                    <CardHeader color="success">
                        <h4 className={classes.cardTitleWhite}>Current Channels</h4>
                        <p className={classes.cardCategoryWhite}>
                            Click on a channel to play
                        </p>
                    </CardHeader>
                    <CardBody>
                        <SearchWrapper
                            onChange={handleChannelFilterChange}
                        />
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
                            <TableHead className={classes["successTableHeader"]}>
                                <TableRow className={classes.tableHeadRow}>
                                    {["No", "Name", "Actions", "Description"].map((prop, key) => {
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
                                {channels && channels.map((channel, index) => (
                                    <TableRow key={index} className={classes.tableRow}>
                                        <TableCell className={classes.tableCell}>{index}</TableCell>
                                        <TableCell className={classes.tableCell}>{channel.channel_title}</TableCell>
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
                                        <TableCell className={classes.tableCell}>{channel.channel_description}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardBody>
                </Card>
            </GridItem>
        </GridContainer>
    );
}
