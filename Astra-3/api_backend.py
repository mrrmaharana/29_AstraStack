import os
import json
import base64
import hashlib
from datetime import datetime
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from werkzeug.utils import secure_filename
import cv2
import numpy as np
from PIL import Image
import piexif
import exifread
import requests
from io import BytesIO
import torch
from pathlib import Path

# Import detection models
try:
    from ultralytics import YOLO
    from mediapipe import solutions as mp_solutions
    MODELS_AVAILABLE = True
except:
    MODELS_AVAILABLE = False
    print("Warning: Some AI models not available. Install ultralytics and mediapipe.")

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'mp4', 'avi', 'mov', 'mkv'}

os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 500 * 1024 * 1024  # 500MB max

# Initialize models (lazy loading)
yolo_model = None
mp_detector = None

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def get_yolo_model():
    global yolo_model
    if yolo_model is None:
        try:
            yolo_model = YOLO('yolov8n.pt')
        except:
            print("Error loading YOLO model")
    return yolo_model

def extract_exif_data(image_path):
    """Extract EXIF data using exifread library"""
    exif_data = {}
    try:
        with open(image_path, 'rb') as f:
            tags = exifread.process_file(f, details=False)
            for tag in tags:
                try:
                    exif_data[tag] = str(tags[tag])
                except:
                    pass
    except Exception as e:
        print(f"Error reading EXIF: {e}")
    
    return exif_data

def extract_gps_data(exif_data):
    """Extract GPS coordinates from EXIF data"""
    gps_info = {}
    try:
        if 'GPS GPSLatitude' in exif_data and 'GPS GPSLongitude' in exif_data:
            lat = exif_data['GPS GPSLatitude']
            lon = exif_data['GPS GPSLongitude']
            gps_info['latitude'] = float(lat) if lat else None
            gps_info['longitude'] = float(lon) if lon else None
            
            if 'GPS GPSAltitude' in exif_data:
                gps_info['altitude'] = float(exif_data['GPS GPSAltitude']) if exif_data['GPS GPSAltitude'] else None
    except:
        pass
    
    return gps_info if gps_info else None

def extract_camera_info(exif_data):
    """Extract camera and capture information"""
    camera_info = {}
    try:
        # Camera make and model
        if 'Image Make' in exif_data:
            camera_info['make'] = exif_data['Image Make']
        if 'Image Model' in exif_data:
            camera_info['model'] = exif_data['Image Model']
        
        # Capture settings
        capture_info = {}
        if 'EXIF ExposureTime' in exif_data:
            capture_info['shutter_speed'] = exif_data['EXIF ExposureTime']
        if 'EXIF FNumber' in exif_data:
            capture_info['aperture'] = exif_data['EXIF FNumber']
        if 'EXIF ISOSpeedRatings' in exif_data:
            capture_info['iso'] = exif_data['EXIF ISOSpeedRatings']
        if 'EXIF FocalLength' in exif_data:
            capture_info['focal_length'] = exif_data['EXIF FocalLength']
        if 'EXIF WhiteBalance' in exif_data:
            capture_info['white_balance'] = exif_data['EXIF WhiteBalance']
        if 'EXIF DateTimeOriginal' in exif_data:
            capture_info['datetime'] = exif_data['EXIF DateTimeOriginal']
        
        if capture_info:
            camera_info['capture_settings'] = capture_info
    except Exception as e:
        print(f"Error extracting camera info: {e}")
    
    return camera_info if camera_info else None

def detect_objects(image_path):
    """Detect objects in image using YOLO"""
    detections = []
    try:
        model = get_yolo_model()
        if model is None:
            return detections
        
        results = model(image_path)
        for r in results:
            for box in r.boxes:
                detection = {
                    'class': r.names[int(box.cls)],
                    'confidence': float(box.conf),
                    'bbox': box.xyxy[0].tolist()
                }
                detections.append(detection)
    except Exception as e:
        print(f"Error in object detection: {e}")
    
    return detections

