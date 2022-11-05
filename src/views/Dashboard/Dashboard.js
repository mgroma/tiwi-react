import React from "react";
// react plugin for creating charts
// @material-ui/core
import {makeStyles} from "@material-ui/core/styles";
// @material-ui/icons
import Update from "@material-ui/icons/Update";
import BugReport from "@material-ui/icons/BugReport";
import Code from "@material-ui/icons/Code";
import Cloud from "@material-ui/icons/Cloud";
// core components
import GridItem from "components/Grid/GridItem.js";
import GridContainer from "components/Grid/GridContainer.js";
import CustomTabs from "components/CustomTabs/CustomTabs.js";
import Card from "components/Card/Card.js";
import CardHeader from "components/Card/CardHeader.js";
import CardIcon from "components/Card/CardIcon.js";
import CardFooter from "components/Card/CardFooter.js";


import styles from "assets/jss/material-dashboard-react/views/dashboardStyle.js";
import WebList from "../../components/Web/WebList";
import ScheduleList from "../../components/Lists/ScheduleList";
import RecordingList from "../../components/Recordings/RecordingList";
import {useRecordingSearch} from "../../context/RecordingSearchContext";
import EPGProgramsAutocomplete from "../../components/Teleman/EPGProgramsAutocomplete";
import {useSelectedEPGChannel} from "../../components/Teleman/useEPGData";
import {LiveTv} from "@material-ui/icons";
import CardBody from "../../components/Card/CardBody";

const useStyles = makeStyles(styles);


export default function Dashboard() {
    const classes = useStyles();
    const {value} = useRecordingSearch();
    const {selectedChannels} = useSelectedEPGChannel();
    const channels = selectedChannels.data && selectedChannels.data.channels
    const programs = selectedChannels.data && selectedChannels.data.programs

    const recordingStatus = `[${value}]`;
    return (
        <div>
            <GridContainer>
                <GridItem xs={12} sm={12} md={12}>
                    <Card>
                        <CardHeader color="success" stats icon>
                            <CardIcon color="success">
                                <LiveTv/>
                            </CardIcon>
                            <p className={classes.cardCategory}>What's On Now</p>
                            <h3 className={classes.cardTitle}>{channels ? channels.length : 'fetching...'}</h3>
                        </CardHeader>
                        <CardBody>
                            <EPGProgramsAutocomplete channels={channels} programs={programs}/>
                        </CardBody>
                        <CardFooter stats>
                            <div className={classes.stats}>
                                <Update/>
                            </div>
                        </CardFooter>
                    </Card>
                </GridItem>
            </GridContainer>
            <span>
            <GridContainer>
            <GridItem xs={12} sm={12} md={5}>
            <CustomTabs
                title=""
                headerColor="success"
                tabs={[
                    {
                        tabName: "Sport",
                        tabIcon: BugReport,
                        tabContent: (
                            <WebList
                                keyword={"sport"}
                            />
                        )
                    },
                    {
                        tabName: "Film",
                        tabIcon: BugReport,
                        tabContent: (
                            <WebList
                                keyword={"film"}
                            />
                        )
                    },
                    {
                        tabName: "Canal+",
                        tabIcon: Cloud,
                        tabContent: (
                            <WebList
                                keyword={"canal"}
                            />
                        )
                    },
                    {
                        tabName: "HBO",
                        tabIcon: Cloud,
                        tabContent: (
                            <WebList
                                keyword={"hbo"}
                            />
                        )
                    },
                    {
                        tabName: "Polsat",
                        tabIcon: Cloud,
                        tabContent: (
                            <WebList
                                keyword={"polsat"}
                            />
                        )
                    },
                ]}
            />
            </GridItem>
            <GridItem xs={12} sm={12} md={7}>
            <CustomTabs
                title="Recordings:"
                headerColor="primary"
                tabs={[
                    {
                        tabName: "Jobs",
                        tabIcon: BugReport,
                        tabContent: (
                            <ScheduleList
                            />
                        )
                    },
                    {
                        tabName: "Recordings",
                        tabIcon: Code,
                        tabContent: (
                            <RecordingList
                                listLength={10}
                            />
                        )
                    },
                ]}
            />
            </GridItem>
            </GridContainer>
            </span>
        </div>
    );
}
