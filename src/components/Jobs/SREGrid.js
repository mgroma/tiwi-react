import React from "react";
import {DataGrid} from "@mui/x-data-grid";
import {makeStyles} from "@mui/styles";
import {CheckCircle, HighlightOff, HourglassEmpty, Timer} from "@mui/icons-material";
import SREEditForm from "./SREEditForm";
//write javascript function to display reactjs edit form using mui dialog form has fields from rows array
//on submit update the row
//on cancel close the popup
    //write javascript function to display reactjs edit form using mui dialog form has fields from rows array
//on submit update the row
//on cancel close the popup
/*const getStatusIcon = (value, progress) => {
    if (value === "Healthy") {
        return <CheckCircle color="success"/>
    } else if (value === "Unhealthy") {
        return <HighlightOff color="error"/>
    } else if (value === "Suspended") {
        return <HourglassEmpty color="warning"/>
    } else if (value === "Progressing") {
        return <Timer color="primary"/>
    } else {
        return <HourglassEmpty color="warning"/>
    }
}*/


const displayEditForm = (row) => {
    //open up a popup
    //display the form
    //on submit update the row
    //on cancel close the popup
    return (
        <div>
            <div>{row.applicationName}</div>
            <div>{row.health1}</div>
            <div>{row.health2}</div>
            <div>{row.health3}</div>
            <div>{row.health4}</div>
        </div>
    )
}


const useStyles = makeStyles(() => ({
    root: {
        height: "400px",
        width: "100%",
        backgroundColor: "#f5f5f5",
        fontFamily: "Roboto",
        fontSize: "14px",
    },
}));

const renderCell = (params) => {
    return (
        <div style={{display: "flex", alignItems: "center"}}>
            {getStatusIcon(params.value, params.row.progress)}
        </div>
    );
};
const HealthStatusRecord = (record) => {
    return (
        <div>
            <div>{record.applicationName}</div>
            <div>{record.health1}</div>
            <div>{record.health2}</div>
            <div>{record.health3}</div>
            <div>{record.health4}</div>
        </div>
    )
}
const openPopup = () => {
    //open up a popup
}
const calculateHoursBetweenDays = (date1, date2) => {
    //calculate the hours between two dates

    //return the hours


}
const showPopupwithHealthStatusRecord = () => {
    //open up a popup with HealthStatusRecord
    return (
        <div>
            <HealthStatusRecord/>
        </div>
    )
}

const columns = [
    {field: "applicationName", headerName: "Application Name ", width: 200},
    {field: "health1", headerName: "Failure", width: 120, renderCell: renderCell, onRowClick:() => {
            showPopupwithHealthStatusRecord()
        }},
    {field: "health2", headerName: "Pattern", width: 120, renderCell: renderCell, onRowClick: showPopupwithHealthStatusRecord},
    {field: "health3", headerName: "Chaos", width: 120, renderCell: renderCell},
    {field: "health4", headerName: "GameD", width: 120, renderCell: renderCell},
];

const rows = [
    {
        id: 1,
        applicationName: "App 1",
        health1: "not started",
        health2: "in progress",
        health3: "completed",
        health4: "not started",
        progress: 50,
    },
    {
        id: 2,
        applicationName: "App 2",
        health1: "completed",
        health2: "not started",
        health3: "in progress",
        health4: "in progress",
        progress: 75,
    },
    {
        id: 3,
        applicationName: "App 3",
        health1: "in progress",
        health2: "not started",
        health3: "not started",
        health4: "in progress",
        progress: 25,
    },
];

const getStatusIcon = (status, progress) => {
    switch (status) {
        case "not started":
            return <Timer color="primary"/>;
        case "in progress":
            return (
                <>
                    <HourglassEmpty color="primary"/> {progress}%
                </>
            );
        case "completed":
            return <CheckCircle color="primary"/>;
        default:
            return "";
    }
}
const HealthStatusGrid = () => {
    const classes = useStyles();
//add a function to open HealthStatusRecord when clicked on a row


    return (
        <div className={classes.root}>
            <DataGrid
                rows={rows}
                columns={columns}
                renderCell={renderCell}
                pageSize={5}
                rowsPerPageOptions={[5]}
                disableSelectionOnClick
                disableColumnMenu
                disableColumnSelector
                disableColumnFilter
                disableColumnReorder
                disableDensitySelector
                disableExtendRowFullWidth
                disableMultipleColumnsSorting
                disableMultipleSelection
                disableSelectionOnRowClick
                disableSelectionOnDrag
                disableColumnResize
                disableCol/>
            <SREEditForm />
        </div>
    )
}
export default HealthStatusGrid
