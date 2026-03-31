# Spec: Weeb account status display

Display Weeb.tv account status in the app UI, sourced from https://weeb.tv/account, with labels translated from Polish to English.

## Requirements

1. **Placement**  
   Account status icon is shown in the **top right corner** of the screen (e.g. in header/toolbar).

2. **Status icon**  
   First display status icon. Upon clicking on the icon, expand it to show a popup with  status fields

2. **Status fields**  
   The following attributes must be displayed (values translated to English where the source is Polish):
   - **Free Account**: Yes / No
   - **Premium days left**: numeric or “—” when not applicable
   - **Multi session**: Yes / No
   - **Local Service**: Yes / No

3. **Data source**  
   Status data is retrieved from the Weeb.tv account page (https://weeb.tv/account). The implementation must obtain this data in a way consistent with the app’s architecture (e.g. backend proxy or permitted client-side fetch) and handle authentication if the page requires it. The page is in HTML format and content needs to be scraped. 

4. **Translation**  
   Any status text that appears in Polish on the source page must be shown in English in the UI (e.g. “Tak” → “Yes”, “Nie” → “No”, and any labels for the four fields above).

4. **Authentication***
   Do not rely on whether the user has authenticated to the reactJs app. 
5. **Failure and loading**  
   - While data is loading: show a loading state (e.g. spinner or “Loading…”), not raw empty values.
   - If the request fails or data is unavailable: show a clear fallback (e.g. “Unavailable” or “—”) so the user knows the status could not be loaded.

## Out of scope

- Changing or managing the Weeb.tv account (only display).
- Storing account status long-term; display can be refreshed on load or on demand.
