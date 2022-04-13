import * as React from 'react';
import {useEffect, useState} from "react";
import {Button, Table, TableCell, TableRow} from "@material-ui/core";

export const MyFacebook = (props) => {
    const [status, setStatus] = useState('pre-init')
    const [name, setName] = useState('dont know yet')
    const [activity, setActivity] = useState('no activity')
    const [authResponse, setAuthResponse] = useState(null)
    useEffect(() => {
        /* eslint-disable no-undef */
        FB.getLoginStatus(function(response) {   // Called after the JS SDK has been initialized.
            setAuthResponse(response)
        /* eslint-disable no-undef */
            FB.api('/me', function(response) {
                console.log('Successful login for: ' + response.name);
                setName(response.name)
            })
        });
    }, []);
    useEffect(() => {
        if (authResponse) {
            /* eslint-disable no-undef */
            FB.api(`/${authResponse.authResponse.userID}/posts?access_token=${authResponse.authResponse.accessToken}`, function(response) {
                // console.log('Successful login for: ' + response.name);
                setActivity(response)
            })

        }
    },[authResponse])
    const checkLoginState = () => {
        /* eslint-disable no-undef */
        FB.getLoginStatus(function(response) {   // See the onlogin handler
            setStatus(response)
        });
    }
    const loginToFB = () => {
        FB.login(function(response) {
            // debugger
            // handle the response
        }, {scope: 'public_profile,email,user_likes,user_posts'});
    }

    return (
        <div>
{/*
            <fb:login-button scope="public_profile,email" onlogin="checkLoginState();">
            </fb:login-button>
*/}
            <Button className="fb-login-button" onClick={loginToFB}>Login to FB</Button>
            <div onClick={loginToFB} className="fb-login-button" data-width="" data-size="small"
                 data-button-type="continue_with" data-layout="default"
                 data-auto-logout-link="false" data-use-continue-as="false"></div>
            Name: [{name}]
            <br/>
            Status: [{status}]
            <br/>
            { activity && activity.data &&
                <Table>
                    {
                        activity.data.filter(item => item.message).map(item => (<TableRow>
                            <TableCell>{item.created_time}</TableCell>
                            <TableCell>{item.message}</TableCell>
                        </TableRow>))
                    }

                </Table>
                }
        </div>
    );
};
