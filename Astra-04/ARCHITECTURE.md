# System Architecture & Technical Specification

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         USER INTERFACE (Browser)                     │
│                  http://localhost:3000 (Next.js)                    │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │              OSINT Toolkit Grid (9 Tools)                    │   │
│  ├──────────────────────────────────────────────────────────────┤   │
│  │ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐         │   │
│  │ │  Email   │ │ Password │ │  Domain  │ │  Social  │ ...    │   │
│  │ │ Checker  │ │ Analyzer │ │  WHOIS   │ │ Media    │         │   │
│  │ └──────────┘ └──────────┘ └──────────┘ └──────────┘         │   │
│  │ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐         │   │
│  │ │  Image   │ │ Image AI │ │  Video   │ │ Video AI │ ...    │   │
│  │ │ Metadata │ │ Analyzer │ │ Metadata │ │ Analyzer │         │   │
│  │ └──────────┘ └──────────┘ └──────────┘ └──────────┘         │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                       │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │          AdvancedImageAnalyzer Component                     │   │
│  ├──────────────────────────────────────────────────────────────┤   │
│  │  Tabs: Metadata | Objects | Landmarks | Reverse | Risk      │   │
│  │  - Displays EXIF data with maps                             │   │
│  │  - Shows detected objects with confidence                   │   │
│  │  - Displays face/hand/pose counts                           │   │
│  │  - Shows privacy risk score                                 │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                       │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │          AdvancedVideoAnalyzer Component                     │   │
│  ├──────────────────────────────────────────────────────────────┤   │
│  │  - Frame gallery with navigation                            │   │
│  │  - Per-frame object detection results                       │   │
│  │  - Privacy risk assessment                                  │   │
│  │  - Summary statistics                                       │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
        │
        │ HTTP/REST API
        │ (Fetch API)
        ↓
