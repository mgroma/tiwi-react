import {stringSimilarity} from "../Utils/StringCompare";
import {useQuery} from "react-query";
import api from "../../service/api";
import {useOktaAuth} from "@okta/okta-react";
import {useState} from "react";

function removeWhiteSpaces(title) {
    return title
        .replace('Polska', '')
        .replace('HD', '')
        .replaceAll(' ', '');
}

const filterOutPastPrograms = (now = Date.now()) => (program) => program.stop >= now

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
    .filter(filterOutPastPrograms());

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
                    if (matchScore > 0.4) {
                        console.debug(`find webtv[${webTvChannel.channel_name}/${targetChannelName}] - epg[${inputChannelName}]-[${channel.channel_name}] ismatch[${matchScore}]`)
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
    return {channels: webTvChannels, programs: webTvPrograms}
}

function useWebAndEpgData(authState) {
    const webTvQuery = useQuery(['webTvData'], () =>
            api.fetchWebChannels(authState),
        {
            staleTime: 1000 * 60 * 3,
            cacheTime: 1000 * 60 * 3
        }
    )
    const epgDataQuery = useQuery(['epgData'], () =>
            api.fetchTvGuide(),
        {
            enabled: !!webTvQuery.data,
            staleTime: 1000 * 60 * 3,
            cacheTime: 1000 * 60 * 3
        }
    )
    return {webTvQuery, epgDataQuery};
}

export function useEPGData(authState) {
    const {webTvQuery, epgDataQuery} = useWebAndEpgData(authState);
    return useQuery(['epgCombinedData'], () =>
            allWebTvWithOptionalEpg(webTvQuery.data,
                epgDataQuery.data),
        {
            enabled: !!epgDataQuery.data,
            staleTime: 1000 * 60 * 1,
            cacheTime: 1000 * 60 * 1
        }
    );
}

export function useSelectedEPGChannel(preSelectedChannelFilter) {
    const {authState} = useOktaAuth();
    const [channelFilter, setChannelFilter] = useState(preSelectedChannelFilter);
    const {data: allChannels} = useEPGData(authState);
    const selectedChannels = useQuery(['epgFilteredChannels', channelFilter], () => {
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
    return {setChannelFilter, selectedChannels};
}
