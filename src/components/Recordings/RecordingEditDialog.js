import React, {useEffect} from "react";
import {
    Box,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Slider, TextField
} from "@material-ui/core";
import Button from "@material-ui/core/Button";
import api from "../../service/api";
import moment from "moment";


export default function RangeSlider({min, max, setNewLengthAndDuration}) {
    const [value, setValue] = React.useState([min, max]);

    const handleChange = (event, newValue) => {
        setValue(newValue);
        setNewLengthAndDuration(newValue)
    };

    return (
        <>
            <Box>Start Time: {value[0]} sec Duration: {value[1]} sec</Box>
            <Slider
                value={value}
                size="medium"
                onChange={handleChange}
                valueLabelDisplay="auto"
                min={min}
                max={max}
            />
        </>
    );
}

export function RecordingEditDialog(props) {
    const {job, closeDialog, authState} = props
    const [duration, setDuration] = React.useState(0);
    const [newLengthAndDuration, setNewLengthAndDuration] = React.useState([0, 0]); //startTime, Duration

    const canSubmit = () => (newLengthAndDuration[1] - newLengthAndDuration[0]) !== duration
    const handleClose = () => {
        closeDialog()
    };
    const handleSubmit = async () => {
        const newDuration = newLengthAndDuration[1] - newLengthAndDuration[0]
        console.debug(`submitting start time: ${newLengthAndDuration[0]}, end time: ${newLengthAndDuration[1]}, duration: ${newDuration}`)
        await api.editRecording(
            authState,
            job.file,
            {
                startTime: newLengthAndDuration[0],
                duration: newDuration
            });
        closeDialog()
    };
    useEffect(() => {
        if (job) {
            api.getRecordingInfo(authState, job.file)
                .then(recordingInfo => {
                    const recordingDuration = recordingInfo.duration;
                    setDuration(recordingDuration)
                    setNewLengthAndDuration([0, recordingDuration])
                })
        }
    }, [job]);

    return <Dialog
        open={true}
        onClose={handleClose}
        fullWidth
    >
        <DialogTitle>Edit Recording</DialogTitle>
        <DialogContent>
            <DialogContentText>
                <TextField
                    autoFocus
                    margin="dense"
                    id="title"
                    label="Title"
                    fullWidth
                    variant="standard"
                    defaultValue={job.file}
                />
                <Box>
                    Original Duration: {moment.duration({seconds: duration}).humanize()} [{duration} sec]
                </Box>
            </DialogContentText>
            {/*
            <TextField
                autoFocus
                margin="dense"
                id="startTime"
                label="Start Time"
                fullWidth
                variant="standard"
                value={startTime}
            />
            <TextField
                autoFocus
                margin="dense"
                id="name"
                label="Duration"
                fullWidth
                variant="standard"
                value={newDuration}
            />
*/}
            <Box style={{marginRight: "20px"}}>
                {duration && <RangeSlider min={0} max={duration} setNewLengthAndDuration={setNewLengthAndDuration}/>}
            </Box>
        </DialogContent>
        <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            {canSubmit() && <Button onClick={handleSubmit}>OK</Button>}
        </DialogActions>
    </Dialog>;
}