┌─────────────────────────────────────────────────────────────────────┐
│                    Python Flask Backend                              │
│              http://localhost:5000 (api_backend.py)                 │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │              Flask Application (Flask + CORS)                │   │
│  ├──────────────────────────────────────────────────────────────┤   │
│  │  Routes:                                                      │   │
│  │  • POST /api/analyze-image                                   │   │
│  │  • POST /api/analyze-video                                   │   │
│  │  • POST /api/strip-metadata                                  │   │
│  │  • GET /health                                               │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                       │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │         Image Analysis Pipeline (extract_exif_data)          │   │
│  ├──────────────────────────────────────────────────────────────┤   │
│  │                                                               │   │
│  │  Input: Image File → File Validation                        │   │
│  │       │                                                       │   │
│  │       ├→ exifread: Extract EXIF Tags → All 100+ tags        │   │
│  │       │                                                       │   │
│  │       ├→ GPS Parser: Extract Location → Lat/Long/Alt        │   │
│  │       │                                                       │   │
│  │       ├→ Camera Parser: Make/Model → Canon/Nikon/Sony...    │   │
│  │       │                                                       │   │
│  │       └→ Output: All metadata in structured format           │   │
│  │                                                               │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                       │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │       Object Detection Pipeline (detect_objects)             │   │
│  ├──────────────────────────────────────────────────────────────┤   │
│  │                                                               │   │
│  │  Input: Image File → Load YOLO v8 Model                     │   │
│  │       │ (1st run: Download 630MB model)                     │   │
│  │       │                                                       │   │
│  │       ├→ YOLOv8n: Inference (500ms-2s)                      │   │
│  │       │                                                       │   │
│  │       ├→ Parse Results: 80+ classes, confidence scores      │   │
│  │       │                                                       │   │
│  │       ├→ Example: [                                          │   │
│  │       │    {"class": "person", "confidence": 0.95},          │   │
│  │       │    {"class": "dog", "confidence": 0.87}              │   │
│  │       │  ]                                                    │   │
│  │       │                                                       │   │
│  │       └→ Output: Object list with bounding boxes             │   │
│  │                                                               │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                       │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │    Landmark Detection Pipeline (detect_landmarks)            │   │
│  ├──────────────────────────────────────────────────────────────┤   │
│  │                                                               │   │
│  │  Input: Image File → Load MediaPipe Models                  │   │
│  │       │                                                       │   │
│  │       ├→ FaceDetection: Count & mesh landmarks (468pts)     │   │
│  │       │                                                       │   │
│  │       ├→ HandDetection: Count & skeleton (21pts per hand)   │   │
│  │       │                                                       │   │
│  │       ├→ PoseDetection: Body skeleton (17 keypoints)        │   │
│  │       │                                                       │   │
│  │       └→ Output: Counts and landmark positions              │   │
│  │                                                               │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                       │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │     Video Analysis Pipeline (extract_video_frames)           │   │
│  ├──────────────────────────────────────────────────────────────┤   │
│  │                                                               │   │
│  │  Input: Video File → Validate & Open (OpenCV)               │   │
│  │       │                                                       │   │
│  │       ├→ Extract Properties:                                 │   │
│  │       │  • Resolution (1920x1080)                            │   │
│  │       │  • FPS (30, 60, etc.)                                │   │
│  │       │  • Duration (seconds)                                │   │
│  │       │  • Total frame count                                 │   │
│  │       │                                                       │   │
│  │       ├→ Frame Extraction (max_frames=5):                    │   │
│  │       │  • Calculate extraction interval                     │   │
│  │       │  • Read frames at intervals                          │   │
│  │       │  • Encode to JPEG                                    │   │
│  │       │  • Convert to Base64                                 │   │
│  │       │                                                       │   │
│  │       ├→ Per-Frame Analysis:                                 │   │
│  │       │  • Run YOLO on each frame                            │   │
│  │       │  • Collect detection results                         │   │
│  │       │                                                       │   │
│  │       └→ Output: Frames + metadata + analysis                │   │
│  │                                                               │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                       │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │    Privacy Risk Scoring (get_privacy_recommendations)        │   │
│  ├──────────────────────────────────────────────────────────────┤   │
│  │                                                               │   │
│  │  Calculate Risk Score (0-100%):                              │   │
│  │                                                               │   │
│  │  Base Score: 10                                              │   │
│  │  + 40 if GPS data found          ← Location disclosure       │   │
│  │  + 15 if Camera info found       ← Device identification     │   │
│  │  + 20 if Faces detected          ← Privacy exposure          │   │
│  │  + 10 if Hands detected          ← Gesture/identity          │   │
│  │  + 10 if Large metadata          ← Hidden information        │   │
│  │  ─────────────────────────────                               │   │
│  │  = Final Score (mapped to 0-100%)                            │   │
│  │                                                               │   │
│  │  Risk Levels:                                                │   │
│  │  • 0-40:   LOW (Green)     ✓ Generally safe                  │   │
│  │  • 40-60:  MEDIUM (Yellow) ⚠ Consider removal                │   │
│  │  • 60-100: HIGH (Red)      ✗ Remove before sharing           │   │
│  │                                                               │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                       │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │         File Management (uploads/ directory)                 │   │
│  ├──────────────────────────────────────────────────────────────┤   │
│  │  • Store uploaded files temporarily                          │   │
│  │  • Timestamped filenames (prevents overwrites)               │   │
│  │  • Max file size: 500MB (configurable)                       │   │
│  │  • Auto-cleanup recommended (manual available)               │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
        ↑                                                    
        │ Returns JSON Response                                       
        │
┌─────────────────────────────────────────────────────────────────────┐
│                    File System & Models                              │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  Model Cache (~2GB on first run):                                   │
│  • yolov8n.pt (YOLO nano)          ~6MB                            │
│  • mediapipe face model             ~3MB                            │
│  • mediapipe hand model             ~4MB                            │
│  • mediapipe pose model             ~5MB                            │
│  • PyTorch dependencies             ~1.8GB                          │
│                                                                       │
│  Temporary Files:                                                    │
│  • uploads/original_*.{jpg,mp4}                                    │
│  • uploads/temp_frame_*.jpg                                        │
│  • uploads/cleaned_*.{jpg,mp4}                                     │
│                                                                      │
│  Python Dependencies:                                               │
│  • site-packages/torch/                                            │
│  • site-packages/cv2/                                              │
│  • site-packages/ultralytics/                                      │
│  • site-packages/mediapipe/                                        │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 📊 Component Interaction Diagram

