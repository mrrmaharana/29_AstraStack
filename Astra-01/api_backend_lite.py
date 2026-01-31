#!/usr/bin/env python3
"""
Lightweight OSINT Image & Video Analysis API Backend
Supports EXIF extraction, object detection, landmark detection, and more
"""

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
from io import BytesIO
from pathlib import Path

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
mp_face_detection = None
models_loading = False

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def get_yolo_model():
    """Lazy load YOLO model"""
    global yolo_model, models_loading
    if yolo_model is None and not models_loading:
        try:
            print("[INFO] Loading YOLO model...")
            models_loading = True
            from ultralytics import YOLO
            yolo_model = YOLO('yolov8n.pt')
            models_loading = False
            print("[INFO] YOLO model loaded successfully")
        except Exception as e:
            models_loading = False
            print(f"[WARNING] Could not load YOLO model: {e}")
            return None
    return yolo_model

def get_mediapipe_detector():
    """Lazy load MediaPipe detector"""
    global mp_detector, models_loading
    if mp_detector is None and not models_loading:
        try:
            print("[INFO] Loading MediaPipe model...")
            models_loading = True
            from mediapipe import solutions
            mp_detector = solutions.face_detection
            models_loading = False
            print("[INFO] MediaPipe model loaded successfully")
        except Exception as e:
            models_loading = False
            print(f"[WARNING] Could not load MediaPipe: {e}")
            return None
    return mp_detector

def extract_exif_data(image_path):
    """Extract all EXIF data from image"""
    try:
        exif_data = {}
        with open(image_path, 'rb') as f:
            tags = exifread.process_file(f, details=False)
            for tag, value in tags.items():
                try:
                    exif_data[tag] = str(value)
                except:
                    exif_data[tag] = "Could not parse"
        return exif_data
    except Exception as e:
        print(f"Error extracting EXIF: {e}")
        return {}

def extract_gps_data(exif_data):
    """Extract GPS coordinates from EXIF data"""
    try:
        gps_data = {}
        if 'GPS GPSLatitude' in exif_data:
            gps_data['latitude'] = exif_data['GPS GPSLatitude']
        if 'GPS GPSLongitude' in exif_data:
            gps_data['longitude'] = exif_data['GPS GPSLongitude']
        if 'GPS GPSAltitude' in exif_data:
            gps_data['altitude'] = exif_data['GPS GPSAltitude']
        return gps_data if gps_data else None
    except Exception as e:
        print(f"Error extracting GPS: {e}")
        return None

def extract_camera_info(exif_data):
    """Extract camera information from EXIF"""
    camera_info = {}
    
    camera_fields = {
        'Image Make': 'make',
        'Image Model': 'model',
        'EXIF ExposureTime': 'exposure_time',
        'EXIF FNumber': 'f_number',
        'EXIF ISOSpeedRatings': 'iso',
        'EXIF FocalLength': 'focal_length',
        'EXIF WhiteBalance': 'white_balance',
        'EXIF LensModel': 'lens_model',
        'Image DateTime': 'date_time',
    }
    
    for exif_key, info_key in camera_fields.items():
        if exif_key in exif_data:
            camera_info[info_key] = str(exif_data[exif_key])
    
    return camera_info if camera_info else None

def detect_objects(image_path):
    """Detect objects using YOLO"""
    try:
        model = get_yolo_model()
        if model is None:
            return []
        
        results = model(image_path)
        detections = []
        
        for result in results:
            if result.boxes is not None:
                for box in result.boxes:
                    detections.append({
                        'class': result.names[int(box.cls.item())],
                        'confidence': float(box.conf.item()),
                        'bbox': box.xyxy[0].tolist()
                    })
        
        return detections
    except Exception as e:
        print(f"Error detecting objects: {e}")
        return []

