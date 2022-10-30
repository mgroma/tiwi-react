import React from "react";
// @material-ui/core components
import {makeStyles} from "@material-ui/core/styles";
// core components
import GridItem from "components/Grid/GridItem.js";
import Card from "components/Card/Card.js";
import CardHeader from "components/Card/CardHeader.js";
import CardBody from "components/Card/CardBody.js";

import {Box, Grid, styled, Tooltip} from "@material-ui/core";
import {Typography} from "@mui/material";
import {useSelectedEPGChannel} from "./useEPGData";
import CustomInput from "../CustomInput/CustomInput";
import {toTime} from "./EPGDataUtils";
import {EPGProgramHeader} from "./EPGProgramsAutocomplete";
import {grayColor} from "../../assets/jss/material-dashboard-react";
import {useOktaAuth} from "@okta/okta-react";

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


const Item = styled('div')(({theme}) => ({
    backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
    ...theme.typography.body2,
    padding: theme.spacing(1),
    textAlign: 'left',
    // borderTop: "1px solid " + grayColor[10],
    border: "1px solid " + grayColor[10],
    // marginTop: 10,
    color: theme.palette.text.secondary,
    minHeight: '4rem',
}));

const EpgChannel = ({channel}) => {
    return (<Grid item xs={12} md={1}><Item>
        <Tooltip title={channel.name}>
            <img
                src={channel.logo}
                style={{maxWidth: '5rem', maxHeight: '3rem'}}
                loading={"lazy"}
                onClick={(event) => alert(JSON.stringify(channel))}
            /></Tooltip></Item></Grid>);
}
const EpgItem = ({children, width, item}) => {
    let duration = (item.stop-item.start)/(1000*60);
    return (<div style={{width: width*110}}><Item><Typography
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

function EPGProgramDetails({programs, classes, authState, channels}) {
    return <>
        {
            programs &&
            programs
                .filter((item, index) => index < 3)
                .map((program, key) => (
                    <EpgItem width={3} key={key} item={program}>
                        <EPGProgramHeader
                            item={program}
                            classes={classes}
                            authState={authState}
                            channels={channels}
                        />
                        <div className={classes.description}>
                            {toTime(program.start)}-{toTime(program.stop)}
                        </div>
                    </EpgItem>
                ))
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


export default function EPG() {
    const classes = useStyles();
    const {authState} = useOktaAuth();
    const {setChannelFilter, selectedChannels} = useSelectedEPGChannel('canal');
    const channel2ProgramMap = toChannel2ProgramMap(selectedChannels.data)

    return (
        <div>
            <Grid>
                <GridItem xs={12} sm={12} md={12}>
                    <Card>
                        <CardHeader color="primary">
                            <h4 className={classes.cardTitleWhite}>EPG Grid</h4>
                            <p className={classes.cardCategoryWhite}>TV Listing</p>
                        </CardHeader>
                        <CardBody>
                            <Grid container>
                                <GridItem xs={6}>
                                    <CustomInput
                                        labelText="Enter Channel Name..."
                                        id="selected-channel"
                                        onChange={e => {
                                            setChannelFilter(e.target.value);
                                        }}
                                        formControlProps={{
                                            fullWidth: true
                                        }}
                                    />
                                </GridItem>
                            </Grid>
                            <Grid container>
                                <GridItem xs={12} sm={12} md={12}>
                                    <Box sx={{flexGrow: 1}}>
                                        {
                                            selectedChannels.data
                                            && selectedChannels.data.channels
                                            && selectedChannels.data.channels.map((channel, key) => {
                                                return (
                                                    <Grid container key={key}>
                                                        <EpgChannel channel={channel}/>


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
                                    </Box>
                                </GridItem>
                            </Grid>
                        </CardBody>
                    </Card>
                </GridItem>
            </Grid>
        </div>
    );
}
