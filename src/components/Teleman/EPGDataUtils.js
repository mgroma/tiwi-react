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
export const fromlist = (item) => item && item[0] && item[0].value

export function toDate(rawDate) {
    return moment(rawDate).format("MM/DD/YY");
}

export function toTime(rawDate) {
    return moment(rawDate).format("hh:mm A");
}

export function recordProgrom(authState, channel, program) {
        api.recordWebChannel(authState, channel.webtv.name, channel.webtv.title + ' - ' + fromlist(program.titles), {
            startTime: moment(program.start), endTime: moment(program.stop)
        })
        // alert(`SCHEDULED web tv Channel = [${channel.webtv.name + "/" + channel.webtv.title}] [${fromlist(program.titles)}] start = ${moment(program.start)}, stop=[${moment(program.stop)}]`)
}