def detect_landmarks(image_path):
    """Detect faces, hands, and poses using MediaPipe"""
    try:
        from mediapipe import solutions
        
        img = cv2.imread(image_path)
        if img is None:
            return {'faces': 0, 'hands': 0, 'poses': 0}
        
        results = {'faces': 0, 'hands': 0, 'poses': 0}
        
        # Face detection
        try:
            with solutions.face_detection.FaceDetection() as face_detection:
                rgb_img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
                face_results = face_detection.process(rgb_img)
                if face_results.detections:
                    results['faces'] = len(face_results.detections)
        except:
            pass
        
        # Hand detection
        try:
            with solutions.hands.Hands() as hands:
                rgb_img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
                hand_results = hands.process(rgb_img)
                if hand_results.multi_hand_landmarks:
                    results['hands'] = len(hand_results.multi_hand_landmarks)
        except:
            pass
        
        # Pose detection
        try:
            with solutions.pose.Pose() as pose:
                rgb_img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
                pose_results = pose.process(rgb_img)
                results['poses'] = 1 if pose_results.pose_landmarks else 0
        except:
            pass
        
        return results
    except Exception as e:
        print(f"Error detecting landmarks: {e}")
        return {'faces': 0, 'hands': 0, 'poses': 0}

def extract_video_frames(video_path, max_frames=5):
    """Extract frames from video"""
    try:
        cap = cv2.VideoCapture(video_path)
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        fps = cap.get(cv2.CAP_PROP_FPS)
        
        if total_frames == 0:
            return [], 0, 0
        
        frame_interval = max(1, total_frames // max_frames)
        frames = []
        frame_idx = 0
        
        while cap.isOpened() and len(frames) < max_frames:
            ret, frame = cap.read()
            if not ret:
                break
            
            if frame_idx % frame_interval == 0:
                # Encode frame to base64
                _, buffer = cv2.imencode('.jpg', frame)
                frame_b64 = base64.b64encode(buffer).decode()
                timestamp = frame_idx / fps if fps > 0 else 0
                frames.append({
                    'index': frame_idx,
                    'timestamp': timestamp,
                    'data': f'data:image/jpeg;base64,{frame_b64}'
                })
            
            frame_idx += 1
        
        cap.release()
        return frames, total_frames, fps
    except Exception as e:
        print(f"Error extracting frames: {e}")
        return [], 0, 0

def get_image_hash(image_path):
    """Generate perceptual hash for reverse image search"""
    try:
        img = Image.open(image_path)
        img_small = img.resize((8, 8))
        img_gray = img_small.convert('L')
        pixels = list(img_gray.getdata())
        avg = sum(pixels) / len(pixels)
        hash_bits = ''.join('1' if p > avg else '0' for p in pixels)
        return hash_bits
    except Exception as e:
        print(f"Error generating hash: {e}")
        return None

def get_privacy_recommendations(exif_data, gps_data, camera_info, objects_detected, landmarks_detected):
    """Calculate privacy risk score and get recommendations"""
    risk_score = 0
    factors = {}
    recommendations = []
    
    # GPS data risk (high)
    if gps_data and any(gps_data.values()):
        risk_score += 40
        factors['gps_location'] = True
        recommendations.append('⚠️ GPS coordinates found. Your location is identifiable.')
    
    # Camera info risk (medium)
    if camera_info and len(camera_info) > 0:
        risk_score += 15
        factors['camera_info'] = True
        recommendations.append('🔍 Camera information present. Device model may be identified.')
    
    # Face detection (high privacy risk)
    if landmarks_detected and landmarks_detected.get('faces', 0) > 0:
        risk_score += 20
        factors['faces_detected'] = True
        recommendations.append(f'👤 {landmarks_detected["faces"]} face(s) detected in image.')
    
    # Hand/gesture detection
    if landmarks_detected and landmarks_detected.get('hands', 0) > 0:
        risk_score += 10
        factors['hands_detected'] = True
        recommendations.append(f'✋ {landmarks_detected["hands"]} hand(s) detected.')
    
    # Large metadata
    exif_count = len(exif_data) if exif_data else 0
    if exif_count > 50:
        risk_score += 10
        factors['large_metadata'] = True
        recommendations.append(f'📊 Extensive metadata ({exif_count} tags) present.')
    
    # Cap score at 100
    risk_score = min(risk_score, 100)
    
    # Add general recommendations
    if risk_score >= 50:
        recommendations.append('🛡️ Consider removing metadata before sharing.')
    
    if risk_score == 0:
        recommendations.append('✅ Image appears privacy-safe with minimal identifiable information.')
    
    return {
        'score': risk_score,
        'level': 'HIGH' if risk_score >= 70 else 'MEDIUM' if risk_score >= 40 else 'LOW',
        'factors': factors,
        'recommendations': recommendations
    }

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'healthy', 'service': 'OSINT Image Analysis API'})

