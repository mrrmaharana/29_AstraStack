# Quick Reference Card - Advanced Analyzers

## 🚀 Start in 30 Seconds

### Step 1: Install Dependencies
```bash
pip install -r requirements.txt
```

### Step 2: Run Python Backend
```bash
python api_backend.py
```
Or on Windows: `start_backend.bat`

### Step 3: Open Frontend
```
http://localhost:3000
```

### Step 4: Use New Tools
- Click "Image AI Analyzer" for photos
- Click "Video AI Analyzer" for videos

---

## 📊 What Each Tool Does

### Image AI Analyzer
**Inputs:** JPG, PNG, GIF, BMP, WebP
**Outputs:**
- ✓ Full EXIF metadata
- ✓ GPS coordinates (if present)
- ✓ Camera model & settings
- ✓ Objects detected (YOLO)
- ✓ Faces, hands, pose (MediaPipe)
- ✓ Privacy risk score
- ✓ Detailed recommendations

**Use Cases:**
- Verify metadata in photos
- Check for location data
- Identify objects in images
- Assess privacy risks

---

### Video AI Analyzer
**Inputs:** MP4, WebM, AVI, MOV, MKV
**Outputs:**
- ✓ Video properties
- ✓ Extracted keyframes
- ✓ Objects per frame (YOLO)
- ✓ Face count
- ✓ Privacy assessment
- ✓ Frame-by-frame analysis

**Use Cases:**
- Extract key moments from video
- Check for people/faces
- Find specific objects
- Assess privacy risks

---

## 🎯 API Endpoints

### Analyze Image
```bash
curl -X POST http://localhost:5000/api/analyze-image \
  -F "file=@photo.jpg"
```

### Analyze Video
```bash
curl -X POST http://localhost:5000/api/analyze-video \
  -F "file=@video.mp4"
```

### Health Check
```bash
curl http://localhost:5000/health
```

---

## 📈 Risk Score Breakdown

| Level | Score | Meaning |
|-------|-------|---------|
| 🟢 LOW | 0-40 | Generally safe |
| 🟡 MEDIUM | 40-60 | Some privacy concerns |
| 🔴 HIGH | 60-100 | Significant risks |

**Factors:**
- GPS location: +40%
- Camera info: +15%
- Face detected: +20%
- Multiple objects: +10%
- Large metadata: +10%

---

## 🔧 Configuration

### Change Number of Extracted Frames
File: `api_backend.py`, line ~220
```python
frames = extract_video_frames(filepath, max_frames=10)  # Default: 5
```

### Use Faster/Better YOLO
File: `api_backend.py`, line ~60
```python
yolo_model = YOLO('yolov8s.pt')  # n(nano) s(small) m(medium) l(large) x(xlarge)
```

### Enable GPU (if available)
```bash
pip install torch torchvision --index-url https://download.pytorch.org/whl/cu118
```

---

## 🐛 Quick Fixes

### Backend Won't Start
```bash
# Check if port 5000 is in use
netstat -ano | findstr :5000  # Windows
lsof -i :5000  # Mac/Linux

# Try different port - edit api_backend.py, last line:
app.run(debug=True, port=5001)  # Change 5000 to 5001
```

### Models Download Takes Forever
- First run downloads ~2GB of models
- Be patient, it's a one-time thing
- Check internet connection
- Free up disk space

### "Module not found" Error
```bash
# Reinstall dependencies
pip install -r requirements.txt --force-reinstall
```

### Out of Memory
- Close other apps
- Use smaller files
- Reduce `max_frames` value
- Use nano YOLO model instead

---

## 📊 Processing Times (Approximate)

| Operation | Time |
|-----------|------|
| Image EXIF | <100ms |
| Object Detection | 500ms-2s |
| Face Detection | 200-500ms |
| Video Frame Extract (30s) | 5-10s |
| Full Image Analysis | 1-3s |
| Full Video (5 min) | 30-60s |

---

## 🔐 Privacy Checklist

Before sharing files:
- [ ] Check for GPS data
- [ ] Check for camera info
- [ ] Review detected objects
- [ ] Count faces/people
- [ ] Read privacy recommendations
- [ ] Strip metadata if needed
- [ ] Review actual file content

---

## 📚 File Locations

| File | Purpose |
|------|---------|
| `api_backend.py` | Python API server |
| `AdvancedImageAnalyzer.tsx` | Image UI component |
| `AdvancedVideoAnalyzer.tsx` | Video UI component |
| `requirements.txt` | Python dependencies |
| `start_backend.bat` | Windows launcher |
| `start_backend.sh` | Linux/Mac launcher |
| `uploads/` | Temporary files |

---

## 🎓 Learning Resources

**EXIF Data:**
- https://en.wikipedia.org/wiki/Exif

**YOLO Object Detection:**
- https://github.com/ultralytics/ultralytics

**MediaPipe:**
- https://mediapipe.dev

**OpenCV:**
- https://opencv.org

---

## ✅ Verification Checklist

After setup, verify:
- [ ] Python 3.8+ installed
- [ ] Dependencies installed: `pip list | grep -E "Flask|OpenCV|torch"`
- [ ] Backend running: `curl http://localhost:5000/health`
- [ ] Frontend accessible: `http://localhost:3000`
- [ ] New tools visible in UI
- [ ] Can upload test image
- [ ] Can upload test video
- [ ] Get analysis results

---

## 🆘 Emergency Restart

If something breaks:
```bash
# Stop backend
Ctrl+C

# Restart backend
python api_backend.py

# Clear uploads (optional)
rm -rf uploads/*  # Mac/Linux
rmdir /s uploads  # Windows

# Reinstall dependencies (if needed)
pip install -r requirements.txt --force-reinstall --no-cache-dir
```

---

## 💡 Tips & Tricks

1. **Faster Analysis:** Use smaller images/videos
2. **Better Results:** Use high-quality input files
3. **GPU Boost:** Install CUDA PyTorch for 5-10x speedup
4. **Batch Processing:** Save multiple files and analyze sequentially
5. **API Integration:** Use endpoints in custom apps

---

## 📞 Common Questions

**Q: Do you need internet?**
A: No, everything runs locally. No API keys needed.

**Q: What's the max file size?**
A: 500MB by default (configurable in api_backend.py)

**Q: Can I use GPU?**
A: Yes, install CUDA version of PyTorch

**Q: How accurate is detection?**
A: YOLO ~90% mAP, MediaPipe ~95% face detection

**Q: Can I process videos in real-time?**
A: Yes, with GPU and optimization

---

## 🔗 Integration Points

The analyzers integrate with:
- ✓ Next.js frontend (already done)
- ✓ Flask Python backend (included)
- ✓ Tailwind CSS styling (matches theme)
- ✓ Lucide React icons (consistent)
- ✓ Existing OSINT tools grid

---

Last Updated: 2026-01-30
Version: 1.0.0
