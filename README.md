# Will You Be My Valentine — mini page

Open `index.html` in a browser. Features:

- Yes button magnetizes toward the mouse when nearby (easier to click).
- No button runs away to a random position each time; after 5 moves you get a popup "stop messing with me".
- Clicking Yes triggers a confetti explosion and a celebratory message.

Popup image configuration:

- By default the script will try to show `popup.jpg` from the same folder when the `No` button has moved 5 times. Replace that file with your chosen image.
- Or set a custom image path before the page loads, e.g. include this in a script tag before `script.js` in `index.html`:

- By default the script will try to show `popup.jpg` from the same folder when the `No` button has moved 5 times. Replace that file with your chosen image.
- Or set a custom image path before the page loads, e.g. include this in a script tag before `script.js` in `index.html`:

```html
<script>window.POPUP_IMAGE_SRC = 'my-photo.jpg';</script>
```

Embedding rich content (Tenor GIFs):

- If you have an embed snippet (like Tenor's), you can set `window.POPUP_HTML` to that HTML before `script.js` loads. `revealPopupAndRemoveNo()` will inject the HTML and ensure external embed scripts run. Example:

```html
<script>
	window.POPUP_HTML = `<div class="tenor-gif-embed" data-postid="8510554628372069925" data-share-method="host" data-aspect-ratio="0.779116" data-width="100%"><a href="https://tenor.com/view/cat-gun-gif-8510554628372069925">Cat Gun GIF</a>from <a href="https://tenor.com/search/cat+gun-gifs">Cat Gun GIFs</a></div>`;
</script>
<script async src="https://tenor.com/embed.js"></script>
```

Place those lines before the `script.js` include in `index.html` so the popup uses your Tenor GIF.

To preview locally (optional):

```bash
# from this folder
python -m http.server 8000
# then open http://localhost:8000 in your browser
```
