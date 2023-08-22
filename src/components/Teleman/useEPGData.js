import {stringSimilarity} from "../Utils/StringCompare";
import {useQuery} from "react-query";
import api from "../../service/api";
import {useOktaAuth} from "@okta/okta-react";
import {useState} from "react";
import {getProgramKeyParts} from "./EPGDataUtils";

function removeWhiteSpaces(title) {
    return title?.replace('Polska', '')
        .replace('Poland', '')
        .replace('HD', '')
        .replaceAll(' ', '');
}

export const filterOutPastPrograms = (now = Date.now()) => (program) => program.stop >= now

const reduceToLastBestMatch = (prev, curr) => {
    if (curr
        && ((!prev)
            || prev.matchScore <= curr.matchScore)
    ) {
        return curr
    }
    return prev
};

const getProgramsFor = (programs, webTvChannels) => programs
    .filter(program => webTvChannels
        .find(channel => program.channel === channel.id))
// .filter(filterOutPastPrograms());

// return only those epg channels that have web tv equivalents
/*
@deprecated
 */
const onlyWebTvEpg = (webTvData, epgData, allChannels = false) => {
    if (!(webTvData && epgData)) return {channels: [], programs: []} //data not ready
    const {channels, programs} = epgData
    const webTvChannels = allChannels ? channels : channels
        .map(channel => {
            const targetChannelName = removeWhiteSpaces(channel.name)
            const bestMatchedWebTvAndEpgChannel = webTvData
                .map(webTvChannel => {
                    const inputChannelName = webTvChannel.channel_title;
                    const matchScore = stringSimilarity(removeWhiteSpaces(inputChannelName), targetChannelName);
                    if (matchScore > 0.4) {
                        console.debug(`find epg[${channel.name}] - webtv[${inputChannelName}]-[${webTvChannel.channel_name}] ismatch[${matchScore}]`)
                        return {
                            matchScore,
                            webtv: {name: webTvChannel.channel_name, title: inputChannelName}
                        }
                    }
                    return null
                })
                .filter(item => item)
                .reduce(reduceToLastBestMatch, null)
            if (bestMatchedWebTvAndEpgChannel)
                return {
                    ...channel,
                    webtv: bestMatchedWebTvAndEpgChannel.webtv
                }
            return null
        })
        .filter(item => item)
    const webTvPrograms = getProgramsFor(programs, webTvChannels);
    return {channels: webTvChannels, programs: webTvPrograms}
}
//document parameters of  allWebTvWithOptionalEpg function, including types
/**
 * @param {Array<{channel_name: string, channel_title: string}>} webTvData
 * @param {Array<{id: number, name: string}>} epgData
 * @returns {{channels: Array<{id: number, name: string, webtv: {name: string, title: string}}>, programs: Array<{channel: number, start: number, stop: number, title: string}>}}
 */

const allWebTvWithOptionalEpg = (webTvData, epgData) => {
    if (!(webTvData && epgData)) return {channels: [], programs: []} //data not ready
    const {channels, programs} = epgData
    const webTvChannels = webTvData
        .map(webTvChannel => {
            const targetChannelName = removeWhiteSpaces(webTvChannel.channel_title)
            const bestMatchedWebTvAndEpgChannel = channels
                .map(channel => {
                    const inputChannelName = channel.name;
                    const matchScore = stringSimilarity(removeWhiteSpaces(inputChannelName), targetChannelName);
                    if (matchScore > 0.23) {
                        //todo: uncomment if extra debugging is needed console.debug(`find webtv[${webTvChannel.channel_name}/${targetChannelName}] - epg[${inputChannelName}]-[${channel.channel_name}] ismatch[${matchScore}]`)
                        return {
                            matchScore,
                            ...channel
                        }
                    }
                    return null
                })
                .filter(item => item)
                .reduce(reduceToLastBestMatch, null)
            if (bestMatchedWebTvAndEpgChannel)
                return {
                    ...bestMatchedWebTvAndEpgChannel,
                    webtv: {name: webTvChannel.channel_name, title: targetChannelName}
                }
            return {
                webtv: {name: webTvChannel.channel_name, title: targetChannelName}
            }
        })
        .filter(item => item)
    const webTvPrograms = getProgramsFor(programs, webTvChannels);
    //convert ratings from string to object
    // debugger;
    return {channels: webTvChannels, programs: webTvPrograms}
}

function useWebAndEpgData(authState) {
    const webTvQuery = useQuery(['webTvData'], () =>
            api.fetchWebChannels(authState),
        {
            staleTime: 1000 * 60 * 6,
            cacheTime: 1000 * 60 * 6
        }
    )
    const epgDataQuery = useQuery(['epgData'], () =>
            api.fetchTvGuide(),
        {
            enabled: !!webTvQuery.data,
            staleTime: 1000 * 60 * 6,
            cacheTime: 1000 * 60 * 6
        }
    )
    return {webTvQuery, epgDataQuery};
}

function useEPGData(authState) {
    const {webTvQuery, epgDataQuery} = useWebAndEpgData(authState);
    return useQuery(['epgCombinedData'], () =>
            allWebTvWithOptionalEpg(webTvQuery.data,
                epgDataQuery.data),
        {
            enabled: !!epgDataQuery.data,
            staleTime: 1000 * 60 * 6,
            cacheTime: 1000 * 60 * 6
        }
    );
}

//optimize this function

export function useSelectedEPGChannel(preSelectedChannelFilter) {
    const {authState} = useOktaAuth();
    const [channelFilter, setChannelFilter] = useState(preSelectedChannelFilter);
    const {data: allChannels} = useEPGData(authState);
    const schedules = useQuery(['epgSchedules'], () =>
            api.fetchSchedules(authState),
        {
            staleTime: 0,
            cacheTime: 0
        }
    )
    const updateProgramsWithScheduledIndicator = (extractProgramKeyFromSchedulesList, tvguide: {
        channels: Array<{ id: number, name: string, webtv: { name: string, title: string } }>,
        programs: Array<{ channel: number, start: number, stop: number, title: string }>
    }) => {
        console.time('filterChannels')
        const ret = tvguide?.programs?.map(program => {
            const isScheduled = extractProgramKeyFromSchedulesList.find(
                schedule => schedule.channel === program.channel && schedule.start == program.start)
            if (isScheduled) {
                console.log(`program[${program.titles[0].value}] is scheduled`)
            }
            return {
                ...program,
                isScheduled: isScheduled
            }
        })
        console.timeEnd('filterChannels')
        return ret
    };

    const selectedChannels = useQuery(['epgFilteredChannels', channelFilter], () => {
            allChannels.programs = allChannels?.programs?.filter(filterOutPastPrograms());


            return (!channelFilter) ? allChannels : {
                channels: allChannels.channels
                    .filter(channel => channel.name && channel.name.toUpperCase().match(channelFilter.toUpperCase())),
                programs: allChannels.programs
            }
        },
        {
            enabled: !!allChannels
        }
    )

    //if schedules is ready then if a program from programs is on schedules list then add isScheduled flag to it
    if (schedules.data && selectedChannels.data) {
        const extractProgramKeyFromSchedulesList = schedules.data
            .map(schedule => getProgramKeyParts(schedule.jobInfo?.programKey))
            .filter(item => item);
        selectedChannels.data.programs =
            updateProgramsWithScheduledIndicator(extractProgramKeyFromSchedulesList, selectedChannels.data);
    }
    return {setChannelFilter, selectedChannels};
}
