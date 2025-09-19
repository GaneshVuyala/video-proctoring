import { useState, useEffect, useRef } from 'react';

// --- Configuration ---
const OBJECT_DETECTION_THRESHOLD = 0.65;
const TARGET_OBJECTS = ['cell phone', 'book', 'laptop', 'mouse', 'keyboard', 'remote']; 
const LOOKING_AWAY_THRESHOLD_SECONDS = 5;
const CANDIDATE_ABSENT_THRESHOLD_SECONDS = 10;

export const useProctoring = (videoRef, onNewAlert) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isProctoring, setIsProctoring] = useState(false);

  const modelsRef = useRef({ objectDetector: null, faceMesh: null });
  const timersRef = useRef({});
  const proctoringIntervalRef = useRef(null);

  useEffect(() => {
    const loadModels = async () => {
      try {
        // The libraries are now on the window object from the CDN
        await window.tf.setBackend('webgl');
        const objectDetector = await window.cocoSsd.load();
        
        const faceMesh = new window.FaceMesh({
          locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
        });
        faceMesh.setOptions({
          maxNumFaces: 5,
          refineLandmarks: true,
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5,
        });

        modelsRef.current = { objectDetector, faceMesh };
        setIsLoading(false);
        console.log("ML models loaded successfully.");
      } catch (error) {
        console.error("Failed to load models:", error);
      }
    };
    loadModels();
  }, []);

  const runProctoring = async () => {
    if (!videoRef.current || videoRef.current.readyState < 3) return;
    const { objectDetector, faceMesh } = modelsRef.current;
    if (!objectDetector || !faceMesh) return;
    
    // MediaPipe face analysis
    await faceMesh.send({ image: videoRef.current });
    faceMesh.onResults((results) => {
        if (results && results.multiFaceLandmarks) {
            processFaceResults(results.multiFaceLandmarks);
        }
    });

    // TensorFlow object detection
    const detectedObjects = await objectDetector.detect(videoRef.current);
    processObjectResults(detectedObjects);
  };

  const handleAlert = (type, message, details = {}, cooldown = 15000) => {
    if (!timersRef.current[type]) {
      const timestamp = new Date().toLocaleTimeString();
      onNewAlert({ eventType: type, timestamp, message, details });
      
      timersRef.current[type] = setTimeout(() => {
        clearTimeout(timersRef.current[type]);
        timersRef.current[type] = null;
      }, cooldown);
    }
  };

  const processFaceResults = (faces) => {
    if (faces.length === 0) {
      if (!timersRef.current.absent) {
        timersRef.current.absent = setTimeout(() => {
           handleAlert('CANDIDATE_ABSENT', 'Candidate is not visible.', {}, 20000);
        }, CANDIDATE_ABSENT_THRESHOLD_SECONDS * 1000);
      }
    } else {
      clearTimeout(timersRef.current.absent);
      timersRef.current.absent = null;
    }

    if (faces.length > 1) {
      handleAlert('MULTIPLE_FACES', `${faces.length} faces detected in the frame.`);
    }

    if (faces.length === 1) {
        const landmarks = faces[0];
        const nose = landmarks[1];
        const leftEye = landmarks[33];
        const rightEye = landmarks[263];
        
        const eyeMidpointX = (leftEye.x + rightEye.x) / 2;
        const horizontalGaze = Math.abs(nose.x - eyeMidpointX);
        const eyeDistance = Math.abs(leftEye.x - rightEye.x);

        if (horizontalGaze > eyeDistance * 0.4) {
            if (!timersRef.current.lookingAway) {
                timersRef.current.lookingAway = setTimeout(() => {
                    handleAlert('LOOKING_AWAY', 'Candidate is looking away from the screen.');
                }, LOOKING_AWAY_THRESHOLD_SECONDS * 1000);
            }
        } else {
            clearTimeout(timersRef.current.lookingAway);
            timersRef.current.lookingAway = null;
        }
    }
  };

  const processObjectResults = (objects) => {
    for (const obj of objects) {
      if (TARGET_OBJECTS.includes(obj.class) && obj.score > OBJECT_DETECTION_THRESHOLD) {
        handleAlert(
            `OBJECT_DETECTED_${obj.class.replace(' ', '_')}`,
            `Suspicious object detected: ${obj.class}.`,
            { object: obj.class, confidence: obj.score.toFixed(2) }
        );
      }
    }
  };

  const startProctoring = () => {
    if (isLoading || isProctoring) return;
    console.log("Starting proctoring session...");
    setIsProctoring(true);
    // Run the detection every half-second instead of every 2 seconds.
    proctoringIntervalRef.current = setInterval(runProctoring, 500); 
  };

  const stopProctoring = () => {
    if (!isProctoring) return;
    setIsProctoring(false);
    clearInterval(proctoringIntervalRef.current);
    Object.values(timersRef.current).forEach(clearTimeout);
    timersRef.current = {};
  };

  return { isLoading, isProctoring, startProctoring, stopProctoring };
};