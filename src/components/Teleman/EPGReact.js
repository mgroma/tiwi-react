// import EPG from "reactjs-epg";
import React from "react";

const getStartTime = (programme) => {
    const start = programme.startTime;
    const end = programme.endTime;
    return `${new Date(start).getHours()}:${new Date(start).getMinutes()}-${new Date(end).getHours()}:${new Date(end).getMinutes()}`;
};

const toEpgReactChannels = channels => channels
    .map(item => (
        {
            "channelID": item.id,
            "channelImages": [{
                "url": item.logo
            }],
            "channelTitle": item.name
        }
    ));

const toEpgReactSchedules = programs => {
    const channel2ObjList = []
    programs
        .reduce((map, curr) => {
            const foundItem = map.get(curr.channel)
            if (!foundItem) map.set(curr.channel, [curr])
            else {
                foundItem.push(curr)
            }

        }, new Map())
        .forEach((value, key) => {
            channel2ObjList.push({
                "channelId": key,
                "listings": value
                    .map(item => (
                        {
                            "description": item.description
                                && item.description.length > 0
                                && item.description[0].value,
                            "endTime": item.stop,
                            "startTime": item.start,
                            "title": item.titles
                                && item.titles.length > 0
                                && item.titles[0].value
                        }
                    ))
            })
        })
    return channel2ObjList
}

export default ({channels, programs}) => {
    // const channels = epgData(channels);
    const epgReactChannels = toEpgReactChannels(channels)
    const epgReactSchedules = toEpgReactSchedules(programs)
    const settings = {
        EPGClass: "epg",
        ChannelListClass: "channel-list",
        ChannelIconClass: "channel",
        ProgammeClass: "programme",
        TimeScaleClass: "time-scale",
        TimeScaleStampClass: "current-time",
        TimeScaleSeparatorClass: "separator",
        CurrentProgrammeClass: "current-program",
    };
    return (
        <div className="App">
            <div className="container">
{/*
                <EPG
                    schedules={epgReactSchedules}
                    channels={epgReactChannels}
                    onSelected={(e, item) => console.log(e, item)}
                    settings={settings}
                    renderItem={(data) => {
                        return (
                            <>
                                <div>{data.title}</div>
                                <div>{getStartTime(data)}</div>
                            </>
                        );
                    }}
                />
*/}
            </div>
        </div>
    );
}
