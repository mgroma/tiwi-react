import React, {useState} from "react";
// @material-ui/core components
import {makeStyles} from "@material-ui/core/styles";
// core components
import GridItem from "components/Grid/GridItem.js";
import Card from "components/Card/Card.js";
import CardHeader from "components/Card/CardHeader.js";
import CardBody from "components/Card/CardBody.js";

import {Box, Grid, styled, Tooltip} from "@material-ui/core";
import {FormControlLabel, Typography} from "@mui/material";
import {useSelectedEPGChannel} from "./useEPGData.tsx";
import CustomInput from "../CustomInput/CustomInput";
import {EpgChannel, Item, toTime} from "./EPGDataUtils";
import {EPGProgramHeader} from "./EPGProgramsAutocomplete";
import {grayColor} from "../../assets/jss/material-dashboard-react";
import {useOktaAuth} from "@okta/okta-react";
import {useRecordingSearch} from "../../context/RecordingSearchContext";
import Checkbox from "@material-ui/core/Checkbox";
import EPGProgramGrid from "./EPGProgramGrid";
import {useQueryClient} from "react-query";
import {RefreshEpg} from "./EPGCacheUtils";


const DEFAULT_CHANNELS_TO_DISPLAY = 10;
const MAX_CHANNELS_TO_DISPLAY = 300;
const styles = {
    cardCategoryWhite: {
        color: "rgba(255,255,255,.62)",
        margin: "0",
        fontSize: "14px",
        marginTop: "0",
        marginBottom: "0"
    },
    cardTitleWhite: {
        color: "#FFFFFF",
        marginTop: "0px",
        minHeight: "auto",
        fontWeight: "300",
        fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
        marginBottom: "3px",
        textDecoration: "none"
    },
    description: {
        fontSize: 11,
        color: grayColor[1],
    }
};

const useStyles = makeStyles(styles);

const EpgItem = ({children, width, item}) => {
    let duration = (item.stop - item.start) / (1000 * 60);
    return (<div style={{width: width * 110}}><Item><Typography
        noWrap>{children}</Typography></Item></div>);
    /*
        return (<Grid item xs={width}><Item><Typography
            noWrap>{children}</Typography></Item></Grid>);
    */
}

/*
@param data: { programs }
 */
function toChannel2ProgramMap(data) {
    if (!(data && data.programs)) return [];
    return data.programs
        .reduce((map, curr) => {
            const currentChannelPrograms = map.get(curr.channel);
            const newChannelPrograms = currentChannelPrograms || []
            newChannelPrograms.push(curr)
            map.set(curr.channel, newChannelPrograms)
            return map
        }, new Map());
}

/**
 * Single Program Details
 * @param classes -   material ui classes
 * @param authState - okta auth state
 * @param channels -  list of channels to be displayed
 * @param width -  number of columns
 * @returns {function(*, *): *}
 * @constructor
 */
function EPGSingleProgramDetails(classes, authState, channels, width = 3) {
    return (program, key) => (
        <EpgItem width={width} key={key} item={program}>
            <EPGProgramHeader
                item={program}
                classes={classes}
                authState={authState}
                channels={channels}
            />
            <div className={classes.description}>
                {toTime(program.start)}-{toTime(program.stop)}
                {program.isScheduled && <span style={{color: 'red'}}> (scheduled)</span>}
            </div>
        </EpgItem>
    );
}

function EPGProgramDetails({programs, classes, authState, channels}) {
    return <>
        {
            programs &&
            programs
                .filter((item, index) => index < 3)
                .map(EPGSingleProgramDetails(classes, authState, channels))
        }
    </>;
}

/*
timeline logic
determine time range
 - range: {min, max} = floor(now) to full/half hour
 - range.min = floor(now) to full/half hour
 - range.max = range.min + 3 hrs
 lowerDelta = range.min > program[0].start ? 0 : (program[0].start > range.max ? range.max - range.min : program[0].start - range.min)
 render lowerDelta
for a given program
    //if program fits
    if program[0].start < range.max {
         endTime = program.stop > range.max ? range.max : program.stop
         programWidth=endTime-program.start


 */


