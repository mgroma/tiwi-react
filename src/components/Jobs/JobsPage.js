// @flow
import * as React from 'react';
import GridContainer from "../Grid/GridContainer";
import GridItem from "../Grid/GridItem";
import Card from "../Card/Card";
import CardHeader from "../Card/CardHeader";
import CardBody from "../Card/CardBody";
import { makeStyles } from "@material-ui/core/styles";

import styles from "assets/jss/material-dashboard-react/views/jobsStyle.js";
import EPGGrid from "./EPGGrid";
const useStyles = makeStyles(styles);


const JobsPageold = (props) => {
    const classes = useStyles();
    return (
        <GridContainer>
            <GridItem xs={12} sm={12} md={12}>
                <Card plain>
                    <CardHeader plain color="primary">
                        <h4 className={classes.cardTitleWhite}>Jobs</h4>
                        <p className={classes.cardCategoryWhite}>Recording Jobs</p>
                    </CardHeader>
                    <CardBody>
                        Jobs Page
                        <ul>
                            <li> input: list of programs (name, startTime, endTime)</li>
                            <li> behavior</li>
                            <li>sort, oldest first</li>
                            <li>display time grid timelines for each program in parallel lines</li>
                            <li>display days, hours and minutes</li>
                            <li>display days, hours and minutes</li>
                            <li>start with the beginning of the earliest jobs</li>
                            <li>end with the end of the last jobs</li>
                            <li>scale</li>
                            <li>highlight overlapping jobs</li>
                            <li>grey out past jobs</li>
                            <li>red out failed jobs</li>
                            <li>green out jobs in progress</li>
                            <li>x screen offset = startTime- beginnig  * / </li>
                        </ul>
                    </CardBody>
                </Card>
            </GridItem>
        </GridContainer>
    );

};
const JobsPage = () => {
  return <EPGGrid />
}
export default JobsPage