@app.route('/api/analyze-image', methods=['POST'])
def analyze_image():
    """Analyze image: EXIF, objects, landmarks, reverse search, privacy risk"""
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file part'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No selected file'}), 400
        
        if not allowed_file(file.filename):
            return jsonify({'error': 'File type not allowed'}), 400
        
        # Save file
        filename = secure_filename(file.filename)
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S_')
        filename = timestamp + filename
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        
        # Extract metadata
        exif_data = extract_exif_data(filepath)
        gps_data = extract_gps_data(exif_data)
        camera_info = extract_camera_info(exif_data)
        
        # Detect objects and landmarks
        objects_detected = detect_objects(filepath)
        landmarks_detected = detect_landmarks(filepath)
        
        # Generate hash for reverse search
        image_hash = get_image_hash(filepath)
        
        # Calculate privacy risk
        privacy_risk = get_privacy_recommendations(
            exif_data, gps_data, camera_info, 
            objects_detected, landmarks_detected
        )
        
        # Get file info
        file_size = os.path.getsize(filepath)
        
        # Cleanup
        try:
            os.remove(filepath)
        except:
            pass
        
        return jsonify({
            'status': 'success',
            'file_info': {
                'name': file.filename,
                'size': file_size,
                'size_mb': round(file_size / (1024 * 1024), 2),
                'type': file.content_type
            },
            'exif_data': exif_data,
            'gps_data': gps_data,
            'camera_info': camera_info,
            'objects_detected': objects_detected,
            'landmarks_detected': landmarks_detected,
            'reverse_search': {'hash': image_hash},
            'image_hash': image_hash,
            'privacy_risk': privacy_risk
        })
    
    except Exception as e:
        print(f"Error analyzing image: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/analyze-video', methods=['POST'])
def analyze_video():
    """Analyze video: extract frames and perform analysis on each"""
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file part'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No selected file'}), 400
        
        if not allowed_file(file.filename):
            return jsonify({'error': 'File type not allowed'}), 400
        
        # Save file
        filename = secure_filename(file.filename)
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S_')
        filename = timestamp + filename
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        
        # Extract frames
        frames, total_frames, fps = extract_video_frames(filepath, max_frames=5)
        
        # Analyze first frame for overall risk
        cap = cv2.VideoCapture(filepath)
        ret, first_frame = cap.read()
        cap.release()
        
        privacy_risk = None
        face_count = 0
        object_summary = []
        
        if ret:
            first_frame_path = os.path.join(app.config['UPLOAD_FOLDER'], 'temp_frame.jpg')
            cv2.imwrite(first_frame_path, first_frame)
            
            landmarks = detect_landmarks(first_frame_path)
            face_count = landmarks.get('faces', 0)
            objects = detect_objects(first_frame_path)
            object_summary = objects
            
            privacy_risk = get_privacy_recommendations({}, None, None, objects, landmarks)
            
            try:
                os.remove(first_frame_path)
            except:
                pass
        
        # Get video info
        file_size = os.path.getsize(filepath)
        
        # Cleanup
        try:
            os.remove(filepath)
        except:
            pass
        
        return jsonify({
            'status': 'success',
            'file_info': {
                'name': file.filename,
                'size': file_size,
                'size_mb': round(file_size / (1024 * 1024), 2),
                'type': file.content_type,
                'total_frames': total_frames,
                'fps': fps,
                'duration_seconds': total_frames / fps if fps > 0 else 0
            },
            'frames': frames,
            'frames_analyzed': len(frames),
            'face_count': face_count,
            'objects_summary': object_summary[:5],
            'privacy_risk': privacy_risk
        })
    
    except Exception as e:
        print(f"Error analyzing video: {e}")
        return jsonify({'error': str(e)}), 500