def detect_landmarks(image_path):
    """Detect landmarks using MediaPipe"""
    landmarks_data = {
        'face_count': 0,
        'hand_count': 0,
        'pose_detected': False
    }
    
    try:
        from mediapipe import solutions
        from mediapipe.framework.formats import landmark_pb2
        import mediapipe as mp
        
        image = cv2.imread(image_path)
        if image is None:
            return landmarks_data
        
        h, w, c = image.shape
        
        # Face detection
        with mp.solutions.face_detection.FaceDetection() as face_detection:
            results = face_detection.process(cv2.cvtColor(image, cv2.COLOR_BGR2RGB))
            if results.detections:
                landmarks_data['face_count'] = len(results.detections)
        
        # Hand detection
        with mp.solutions.hands.Hands() as hands:
            results = hands.process(cv2.cvtColor(image, cv2.COLOR_BGR2RGB))
            if results.multi_hand_landmarks:
                landmarks_data['hand_count'] = len(results.multi_hand_landmarks)
        
        # Pose detection
        with mp.solutions.pose.Pose() as pose:
            results = pose.process(cv2.cvtColor(image, cv2.COLOR_BGR2RGB))
            if results.pose_landmarks:
                landmarks_data['pose_detected'] = True
    
    except Exception as e:
        print(f"Error in landmark detection: {e}")
    
    return landmarks_data

def reverse_image_search(image_path):
    """Reverse image search using Google Images API"""
    results = {
        'google_lens': None,
        'similar_images': [],
        'web_results': []
    }
    
    try:
        # Read image and encode to base64
        with open(image_path, 'rb') as f:
            image_data = f.read()
        
        # Simple reverse search attempt (requires API key or proxy)
        # This is a placeholder - full implementation would need:
        # - Google Images API key
        # - TinEye API key
        # - Or use a service like SerpAPI
        
        results['google_lens'] = {
            'status': 'requires_api_key',
            'message': 'Configure API keys for full reverse image search'
        }
    except Exception as e:
        print(f"Error in reverse image search: {e}")
    
    return results

