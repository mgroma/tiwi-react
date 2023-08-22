import React from 'react';
import {makeStyles} from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import {Graph} from "./Graph";
import {filterOutPastPrograms, useSelectedEPGChannel} from "../Teleman/useEPGData";
import {EPGProgramTimes} from "../Teleman/EPGProgramsAutocomplete";
import {fromlist} from "../Teleman/EPGDataUtils";
import {useHistory, useParams} from "react-router-dom";
import {Button} from "@material-ui/core";
import ThreadProgressBar from "../Teleman/ThreadPool";
import SREGrid from "./SREGrid";
import BardList from "./BardList";
import Chatgptlist from "./Chatgptlist";
import {DependencyGraph, DependencyGraphGpt} from "./TreeGraph";
import * as os from 'os';

const useStyles = makeStyles((theme) => ({
    root: {
        flexGrow: 1,
    },
    paper: {
        padding: theme.spacing(2),
        textAlign: 'center',
        color: theme.palette.text.secondary,
    },
    timeline: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: theme.spacing(2)
    },
    timelineItem: {
        display: 'flex',
        alignItems: 'center',
    },
    timelineTime: {
        marginRight: theme.spacing(1),
    }
}));

const channels = [{
    name: 'Channel 1',
    programs: [{name: 'Program 1', startTime: '10:00', endTime: '11:00'}, {
        name: 'Program 2',
        startTime: '11:00',
        endTime: '12:00'
    }, {name: 'Program 3', startTime: '12:00', endTime: '13:00'},]
},
    {
        name: 'Channel 2',
        programs: [
            {name: 'Program A', startTime: '10:00', endTime: '11:00'},
            {name: 'Program B', startTime: '11:00', endTime: '12:00'},
            {name: 'Program C', startTime: '12:00', endTime: '13:00'},
        ]
    },
    {
        name: 'Channel 3',
        programs: [
            {name: 'Program X', startTime: '10:00', endTime: '11:00'},
            {name: 'Program Y', startTime: '11:00', endTime: '12:00'},
            {name: 'Program Z', startTime: '12:00', endTime: '13:00'},
        ]
    },
];


export default function EPGGrid() {
    const {program} = useParams()
    const classes = useStyles();

    function GPTGrid() {
        return <Grid container spacing={3}>
            {channels.map(channel => (
                <Grid item xs={12} key={channel.name}>
                    <Paper className={classes.paper}>
                        <Typography variant="h5">{channel.name}</Typography>
                        <div className={classes.timeline}>
                            {channel.programs.map(program => (
                                <div className={classes.timelineItem} key={program.name}>
                                    <Typography
                                        className={classes.timelineTime}>{program.startTime} - {program.endTime}</Typography>
                                    <Typography>{program.name}</Typography>
                                </div>))
                            }
                        </div>
                    </Paper>
                </Grid>
            ))}
        </Grid>;
    }

    return (
        <div className={classes.root}>
            storage available =[{getComputerAvailableDiskSpace()}]
            {/*
            <Chatgptlist />
            <BardList />
*/}
            {/*<SREGrid/>*/}
            {/*<DependencyGraphGpt/>*/}
            <ThreadProgressBar/>
            {
                /*           <Graph/>
                           <GPTGrid />
                           <Timeline program={program}/>
               */}

        </div>)
}


function getEventsFor(channelName, programs) {
    return programs && programs
        .filter(item => item.channel === channelName)
        .filter(filterOutPastPrograms())
}

function Timeline({program}) {
    const history = useHistory()
    const {selectedChannels} = useSelectedEPGChannel();
    const programs = selectedChannels.data && selectedChannels.data.programs

    const events = getEventsFor(program || "CanalPlusFilm.pl", programs)
    if (!events) return (
        <div>nada</div>
    )
    // Sort the events array based on start time
    // events.sort((a, b) => a.start.localeCompare(b.start));

    // Find the start time of the first event
    const firstStartTime = events[0].start;
    return (
        <div style={{position: 'relative', height: '500px'}}>
            <Button onClick={() => history.push('/admin/epgList/')}>Back to EPG</Button>
            {events.map(event => {
                const offset = (event.start - firstStartTime) / 50000;
                return (
                    <div
                        key={event.id}
                        style={{
                            position: 'absolute',
                            top: `${offset}px`,
                            left: '15%',
                            // transform: 'translate(-50%, 0)',
                            border: '1px solid black',
                            padding: '5px',
                            backgroundColor: 'white',
                            zIndex: 1
                        }}
                    >
                        <div>{EPGProgramTimes(event)} {fromlist(event.titles)} : {offset}</div>
                    </div>
                );
            })}
        </div>
    );

    /*
        return (
            <div className="timeline">
                {events.map((event) => {
                    // Calculate the time delta between the event start time and the first start time
                    const timeDelta = getTimeDelta(firstStartTime, event.start);

                    // Calculate the vertical position of the event based on the time delta
                    const position = timeDelta * 10; // 10px per minute

                    return (
                        <div
                            key={event.name}
                            className="timeline-event"
                            style={{ top: position }}
                        >
                            <h3>{event.name}</h3>
                            <p>{formatTime(event.start)} - {formatTime(event.end)}</p>
                        </div>
                    );
                })}
            </div>
        );
    */
}

// Utility function to format the time as "HH:MM"
function formatTime(time) {
    const date = new Date(Date.parse(time));
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
}

// Utility function to calculate the time delta in minutes
function getTimeDelta(start1, start2) {
    const time1 = Date.parse(start1);
    const time2 = Date.parse(start2);
    const delta = Math.abs(time2 - time1);
    return Math.floor(delta / (1000 * 60));
}
// return local computer available disk space in MB
export const getComputerAvailableDiskSpace = () => {
    const freeSpaceInBytes = os.freemem();
    const freeSpaceInGB = (freeSpaceInBytes / (1024 ** 11)).toFixed(2);
    return freeSpaceInGB;

}
