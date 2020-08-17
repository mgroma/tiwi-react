

const _fetchWebChannels = async (authState) => {
    const {accessToken} = authState;
    const apiUrl = 'http://localhost:3001/api'
    const response = await fetch(apiUrl, {
        headers: {
            Authorization: `Bearer ${accessToken}`,
        }
    })
    if (!response.ok) {
        throw Error(`error fetching channels: error=[${response.error()}]`);
    }
    return await response.json();
}
const fetchWebChannels = (authState) => _fetchWebChannels(authState)
export {
    fetchWebChannels
}
