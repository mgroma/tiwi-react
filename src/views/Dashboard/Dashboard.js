import React from "react";
// react plugin for creating charts
// @material-ui/core
import {makeStyles} from "@material-ui/core/styles";
import Icon from "@material-ui/core/Icon";
// @material-ui/icons
import Warning from "@material-ui/icons/Warning";
import LocalOffer from "@material-ui/icons/LocalOffer";
import Update from "@material-ui/icons/Update";
import Accessibility from "@material-ui/icons/Accessibility";
import BugReport from "@material-ui/icons/BugReport";
import Code from "@material-ui/icons/Code";
import Cloud from "@material-ui/icons/Cloud";
// core components
import GridItem from "components/Grid/GridItem.js";
import GridContainer from "components/Grid/GridContainer.js";
import Tasks from "components/Tasks/Tasks.js";
import CustomTabs from "components/CustomTabs/CustomTabs.js";
import Danger from "components/Typography/Danger.js";
import Card from "components/Card/Card.js";
import CardHeader from "components/Card/CardHeader.js";
import CardIcon from "components/Card/CardIcon.js";
import CardFooter from "components/Card/CardFooter.js";

import {server} from "variables/general.js";

import styles from "assets/jss/material-dashboard-react/views/dashboardStyle.js";
import WebList from "../../components/Web/WebList";
import ScheduleList from "../../components/Lists/ScheduleList";
import RecordingList from "../../components/Recordings/RecordingList";
import {Refresh} from "@material-ui/icons";

const useStyles = makeStyles(styles);


export default function Dashboard() {
    const classes = useStyles();
    return (
        <div>
            <GridContainer>
                <GridItem xs={12} sm={6} md={4}>
                    <Card>
                        <CardHeader color="warning" stats icon>
                            <CardIcon color="warning">
                                <Icon>content_copy</Icon>
                            </CardIcon>
                            <p className={classes.cardCategory}>Interestings</p>
                            <h3 className={classes.cardTitle}>
                                49/50 <small>GB</small>
                            </h3>
                        </CardHeader>
                        <CardFooter stats>
                            <div className={classes.stats}>
                                <Danger>
                                    <Warning/>
                                </Danger>
                                <a href="#pablo" onClick={e => e.preventDefault()}>
                                    Get more space
                                </a>
                            </div>
                        </CardFooter>
                    </Card>
                </GridItem>
                <GridItem xs={12} sm={6} md={4}>
                    <Card>
                        <CardHeader color="primary" stats icon>
                            <CardIcon color="primary">
                                <Icon>info_outline</Icon>
                            </CardIcon>
                            <p className={classes.cardCategory}>Recordings</p>
                            <h3 className={classes.cardTitle}>75</h3>
                        </CardHeader>
                        <CardFooter stats>
                            <div className={classes.stats}>
                                <LocalOffer/>
                                Tracked from Github
                            </div>
                        </CardFooter>
                    </Card>
                </GridItem>
                <GridItem xs={12} sm={6} md={4}>
                    <Card>
                        <CardHeader color="success" stats icon>
                            <CardIcon color="success">
                                <Accessibility/>
                            </CardIcon>
                            <p className={classes.cardCategory}>What's On Now</p>
                            <h3 className={classes.cardTitle}>+245</h3>
                        </CardHeader>
                        <CardFooter stats>
                            <div className={classes.stats}>
                                <Update/>
                                Just Updated
                            </div>
                        </CardFooter>
                    </Card>
                </GridItem>
            </GridContainer>
            <span>
            <GridContainer>
            <GridItem xs={12} sm={12} md={6}>
            <CustomTabs
                title="What's On Now:"
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
                ]}
            />
            </GridItem>
            <GridItem xs={12} sm={12} md={6}>
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
                    {
                        tabName: "Server",
                        tabIcon: Refresh,
                        tabContent: (
                            <Tasks
                                checkedIndexes={[1]}
                                tasksIndexes={[0, 1, 2]}
                                tasks={server}
                            />
                        )
                    }
                ]}
            />
            </GridItem>
            </GridContainer>
            </span>
        </div>
    );
}
