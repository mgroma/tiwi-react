/*!

=========================================================
* Material Dashboard React - v1.9.0
=========================================================

* Product Page: https://www.creative-tim.com/product/material-dashboard-react
* Copyright 2020 Creative Tim (https://www.creative-tim.com)
* Licensed under MIT (https://github.com/creativetimofficial/material-dashboard-react/blob/master/LICENSE.md)

* Coded by Creative Tim

=========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

*/
import React from "react";
import { createRoot } from 'react-dom/client';
import {createBrowserHistory} from "history";
import {Router, Route, Switch, Redirect} from "react-router-dom";
import {Security, LoginCallback} from '@okta/okta-react';
import { OktaAuth, toRelativeUrl } from '@okta/okta-auth-js';
import config from './config';
import Login from './views/Login/Login';


// core components
import Admin from "layouts/Admin.js";

import "assets/css/material-dashboard-react.css?v=1.9.0";
import {RecordingSearchContextProvider} from "./context/RecordingSearchContext";
import { QueryClient, QueryClientProvider } from 'react-query'
const hist = createBrowserHistory();
const customAuthHandler = () => {
    hist.push('/login')
}
const queryClient = new QueryClient()
const restoreOriginalUri = async (_oktaAuth, originalUri) => {
    hist.replace(toRelativeUrl(originalUri, window.location.origin));
};

const oktaAuth = new OktaAuth(config.oidc);
const container = document.getElementById('root');
const root = createRoot(container); // createRoot(container!) if you use TypeScript
root.render(
    <Router history={hist}>
        <QueryClientProvider client={queryClient}>
        <RecordingSearchContextProvider>
        <Security
            onAuthRequired={customAuthHandler}
            oktaAuth={oktaAuth}
            restoreOriginalUri={restoreOriginalUri}
        >
            <Switch>
                <Route path="/admin" component={Admin}/>
                <Route path="/login" component={Login}/>
                <Route path="/callback" component={LoginCallback} />
                <Redirect from="/" to="/admin/dashboard"/>
            </Switch>
        </Security>
        </RecordingSearchContextProvider>
        </QueryClientProvider>
    </Router>
);
