import React from "react";
import {DataGrid} from "@mui/x-data-grid";
import {EpgChannel} from "./EPGDataUtils";
import {Tooltip} from "@material-ui/core";
import {playChannel} from "../Player/PlayerUtils";
import {useHistory} from "react-router-dom";

/* display mui DataGrid with 3 columns
 first column:                             <EpgChannel channel={channel}
                                         changePlayerUrl={changePlayerUrl}
                                         authState={authState}
 */
const EPGCurrentProgramsGrid = ({
                                    selectedChannels,
                                    maxChannels,
                                    changePlayerUrl,
                                    authState,
                                    channel2ProgramMap,
                                    classes
                                }) => {
    //display mui DataGrid with 3 columns
    const history = useHistory()
    const columns = [
        {
            field: 'id', headerName: 'Channel', width: 290,
            editable: false,
            renderCell: (params) => {
                // const channel = channel2ProgramMap?.get(params.row?.id);
                const channel = params.row
                if (channel) {
                    return <span><EpgChannel channel={channel}
                                       changePlayerUrl={changePlayerUrl}
                                       authState={authState}
                    /></span>;
                } else {
                    return <div>Channel {params.row?.id} not found</div>;
                }
            }
        }
    ]
    // const rows = selectedChannels?.data?.channels || []
    const rows = selectedChannels?.data?.channels?.filter(item => item.id) || []
    return (
        <div style={{height: '100%', width: '100%'}}>
            <DataGrid
                rows={rows}
                columns={columns}
                initialState={{
                    pagination: {
                        paginationModel: {
                            pageSize: 10,
                        }
                    }
                }}
                getRowId={(row) => row.id || row.name || row.webtv?.name || 1}
                pageSizeOptions={[10, 25, 50, 100]}/>
        </div>
    )
}


export default EPGCurrentProgramsGrid;
