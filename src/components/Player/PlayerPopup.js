import {useRecordingSearch} from "../../context/RecordingSearchContext";
import React from "react";
import {Player} from "./PlayerPage";
import Button from '@material-ui/core/Button';
import {Box, Dialog, DialogActions, DialogContent, DialogTitle, IconButton} from "@material-ui/core";


export default function BasicPopover() {
    const {playerUrl, anchorElement, closePlayer} = useRecordingSearch();

    const open = Boolean(anchorElement);
    console.log(`popover  open[${open}] anchorEl[${anchorElement}]`)
    const id = open ? 'simple-popover' : undefined;

    return (
        <div>

            <Dialog
                id={id}
                open={open}
                anchorEl={anchorElement}
                onClose={closePlayer}
                fullWidth={true}
                maxWidth={'md'}
                anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}
                transformOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
                }}
            >
                {/*                <DialogTitle>
                    HLS Player
                    <IconButton
                        aria-label="close"
                        onClick={closePlayer}
                        sx={{
                            position: 'absolute',
                            right: 8,
                            top: 8,
                            color: (theme) => theme.palette.grey[500],
                        }}
                    >
                        <CloseSharp />
                    </IconButton>
                </DialogTitle>*/}
                {/*<DialogContent>*/}
                    <Box
                        noValidate
                        component="form"
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            m: 'auto',
                            width: 'fit-content',
                        }}
                    >
                        <Player url={playerUrl}/>
                    </Box>
                {/*</DialogContent>*/}

                <DialogActions>
                    <Button onClick={closePlayer}>Close</Button>
                </DialogActions>

            </Dialog>
        </div>
    );
}
