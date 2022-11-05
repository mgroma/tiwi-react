import {useOktaAuth} from "@okta/okta-react";
import React from "react";
import {calculateDeltaTime, fromlist, recordProgrom, toDate, toTime} from "./EPGDataUtils";
import {Autocomplete, createFilterOptions} from "@mui/material";
import {Link, styled, TextField} from "@material-ui/core";
import {makeStyles} from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";
import Paper from "@material-ui/core/Paper";
import {grayColor} from "../../assets/jss/material-dashboard-react";
import {red, green} from "@material-ui/core/colors";

export const styles = {
    container: {
        padding: 5,
        width: "98%",
        border: "0",
    },
    title: {
        fontSize: 18,
    },
    description: {
        fontSize: 11,
        color: grayColor[1],
    },
    details: {
        fontSize: 13,
        fontWeight: "bold",
        color: grayColor[1],
        borderBottom: "1px solid " + grayColor[5]
    },
}

const useStyles = makeStyles(styles);

function getChannel(channels, channelId) {
    return channels.find(item => item.id === channelId)
}

const Item = ({backgroundColor = "#eee", textAlign = 'right'}) => styled(Paper)(({theme}) => ({
    // backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
    backgroundColor: backgroundColor,
    ...theme.typography.body2,
    padding: theme.spacing(1),
    textAlign: textAlign,
    color: theme.palette.text.secondary,
}));

function getBackgroundColorFor(deltaTime) {
    const deltaHours = deltaTime.asHours()
    let color = green[50]
    if (0 > deltaHours) color = red[200];
    else if (1 > deltaHours) color = green[500];
    else if (2 > deltaHours) color = green[400];
    else if (4 > deltaHours) color = green[300];
    else if (8 > deltaHours) color = green[200];
    else if (16 > deltaHours) color = green[100];
    return color
}

const ItemColored = props => {
    const {deltaTime} = props
    const deltaHours = deltaTime && deltaTime.asHours()
    const message = deltaHours > 0 ? `in ${deltaTime.humanize()}` : `${deltaTime && deltaTime.humanize()} ago`
    const RenderItem = Item({backgroundColor: getBackgroundColorFor(deltaTime)})
    return (<RenderItem>
            {message}
        </RenderItem>
    )
}

export function EPGProgramHeader({classes, authState, channels, item}) {
    return <>
        <Link
            className={classes.title}
            onClick={(event) => recordProgrom(authState, getChannel(channels, item.channel), item)}
        >{fromlist(item.titles)}</Link>
        <div className={classes.description}>
            {fromlist(item.descriptions)}
        </div>
    </>;
}

export function EPGProgramTimes(item) {
    return <span>{` [${toDate(item.start)} ${toTime(item.start)}-${toTime(item.stop)}]`}</span>;
}

export function EPGProgramFooter(classes, item) {
    return <div className={classes.details}>{item.channel} -
        {EPGProgramTimes(item)}
    </div>;
}

export default function EPGProgramsAutocomplete({channels, programs}) {
    const classes = useStyles()
    const {authState} = useOktaAuth();
    const calculateDeltaTimeHO = calculateDeltaTime()
    const programsSorted = programs ? programs.sort((a, b) => a.start - b.start) : []
    const defaultProps = {
        options: programsSorted,
        getOptionLabel: item => item && item.titles ? `[${toDate(item.start)} ${toTime(item.start)}-${toTime(item.stop)}] ${item.channel}: ${fromlist(item.titles)}` : ''
    }
    const filterOptions = createFilterOptions({
        limit: 45,
    });
    return (
        <>
            <Autocomplete
                {...defaultProps}
                autoComplete
                filterOptions={filterOptions}
                renderInput={(params) => <TextField {...params} label={'Enter program or channel name...'}/>}
                renderOption={(props, item) => {
                    const deltaTime = calculateDeltaTimeHO(item);
                    const ItemDetails = Item({textAlign: 'left'})
                    return (
                        <div
                            className={classes.container}
                        >
                            <Grid container spacing={1}>
                                <Grid item xs={10}>
                                    {EPGProgramHeader({classes, authState, channels, item})}
                                </Grid>
                                <Grid item xs={2}
                                >
                                    <ItemColored deltaTime={deltaTime}/>
                                </Grid>
                                <Grid item xs={12}>
                                    {EPGProgramFooter(classes, item)}
                                </Grid>
                            </Grid>
                        </div>
                    );
                }}

            />
        </>
    );
}
