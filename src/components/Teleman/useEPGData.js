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
const onlyWebTvEpg = (webTvData, epgData, allChannels = false) => {
    if (!(webTvData && epgData)) return {channels: [], programs: []} //data not ready
    const {channels, programs} = epgData
    const webTvChannels = allChannels ? channels : channels
        .map(channel => {
            const cleanedChannelName = removeWhiteSpaces(channel.name)
            const bestMatchedWebTvAndEpgChannel = webTvData
                .map(webTvChannel => {
                    const matchScore = stringSimilarity(removeWhiteSpaces(webTvChannel.channel_title), cleanedChannelName);
                    if (matchScore > 0.4) {
                        console.debug(`find epg[${channel.name}] - webtv[${webTvChannel.channel_title}] ismatch[${matchScore}]`)
                        return {
                            matchScore,
                            webtv: {name: webTvChannel.channel_name, title: webTvChannel.channel_title}
                        }
                    }
                    return null
                })
                .filter(item => item)
                .reduce((prev, curr) => {
                    if (curr
                        && ((!prev)
                            || prev.matchScore < curr.matchScore)
                    ) {
                        return curr
                    }
                    return prev
                }, null)
            if (bestMatchedWebTvAndEpgChannel)
                return {
                    ...channel,
                    webtv: bestMatchedWebTvAndEpgChannel.webtv
                }
            return null
        })
        .filter(item => item)
    const webTvPrograms = programs
        .filter(program => webTvChannels.find(channel => program.channel === channel.id))
        .filter(filterOutPastPrograms())
    return {channels: webTvChannels, programs: webTvPrograms}
}

export function useEPGData(authState) {
    const webTvQuery = useQuery(['webTvData'], () =>
            api.fetchWebChannels(authState),
        {
            staleTime: 1000 * 60 * 24,
            cacheTime: 1000 * 60 * 24
        }
    )
    const epgDataQuery = useQuery(['epgData'], () =>
            api.fetchTvGuide(),
        {
            enabled: !!webTvQuery.data,
            staleTime: 1000 * 60 * 24,
            cacheTime: 1000 * 60 * 24
        }
    )
    const epgCombinedQuery = useQuery(['epgCombinedData'], () => {
            const onlyWebTvEpgData = onlyWebTvEpg(webTvQuery.data,
                epgDataQuery.data);
            return onlyWebTvEpgData
        },
        {
            enabled: !!epgDataQuery.data,
            staleTime: 1000 * 60 * 24,
            cacheTime: 1000 * 60 * 24
        }
    )
    return epgCombinedQuery;
}

export function useSelectedEPGChannel(preSelectedChannelFilter) {
    const {authState} = useOktaAuth();
    const [channelFilter, setChannelFilter] = useState(preSelectedChannelFilter);
    const {data: allChannels} = useEPGData(authState);
    const selectedChannels = useQuery(['epgFilteredChannels', channelFilter], () => {
            if (!channelFilter) return allChannels
            return {
                channels: allChannels.channels
                    .filter(channel => channel.name.toUpperCase().match(channelFilter.toUpperCase())),
                programs: allChannels.programs
            }
        },
        {
            enabled: !!allChannels
        }
    )
    return {setChannelFilter, selectedChannels};
}
