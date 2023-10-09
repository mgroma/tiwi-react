/** react component to return programs that have been rated and sorted by rating
 * @param programs - array of programs to be displayed
 * @param channels - array of channels to be displayed
 * */
/** program logic
 * initialize:
 * get channels and programs
 * initialize state for rank threshold
 * display rank threshold drop down: values: 6,7,8,9,10
 * useeffect to update programs based on rank threshold change
 * display programs filtered to be above rank threshold and sorted by rank in descending order
 */
import React from 'react';
import {useSelectedEPGChannel} from "./useEPGData";
import {getValidRatings} from "./EPGRatingFromList";
import * as program from 'commander'
import {EPGProgramHeader, renderSingleProgramItem, styles} from "./EPGProgramsAutocomplete";
import {useOktaAuth} from "@okta/okta-react";
import {makeStyles} from "@material-ui/core/styles";
import {useHistory} from "react-router-dom";
import {calculateDeltaTime} from "./EPGDataUtils";

function getProgramRatingsPredicate(rankThreshold) {
    return program => {
        const validRatings = getValidRatings(program.ratings)
        //return true if at least one rating is above rank threshold
        const isRatingAboveThreshold = validRatings?.length > 0 && validRatings.some(rating => rating.rank > rankThreshold);
        return isRatingAboveThreshold
        //...or use average rating
        const averageRating = validRatings.reduce((acc, rating) => acc + rating, 0) / validRatings.length
        return averageRating > rankThreshold
    };
}

const sortPredicatePickMaxRankings = (a, b) => {
    const aRatings = getValidRatings(a.ratings)
    const bRatings = getValidRatings(b.ratings)
    const aRank = aRatings?.length > 0 ? Math.max(...aRatings.map(rating => rating.rank)) : 0
    const bRank = bRatings?.length > 0 ? Math.max(...bRatings.map(rating => rating.rank)) : 0
    return bRank - aRank
}
/* test sortpredicatePickMaxRankings
const programs = [
    {ratings: [{rank: 10}, {rank: 5}]},
    {ratings: [{rank: 5}, {rank: 10}]},
    {ratings: [{rank: 5}, {rank: 10}]}
    ]
    programs.sort(sortPredicatePickMaxRankings)
    console.log(programs)
    //[{ratings: [{rank: 10}, {rank: 5}]}, {ratings: [{rank: 10}, {rank: 5}]}, {ratings: [{rank: 10}, {rank: 5}]}]
 */

export default function EPGProgramsByRatings(props) {
    const {selectedChannels} = useSelectedEPGChannel();
    const {authState} = useOktaAuth();
    const useStyles = makeStyles(styles);
    const history = useHistory();
    const calculateDeltaTimeHO = calculateDeltaTime()
    const classes = useStyles();
    const channels = selectedChannels?.data?.channels
    const programs = selectedChannels?.data?.programs
    const [rankThreshold, setRankThreshold] = React.useState(8);
    const [programsAboveRatings, setProgramsAboveRatings] = React.useState(null);
    //if rankThreshold changes, update programsAboveRatings programs
    React.useEffect(() => {
        setProgramsAboveRatings(programs?.filter(getProgramRatingsPredicate(rankThreshold))
            ?.sort(sortPredicatePickMaxRankings));
    }, [rankThreshold, programs]);
    return (
        <div>
            <h3>Programs by Ratings</h3>
            Ratings
            <select value={rankThreshold} onChange={e => setRankThreshold(e.target.value)}>
                <option value={6}>6</option>
                <option value={7}>7</option>
                <option value={8}>8</option>
                <option value={9}>9</option>
                <option value={10}>10</option>
            </select>
            <p>Programs above rating {rankThreshold} count: [{programsAboveRatings?.length}]
            </p>
            {programsAboveRatings?.map(program => renderSingleProgramItem(program,classes, authState, channels, history, calculateDeltaTimeHO))}
        </div>
    );
}


