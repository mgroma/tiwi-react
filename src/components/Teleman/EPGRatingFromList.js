/*export function EPGPrograms({selectedChannel, programs, setSelectedChannel}) {
    const {authState} = useOktaAuth();
    const history = useHistory()
    const [currentProgram, setCurrentProgram] = useState([]);
    useEffect(() => {
        if (selectedChannel && programs) {
            setCurrentProgram(getProgramsForChannel(selectedChannel, programs))
        }
    }, [selectedChannel, programs])

    return (
        <div>
            <Button onClick={() => setSelectedChannel(null)}>Back to Main List</Button>
            <Button onClick={() => history.push('/admin/epgList/')}>Back to EPG</Button>
            Selected Channel = [{selectedChannel?.name}]
            web tv Channel = [{selectedChannel?.webtv?.name + "/" + selectedChannel?.webtv?.title}]
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
                                    <Tooltip title={fromlist2(item.ratings)}>
                                        <span>{fromlist(item.titles)}</span>
                                    </Tooltip>
                                </TableCell>
                                <TableCell>{fromlist(item.descriptions)}</TableCell>
                                <TableCell>{fromlist(item.categories)}</TableCell>
                                {/!*<TableCell>{fromlist2(item.ratings)}</TableCell>*!/}
                                <TableCell>{fromlist(item.directors)}</TableCell>
                                <TableCell>{fromlist(item.actors)}</TableCell>
                            </TableRow>
                        ))}
                </TableBody>
            </Table>
        </div>
    );
}*/
// return {
import React from "react";

/**
 *
 * @param itemList - list of ratings
 * @returns {*}
 */
export const getValidRatings = itemList => {
    const ratings = itemList?.value?.filter(item => item.type !== '')
    return ratings;
};

export const ratingFromList = (itemList) => {
    const ratings = getValidRatings(itemList);
    const ret = ratings?.map(item => <div><a href={item.url} target="_blank">{item.type}/{item.rank}</a></div>)
    return ret || ''
}
export const ratingsToString = (itemList) => {
    const ratings = getValidRatings(itemList);
    const ret = ratings?.map(item => `${item.type}/${item.rank} `)
    return ret || ''
}
