import {stringSimilarity} from "../Utils/StringCompare";
import {useQuery, useQueryClient} from "react-query";
import api from "../../service/api";
import {useOktaAuth} from "@okta/okta-react";
import {useState, useEffect} from "react";
import {getProgramKeyParts} from "./EPGDataUtils";

interface WebTvChannel {
    channel_name: string;
    channel_title: string;
}

interface EPGChannel {
    id: number;
    name: string;
}

interface EPGProgram {
    channel: number;
    start: number;
    stop: number;
    title: string;
    titles?: Array<{ value: string }>;
}

interface TVGuide {
    channels: Array<{
        id: number;
        name: string;
        webtv?: {
            name: string;
            title: string;
        };
    }>;
    programs: Array<EPGProgram>;
}

interface Schedule {
    channel: number;
    start: number;
}

function removeWhiteSpaces(title: string | undefined): string {
    return title?.replace('Polska', '')
        .replace('Poland', '')
        .replace('HD', '')
        .replaceAll(' ', '') || '';
}

export const filterOutPastPrograms = (now = Date.now()) => (program: EPGProgram) => program.stop >= now;

const reduceToLastBestMatch = (prev: any, curr: any) => {
    if (curr
        && ((!prev)
            || prev.matchScore <= curr.matchScore)
    ) {
        return curr;
    }
    return prev;
};

const getProgramsFor = (programs: EPGProgram[], webTvChannels: any[]) => programs
    .filter(program => webTvChannels
        .find(channel => program.channel === channel.id));

/**
 * @deprecated
 */
