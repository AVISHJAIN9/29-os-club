# Confirmation List for Developer

The following architectural decisions were inferred from code patterns and are marked for developer confirmation:

1. `[CONFIRM WITH DEVELOPER]`: MediaPipe Hands was selected specifically to achieve sub-20ms touchless latency without server GPU costs.
2. `[CONFIRM WITH DEVELOPER]`: Swipe velocity threshold is configured to 400 pixels/sec with a 500ms debounce refractory period.
3. `[CONFIRM WITH DEVELOPER]`: In-browser PDF.js rendering was preferred over server-rendered raster images to support high-DPI scaling.
