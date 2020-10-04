import React, {useEffect, useState} from "react";
// @material-ui/core components
import {makeStyles} from "@material-ui/core/styles";
// core components
import GridItem from "components/Grid/GridItem.js";
import GridContainer from "components/Grid/GridContainer.js";
import Table from "components/Table/Table.js";
import Card from "components/Card/Card.js";
import CardHeader from "components/Card/CardHeader.js";
import CardBody from "components/Card/CardBody.js";
import api from "../../service/api";
import {useOktaAuth} from "@okta/okta-react";
import WebActions from "./WebActions";
import styles from "assets/jss/material-dashboard-react/components/tasksStyle.js";
import CustomInput from "../CustomInput/CustomInput";
import Button from "../CustomButtons/Button";
import Search from "@material-ui/icons/Search";


/*
const styles = {
    cardCategoryWhite: {
        "&,& a,& a:hover,& a:focus": {
            color: "rgba(255,255,255,.62)",
            margin: "0",
            fontSize: "14px",
            marginTop: "0",
            marginBottom: "0"
        },
        "& a,& a:hover,& a:focus": {
            color: "#FFFFFF"
        }
    },
    cardTitleWhite: {
        color: "#FFFFFF",
        marginTop: "0px",
        minHeight: "auto",
        fontWeight: "300",
        fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
        marginBottom: "3px",
        textDecoration: "none",
        "& small": {
            color: "#777",
            fontSize: "65%",
            fontWeight: "400",
            lineHeight: "1"
        }
    }
};
*/

const useStyles = makeStyles(styles);

const SearchWrapper = (props) => {
    const classes = props && props.classes || {};
    return <div className={classes.searchWrapper}>
        <CustomInput
            formControlProps={{
                className: classes.margin + " " + classes.search
            }}
            inputProps={{
                placeholder: "Search channel name",
                inputProps: {
                    "aria-label": "Search"
                }
            }}
        />
        <Button color="white" aria-label="edit" justIcon round>
            <Search/>
        </Button>
    </div>;
}


export default function WebPage() {
    const classes = useStyles();
    const [channels, setChannels] = useState(null);
    const {authState} = useOktaAuth();

    useEffect(() => {
        if (authState.isAuthenticated) {
            api.fetchWebChannels(authState)
                .then(channelList => setChannels(channelList
                    .map((channel, index) => {
                        const {channel_title, channel_description, channel_name} = channel;
                        return Object.values({
                                index: index + 1,
                                channel_title,
                                actions: WebActions(classes, {channel_name, channel_title}, authState),
                                channel_description,
                            }
                        )
                    })
                ));
        }
    }, [authState]);

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
                        <SearchWrapper/>
                        <Table
                            tableHeaderColor="success"
                            tableHead={["No", "Name", "Actions", "Description"]}
                            tableData={channels}
                        />
                    </CardBody>
                </Card>
            </GridItem>
        </GridContainer>
    );
}
