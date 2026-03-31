import React, { useState, useEffect, useCallback } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import CircularProgress from '@material-ui/core/CircularProgress';
import IconButton from '@material-ui/core/IconButton';
import Popover from '@material-ui/core/Popover';
import Box from '@material-ui/core/Box';
import Settings from '@material-ui/icons/Settings';

import api from '../../service/api';

const useStyles = makeStyles((theme) => ({
    popover: {
        padding: theme.spacing(2),
        minWidth: 200,
    },
    field: {
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: theme.spacing(1),
        '&:last-child': { marginBottom: 0 },
    },
    label: {
        fontWeight: 500,
        marginRight: theme.spacing(2),
    },
    unavailable: {
        color: theme.palette.text.secondary,
        fontStyle: 'italic',
    },
}));

const FIELDS = [
    { key: 'freeAccount', label: 'Free Account' },
    { key: 'premiumDaysLeft', label: 'Premium days left' },
    { key: 'multiSession', label: 'Multi session' },
    { key: 'localService', label: 'Local Service' },
];

function formatValue(value, key) {
    if (value == null || value === '') return '—';
    if (key === 'premiumDaysLeft' && typeof value === 'number') return String(value);
    return String(value);
}

export default function WeebAccountStatus() {
    const classes = useStyles();
    const [anchorEl, setAnchorEl] = useState(null);
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);

    const fetchStatus = useCallback(async () => {
        setLoading(true);
        setError(false);
        try {
            const result = await api.getWeebAccountStatus();
            if (result && (result.unavailable || result.error)) {
                setError(true);
                setData(null);
            } else {
                setData(result);
            }
        } catch (e) {
            setError(true);
            setData(null);
        } finally {
            setLoading(false);
        }
    }, []);

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
        if (!data && !loading && !error) {
            fetchStatus();
        }
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const open = Boolean(anchorEl);

    return (
        <>
            <IconButton color="inherit" onClick={handleClick} aria-label="Weeb account status">
                <Settings />
            </IconButton>
            <Popover
                open={open}
                anchorEl={anchorEl}
                onClose={handleClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
                <Box className={classes.popover}>
                    {loading && (
                        <Box display="flex" alignItems="center" gap={1}>
                            <CircularProgress size={20} />
                            <Typography variant="body2">Loading…</Typography>
                        </Box>
                    )}
                    {error && (
                        <Typography variant="body2" className={classes.unavailable}>
                            Unavailable
                        </Typography>
                    )}
                    {!loading && !error && data && (
                        <>
                            {FIELDS.map(({ key, label }) => (
                                <div key={key} className={classes.field}>
                                    <Typography variant="body2" className={classes.label}>
                                        {label}:
                                    </Typography>
                                    <Typography variant="body2">
                                        {formatValue(data[key], key)}
                                    </Typography>
                                </div>
                            ))}
                        </>
                    )}
                </Box>
            </Popover>
        </>
    );
}