const onlyWebTvEpg = (webTvData: WebTvChannel[], epgData: TVGuide, allChannels = false) => {
    if (!(webTvData && epgData)) return {channels: [], programs: []} //data not ready
    const {channels, programs} = epgData
    const webTvChannels = allChannels ? channels : channels
        .map(channel => {
            const targetChannelName = removeWhiteSpaces(channel.name)
            const bestMatchedWebTvAndEpgChannel = webTvData
                .map(webTvChannel => {
                    const inputChannelName = webTvChannel.channel_title;
                    const matchScore = stringSimilarity(removeWhiteSpaces(inputChannelName), targetChannelName);
                    const SIMILIARITY_MATCH_SCORE = 0.8;
                    if (matchScore > SIMILIARITY_MATCH_SCORE) {
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
const CHANNEL_NAME_MATCH_THRESHOLD = 0.53;
//document parameters of  allWebTvWithOptionalEpg function, including types
/**
 * @param {Array<{channel_name: string, channel_title: string}>} webTvData
 * @param {Array<{id: number, name: string}>} epgData
 * @returns {{channels: Array<{id: number, name: string, webtv: {name: string, title: string}}>, programs: Array<{channel: number, start: number, stop: number, title: string}>}}
 */

const allWebTvWithOptionalEpg = (webTvData: WebTvChannel[], epgData: TVGuide) => {
    console.time('allWebTvWithOptionalEpg');
    if (!(webTvData && epgData)) return {channels: [], programs: []}; //data not ready
    const {channels, programs} = epgData;
    const webTvChannels = webTvData
        .map(webTvChannel => {
            const targetChannelName = removeWhiteSpaces(webTvChannel.channel_title);
            const bestMatchedWebTvAndEpgChannel = channels
                .map(channel => {
                    const inputChannelName = channel.name;
                    const matchScore = stringSimilarity(removeWhiteSpaces(inputChannelName), targetChannelName);
                    if (matchScore > CHANNEL_NAME_MATCH_THRESHOLD) {
                        //todo: uncomment if extra debugging is needed 
                        // console.debug(`find webtv[${webTvChannel.channel_name}/${targetChannelName}] - epg[${inputChannelName}]-[${channel.name}] ismatch[${matchScore}]`)
                        return {
                            matchScore,
                            ...channel
                        };
                    }
                    return null;
                })
                .filter(item => item)
                .reduce(reduceToLastBestMatch, null);
            if (bestMatchedWebTvAndEpgChannel)
                return {
                    ...bestMatchedWebTvAndEpgChannel,
                    webtv: {name: webTvChannel.channel_name, title: targetChannelName}
                };
            return {
                webtv: {name: webTvChannel.channel_name, title: targetChannelName}
            };
        })
        .filter(item => item);
    const webTvPrograms = getProgramsFor(programs, webTvChannels);
    console.timeEnd('allWebTvWithOptionalEpg');
    //convert ratings from string to object
    // debugger;
    return {channels: webTvChannels, programs: webTvPrograms};
}

function useWebAndEpgData(authState: any) {
    console.time('api.fetchWebChannels');
    const webTvQuery = useQuery(
        // ['webTvData', authState?.accessToken],
        ['webTvData'],
        () => api.fetchWebChannels(authState),
        {
            // enabled: !!authState?.accessToken,
            staleTime: 1000 * 60 * 15, // 15 minutes
            cacheTime: 1000 * 60 * 10, // 10 minutes
            refetchInterval: 1000 * 60 * 15, // Refetch every 15 minutes
            refetchIntervalInBackground: false,
            onError: (error) => {
                console.error('WebTV query error:', error);
            }
        }
    );
    console.timeEnd('api.fetchWebChannels');
    console.time('api.fetchTvGuide');
    const epgDataQuery = useQuery(
        ['epgData', webTvQuery.data ? 'loaded' : 'waiting'],
        () => api.fetchTvGuide(),
        {
            enabled: !!webTvQuery.data,
            staleTime: 1000 * 60 * 60 * 6, // 6 hours
            cacheTime: 1000 * 60 * 60 * 24, // 24 hours
            refetchInterval: 1000 * 60 * 60 * 6, // Refetch every 6 hours
            refetchIntervalInBackground: false,
            retry: 2,
            retryDelay: 2 * 60 * 1000, //allow for 2 minutes between retries
            onError: (error) => {
                console.error('EPG data query error:', error);
            }
        }
    );
    console.timeEnd('api.fetchTvGuide');
    return {webTvQuery, epgDataQuery};
}

function useEPGData(authState: any) {
    const queryClient = useQueryClient();
    const {webTvQuery, epgDataQuery} = useWebAndEpgData(authState);

    // Remove the SSE connection since it's handled by JobStatus
    return useQuery(['epgCombinedData'], () =>
            allWebTvWithOptionalEpg(webTvQuery.data,
                epgDataQuery.data),
        {
            enabled: !!epgDataQuery.data,
            staleTime: 1000 * 60 * 15,
            cacheTime: 1000 * 60 * 15,
            refetchInterval: 1000 * 60 * 15,
            refetchIntervalInBackground: true,
            retry: 2,
            retryDelay: 2 * 60 * 1000,
            onError: (error) => {
                console.error('EPG data query error:', error);
            }
        }
    );
}

//optimize this function
/**
 * description: hook to get epg data for selected channel
 *
 * @param preSelectedChannelFilter - string to filter channels by
 * @returns {{setChannelFilter: (value: (((prevState: *) => *) | *)) => void, selectedChannels: UseQueryResult<{channels: Array<{id: number, name: string, webtv: {name: string, title: string}}>, programs: Array<{channel: number, start: number, stop: number, title: string}>}|{channels: {id: number, name: string, webtv: {name: string, title: string}}[], programs: Array<{channel: number, start: number, stop: number, title: string}>}, unknown>}}
 */
export function useSelectedEPGChannel(preSelectedChannelFilter: string) {
    const {authState} = useOktaAuth();
    const [channelFilter, setChannelFilter] = useState(preSelectedChannelFilter);
    const {data: allChannels} = useEPGData(authState);
    const schedules = useQuery(['epgSchedules'], () =>
            api.fetchSchedules(authState),
        {
            staleTime: 0,
            cacheTime: 0
        }
    );

    const updateProgramsWithScheduledIndicator = (extractProgramKeyFromSchedulesList: Schedule[], tvguide: TVGuide) => {
        console.time('updateProgramsWithScheduledIndicator');
        const ret = tvguide?.programs?.map(program => {
            const isScheduled = extractProgramKeyFromSchedulesList.find(
                schedule => schedule.channel === program.channel && schedule.start == program.start);
            if (isScheduled) {
                console.log(`program[${program.titles?.[0]?.value}] is scheduled`);
            }
            return {
                ...program,
                isScheduled: isScheduled
            };
        });
        console.timeEnd('updateProgramsWithScheduledIndicator');
        return ret;
    };

    const selectedChannels = useQuery(['epgFilteredChannels', channelFilter], () => {
            if (!allChannels) {
                return { channels: [], programs: [] };
            }

            const filteredPrograms = allChannels.programs?.filter(filterOutPastPrograms()) || [];
            const updatedAllChannels = {
                ...allChannels,
                programs: filteredPrograms
            };

            return (!channelFilter) ? updatedAllChannels : {
                channels: allChannels.channels
                    .filter(channel => channel.name && channel.name.toUpperCase().match(channelFilter.toUpperCase())),
                programs: filteredPrograms
            };
        },
        {
            enabled: !!allChannels
        }
    );

    //if schedules is ready then if a program from programs is on schedules list then add isScheduled flag to it
    if (schedules.data && selectedChannels.data) {
        const extractProgramKeyFromSchedulesList = schedules.data
            .map(schedule => getProgramKeyParts(schedule.jobInfo?.programKey))
            .filter(item => item);
        selectedChannels.data.programs =
            updateProgramsWithScheduledIndicator(extractProgramKeyFromSchedulesList, selectedChannels.data);
    }
    return {
        selectedChannels,
        setChannelFilter
    };
}
