import React, {memo, useState} from 'react';
import PropTypes from 'prop-types';
import {Table, TableBody, TableCell, TableHead, TableRow} from "@material-ui/core";
import {EPGPrograms} from "./EPGPrograms";
import EPGProgramsAutocomplete from "./EPGProgramsAutocomplete";
import {useSelectedEPGChannel} from "./useEPGData";
import CustomInput from "../CustomInput/CustomInput";

function EPGChannels(channels, programs, selectedChannel, setSelectedChannel) {
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
                                    onClick={(event) => setSelectedChannel(channel)}
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

const EPGMain = (props) => {
    const {setChannelFilter, selectedChannels} = useSelectedEPGChannel();
    const channels = selectedChannels.data && selectedChannels.data.channels
    const programs = selectedChannels.data && selectedChannels.data.programs
    const [selectedChannel, setSelectedChannel] = useState(null);
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
                {(!selectedChannel) && EPGChannels(channels, programs, selectedChannel, setSelectedChannel)}
                {selectedChannel &&
                <EPGPrograms selectedChannel={selectedChannel} setSelectedChannel={setSelectedChannel}
                             programs={programs}/>}
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
