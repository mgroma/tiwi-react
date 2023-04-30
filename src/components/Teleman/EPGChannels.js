import React, {memo, useState} from 'react';
import PropTypes from 'prop-types';
import {Table, TableBody, TableCell, TableHead, TableRow} from "@material-ui/core";
import {EPGPrograms} from "./EPGPrograms";
import EPGProgramsAutocomplete from "./EPGProgramsAutocomplete";
import {useSelectedEPGChannel} from "./useEPGData";
import CustomInput from "../CustomInput/CustomInput";
import {getChannelForName} from "./EPGDataUtils";
import {useHistory} from "react-router-dom";

function EPGChannels(channels, programs) {
    const history = useHistory()
    return <>
        {channels &&
        <Table>
            <TableHead>
                <TableRow>
                    <TableCell colSpan={3}><EPGProgramsAutocomplete channels={channels} programs={programs} /></TableCell>
                </TableRow>
                <TableRow>
                    <TableCell colSpan={2}>ChannelCount = {channels.length}</TableCell>
                    <TableCell>Programs Count = {programs.length}</TableCell>
                </TableRow>
                <TableRow>
                    <TableCell>Channel</TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell>Web.Name</TableCell>
                    <TableCell>Web.Title</TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
                {
                    channels.map((channel, key) => {
                        return (
                            <TableRow key={key}>
                                <TableCell><img
                                    src={channel.logo}
                                    alt={channel.name}
                                    style={{maxWidth: '6rem', maxHeight: '3rem'}}
                                    loading={"lazy"}
                                    onClick={(event) => history.push('/admin/epgProgram/' + channel.id)}
                                />
                                </TableCell>
                                <TableCell>{channel.name}</TableCell>
                                <TableCell>{channel.webtv.name}</TableCell>
                                <TableCell>{channel.webtv.title}</TableCell>
                            </TableRow>
                        )
                    })
                }
            </TableBody>
        </Table>
        }
    </>;
}

const EPGMain = () => {
    const {setChannelFilter, selectedChannels} = useSelectedEPGChannel();
    const channels = selectedChannels.data && selectedChannels.data.channels
    const programs = selectedChannels.data && selectedChannels.data.programs
    return (
        <>
            <CustomInput
                labelText="Enter Channel Name..."
                id="selected-channel"
                onChange={e => {
                    setChannelFilter(e.target.value);
                }}
                formControlProps={{
                    fullWidth: true
                }}
            />
            {channels
            && programs
            && <div>
                {EPGChannels(channels, programs)}
            </div>}
        </>
    )
};

EPGMain.propTypes = {
    epg: PropTypes.object,
};

export default memo((props) => {
    return (
        <>
            <EPGMain {...props} />
        </>
    )
})
