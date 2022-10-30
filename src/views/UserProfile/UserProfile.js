import React from "react";
// @material-ui/core components
import {makeStyles} from "@material-ui/core/styles";
import InputLabel from "@material-ui/core/InputLabel";
// core components
import GridItem from "components/Grid/GridItem.js";
import Card from "components/Card/Card.js";
import CardHeader from "components/Card/CardHeader.js";
import CardBody from "components/Card/CardBody.js";

import {Box, Grid, Paper, styled} from "@material-ui/core";
import {Typography} from "@mui/material";

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
    }
};

const useStyles = makeStyles(styles);


const Item = styled(Paper)(({theme}) => ({
    backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
    ...theme.typography.body2,
    padding: theme.spacing(1),
    textAlign: 'center',
    marginTop: 10,
    color: theme.palette.text.secondary,
}));

const EpgChannel = ({children}) => {
    return (<Grid item xs={2}><Item><Typography
        noWrap>{children}</Typography></Item></Grid>);
}
const EpgItem = ({children, width}) => {
    return (<Grid item xs={width}><Item><Typography
        noWrap>{children}</Typography></Item></Grid>);
}

export default function UserProfile() {
    const classes = useStyles();
    return (
        <div>
        </div>
    );
}
