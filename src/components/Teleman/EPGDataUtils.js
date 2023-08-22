import moment from "moment";
import api from "../../service/api";

export const getProgramsForChannel = (channel, programs) => {
    return markCurrent(programs
        && programs
            .filter(item => item.channel === channel.id))
}
const markCurrent = (programs) => {
    const now = Date.now()
    return programs &&
        programs
            .map((item) => {
                item.current = (item.start <= now && item.stop >= now)
                return item
            })
}

//field-level transformers
export const calculateDeltaTime = (fromTime = moment()) => (program) => {
    const diffSeconds = moment(program.start).diff(fromTime)
    return moment.duration(diffSeconds)
}
export const fromlist = (item) => item && item[0]?.value
export const fromlist2 = (item) => item && (item.length > 1) &&((item[0]?.value || '') +"," +  (item[1]?.value || ''))
/*
 @item.ratings = {"value":" imdbRank; 6.6; http://www.imdb.com/title/tt0472884/"}
 @returns {"type":" imdbRank", rank: 6.6,  "url": "http://www.imdb.com/title/tt0472884/"}
 */
export function convertImdbRankToObject(input) {
    // initialize the output object
    const output = {
        type: '',
        rank: '',
        url: ''
    };

    // check if input is empty
    if (!input) {
        return output;
    }

    // split input by semicolons
    const parts = input.split('; ');

    // check if input has at least 2 parts
    if (parts.length < 2) {
        return output;
    }

    // extract type, rank, and url from parts
    output.type = parts[0].replace('value:', '').trim();
    output.rank = parseFloat(parts[1]);
    output.url = parts.length >= 3 ? parts[2].trim() : '';

    return output;
}
export function toDate(rawDate) {
    return moment(rawDate).format("MM/DD/YY");
}

export function toTime(rawDate) {
    return moment(rawDate).format("hh:mm A");
}
//get composite key for a program - channel + start time
export function getProgramKey(program) {
    return `${program.channel}||${program.start}`
}
//get channel and start time from composite key
export function getProgramKeyParts(key) {
    if (!key) {
        return null
    }
    const parts = key.split('||')
    return {channel: parts[0], start: parts[1]}
}

export function recordProgrom(authState, channel, program) {
        api.recordWebChannel(authState, channel.webtv.name, channel.webtv.title + ' - ' + fromlist(program.titles), {
            startTime: moment(program.start), endTime: moment(program.stop)
        }, getProgramKey(program))
        // alert(`SCHEDULED web tv Channel = [${channel.webtv.name + "/" + channel.webtv.title}] [${fromlist(program.titles)}] start = ${moment(program.start)}, stop=[${moment(program.stop)}]`)
}
/*
 channelName - name of the program e.g. CanalPlusPremium.pl
 channels - a list of all channels
 */
export function getChannelForName(channelName, channels) {
    if (channels) {
        const arr = channels.filter(channel => channel.id === channelName);
        if (arr.length > 0) return arr[0]
        else return null
    }
    return null
}