import re
import spacy
from textblob import TextBlob
import wikipedia
import requests
from bs4 import BeautifulSoup
import urllib.parse

# Initialize Spacy model (lazy loading)
nlp_model = None

def search_ddg_html(query, max_results=5):
    """Search DuckDuckGo HTML version (Scraper)"""
    try:
        url = "https://html.duckduckgo.com/html/"
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
        }
        data = {
            "q": query
        }
        
        resp = requests.post(url, data=data, headers=headers, timeout=10)
        results = []
        
        if resp.status_code == 200:
            soup = BeautifulSoup(resp.text, 'html.parser')
            result_divs = soup.find_all('div', class_='result')
            
            for res in result_divs[:max_results]:
                try:
                    title_tag = res.find('a', class_='result__a')
                    snippet_tag = res.find('a', class_='result__snippet')
                    
                    if title_tag and snippet_tag:
                        results.append({
                            'title': title_tag.text,
                            'href': title_tag['href'],
                            'body': snippet_tag.text
                        })
                except Exception:
                    continue
                    
        return results
    except Exception as e:
        print(f"Error searching DDG: {e}")
        return []

def search_web(query, max_results=3):
    """Search the web using DuckDuckGo (Primary) or Wikipedia (Fallback)"""
    try:
        # Try DuckDuckGo first (Broad Web Search)
        print(f"Searching DuckDuckGo for: {query}")
        ddg_results = search_ddg_html(query, max_results)
        
        if ddg_results:
            return ddg_results
            
        # Fallback to Wikipedia
        print(f"DuckDuckGo failed/empty. Falling back to Wikipedia for: {query}")
        results = []
        # Search for titles
        search_results = wikipedia.search(query, results=max_results)
        
        for title in search_results:
            try:
                # Get page summary
                # auto_suggest=False prevents random redirects
                summary = wikipedia.summary(title, sentences=2, auto_suggest=False)
                url = wikipedia.page(title, auto_suggest=False).url
                
                results.append({
                    'title': title,
                    'href': url,
                    'body': summary
                })
            except Exception as e:
                print(f"Error fetching page {title}: {e}")
                continue
                
        return results
    except Exception as e:
        print(f"Error searching web: {e}")
        return []

def get_nlp_model():
    """Lazy load Spacy model"""
    global nlp_model, models_loading
    if nlp_model is None and not models_loading:
        try:
            print("[INFO] Loading Spacy model...")
            models_loading = True
            nlp_model = spacy.load("en_core_web_sm")
            models_loading = False
            print("[INFO] Spacy model loaded successfully")
        except Exception as e:
            models_loading = False
            print(f"[WARNING] Could not load Spacy model: {e}")
            return None
    return nlp_model

