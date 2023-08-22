import {useOktaAuth} from "@okta/okta-react";
import React, {useEffect} from "react";
import {calculateDeltaTime, fromlist, fromlist2, recordProgrom, toDate, toTime} from "./EPGDataUtils";
import {Autocomplete, createFilterOptions, Tooltip} from "@mui/material";
import {Link, styled, TextField} from "@material-ui/core";
import {makeStyles} from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";
import Paper from "@material-ui/core/Paper";
import {grayColor} from "../../assets/jss/material-dashboard-react";
import {red, green} from "@material-ui/core/colors";
import {useHistory} from "react-router-dom";
import {useQueryClient} from "react-query";

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

function getDescription(itemDescription, actors, directors, ratings) {
    const actorsContent = actors ? `actors: [${actors}]` : ''
    const directorsContent = directors ? `director: [${directors}]` : ''
    const ratingsContent = ratings ? `ratings: [${ratings}]` : ''
    return <>
        {itemDescription}
        {actorsContent}
        {directorsContent}
        {ratingsContent}
    </>;
}

export function EPGProgramHeader({classes, authState, channels, item}) {
    const itemDescription = fromlist(item.descriptions);
    const itemTitle = fromlist(item.titles);
    const directors = fromlist(item.directors);
    const actors = fromlist(item.actors);
    const ratings = fromlist2(item.ratings);
    const ratingsContent = ratings ? `ratings: ${ratings}` : ''
    const actorsContent = actors ? `actors: ${actors};` : ''
    const directorsContent = directors ? `director: ${directors};` : '';
    // const [scheduled, setScheduled] = React.useState(false);
/*
    const queryClient = useQueryClient()
    useEffect(() => {
        queryClient.invalidateQueries({queryKey: ['selectedChannels']})
        // if (scheduled) {
        //     recordProgrom(authState, getChannel(channels, item.channel), item)
        // }
    }, [scheduled]);
*/

    return <>
        <Link
            className={classes.title}
            onClick={(event) => {
                if (!item.isScheduled) {
                    recordProgrom(authState, getChannel(channels, item.channel), item)
                }
                // setScheduled(!scheduled)
            }}
        >{itemTitle}</Link>
        <Tooltip
            title={`${itemTitle} \n desc: ${itemDescription} \n${actorsContent}${directorsContent}${ratingsContent}`}>
            <div className={classes.description}>
                {getDescription(itemDescription, actors, directors, ratings)}
            </div>
        </Tooltip>
    </>;
}

export function EPGProgramTimes(item) {
    return <span>{` [${toDate(item.start)} ${toTime(item.start)}-${toTime(item.stop)}]`}</span>;
}

export function EPGProgramFooter(classes, item, history) {
    return <div className={classes.details}>
        <span
            onClick={() =>
                history.push('/admin/epgProgram/' + item.channel)
            }
        >{item.channel}</span> -
        {EPGProgramTimes(item)}
    </div>;
}

export default function EPGProgramsAutocomplete({channels, programs}) {
    const classes = useStyles()
    const {authState} = useOktaAuth();
    const history = useHistory()
    const calculateDeltaTimeHO = calculateDeltaTime()
    const programsSorted = programs ? programs.sort((a, b) => a.start - b.start) : []
    const defaultProps = {
        options: programsSorted,
        getOptionLabel: item => item && item.titles ? `[${toDate(item.start)} ${toTime(item.start)}-${toTime(item.stop)}] ${item.channel}: ${fromlist(item.titles)} - ${fromlist(item.descriptions)} - ${fromlist(item.actors)} - ${fromlist(item.directors)}` : ''
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
                                    {EPGProgramFooter(classes, item, history)}
                                </Grid>
                            </Grid>
                        </div>
                    );
                }}

            />
        </>
    );
}
