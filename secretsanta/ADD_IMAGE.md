# How to Add Background Image

## Option 1: Using Finder (Mac)
1. Open Finder
2. Navigate to: `/Users/srinivas/Documents/secretsanta/public/`
3. Copy your image file into this folder
4. Rename it to: `background.jpg`

## Option 2: Using Terminal
If your image is in Downloads or Desktop:
```bash
# If image is in Downloads folder
cp ~/Downloads/your-image.jpg /Users/srinivas/Documents/secretsanta/public/background.jpg

# If image is in Desktop
cp ~/Desktop/your-image.jpg /Users/srinivas/Documents/secretsanta/public/background.jpg
```

## Option 3: Drag and Drop
1. Open the `public` folder in Finder
2. Drag your image file into it
3. Rename it to `background.jpg` if needed

## Supported Formats
- .jpg or .jpeg
- .png
- .webp

## After Adding the Image
1. Restart your dev server: `npm run dev`
2. The background should appear!