```
                    React Component Lifecycle
                    
    ┌────────────────────────────────────────────┐
    │  AdvancedImageAnalyzer.tsx                 │
    │  (650 lines, ~8KB)                         │
    └────────────────────────────────────────────┘
                      ↓
    ┌────────────────────────────────────────────┐
    │  useState (preview, result, loading)       │
    │  useRef (fileInputRef)                     │
    └────────────────────────────────────────────┘
                      ↓
    ┌────────────────────────────────────────────┐
    │  File Input Handling                       │
    │  • handleFileSelect()                      │
    │  • handleDragOver()                        │
    │  • handleDrop()                            │
    └────────────────────────────────────────────┘
                      ↓
    ┌────────────────────────────────────────────┐
    │  Fetch to Flask Backend                    │
    │  fetch('http://localhost:5000/...')        │
    │  FormData with file                        │
    └────────────────────────────────────────────┘
                      ↓
    ┌────────────────────────────────────────────┐
    │  Flask API Handler                         │
    │  @app.route('/api/analyze-image')          │
    │  def analyze_image():                      │
    └────────────────────────────────────────────┘
                      ↓
    ┌────────────────────────────────────────────┐
    │  Process Image                             │
    │  1. Load Image (PIL)                       │
    │  2. Extract EXIF (exifread)                │
    │  3. Parse GPS (custom)                     │
    │  4. Detect Objects (YOLO)                  │
    │  5. Detect Landmarks (MediaPipe)           │
    │  6. Calculate Risk                         │
    └────────────────────────────────────────────┘
                      ↓
    ┌────────────────────────────────────────────┐
    │  Return JSON Response                      │
    │  {status, file_info, exif_data, ...}       │
    └────────────────────────────────────────────┘
                      ↓
    ┌────────────────────────────────────────────┐
    │  Parse Response in React                   │
    │  setResult(data)                           │
    │  setPreview(url)                           │
    │  setLoading(false)                         │
    └────────────────────────────────────────────┘
                      ↓
    ┌────────────────────────────────────────────┐
    │  Render UI Components                      │
    │  • Image Preview                           │
    │  • Risk Assessment Card                    │
    │  • Tab Navigation                          │
    │  • Tab Content (5 tabs)                    │
    └────────────────────────────────────────────┘
                      ↓
    ┌────────────────────────────────────────────┐
    │  User Interaction                          │
    │  • Click tabs to view different data       │
    │  • View detailed information               │
    │  • Get privacy recommendations             │
    └────────────────────────────────────────────┘
```

---

## 🔄 Data Flow Diagrams

### Image Processing Data Flow

