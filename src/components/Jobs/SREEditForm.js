import React, { useState } from "react";
import { DataGrid } from "@mui/x-data-grid";
import { makeStyles } from "@mui/styles";
import {
    CheckCircle,
    HighlightOff,
    HourglassEmpty,
    Edit,
    Close,
    Save,
} from "@mui/icons-material";
import {
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
} from "@mui/material";

const useStyles = makeStyles(() => ({
    root: {
        height: "400px",
        width: "100%",
        backgroundColor: "#f5f5f5",
        fontFamily: "Roboto",
        fontSize: "14px",
    },
    dialog: {
        "& .MuiDialog-paper": {
            width: "400px",
        },
    },
    dialogContent: {
        display: "flex",
        flexDirection: "column",
        gap: "10px",
    },
    fieldLabel: {
        fontWeight: "bold",
    },
    textField: {
        "& .MuiInputBase-input": {
            fontSize: "14px",
        },
    },
}));

const columns = [
    { field: "applicationName", headerName: "Application Name", width: 200 },
    { field: "health1", headerName: "Health 1", width: 120 },
    { field: "health2", headerName: "Health 2", width: 120 },
    { field: "health3", headerName: "Health 3", width: 120 },
    { field: "health4", headerName: "Health 4", width: 120 },
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
            return <HighlightOff color="error" />;
        case "in progress":
            return (
                <>
                    <HourglassEmpty color="secondary" /> {progress}%
                </>
            );
        case "completed":
            return <CheckCircle color="primary" />;
        default:
            return "";
    }
};

const HealthStatusGrid = () => {
    const classes = useStyles();
    const [selectedRow, setSelectedRow] = useState(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [dialogData, setDialogData] = useState(null);

    const handleRowClick = (params) => {
        setSelectedRow(params.id);
        setDialogData({
            applicationName: params.row.applicationName,
            health1: params.row.health1,
            health2: params.row.health2,
            health3: params.row.health3,
            health4: params.row.health4,
            progress: params.row.progress,
        });
        setOpenDialog(true);
    };

    const handleDialogClose = () => setOpenDialog(false);
    const handleDialogSave = () => {
        setOpenDialog(false);
        setSelectedRow(null);
    }
    return (
        <div className={classes.root}>
            <DataGrid
                rows={rows}
                columns={columns}
                pageSize={5}
                rowsPerPageOptions={[5]}
                onRowClick={handleRowClick}
            />

        <Dialog
            open={openDialog}
            onClose={handleDialogClose}
            className={classes.dialog}
        >
            <DialogTitle>Edit Health Status</DialogTitle>
            <DialogContent className={classes.dialogContent}>
                <TextField
                    label="Application Name"
                    value={dialogData?.applicationName}
                    disabled
                    className={classes.textField}
                />
                <TextField
                    label="Health 1"
                    value={dialogData?.health1}
                    disabled
                    className={classes.textField}
                />
                <TextField
                    label="Health 2"

            value={dialogData?.health2}
                        disabled
                    className={classes.textField}
                />
                <TextField
                    label="Health 3"
                        value={dialogData?.health3}
                    disabled
                    className={classes.textField}
                />
                <TextField
                    label="Health 4"
                    value={dialogData?.health4}
                    disabled
                    className={classes.textField}
                />
                <TextField
                    label="Progress"
                    value={dialogData?.progress}
                    disabled

            className={classes.textField}
                />
            </DialogContent>
            <DialogActions>
                <Button
                        variant="contained"
                        color="primary"
                        startIcon={<Save />}
                        onClick={handleDialogSave}
                >
                    Save
                    </Button>
                <Button
                    variant="contained"
                    color="secondary"
                    startIcon={<Close />}
                    onClick={handleDialogClose}
                >
                    Cancel
                </Button>
            </DialogActions>
        </Dialog>
        </div>

    );

};
export default HealthStatusGrid;


