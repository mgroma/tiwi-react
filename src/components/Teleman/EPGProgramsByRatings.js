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
import {useSelectedEPGChannel} from "./useEPGData.tsx";
import {getValidRatings} from "./EPGRatingFromList";
import * as program from 'commander'
import {EPGProgramHeader, renderSingleProgramItem, styles} from "./EPGProgramsAutocomplete";
import {useOktaAuth} from "@okta/okta-react";
import {makeStyles} from "@material-ui/core/styles";
import {useHistory} from "react-router-dom";
import {calculateDeltaTime} from "./EPGDataUtils";
import {Select, InputLabel, Chip, Box} from "@material-ui/core";
import MenuItem from "@material-ui/core/MenuItem";
import FormControl from "@material-ui/core/FormControl";

function getProgramRatingsPredicate(rankThreshold) {
    return program => {
        const validRatings = getValidRatings(program.ratings)
        const maxValidRanking =   validRatings?.length > 0 ? validRatings.reduce((acc, rating) => acc.rank > rating.rank ? acc : rating, validRatings[0]) : null
        //return true if at least one rating is above rank threshold
        const isRatingAboveThreshold = validRatings?.length > 0 && isRankWithinRankThreshold(rankThreshold, [maxValidRanking])
        // const isRatingAboveThreshold = validRatings?.length > 0 && validRatings.some(rating => rating.rank > rankThreshold[0]);
        return isRatingAboveThreshold
        //...or use average rating
        const averageRating = validRatings.reduce((acc, rating) => acc + rating, 0) / validRatings.length
        return averageRating > rankThreshold
    };
}

/*
@param unsorted array of rank threshold values e.g. [6, 9, 8]
@param array of rankings for a single program e.g. [{rank: 6.1} , {rank: 9.2}, {rank: 8.3}]
return if any of the rankings fall within rank threshold values e.g. if rankThreshold = [6, 9, 8] and rankings = [{rank: 6.1} , {rank: 9.2}, {rank: 8.3}] return true because 6.1 falls within [6, 9, 8] and 9.2 falls within [6, 9, 8] and 8.3 falls within [6, 9, 8]
e.g. if rankThreshold = [6, 9, 8] and rankings = [{rank: 7.1}] return false because 7.1 does not fall within [6, 9, 8]
use Math.floor to round down the rank value to the nearest integer e.g. if rank = 6.1 then Math.floor(6.1) = 6
 */
function isRankWithinRankThreshold(rankThreshold, rankings) {
    return rankings?.some(rating => rankThreshold?.includes(Math.floor(rating.rank)))
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

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
    PaperProps: {
        style: {
            maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
            width: 450,
        },
    },
};
export default function EPGProgramsByRatings() {
    const {selectedChannels} = useSelectedEPGChannel();
    const {authState} = useOktaAuth();
    const useStyles = makeStyles(styles);
    const history = useHistory();
    const calculateDeltaTimeHO = calculateDeltaTime()
    const classes = useStyles();
    const channels = selectedChannels?.data?.channels
    const programs = selectedChannels?.data?.programs
    const [rankThreshold, setRankThreshold] = React.useState([8]);
    const [programsAboveRatings, setProgramsAboveRatings] = React.useState(null);
    //if rankThreshold changes, update programsAboveRatings programs
    React.useEffect(() => {
        if (!programs) {
            return
        }
        //deep copy programs
        const programsCopy = JSON.parse(JSON.stringify(programs?.filter(getProgramRatingsPredicate(rankThreshold))))
        setProgramsAboveRatings(programsCopy?.sort(sortPredicatePickMaxRankings));
    }, [rankThreshold, programs]);
    const handleChange = (event) => {
        const {
            target: {value},
        } = event;
        // alert("value=" + value)
        // return
        setRankThreshold(
            // On autofill we get a stringified value.
            typeof value === 'string' ? value.split(',') : value,
        );
    };
    return (
        <div>
            <h3>Programs by Ratings</h3>
            <FormControl  sx={{m: 1, width: 400}}>
                <InputLabel id="ratings-label">Ratings</InputLabel>
                <Select
                    labelId="ratings-label"
                    id="ratings-select"
                    value={rankThreshold}
                    label="rankings"
                    multiple
                    onChange={handleChange}
                    MenuProps={MenuProps}
                    renderValue={(selected) => (
                        <Box sx={{display: 'flex', flexWrap: 'wrap', gap: 1.5}}>
                            {selected?.map((value) => (
                                <Chip key={value} label={value}/>
                            ))}
                        </Box>
                    )}
                >
                    {getMenuItemsForRange([6, 10])}
                </Select>
            </FormControl>
            <p>Programs for the rating {rankThreshold?.join(', ')}: {programsAboveRatings?.length}
            </p>
            {programsAboveRatings?.map(program => renderSingleProgramItem(program, classes, authState, channels, history, calculateDeltaTimeHO))}
        </div>
    );
}

const getMenuItemsForRange = (range) => {
    const menuItems = [];
    for (let i = range[0]; i <= range[1]; i++) {
        menuItems.push(<MenuItem value={i}>Rank {i}</MenuItem>);
    }
    return menuItems;
}

