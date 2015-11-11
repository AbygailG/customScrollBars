# customScrollBars
jQuery extension for custom scrollbars.

# Usage
This is a custom jQuery function, so jQuery is required in the page. Further you will need to load the basic CSS and of course the JavaScript file.

To convert an element into a scrollable element, call the customScrollBar function:

```javascript
$('#myScrollableNode').customScrollBar();
```
The new scrollbar can easily be styled via the CSS.

# Limitations
* At this time, it is only possible to add vertical scrollbars. Horizontal scrolling is not (yet?) supported.
* The scrollable area needs to have a height.