def analyze_text_content(text):
    """Analyze text for entities, sentiment, and risks"""
    try:
        nlp = get_nlp_model()
        if nlp is None:
            return None
        
        doc = nlp(text)
        blob = TextBlob(text)
        
        # Entities
        entities = {
            'PERSON': [],
            'ORG': [],
            'GPE': [], # Locations
            'LOC': [], # Locations
            'DATE': [],
            'MONEY': []
        }
        
        for ent in doc.ents:
            if ent.label_ in entities:
                entities[ent.label_].append(ent.text)
        
        # Regex extraction
        emails = re.findall(r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}', text)
        phones = re.findall(r'\+?[\d\s-]{10,}', text) # Simple phone regex
        urls = re.findall(r'http[s]?://(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*\\(\\),]|(?:%[0-9a-fA-F][0-9a-fA-F]))+', text)
        socials = re.findall(r'@[\w_]+', text)
        
        # Sentiment
        sentiment = {
            'polarity': blob.sentiment.polarity,
            'subjectivity': blob.sentiment.subjectivity,
            'label': 'Positive' if blob.sentiment.polarity > 0.1 else 'Negative' if blob.sentiment.polarity < -0.1 else 'Neutral'
        }
        
        # Risk Assessment
        risks = []
        if emails: risks.append(f"Found {len(emails)} email addresses")
        if phones: risks.append(f"Found {len(phones)} phone numbers")
        if entities['GPE'] or entities['LOC']: risks.append(f"Found {len(entities['GPE']) + len(entities['LOC'])} location references")
        
        risk_score = min(100, (len(emails) * 20) + (len(phones) * 20) + (len(entities['GPE']) * 10))
        
        # Web Search for Context
        search_query = ""
        if entities['PERSON']:
            search_query += " ".join(entities['PERSON'][:2]) + " "
        if entities['ORG']:
            search_query += " ".join(entities['ORG'][:1]) + " "
        if entities['GPE']:
            search_query += " ".join(entities['GPE'][:1])
            
        if not search_query.strip():
            # Fallback to key noun phrases if no entities found
            search_query = " ".join(blob.noun_phrases[:3])
            
        if not search_query.strip():
             search_query = text[:50] # Last resort
             
        web_results = search_web(search_query.strip())
        
        return {
            'entities': entities,
            'emails': emails,
            'phones': phones,
            'urls': urls,
            'socials': socials,
            'sentiment': sentiment,
            'risks': risks,
            'risk_score': risk_score,
            'web_results': web_results
        }
    except Exception as e:
        print(f"Error analyzing text: {e}")
        return None

@app.route('/api/analyze-text', methods=['POST'])
def analyze_text_endpoint():
    """Analyze text endpoint"""
    try:
        data = request.json
        if not data or 'text' not in data:
            return jsonify({'error': 'No text provided'}), 400
        
        text = data['text']
        result = analyze_text_content(text)
        
        if result is None:
            return jsonify({'error': 'Analysis failed'}), 500
            
        return jsonify({
            'status': 'success',
            'data': result
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/strip-metadata', methods=['POST'])
def strip_metadata():
    """Remove metadata from image"""
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
        
        # Save to bytes
        output = BytesIO()
        image_without_exif.save(output, format='PNG')
        output.seek(0)
        
        return jsonify({
            'status': 'success',
            'message': 'Metadata removed successfully',
            'file': base64.b64encode(output.getvalue()).decode()
        })
    
    except Exception as e:
        print(f"Error stripping metadata: {e}")
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

if __name__ == '__main__':
    print("=" * 60)
    print("🔍 OSINT Image & Video Analysis API")
    print("=" * 60)
    print("✓ Flask server starting...")
    print("✓ Listening on http://localhost:5000")
    print("✓ CORS enabled for http://localhost:3000")
    print("=" * 60)
    print("\nEndpoints:")
    print("  POST /api/analyze-image  - Analyze image metadata and content")
    print("  POST /api/analyze-video  - Analyze video frames")
    print("  POST /api/strip-metadata - Remove metadata from images (base64)")
    print("  POST /api/remove-exif    - Remove EXIF and download cleaned image")
    print("  GET  /health            - Health check")
    print("\n" + "=" * 60)
    
    app.run(
        host='0.0.0.0',
        port=5000,
        debug=False,
        threaded=True
    )
