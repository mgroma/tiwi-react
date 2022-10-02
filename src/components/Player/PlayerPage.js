/*eslint-disable*/
import React from "react";
// @material-ui/core components
import {makeStyles} from "@material-ui/core/styles";
// core components
import GridItem from "components/Grid/GridItem.js";
import GridContainer from "components/Grid/GridContainer.js";
import Card from "components/Card/Card.js";
import CardHeader from "components/Card/CardHeader.js";
import CardBody from "components/Card/CardBody.js";

import styles from "assets/jss/material-dashboard-react/views/iconsStyle.js";
import ReactHlsPlayer from "react-hls-player";

const useStyles = makeStyles(styles);
const HOSTNAME = window.location.protocol + '//' + window.location.hostname + ':8000/';


export default function PlayerPage(props) {
    const {match: {params}} = props;
    const classes = useStyles();
    return (
        <GridContainer>
            <GridItem xs={12} sm={12} md={12}>
                <Card plain>
                    <CardHeader plain color="primary">
                        <h4 className={classes.cardTitleWhite}>HLS Player</h4>
                    </CardHeader>
                    <CardBody>
                        <Player {...params} />
                    </CardBody>
                </Card>
            </GridItem>
        </GridContainer>

    )
}


const getPlaylist = params => {
    const {file, url} = params;
    if (url) {
        return decodeURIComponent(url);
    }
    if (file) {
        return file === ':file' ? "" : `${HOSTNAME}${file}.m3u8`;
    }
    return ""
}

export function Player(params) {
    const playlist = getPlaylist(params)
    return (
        <div
            // className={classes.iframe}
        >
            {playlist !== "" && <ReactHlsPlayer
                url={playlist}
                // url={HOSTNAME + "/EUROSPORT 2 - 2020-10-01T06:32:26-04:00.ts.m3u8"}
                // url='https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u8'
                autoplay={false}
                controls={true}
                width='100%'
                height='auto'
            />}
            {(!playlist) &&
            <div>no video selected</div>
            }
        </div>
    );
}