function showSelectedChannelsCount(selectedChannels) {
    return <> ({selectedChannels?.data?.channels?.length || 0} channels)</>;
}

//todo: finish it up
const EPGCurrentProgramsGridNew = (selectedChannels, maxChannels, changePlayerUrl, authState, channel2ProgramMap, classes) =>
    <EPGProgramGrid
        selectedChannels={selectedChannels}
        maxChannels={maxChannels}
        changePlayerUrl={changePlayerUrl}
        authState={authState}
        channel2ProgramMap={channel2ProgramMap}
        classes={classes}
    />
;

function EPGCurrentProgramsGrid(selectedChannels, maxChannels, changePlayerUrl, authState, channel2ProgramMap, classes) {
    return <Box sx={{flexGrow: 1}}>
        {
            selectedChannels.data
            && selectedChannels.data.channels
            && selectedChannels.data.channels
                .filter((item, index) => {
                    return index < maxChannels;
                })
                .map((channel, key) => {
                    return (
                        <Grid container key={key}>
                            <EpgChannel channel={channel}
                                        changePlayerUrl={changePlayerUrl}
                                        authState={authState}
                            />


                            <EPGProgramDetails
                                programs={channel2ProgramMap &&
                                    channel2ProgramMap
                                        .get(channel.id)}
                                classes={classes}
                                authState={authState}
                                channels={selectedChannels.data.channels}
                            />


                        </Grid>
                    )
                })
        }
    </Box>;
}

export default function EPG() {
    const queryClient = useQueryClient()
    const classes = useStyles();
    const {authState} = useOktaAuth();
    const {changePlayerUrl} = useRecordingSearch();
    const {setChannelFilter, selectedChannels} = useSelectedEPGChannel('');
    // const {setChannelFilter, selectedChannels} = useSelectedEPGChannel('canal');
    const channel2ProgramMap = toChannel2ProgramMap(selectedChannels.data)
    const [maxChannels, setMaxChannels] = useState(DEFAULT_CHANNELS_TO_DISPLAY)


    return (
        <div>
            <Grid>
                <GridItem xs={12} sm={12} md={12}>
                    <Card>
                        <CardHeader color="primary">
                            <h4 className={classes.cardTitleWhite}>EPG Grid</h4>
                            <p className={classes.cardCategoryWhite}>TV
                                Listing {showSelectedChannelsCount(selectedChannels)} <RefreshEpg
                                    queryClient={queryClient}/></p>
                        </CardHeader>
                        <CardBody>
                            <Grid container>
                                <GridItem xs={6}>
                                    <CustomInput
                                        autoFocus
                                        labelText="Enter Channel Name..."
                                        id="selected-channel"
                                        onChange={e => {
                                            setChannelFilter(e.target.value);
                                        }}
                                        formControlProps={{
                                            fullWidth: true
                                        }}
                                    />
                                    <FormControlLabel
                                        label="Display All Channels"
                                        control={
                                            <Checkbox
                                                checked={maxChannels === MAX_CHANNELS_TO_DISPLAY}
                                                onChange={e => {
                                                    if (e.target.checked) {
                                                        setMaxChannels(MAX_CHANNELS_TO_DISPLAY);
                                                    } else {
                                                        setMaxChannels(DEFAULT_CHANNELS_TO_DISPLAY);
                                                    }
                                                }}
                                            />
                                        }
                                    />
                                </GridItem>
                            </Grid>
                            <Grid container>
                                <GridItem xs={12} sm={12} md={12}>
                                    {EPGCurrentProgramsGrid(selectedChannels, maxChannels, changePlayerUrl, authState, channel2ProgramMap, classes)}
                                </GridItem>
                            </Grid>
                        </CardBody>
                    </Card>
                </GridItem>
            </Grid>
        </div>
    );
}
