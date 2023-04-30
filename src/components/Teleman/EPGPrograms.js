import React, {useEffect, useState} from "react";
import {Button, Table, TableBody, TableCell, TableRow, Tooltip} from "@material-ui/core";
import {useOktaAuth} from "@okta/okta-react";
import {fromlist, getChannelForName, getProgramsForChannel, recordProgrom, toDate, toTime} from "./EPGDataUtils";
import {useHistory, useParams} from "react-router-dom";
import {useSelectedEPGChannel} from "./useEPGData";
import {playChannel} from "../Player/PlayerUtils";
import {useRecordingSearch} from "../../context/RecordingSearchContext";
import {ratingFromList} from "./EPGRatingFromList";

/*
 @param programs: array of {
    "site": "programtv.onet.pl",
    "channel": "13Ulica.pl",
    "titles": [{"value": "Kobra - oddział specjalny 25, odc. 10: Testament, część 2", "lang": "pl"}],
    "sub_titles": [],
    "descriptions": [{
        "value": "Obława na syna zarządcy zajazdu ma tragiczne skutki. Ojciec widzi jego śmierć i postanawia się zemścić. Zaczyna nękać...",
        "lang": "pl"
    }],
    "icon": {"src": ""},
    "episodeNumbers": [],
    "date": null,
    "start": 1669169700000,
    "stop": 1669173000000,
    "urls": [],
    "ratings": [],
    "categories": [{"value": "serial sensacyjny", "lang": "pl"}],
    "directors": [],
    "actors": [],
    "writers": [],
    "adapters": [],
    "producers": [],
    "composers": [],
    "editors": [],
    "presenters": [],
    "commentators": [],
    "guests": []
}

original xml:
    <programme start="20221126215000 +0000" stop="20221127002500 +0000" channel="TVP1.pl">
        <title lang="pl">Hit na sobotę: Casino Royale</title>
        <desc lang="pl">Agent 007 kontra skarbnik przestępczej organizacji.</desc>
        <credits>
            <director>Martin Campbell</director>
            <actor>Daniel Craig,Eva Green,Mads Mikkelsen,Jeffrey Wright</actor>
        </credits>
        <category lang="pl">film sensacyjny, Czechy/Niemcy/Wielka Brytania/USA 2006</category>
        <url>https://www.teleman.pl/tv/Casino-Royale-813534</url>
        <rating>
            <value>8.0</value>
        </rating>
    </programme>

 */


export function EPGPrograms() {
    const {authState} = useOktaAuth();
    const { program } = useParams()
    const {changePlayerUrl} = useRecordingSearch();
    const history = useHistory()
    const {selectedChannels} = useSelectedEPGChannel();
    const channels = selectedChannels.data && selectedChannels.data.channels
    const programs = selectedChannels.data && selectedChannels.data.programs
    const [selectedChannel, setSelectedChannel] = useState(getChannelForName(program, channels));

    useEffect(() => {
        if (program && channels) {
            setSelectedChannel(getChannelForName(program, channels))
        }
    }, [program, channels])
    const [currentProgram, setCurrentProgram] = useState([]);
    useEffect(() => {
        if (selectedChannel && programs) {
            setCurrentProgram(getProgramsForChannel(selectedChannel, programs))
        }
    }, [selectedChannel, programs])

    return (
        <div>
            <Button onClick={() => history.push('/admin/schedule/')}>Back to Main List</Button>
            <Button onClick={() => history.push('/admin/epgList/')}>Back to EPG</Button>
            Selected Channel = [{selectedChannel?.name}]
            <span
                onClick={(event) => playChannel(selectedChannel?.webtv?.name, changePlayerUrl, event, authState)}
            >web tv Channel = [{selectedChannel?.webtv?.name + "/" + selectedChannel?.webtv?.title}]</span>
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
                                <TableCell>
                                    <Tooltip title={ratingFromList(item.ratings)}>
                                        <span>{fromlist(item.titles)} {ratingFromList(item.ratings)}</span>
                                    </Tooltip>
                                </TableCell>
                                <TableCell>{fromlist(item.descriptions)}</TableCell>
                                <TableCell>{fromlist(item.categories)}</TableCell>
                                <TableCell>{ratingFromList(item.ratings)}</TableCell>
                                <TableCell>{fromlist(item.directors)}</TableCell>
                                <TableCell>{fromlist(item.actors)}</TableCell>
                            </TableRow>
                        ))}
                </TableBody>
            </Table>
        </div>
    );
}
