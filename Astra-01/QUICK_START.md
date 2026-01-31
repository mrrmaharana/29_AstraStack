# 🚀 Quick Start Guide - Image & Video Analyzer

## Step-by-Step Setup

### 1️⃣ Install Python Dependencies
Open a terminal in the project folder and run:
```bash
pip install -r requirements.txt
```
**Note:** This will install Flask, OpenCV, MediaPipe, YOLO, and other required libraries.  
⏱️ First-time setup takes 2-5 minutes.

---

### 2️⃣ Start the Python Backend
In the same terminal, run:
```bash
python api_backend_lite.py
```

✅ You should see:
```
🔍 OSINT Image & Video Analysis API
✓ Listening on http://localhost:5000
✓ CORS enabled for http://localhost:3000
```

**Keep this terminal open!** The backend must stay running.

---

### 3️⃣ Start the Frontend (In a New Terminal)
In a **different terminal** window, run:
```bash
npm run dev
```

✅ You should see:
```
✓ Ready in X.Xs
→ Local: http://localhost:3000
```

---

### 4️⃣ Upload Your Image or Video
1. Open **http://localhost:3000** in your browser
2. Click on **"Image AI Analyzer"** or **"Video AI Analyzer"**
3. Drag & drop or click to upload a file
4. Wait for analysis to complete

---

## 📊 What Gets Analyzed

### For Images:
- ✅ EXIF metadata (camera, GPS, timestamps)
- ✅ Objects detected (YOLO)
- ✅ Faces, hands, body pose detected
- ✅ Privacy risk score
- ✅ Recommendations

### For Videos:
- ✅ Frame extraction
- ✅ Per-frame object detection
- ✅ Face counting
- ✅ Privacy risk assessment

---

## ⚠️ Troubleshooting

### Error: "Error analyzing image. Make sure the Python backend is running"

**Solution:** 
1. Check if `api_backend_lite.py` is still running
2. Make sure Flask shows "Running on http://127.0.0.1:5000"
3. If not, run it again: `python api_backend_lite.py`

### Error: "ModuleNotFoundError: No module named 'flask'"

**Solution:**
Install dependencies again:
```bash
pip install -r requirements.txt
```

### Slow first analysis (takes 30+ seconds)

**Normal!** The first time you analyze, YOLO and MediaPipe models download (~500MB-1GB).  
Subsequent analyses are much faster (2-5 seconds).

### Port 5000 already in use

**Solution:** Close other Python processes or change the port:
1. Edit `api_backend_lite.py` line 348: Change `port=5000` to `port=5001`
2. Edit `AdvancedImageAnalyzer.tsx` line 60: Change URL to `http://localhost:5001/api/analyze-image`

---

## 🎯 Expected File Sizes

- Pillow: 30 MB
- OpenCV: 100 MB
- YOLO: 300-600 MB
- MediaPipe: 200-300 MB
- PyTorch: 400-600 MB

**Total:** ~1.5-2.0 GB (downloads only once)

---

## ✨ Advanced Options

### Using Different Backend Port
In `api_backend_lite.py`, find this line:
```python
if __name__ == '__main__':
    # ...
    app.run(
        host='0.0.0.0',
        port=5000,  # ← Change this
        debug=False,
        threaded=True
    )
```

Then update the frontend URLs in both components to match.

---

## 🔒 Privacy Notes

- ✅ All analysis happens locally (no cloud uploads)
- ✅ Files are automatically deleted after analysis
- ✅ Your images/videos never leave your computer
- ✅ Reverse image search is optional (requires API keys)

---

**Need help?** Check the browser console (F12) for detailed error messages.
