# 📱 Visual Guide - How to Use the Advanced Analyzers

## 🖼️ Image AI Analyzer

### Step 1: Open Tool
```
Main Dashboard
    ↓
OSINT Toolkit Grid
    ↓
Click "Image AI Analyzer" (Cyan card)
    ↓
Upload Screen Appears
```

### Step 2: Upload Image
```
Three Ways to Upload:
1. Click "Choose Image" button
2. Drag & drop image onto area
3. Click gray area to browse

Supported: JPG, PNG, GIF, BMP, WebP
Max Size: 500MB
```

### Step 3: Analysis Runs
```
Loading Screen Shows:
- Spinner icon
- "Analyzing image with AI models..."
- "Extracting EXIF, detecting objects & landmarks"

Time: 1-3 seconds
```

### Step 4: View Results
```
Results Screen Layout:
┌─────────────────────────────────────────┐
│ Header with Back & Clear buttons        │
├─────────────────────────────────────────┤
│ ┌──────────────────┐  ┌──────────────┐  │
│ │ Image Preview    │  │ Risk Card    │  │
│ │ (left sidebar)   │  │ (0-100%)     │  │
│ ├──────────────────┤  ├──────────────┤  │
│ │ • Filename       │  │ 5 Tabs:      │  │
│ │ • Size           │  │ 1. EXIF      │  │
│ │ • Dimensions     │  │ 2. Objects   │  │
│ │ • Format         │  │ 3. Landmarks │  │
│ │                  │  │ 4. Reverse   │  │
│ │                  │  │ 5. Risk      │  │
│ └──────────────────┘  └──────────────┘  │
└─────────────────────────────────────────┘
```

### Step 5: Explore Tabs

#### Tab 1: EXIF & Metadata
```
Shows:
✓ Camera Make (e.g., Canon)
✓ Camera Model (e.g., EOS R5)
✓ Shutter Speed (e.g., 1/2000)
✓ Aperture (e.g., f/8.0)
✓ ISO (e.g., 400)
✓ Focal Length (e.g., 50mm)
✓ Date & Time

🔴 GPS Location (if present):
  - Latitude, Longitude, Altitude
  - ⚠️ Warning: Location exposed!

✓ All EXIF Data (expandable)
```

#### Tab 2: Objects Detected
```
Shows YOLO Results:
✓ person       confidence: 95%
✓ dog          confidence: 87%
✓ car          confidence: 82%
✓ [other objects...]

Each item shows:
- Object class name
- Confidence percentage (0-100%)
- Bounding box coordinates
```

#### Tab 3: Landmarks
```
Shows MediaPipe Results:

Faces Detected:     1
Hands Detected:     2
Pose Detected:      ✓ Yes

Visual indicators with counts
and status
```

#### Tab 4: Reverse Search
```
Shows:
✓ Perceptual Hash:
  1110101010...1010101010
  (64+ hex characters)

Info:
Framework ready for TinEye/Google
integration
API integration instructions
```

#### Tab 5: Risk Analysis
```
Shows:
✓ All recommendations
✓ Detailed breakdown
✓ Privacy concerns
✓ Step-by-step fixes

Examples:
- Remove GPS location
- Strip camera information
- Blur faces
- Re-encode without metadata
```

---

## 🎬 Video AI Analyzer

### Step 1: Open Tool
```
Main Dashboard
    ↓
OSINT Toolkit Grid
    ↓
Click "Video AI Analyzer" (Rose card)
    ↓
Upload Screen Appears
```

### Step 2: Upload Video
```
Three Ways:
1. Click "Choose Video" button
2. Drag & drop video onto area
3. Click gray area to browse

Supported: MP4, WebM, AVI, MOV, MKV
Max Size: 500MB
```

### Step 3: Analysis Runs
```
Loading Screen:
- Spinner icon
- "Analyzing video with AI models..."
- "Extracting frames and detecting objects"

Time: 30-60 seconds (depends on video length)
```

### Step 4: View Results
```
Results Screen Layout:
┌─────────────────────────────────────────┐
│ Header with Back & Clear buttons        │
├─────────────────────────────────────────┤
│ ┌──────────────────┐  ┌──────────────┐  │
│ │ Video Info       │  │ Frame Preview│  │
│ │ (left sidebar)   │  │ & Analysis   │  │
│ ├──────────────────┤  │              │  │
│ │ • Filename       │  │ [Image]      │  │
│ │ • Size           │  │              │  │
│ │ • Duration       │  │ Frame#, Time │  │
│ │ • Resolution     │  │              │  │
│ │ • FPS            │  │ Objects in   │  │
│ │ • Frames         │  │ this frame   │  │
│ │                  │  │              │  │
│ │ Extracted Frames │  │ Summary      │  │
│ │ Frame 0 (0.0s)   │  │ Stats        │  │
│ │ Frame 723 (24.1s)│  │              │  │
│ │ Frame 1446 ...   │  │              │  │
│ └──────────────────┘  └──────────────┘  │
└─────────────────────────────────────────┘
```

### Step 5: Navigate Frames

```
Click Frame in Sidebar:
Frame 0 (0.0s) → Preview shows frame 0
Frame 723 (24.1s) → Preview shows frame 723

For Each Frame Shows:
✓ Frame number
✓ Timestamp (in seconds)
✓ Objects detected in this frame
✓ Confidence scores

Slide through to see video content
```

### Step 6: View Summary

```
Overall Analysis Summary:

🔢 Total Objects: 45
   (across all extracted frames)

👤 Faces Detected: 3
   (across all frames)

⚠️ Risk Level: MEDIUM (45%)
   • Contains identifiable people
   • Consider blurring before sharing
   • Use FFmpeg to remove metadata
```