def extract_video_frames(video_path, max_frames=5):
    """Extract frames from video"""
    frames_data = []
    try:
        cap = cv2.VideoCapture(video_path)
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        frame_interval = max(1, total_frames // max_frames)
        
        frame_count = 0
        while True:
            ret, frame = cap.read()
            if not ret:
                break
            
            if frame_count % frame_interval == 0 and len(frames_data) < max_frames:
                # Convert frame to base64
                ret, buffer = cv2.imencode('.jpg', frame)
                frame_base64 = base64.b64encode(buffer).decode('utf-8')
                frames_data.append({
                    'frame_number': frame_count,
                    'timestamp': frame_count / cap.get(cv2.CAP_PROP_FPS),
                    'image': f'data:image/jpeg;base64,{frame_base64}'
                })
            
            frame_count += 1
        
        cap.release()
    except Exception as e:
        print(f"Error extracting video frames: {e}")
    
    return frames_data

def get_image_hash(image_path):
    """Calculate perceptual hash of image for reverse search"""
    try:
        image = cv2.imread(image_path)
        if image is None:
            return None
        
        # Resize to small fixed size
        image_small = cv2.resize(image, (8, 8))
        # Convert to grayscale
        gray = cv2.cvtColor(image_small, cv2.COLOR_BGR2GRAY)
        # Calculate average
        avg = gray.mean()
        # Generate hash
        hash_string = ''.join(['1' if pixel > avg else '0' for pixel in gray.flatten()])
        return hash_string
    except:
        return None

@app.route('/api/analyze-image', methods=['POST'])
def analyze_image():
    """Analyze image metadata, objects, landmarks, and reverse search"""
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        if not allowed_file(file.filename):
            return jsonify({'error': 'File type not allowed'}), 400
        
        # Save file
        filename = secure_filename(file.filename)
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S_')
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], timestamp + filename)
        file.save(filepath)
        
        # Extract image info
        image = Image.open(filepath)
        img_width, img_height = image.size
        file_size = os.path.getsize(filepath)
        
        # Extract EXIF data
        exif_data = extract_exif_data(filepath)
        gps_data = extract_gps_data(exif_data)
        camera_info = extract_camera_info(exif_data)
        
        # Object detection
        objects = detect_objects(filepath)
        
        # Landmark detection
        landmarks = detect_landmarks(filepath)
        
        # Reverse image search
        reverse_search = reverse_image_search(filepath)
        
        # Image hash for comparison
        image_hash = get_image_hash(filepath)
        
        # Risk assessment
        risk_score = 10
        if gps_data:
            risk_score += 40
        if camera_info:
            risk_score += 15
        if len(objects) > 5:
            risk_score += 10
        if landmarks['face_count'] > 0:
            risk_score += 20
        
        risk_level = 'HIGH' if risk_score >= 60 else 'MEDIUM' if risk_score >= 40 else 'LOW'
        
        result = {
            'status': 'success',
            'file_info': {
                'filename': filename,
                'size': file_size,
                'size_formatted': f"{file_size / (1024*1024):.2f} MB" if file_size > 1024*1024 else f"{file_size / 1024:.2f} KB",
                'width': img_width,
                'height': img_height,
                'aspect_ratio': f"{img_width / img_height:.2f}" if img_height else "Unknown",
                'format': image.format,
                'creation_time': datetime.now().isoformat()
            },
            'exif_data': exif_data,
            'gps_data': gps_data,
            'camera_info': camera_info,
            'objects_detected': objects,
            'landmarks_detected': landmarks,
            'reverse_search': reverse_search,
            'image_hash': image_hash,
            'privacy_risk': {
                'score': risk_score,
                'level': risk_level,
                'recommendations': get_privacy_recommendations(risk_score, gps_data, camera_info, landmarks)
            }
        }
        
        return jsonify(result)
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/analyze-video', methods=['POST'])
def analyze_video():
    """Analyze video metadata, extract frames, and detect objects/landmarks in each frame"""
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        if not allowed_file(file.filename):
            return jsonify({'error': 'File type not allowed'}), 400
        
        # Save file
        filename = secure_filename(file.filename)
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S_')
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], timestamp + filename)
        file.save(filepath)
        
        # Video metadata extraction
        cap = cv2.VideoCapture(filepath)
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        fps = cap.get(cv2.CAP_PROP_FPS)
        width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        duration = total_frames / fps if fps > 0 else 0
        file_size = os.path.getsize(filepath)
        
        cap.release()
        
        # Extract frames
        frames = extract_video_frames(filepath, max_frames=5)
        
        # Analyze each frame
        frame_analysis = []
        for frame_data in frames:
            # Convert base64 to image for analysis
            frame_base64 = frame_data['image'].split(',')[1]
            frame_bytes = base64.b64decode(frame_base64)
            frame_image = cv2.imdecode(np.frombuffer(frame_bytes, np.uint8), cv2.IMREAD_COLOR)
            
            # Temporary save for analysis
            temp_frame_path = os.path.join(app.config['UPLOAD_FOLDER'], f"temp_frame_{frame_data['frame_number']}.jpg")
            cv2.imwrite(temp_frame_path, frame_image)
            
            # Detect objects in frame
            frame_objects = detect_objects(temp_frame_path)
            
            # Detect landmarks in frame
            frame_landmarks = detect_landmarks(temp_frame_path)
            
            frame_analysis.append({
                'frame_number': frame_data['frame_number'],
                'timestamp': frame_data['timestamp'],
                'objects': frame_objects,
                'landmarks': frame_landmarks
            })
            
            # Clean up temp file
            try:
                os.remove(temp_frame_path)
            except:
                pass
        
        # Privacy risk assessment
        risk_score = 10
        
        if duration > 3600:
            risk_score += 10
        
        # Check for faces in frames
        face_count = 0
        for analysis in frame_analysis:
            face_count += analysis['landmarks']['face_count']
        
        if face_count > 0:
            risk_score += 20
        
        risk_level = 'HIGH' if risk_score >= 60 else 'MEDIUM' if risk_score >= 40 else 'LOW'
        
        result = {
            'status': 'success',
            'file_info': {
                'filename': filename,
                'size': file_size,
                'size_formatted': f"{file_size / (1024*1024):.2f} MB",
                'duration': duration,
                'fps': fps,
                'resolution': f"{width}x{height}",
                'total_frames': total_frames
            },
            'extracted_frames': frames,
            'frame_analysis': frame_analysis,
            'privacy_risk': {
                'score': risk_score,
                'level': risk_level,
                'face_count': face_count,
                'recommendations': [
                    "Video contains personal/identifying information" if face_count > 0 else "No faces detected",
                    "Consider removing or blurring identifiable content before sharing",
                    "Use tools like FFmpeg to re-encode without metadata",
                ]
            }
        }
        
        return jsonify(result)
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

