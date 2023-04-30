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
// @material-ui/icons
import Dashboard from "@material-ui/icons/Dashboard";
import Person from "@material-ui/icons/Person";
import LibraryBooks from "@material-ui/icons/LibraryBooks";
import BubbleChart from "@material-ui/icons/BubbleChart";
import Notifications from "@material-ui/icons/Notifications";
// core components/views for Admin layout
import DashboardPage from "views/Dashboard/Dashboard.js";
import OldDashboardPage from "views/Dashboard/OldDashboard.js";
import Typography from "views/Typography/Typography.js";
import Icons from "views/Icons/Icons.js";
import NotificationsPage from "views/Notifications/Notifications.js";
import WebPage from "./components/Web/WebPage";
import RecordingsPage from "./components/Recordings/RecordingsPage";
import TelemanList from "./components/Teleman/TelemanList";
import PlayerPage from "./components/Player/PlayerPage";
import EPG from "./components/Teleman/EPG";
import JobsPage from "./components/Jobs/JobsPage";
import {EPGPrograms} from "./components/Teleman/EPGPrograms";

const dashboardRoutes = [
    {
        path: "/dashboard",
        name: "Dashboard",
        icon: Dashboard,
        component: DashboardPage,
        layout: "/admin",
        unsecure: true
    },
    {
        path: "/old-dashboard",
        name: "Old Dashboard",
        icon: Dashboard,
        component: OldDashboardPage,
        layout: "/admin",
        unsecure: true
    },
    {
        path: "/jobs/:program?",
        name: "Jobs",
        icon: "video_label",
        component: JobsPage,
        layout: "/admin",
        unsecure: true,
    },
    {
        path: "/watch",
        name: "Web.tv",
        icon: "video_label",
        component: WebPage,
        layout: "/admin",
        unsecure: true,
    },
    {
        path: "/recordings",
        name: "Recordings",
        icon: "video_library",
        component: RecordingsPage,
        layout: "/admin",
        unsecure: true
    },
    {
        path: "/schedule/:program?",
        name: "Teleman List",
        icon: "list",
        component: TelemanList,
        layout: "/admin",
        unsecure: true
    },
    {
        path: "/player/:file/:url?",
        name: "Player",
        icon: "list",
        component: PlayerPage,
        layout: "/admin",
        unsecure: true
    },
    {
        path: "/epgList",
        name: "EPG List",
        icon: Person,
        component: EPG,
        layout: "/admin",
        unsecure: true
    },
    {
        path: "/epgProgram/:program?",
        name: "EPG Program",
        icon: "program",
        component: EPGPrograms,
        layout: "/admin",
        unsecure: true,
        skipFromDisplay : true
    },
    {
        path: "/typography",
        name: "Typography",
        icon: LibraryBooks,
        component: Typography,
        layout: "/admin"
    },
    {
        path: "/icons",
        name: "Icons",
        icon: BubbleChart,
        component: Icons,
        layout: "/admin",
        unsecure: true
    },
    {
        path: "/notifications",
        name: "Notifications",
        icon: Notifications,
        component: NotificationsPage,
        layout: "/admin",
        unsecure: true
    },
];

export default dashboardRoutes;
