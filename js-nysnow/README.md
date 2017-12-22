Demo: https://rawgit.com/bbars/utils/master/js-nysnow/index.html

### Usage
Add script:

```html
<script src="https://cdn.rawgit.com/bbars/utils/677b464e/js-nysnow/nysnow.js"></script>
<script>
window.nysnow = new NYSnow();
</script>
```

#### You may check NY eve and CSS support before:

```js
var now = new Date(),
var nyTime = new Date(now.getFullYear(), 11, 15) < now && now < new Date(now.getFullYear() + 1, 0, 15);
var cssSupported = typeof document.body.style.pointerEvents != undefined || typeof document.body.style.webkitPointerEvents != undefined || typeof document.body.style.mozPointerEvents != undefined;

if (nyTime && cssSupported) {
    window.nysnow = new NYSnow();
}
```

### Parameters

```js
var container = document.body; // container of canvas
var cfg = {
    particleCount: 300, // count of visible snow particles
    safeEdge: 10,       // particles may go outside of screen (percents of width of height)
    wind: 0.2,          // wind strength
    chaos: 0.1,         // direction of particles depends on Z-position
    gravity: 9.8 * 0.1, // gravity * windage
    windChange: 0.1,    // speed of wind direction changes (X)
    windChangeZ: 0,     // speed of wind direction changes (Z)
};
var async = false; // initial particles should be generated when instance created

window.nysnow = new NYSnow(container, cfg, async);
```