def get_privacy_recommendations(risk_score, gps_data, camera_info, landmarks):
    """Generate privacy recommendations based on analysis"""
    recommendations = []
    
    if gps_data:
        recommendations.append("⚠️ GPS location data detected - consider removing before sharing")
    
    if camera_info:
        recommendations.append("⚠️ Camera information detected - model and settings exposed")
    
    if landmarks['face_count'] > 0:
        recommendations.append(f"⚠️ {landmarks['face_count']} face(s) detected - consider blurring before sharing")
    
    if landmarks['hand_count'] > 0:
        recommendations.append(f"⚠️ {landmarks['hand_count']} hand(s) detected")
    
    if risk_score >= 60:
        recommendations.append("🔴 HIGH RISK: Remove all metadata and consider re-encoding")
    elif risk_score >= 40:
        recommendations.append("🟡 MEDIUM RISK: Consider removing metadata before sharing")
    else:
        recommendations.append("🟢 LOW RISK: Generally safe to share, but review content")
    
    return recommendations

@app.route('/api/strip-metadata', methods=['POST'])
def strip_metadata():
    """Remove metadata from image or video"""
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
        
        file = request.files['file']
        filename = secure_filename(file.filename)
        
        # Save original
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], 'original_' + filename)
        file.save(filepath)
        
        # Create clean copy
        clean_filename = 'cleaned_' + filename
        clean_filepath = os.path.join(app.config['UPLOAD_FOLDER'], clean_filename)
        
        # Load and re-save without metadata
        image = Image.open(filepath)
        
        # Create new image without EXIF
        data = list(image.getdata())
        image_without_exif = Image.new(image.mode, image.size)
        image_without_exif.putdata(data)
        image_without_exif.save(clean_filepath, quality=95)
        
        return jsonify({
            'status': 'success',
            'message': 'Metadata stripped successfully',
            'cleaned_file': clean_filename
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/remove-exif', methods=['POST'])
def remove_exif():
    """Remove EXIF data from image and return as file download"""
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file part'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No selected file'}), 400
        
        # Process image
        img = Image.open(file.stream)
        
        # Create new image without metadata
        data = list(img.getdata())
        image_without_exif = Image.new(img.mode, img.size)
        image_without_exif.putdata(data)
        
        # Save to bytes with proper format
        output = BytesIO()
        # Use JPEG format for compatibility and smaller size
        image_without_exif = image_without_exif.convert('RGB') if image_without_exif.mode in ('RGBA', 'LA', 'P') else image_without_exif
        image_without_exif.save(output, format='JPEG', quality=95, optimize=False)
        output.seek(0)
        
        return send_file(
            output,
            mimetype='image/jpeg',
            as_attachment=True,
            download_name='image_no_exif.jpg'
        )
    
    except Exception as e:
        print(f"Error removing EXIF: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok', 'timestamp': datetime.now().isoformat()})

if __name__ == '__main__':
    app.run(debug=True, port=5000, host='0.0.0.0')
