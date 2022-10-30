import React, {useEffect, useState} from "react";
import {Button, Table, TableBody, TableCell, TableRow} from "@material-ui/core";
import {useOktaAuth} from "@okta/okta-react";
import {fromlist, getProgramsForChannel, recordProgrom, toDate, toTime} from "./EPGDataUtils";

export function EPGPrograms({selectedChannel, programs, setSelectedChannel}) {
    const {authState} = useOktaAuth();
    const [currentProgram, setCurrentProgram] = useState([]);
    useEffect(() => {
        if (selectedChannel && programs) {
            setCurrentProgram(getProgramsForChannel(selectedChannel, programs))
        }
    }, [selectedChannel, programs])

    return (
        <div>
            <Button onClick={() => setSelectedChannel(null)}>Back to Main List</Button>
            Selected Channel = [{selectedChannel.name}]
            web tv Channel = [{selectedChannel.webtv.name + "/" + selectedChannel.webtv.title}]
            now = [{toDate(Date.now()) + ' - ' + toTime(Date.now())}]
            <Table>
                <TableBody>
                    {currentProgram
                        .map((item, key) => (
                            <TableRow
                                key={key}
                                style={item.current ? {
                                    backgroundColor: 'lightgray',
                                } : {}}
                                onClick={() => recordProgrom(authState, selectedChannel, item)}

                            >
                                <TableCell
                                    style={{width: 160}}>
                                    <div>{toDate(item.start)}</div>
                                    <div>{`${toTime(item.start)} - ${toTime(item.stop)} `}</div>
                                </TableCell>
                                <TableCell>{fromlist(item.titles)}</TableCell>
                                <TableCell>{fromlist(item.descriptions)}</TableCell>
                                <TableCell>{fromlist(item.categories)}</TableCell>
                            </TableRow>
                        ))}
                </TableBody>
            </Table>
        </div>
    );
}
