import React from 'react';
import PropTypes from "prop-types";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import Button from "@material-ui/core/Button";

/**
 * Dialog component for confirming file concatenation
 * @param {Object} props
 * @param {boolean} props.open - Whether the dialog is open
 * @param {string} props.fileName - Name of the file to concatenate
 * @param {Function} props.onConfirm - Callback when user confirms concatenation
 * @param {Function} props.onCancel - Callback when user cancels concatenation
 * @returns {JSX.Element}
 */
export default function ConcatenateDialog({ open, fileName, onConfirm, onCancel }) {
    return (
        <Dialog
            open={open}
            onClose={onCancel}
            aria-labelledby="concatenate-dialog-title"
            aria-describedby="concatenate-dialog-description"
        >
            <DialogTitle id="concatenate-dialog-title">
                Combine Recording Files
            </DialogTitle>
            <DialogContent>
                <DialogContentText id="concatenate-dialog-description">
                    Would you like to combine all related recording files for "{fileName}" into a single file? This will merge all segments of the recording into one continuous file.
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={onCancel} color="primary">
                    Cancel
                </Button>
                <Button onClick={onConfirm} color="primary" variant="contained">
                    Combine Files
                </Button>
            </DialogActions>
        </Dialog>
    );
}

ConcatenateDialog.propTypes = {
    open: PropTypes.bool.isRequired,
    fileName: PropTypes.string,
    onConfirm: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired
}; 