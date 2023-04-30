/*eslint-disable*/
import React, {memo, useState} from "react";
// @material-ui/core components
import {makeStyles} from "@material-ui/core/styles";
// core components
import GridItem from "components/Grid/GridItem.js";
import GridContainer from "components/Grid/GridContainer.js";
import Card from "components/Card/Card.js";
import CardHeader from "components/Card/CardHeader.js";
import CardBody from "components/Card/CardBody.js";

import styles from "assets/jss/material-dashboard-react/views/iconsStyle.js";
import {createLogger} from "logger";
import EPGList from "./EPGChannels";
import {useParams} from "react-router-dom";

const useStyles = makeStyles(styles);

const logger = createLogger()

function TelemanList(props) {
    const params = useParams()
    const classes = useStyles();
    return (
        <GridContainer>
            <GridItem xs={12} sm={12} md={12}>
                <Card plain>
                    <CardHeader plain color="primary">
                        <h4 className={classes.cardTitleWhite}>Tv Guide</h4>
                        <p className={classes.cardCategoryWhite}>
                            EPG
                        </p>
                    </CardHeader>
                    <CardBody>
                        <EPGList {...params}/>
                    </CardBody>
                </Card>
            </GridItem>
        </GridContainer>
    );
}
export default memo(TelemanList)
