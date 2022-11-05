import React from "react";
// @material-ui/core components
import {makeStyles} from "@material-ui/core/styles";
// @material-ui/icons
import Search from "@material-ui/icons/Search";
// core components
import CustomInput from "components/CustomInput/CustomInput.js";
import Button from "components/CustomButtons/Button.js";

import styles from "assets/jss/material-dashboard-react/components/headerLinksStyle.js";
import {useOktaAuth} from '@okta/okta-react';

const useStyles = makeStyles(styles);

export default function AdminNavbarLinks() {
    const {authState, oktaAuth} = useOktaAuth();
    const login = async () => oktaAuth.signInWithRedirect('/admin/login');
    const logout = async () => oktaAuth.signOut({postLogoutRedirectUri: window.location.origin + '/'});
    const [userInfo, setUserInfo] = React.useState(null);


    React.useEffect (() => {
        const updateUserInfo = async () => {
            if (authState.isAuthenticated && !userInfo) {
                setUserInfo(await oktaAuth.getUser());
            } else {
                setUserInfo(null);
            }
        }
        updateUserInfo();
    }, [authState, oktaAuth])

    const classes = useStyles();
    const [openNotification, setOpenNotification] = React.useState(null);
    const [openProfile, setOpenProfile] = React.useState(null);
    const handleClickNotification = event => {
        if (openNotification && openNotification.contains(event.target)) {
            setOpenNotification(null);
        } else {
            setOpenNotification(event.currentTarget);
        }
    };
    const handleCloseNotification = () => {
        setOpenNotification(null);
    };
    const handleClickProfile = event => {
        if (openProfile && openProfile.contains(event.target)) {
            setOpenProfile(null);
        } else {
            setOpenProfile(event.currentTarget);
        }
    };
    const handleCloseProfile = () => {
        setOpenProfile(null);
    };

    const SearchWrapper = () => {
        return <div className={classes.searchWrapper}>
            <CustomInput
                formControlProps={{
                    className: classes.margin + " " + classes.search
                }}
                inputProps={{
                    placeholder: "Search",
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

    return (
        <div>
            <SearchWrapper
            />
        </div>
    );
}
