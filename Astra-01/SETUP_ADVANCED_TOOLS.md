# OSINT Toolkit - Advanced Image & Video Analyzer

## Features

### AI-Powered Analysis
- **EXIF Data Extraction**: Complete metadata extraction using exifread
- **Object Detection**: YOLO v8 for real-time object recognition
- **Landmark Detection**: MediaPipe for face, hand, and pose detection
- **Frame Extraction**: OpenCV-based frame extraction from videos
- **Reverse Image Search**: Prepare for reverse image search with perceptual hashing
- **Privacy Risk Scoring**: Comprehensive privacy assessment

### Two Tool Tiers

#### Standard Tools
- **Image Metadata**: Basic EXIF extraction
- **Video Metadata**: Basic video properties extraction

#### Advanced AI Tools (Requires Python Backend)
- **Image AI Analyzer**: Full EXIF, objects, landmarks, reverse search
- **Video AI Analyzer**: Frame extraction, per-frame object detection, analysis

## Setup Instructions

### 1. Install Python Dependencies

```bash
pip install -r requirements.txt
```

**Key Dependencies:**
- `Flask` - Web framework for API
- `OpenCV` - Computer vision and frame extraction
- `ultralytics` - YOLO object detection
- `mediapipe` - Face/hand/pose detection
- `exifread` - EXIF data extraction
- `Pillow` - Image processing

### 2. Start Python Backend

```bash
python api_backend.py
```

The API will start on `http://localhost:5000`

**Available Endpoints:**
- `POST /api/analyze-image` - Full image analysis
- `POST /api/analyze-video` - Full video analysis with frame extraction
- `POST /api/strip-metadata` - Remove metadata from images
- `GET /health` - Health check

### 3. Next.js Frontend (Already Running)

The Next.js app is already running on `http://localhost:3000`

Access the advanced tools:
- **Image AI Analyzer**: Tab in the main toolbar
- **Video AI Analyzer**: Tab in the main toolbar

## Usage

### Analyzing Images

1. Open "Image AI Analyzer" tool
2. Drag & drop or select an image file
3. Wait for analysis to complete (displays):
   - Full EXIF/metadata
   - GPS location (if present)
   - Detected objects with confidence scores
   - Face count, hand count, pose detection
   - Privacy risk score (0-100%)
   - Recommendations

### Analyzing Videos

1. Open "Video AI Analyzer" tool
2. Drag & drop or select a video file
3. Wait for frame extraction and analysis
4. View extracted frames with:
   - Per-frame object detection
   - Face detection counts
   - Privacy assessment
   - Frame navigation

## Technical Details

### Python Backend (`api_backend.py`)

**Image Analysis Flow:**
1. Receive image file
2. Extract EXIF data using exifread
3. Parse GPS coordinates from EXIF
4. Run YOLO v8 object detection
5. Run MediaPipe landmark detection
6. Calculate perceptual hash
7. Risk assessment based on findings
8. Return comprehensive JSON

**Video Analysis Flow:**
1. Receive video file
2. Extract video properties (resolution, fps, duration)
3. Extract keyframes using OpenCV
4. Run YOLO object detection on each frame
5. Detect faces per frame
6. Calculate overall privacy risk
7. Return analysis data with frame images

### AI Models Used

- **Object Detection**: YOLOv8n (nano - fast, lower resources)
- **Face/Hand/Pose**: MediaPipe Solutions (accurate, real-time)
- **EXIF Parsing**: exifread (comprehensive EXIF support)

### Performance Notes

- First-time model loading takes ~30 seconds
- Subsequent requests are faster (models cached)
- Video analysis depends on video length/resolution
- GPU acceleration available if CUDA installed

## API Response Examples

### Image Analysis Response

```json
{
  "status": "success",
  "file_info": {
    "filename": "photo.jpg",
    "size": 2048576,
    "width": 1920,
    "height": 1080,
    "format": "JPEG"
  },
  "exif_data": {
    "Image Make": "Canon",
    "Image Model": "Canon EOS R5",
    "EXIF DateTimeOriginal": "2024:01:30 10:45:30"
  },
  "gps_data": {
    "latitude": 40.7128,
    "longitude": -74.0060,
    "altitude": 10.5
  },
  "objects_detected": [
    {
      "class": "person",
      "confidence": 0.95,
      "bbox": [100, 150, 500, 800]
    }
  ],
  "landmarks_detected": {
    "face_count": 1,
    "hand_count": 2,
    "pose_detected": true
  },
  "privacy_risk": {
    "score": 75,
    "level": "HIGH",
    "recommendations": [...]
  }
}
```

### Video Analysis Response

```json
{
  "status": "success",
  "file_info": {
    "filename": "video.mp4",
    "duration": 120.5,
    "fps": 30,
    "resolution": "1920x1080",
    "total_frames": 3615
  },
  "extracted_frames": [
    {
      "frame_number": 0,
      "timestamp": 0.0,
      "image": "data:image/jpeg;base64,..."
    }
  ],
  "frame_analysis": [
    {
      "frame_number": 0,
      "timestamp": 0.0,
      "objects": [...]
    }
  ],
  "privacy_risk": {
    "score": 45,
    "level": "MEDIUM",
    "face_count": 3
  }
}
```

## Troubleshooting

### "Cannot connect to backend" Error
- Ensure Python backend is running: `python api_backend.py`
- Check port 5000 is accessible
- Verify CORS is enabled in Flask

### Models Not Loading
- Install PyTorch: `pip install torch torchvision`
- Download YOLO models manually if needed
- Check disk space for model cache

### Memory Issues with Large Videos
- Reduce frame extraction rate in `api_backend.py`
- Use videos under 1GB
- Run on machine with 8GB+ RAM

### GPU Acceleration
Install CUDA-enabled PyTorch:
```bash
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118
```

## Privacy & Security

- All analysis is **local** - no data sent to external APIs
- Files are stored in `uploads/` directory (temporary)
- Delete files manually or implement cleanup
- No model data is logged or persisted beyond current session
- **EXIF data may contain sensitive information** - review before sharing

## Legal Notice

⚠️ This toolkit is for **educational and authorized security research** purposes only.
- Respect privacy laws in your jurisdiction
- Do not use on files without permission
- Always review content for sensitive information before sharing

## Performance Metrics

| Task | Time | Resource Usage |
|------|------|-----------------|
| EXIF Extraction | <100ms | Minimal |
| Object Detection | 500ms-2s | Moderate (GPU: 500ms) |
| Landmark Detection | 200-500ms | Moderate |
| Frame Extraction | 1-5s | CPU intensive |
| Complete Image Analysis | 1-3s | Moderate |
| Video (5 min, 1080p) | 30-60s | High |

## Future Enhancements

- [ ] TinEye API integration for reverse search
- [ ] Google Lens API integration
- [ ] OCR text extraction from images/video
- [ ] Metadata stripping/cleaning tools
- [ ] Batch processing
- [ ] Advanced forensic analysis
- [ ] Audio metadata extraction
- [ ] Real-time video stream analysis

## License

For educational purposes. See LICENSE file for details.
