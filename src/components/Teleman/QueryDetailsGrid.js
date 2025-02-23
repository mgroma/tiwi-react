// QueryDetailsGrid.js
import React from "react";
import { DataGrid } from '@mui/x-data-grid';
import { Box } from '@mui/material';

const QueryDetailsGrid = ({ queryDetails }) => {
  const columns = [
    {
      field: 'queryKey',
      headerName: 'Query Key',
      width: 200,
      valueGetter: (params) => {
        return Array.isArray(params.value) ? params.value.join(',') : params.value;
      }
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 120
    },
    {
      field: 'isStale',
      headerName: 'Is Stale',
      width: 100,
      valueGetter: (params) => params.value.toString()
    },
    {
      field: 'lastUpdated',
      headerName: 'Last Updated',
      width: 200
    },
    {
      field: 'expiresAt',
      headerName: 'Expires At',
      width: 200
    },
    {
      field: 'remainingTimeInSeconds',
      headerName: 'Remaining Time (s)',
      width: 150,
      valueGetter: (params) => `${params.value}s`
    },
    {
      field: 'cacheTimeInMinutes',
      headerName: 'Cache Time (min)',
      width: 150,
      valueGetter: (params) => `${params.value}m`
    }
  ];

  // Add unique id to each row
  const rows = queryDetails.map((detail, index) => ({
    id: index,
    ...detail
  }));

  return (
    <Box sx={{ height: 400, width: '100%' }}>
      <DataGrid
        rows={rows}
        columns={columns}
        pageSize={5}
        rowsPerPageOptions={[5, 10, 20]}
        disableSelectionOnClick
        sx={{
          '& .MuiDataGrid-cell': {
            whiteSpace: 'normal',
            wordWrap: 'break-word'
          },
          backgroundColor: 'white'
        }}
      />
    </Box>
  );
};

export default QueryDetailsGrid;

// Modified Modal Component
/*
const QueryDebugModal = () => {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const [queryDetails, setQueryDetails] = useState([]);

  const handleOpen = () => {
    const details = debugQueries();
    setQueryDetails(details);
    setOpen(true);
  };

  const handleClose = () => setOpen(false);

  const debugQueries = () => {
    const queryCache = queryClient.getQueryCache();
    const queries = queryCache.getAll();
    const now = Date.now();

    return queries.map(query => {
      const expiresAt = query.state.dataUpdatedAt + query.cacheTime;
      const remainingTime = expiresAt - now;

      return {
        queryKey: query.queryKey,
        status: query.state.status,
        isStale: query.isStale(),
        lastUpdated: new Date(query.state.dataUpdatedAt).toLocaleString(),
        expiresAt: new Date(expiresAt).toLocaleString(),
        remainingTimeInSeconds: Math.round(remainingTime / 1000),
        cacheTimeInMinutes: query.cacheTime / 60000
      };
    });
  };

  // Add real-time updates
  useEffect(() => {
    if (open) {
      const interval = setInterval(() => {
        setQueryDetails(debugQueries());
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [open]);

  return (
    <>
      <Button onClick={handleOpen} variant="contained" color="primary">
        Debug Queries
      </Button>

      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="query-debug-modal"
        aria-describedby="query-cache-information"
      >
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '90%',
          maxHeight: '90vh',
          bgcolor: 'background.paper',
          border: '2px solid #000',
          boxShadow: 24,
          p: 4,
          overflow: 'auto'
        }}>
          <Typography variant="h6" component="h2" gutterBottom>
            Query Cache Status
          </Typography>

          <QueryDetailsGrid queryDetails={queryDetails} />

          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              onClick={() => setQueryDetails(debugQueries())}
              variant="outlined"
              sx={{ mr: 1 }}
            >
              Refresh Data
            </Button>
            <Button onClick={handleClose} variant="contained">
              Close
            </Button>
          </Box>
        </Box>
      </Modal>
    </>
  );
};*/