```
Image File (JPG/PNG/WebP)
      │
      ├─→ File Validation & Save
      │
      ├─→ PIL Image Load
      │   ├─ Width: 1920
      │   ├─ Height: 1080
      │   ├─ Format: JPEG
      │   └─ Size: 2048576 bytes
      │
      ├─→ exifread Extract EXIF
      │   ├─ Image Make: Canon
      │   ├─ Image Model: EOS R5
      │   ├─ EXIF Date: 2024:01:30 10:45:30
      │   ├─ Shutter: 1/2000
      │   ├─ Aperture: 8.0
      │   ├─ ISO: 400
      │   ├─ Focal Length: 50mm
      │   └─ [100+ more tags]
      │
      ├─→ GPS Parser Extract Location
      │   ├─ Latitude: 40.7128
      │   ├─ Longitude: -74.0060
      │   ├─ Altitude: 10.5m
      │   └─ ⚠️ HIGH RISK: Location exposed
      │
      ├─→ YOLO v8 Detect Objects
      │   ├─ Load Model (yolov8n.pt)
      │   ├─ Run Inference (1.5s)
      │   ├─ Parse Detections:
      │   │  ├─ person: 0.95 confidence
      │   │  ├─ dog: 0.87 confidence
      │   │  └─ car: 0.82 confidence
      │   └─ Calculate Bounding Boxes
      │
      ├─→ MediaPipe Detect Landmarks
      │   ├─ Face Detection:
      │   │  ├─ Count: 1 face
      │   │  └─ Landmarks: 468 points
      │   ├─ Hand Detection:
      │   │  ├─ Count: 2 hands
      │   │  └─ Landmarks: 21 points each
      │   └─ Pose Detection:
      │      ├─ Status: Detected
      │      └─ Keypoints: 17 skeleton points
      │
      ├─→ Hash Image (Perceptual)
      │   ├─ Resize to 8x8
      │   ├─ Convert to Grayscale
      │   ├─ Calculate Average
      │   └─ Generate 64-bit Hash
      │
      ├─→ Risk Scoring Algorithm
      │   ├─ Base: 10
      │   ├─ GPS Found: +40
      │   ├─ Camera Info: +15
      │   ├─ Face Detected: +20
      │   └─ Final Score: 85 (HIGH RISK)
      │
      └─→ Generate Recommendations
          ├─ Remove GPS data
          ├─ Remove camera information
          ├─ Blur faces
          └─ Use FFmpeg for clean copy
```

### Video Processing Data Flow

```
Video File (MP4/WebM/AVI)
      │
      ├─→ File Validation & Save
      │
      ├─→ OpenCV Open Video
      │   ├─ Check Format
      │   ├─ Get Properties:
      │   │  ├─ Resolution: 1920x1080
      │   │  ├─ FPS: 30
      │   │  ├─ Duration: 120.5 seconds
      │   │  └─ Total Frames: 3615
      │   └─ Release Handle
      │
      ├─→ Extract Keyframes
      │   ├─ Calculate Interval:
      │   │  └─ 3615 / 5 = 723 frames
      │   ├─ Extract at Intervals:
      │   │  ├─ Frame 0 (0.0s)
      │   │  ├─ Frame 723 (24.1s)
      │   │  ├─ Frame 1446 (48.2s)
      │   │  ├─ Frame 2169 (72.3s)
      │   │  └─ Frame 2892 (96.4s)
      │   ├─ Encode to JPEG
      │   └─ Convert to Base64
      │
      ├─→ Per-Frame YOLO Analysis
      │   ├─ Frame 0:
      │   │  ├─ person: 0.92
      │   │  └─ dog: 0.85
      │   ├─ Frame 723:
      │   │  ├─ person: 0.88
      │   │  └─ car: 0.79
      │   └─ ... (for each frame)
      │
      ├─→ Face Detection Summary
      │   ├─ Frame 0: 1 face
      │   ├─ Frame 723: 2 faces
      │   └─ Total Faces: 3
      │
      ├─→ Risk Scoring
      │   ├─ Base: 15
      │   ├─ Frames Extracted: +10
      │   ├─ Faces Detected: +20
      │   └─ Final Score: 45 (MEDIUM RISK)
      │
      └─→ Package Response
          ├─ File metadata
          ├─ Extracted frames
          ├─ Per-frame analysis
          └─ Risk assessment
```

---

## 💾 Database Schema (Optional Future)

If logging is enabled, data structure would be:

