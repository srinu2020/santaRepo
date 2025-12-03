# How to Set Up Background Image

## Step 1: Add Your Image
1. Place your background image file in the `public` folder
2. Name it exactly: `background.jpg`
   - Supported formats: `.jpg`, `.jpeg`, `.png`, `.webp`
   - If using a different format, update the filename in `src/App.css` line 17

## Step 2: Verify the Image
After adding the image, the file structure should look like:
```
public/
  ├── background.jpg  (your image file)
  └── README.md
```

## Step 3: Test
1. Start the dev server: `npm run dev`
2. The background image should appear behind the app

## Troubleshooting
If the image doesn't show:
1. Check the filename matches exactly (case-sensitive)
2. Make sure the file is in the `public` folder (not `src`)
3. Try refreshing the browser (hard refresh: Cmd+Shift+R on Mac, Ctrl+Shift+R on Windows)
4. Check browser console for 404 errors

## Alternative: Use Different Filename
If your image has a different name, update `src/App.css`:
- Find: `url('/background.jpg')`
- Replace with: `url('/your-image-name.jpg')`