---

## 🎯 Privacy Risk Scoring Explained

### How Risk is Calculated

```
Base Score: 10 points

Add Points For:
+ 40 if GPS location found
+ 15 if Camera information found
+ 20 if 1+ faces detected
+ 10 if Hands detected
+ 10 if Large metadata
_____________________
= Total Score (capped at 100)

Risk Levels:
🟢 LOW (0-40%)     → Generally safe to share
🟡 MEDIUM (40-60%) → Consider removing metadata
🔴 HIGH (60-100%)  → Remove metadata before sharing
```

### Understanding Recommendations

```
⚠️ GPS location data detected
   → Reveals where photo was taken
   Solution: Remove using ExifTool

⚠️ Camera information detected
   → Shows camera model and settings
   Solution: Strip EXIF data

⚠️ Faces detected
   → People are identifiable
   Solution: Blur faces before sharing

⚠️ Hands detected
   → May reveal identifying marks/rings
   Solution: Consider context

🟡 MEDIUM RISK
   → Some privacy concerns
   → Consider metadata removal

🔴 HIGH RISK
   → Significant privacy exposure
   → Remove all metadata
   → Consider re-encoding
```

---

## 🔧 Common Tasks

### Task 1: Check If Photo Has GPS Location
```
1. Open "Image AI Analyzer"
2. Upload photo
3. Look at "Risk Assessment" card
4. Check EXIF & Metadata tab
5. Look for "GPS Location Data Detected" warning
6. If shown: Photo contains location info
```

### Task 2: Find What Camera Took a Photo
```
1. Open "Image AI Analyzer"
2. Upload photo
3. Go to "EXIF & Metadata" tab
4. Look at "Camera Information" section
5. Shows: Make, Model, Lens info
```

### Task 3: See Objects in Image
```
1. Open "Image AI Analyzer"
2. Upload image
3. Go to "Objects Detected" tab
4. See list of all objects with confidence
5. Shows: person, dog, car, etc.
```

### Task 4: Count Faces in Image
```
1. Open "Image AI Analyzer"
2. Upload image
3. Go to "Landmarks" tab
4. See "Faces Detected: X"
5. Also shows hands and pose status
```

### Task 5: Extract Frames from Video
```
1. Open "Video AI Analyzer"
2. Upload video
3. Wait for analysis
4. View "Extracted Frames" sidebar
5. Click frames to preview
6. See timestamp and objects in each frame
```

### Task 6: Find How Many People Are in Video
```
1. Open "Video AI Analyzer"
2. Upload video
3. Scroll to "Overall Analysis Summary"
4. Look at "Faces Detected: X"
5. Shows total faces across all frames
```

### Task 7: Assess Privacy Risk
```
1. Upload image or video
2. Look at Risk Assessment card (top)
3. Check score (0-100%)
4. Read recommendations
5. Follow steps to improve privacy
```

---

## ⚡ Quick Tips

### Faster Analysis
- Use smaller images (compress first)
- Use shorter video clips
- Close other applications
- Restart backend if slow

### Better Results
- Use high-quality images
- Clear, well-lit photos
- Good video quality
- Not blurry or distorted

### More Accurate
- Clear faces (not obstructed)
- Good lighting
- Objects clearly visible
- Video not too dark

---

## 🐛 If Something Goes Wrong

### Image Won't Upload
```
Check:
1. File format (JPG, PNG, GIF, BMP, WebP)
2. File size (< 500MB)
3. File not corrupted
4. Try refreshing page
```

### Analysis Takes Too Long
```
1. Check if backend is running
2. Look at terminal for errors
3. Large file size?
4. Close other apps
5. Try smaller file
```

### Results Look Wrong
```
1. Backend might have crashed
2. Restart: python api_backend.py
3. Try again with different file
4. Check file quality
```

### Can't Connect to Backend
```
1. Is python api_backend.py running?
2. Is port 5000 available?
3. Try: python api_backend.py
4. Check for error messages
5. Restart backend if needed
```

---

## 📊 Interpreting Results

### EXIF Data
```
Camera Make: Canon
→ Image was taken with Canon camera

Camera Model: EOS R5
→ Specific model number

Shutter Speed: 1/2000
→ Very fast (good for fast motion)

Aperture: f/8.0
→ Medium-small aperture (deep focus)

ISO: 400
→ Moderate light sensitivity

Focal Length: 50mm
→ 50mm lens (standard portrait)

DateTime: 2024:01:30 10:45:30
→ When photo was taken
```

### Objects Detected
```
person: 0.95
→ Very confident (95%) it's a person

dog: 0.87
→ 87% confident it's a dog

car: 0.82
→ 82% confident it's a car

confidence: 0.92
→ How sure the AI is (0-1.0)
→ Higher = more confident
```

### Risk Score
```
Score: 25
Level: LOW
→ No major privacy issues
→ Safe to share online

Score: 55
Level: MEDIUM
→ Some privacy concerns
→ Consider removing metadata

Score: 85
Level: HIGH
→ Significant privacy exposure
→ Remove all metadata first
```

---

## 🎓 Learning

### To Understand More
- Read QUICK_REFERENCE.md
- Read SETUP_ADVANCED_TOOLS.md
- Check ARCHITECTURE.md
- See API examples

### Key Concepts
- **EXIF**: Metadata in photos
- **GPS**: Location coordinates
- **YOLO**: Object detection AI
- **MediaPipe**: Face/hand detection
- **Landmark**: Key facial/hand points
- **Risk Score**: Privacy threat level

---

**Happy Analyzing! 🎉**

For more help, see the documentation files included with this project.