```sql
-- Images Analysis Table
CREATE TABLE image_analysis (
    id INTEGER PRIMARY KEY,
    filename TEXT,
    file_size INTEGER,
    file_hash VARCHAR(64),
    width INTEGER,
    height INTEGER,
    camera_make VARCHAR(100),
    camera_model VARCHAR(100),
    has_gps BOOLEAN,
    gps_latitude FLOAT,
    gps_longitude FLOAT,
    face_count INTEGER,
    hand_count INTEGER,
    object_count INTEGER,
    risk_score INTEGER,
    risk_level VARCHAR(10),
    analysis_timestamp TIMESTAMP,
    created_at TIMESTAMP
);

-- Videos Analysis Table
CREATE TABLE video_analysis (
    id INTEGER PRIMARY KEY,
    filename TEXT,
    file_size INTEGER,
    duration FLOAT,
    fps FLOAT,
    resolution VARCHAR(20),
    total_frames INTEGER,
    extracted_frames INTEGER,
    face_count INTEGER,
    total_objects INTEGER,
    risk_score INTEGER,
    risk_level VARCHAR(10),
    analysis_timestamp TIMESTAMP,
    created_at TIMESTAMP
);

-- Detected Objects Table
CREATE TABLE detected_objects (
    id INTEGER PRIMARY KEY,
    analysis_id INTEGER,
    object_class VARCHAR(50),
    confidence FLOAT,
    bbox_x1 FLOAT,
    bbox_y1 FLOAT,
    bbox_x2 FLOAT,
    bbox_y2 FLOAT,
    created_at TIMESTAMP
);
```

---

## 🔌 Extension Points

### Add Custom Models

```python
# In api_backend.py, add:
def load_custom_yolo_model():
    return YOLO('path/to/custom_model.pt')

# Or use different detection framework:
from detectron2 import model_zoo
cfg = model_zoo.get_config_file("path/to/config.yaml")
detector = DefaultPredictor(cfg)
```

### Add API Integrations

```python
# For reverse image search:
def reverse_search_tineye(image_hash):
    api_key = os.getenv('TINEYE_API_KEY')
    # Implementation...

def reverse_search_google_lens(image_path):
    # Use google-reverse-image-search library
    # Implementation...
```

### Add Custom Processing

```python
# Add custom analysis:
def custom_analysis(image_path):
    # Your analysis code
    return results

# Hook into pipeline:
result['custom'] = custom_analysis(filepath)
```

---

## 📈 Scaling Considerations

### For Batch Processing
```python
def analyze_batch(file_list):
    results = []
    for file in file_list:
        result = analyze_image(file)
        results.append(result)
    return results
```

### For Real-time Streaming
```python
def analyze_stream(video_source):
    cap = cv2.VideoCapture(video_source)
    while True:
        ret, frame = cap.read()
        if not ret: break
        
        # Run YOLO on each frame
        results = model(frame)
        # Yield results in real-time
        yield results
```

### For Distributed Processing
```python
# Use Celery for task queue:
@app.task
def analyze_image_async(filepath):
    return analyze_image(filepath)

# Or use AWS Lambda:
def lambda_handler(event, context):
    file = event['file']
    result = analyze_image(file)
    return result
```

---

## 🔐 Security Hardening

### Input Validation
```python
# In production:
- Validate file MIME types
- Scan with virus scanner (ClamAV)
- Limit upload size
- Use secure file naming
- Store outside web root
```

### Access Control
```python
# Add authentication:
from flask_jwt_extended import JWTManager
jwt = JWTManager(app)

@app.route('/api/analyze-image')
@jwt_required()
def analyze_image():
    # Requires valid JWT token
```

### Rate Limiting
```python
from flask_limiter import Limiter
limiter = Limiter(app, key_func=lambda: request.remote_addr)

@app.route('/api/analyze-image')
@limiter.limit("5 per minute")
def analyze_image():
    # Max 5 requests per minute
```

---

## 📊 Performance Tuning

### Model Optimization
```python
# Use quantized models:
yolo_model = YOLO('yolov8n-int8.pt')  # Faster, smaller

# Use half precision:
model.half()  # FP16 on GPU

# Use dynamic shape:
results = model(source, imgsz=416)  # Smaller input
```

### Batch Processing
```python
# Process multiple images at once:
results = model(batch_images)  # Faster than one-by-one
```

### Caching
```python
from functools import lru_cache

@lru_cache(maxsize=100)
def get_model():
    return YOLO('yolov8n.pt')  # Cache loaded model
```

---

This comprehensive architecture documentation provides:
- ✅ Complete system overview
- ✅ Data flow diagrams
- ✅ Component interaction
- ✅ Scaling approaches
- ✅ Security hardening
- ✅ Performance optimization
- ✅ Extension points
