import React, {useEffect} from "react";
// @material-ui/core components
import {makeStyles} from "@material-ui/core/styles";
// core components
import GridItem from "components/Grid/GridItem.js";
import GridContainer from "components/Grid/GridContainer.js";
import Card from "components/Card/Card.js";
import CardHeader from "components/Card/CardHeader.js";
import CardBody from "components/Card/CardBody.js";

import config from '../../config';
import * as OktaSignIn from '@okta/okta-signin-widget';
import '@okta/okta-signin-widget/dist/css/okta-sign-in.min.css';


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

};

const useStyles = makeStyles(styles);

export default function Login() {
    useEffect(() => {
        const {pkce, issuer, clientId, redirectUri, scopes} = config.oidc;
        const widget = new OktaSignIn({
            /**
             * Note: when using the Sign-In Widget for an OIDC flow, it still
             * needs to be configured with the base URL for your Okta Org. Here
             * we derive it from the given issuer for convenience.
             */
            baseUrl: issuer.split('/oauth2')[0],
            clientId,
            redirectUri,
            idps: [
                {type: 'GOOGLE', id: '0oaaix1twko0jyKik0g1'},
                {type: 'FACEBOOK', id: '0oar25ZnMM5LrpY1O0g2'},
                {type: 'APPLE', id: '0oaz2emOZGUKjuZwX0g3'},
                {type: 'MICROSOFT', id: '0oaaix1twko0jyKik0g4'},
                {type: 'LINKEDIN', id: '0oaaix1twko0jyKik0g5'},
                {id: '0oabds23xM3ssMjosl0g5', text: 'Login with Cigna', className: 'with-joe' }
            ],
            logo: '/video-camera-icon.png',
            colors: {
                brand: '#9c27b0'
            },
            i18n: {
                en: {
                    'primaryauth.title': 'Sign in to Tiwi Player & Company',
                },
            },
            authParams: {
                pkce,
                issuer,
                display: 'page',
                responseMode: pkce ? 'query' : 'fragment',
                scopes,
            },
            features: {
                selfServiceUnlock: true,
                registration: true,
                showPasswordToggleOnSignInPage: true,
                autoPush: true,

            }
        });

        widget.renderEl(
            {el: '#sign-in-widget'},
            () => {
                /**
                 * In this flow, the success handler will not be called beacuse we redirect
                 * to the Okta org for the authentication workflow.
                 */
            },
            (err) => {
                console.log(`error occured in login: ${err}`);
                throw err;
            },
        );
    }, []);

    const classes = useStyles();
    return (
        <div>
            <GridContainer>
                <GridItem xs={12} sm={12} md={8}>
                    <Card>
                        <CardHeader color="primary">
                            <h4 className={classes.cardTitleWhite}>Login</h4>
                            <p className={classes.cardCategoryWhite}>Enter you credentials</p>
                        </CardHeader>
                        <CardBody>
                            <div id="sign-in-widget"/>
                        </CardBody>
                        }
                    </Card>
                </GridItem>
            </GridContainer>
        </div>
    );
}
