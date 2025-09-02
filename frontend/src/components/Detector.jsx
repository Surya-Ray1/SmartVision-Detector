import { useEffect, useRef, useState } from 'react';
import { Button, Card, Container, Row, Col, Spinner, Form, Alert } from 'react-bootstrap';
import * as cocoSsd from '@tensorflow-models/coco-ssd';
import '@tensorflow/tfjs';
import BoxesOverlay from './BoxesOverlay';
import { saveDetection } from '../api';


export default function Detector(){
const videoRef = useRef(null);
const [model, setModel] = useState(null);
const [running, setRunning] = useState(false);
const [boxes, setBoxes] = useState([]);
const [err, setErr] = useState('');
const [threshold, setThreshold] = useState(0.5);
const rafRef = useRef(null);


useEffect(() => {
cocoSsd.load({ base:'lite_mobilenet_v2' }).then(setModel).catch(e=>setErr(String(e)));
}, []);


const startCamera = async () => {
try {
const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
videoRef.current.srcObject = stream;
await videoRef.current.play();
} catch (e) { setErr('Camera access denied or unavailable.'); }
};


const stopCamera = () => {
const stream = videoRef.current?.srcObject; if (stream) stream.getTracks().forEach(t=>t.stop());
videoRef.current.srcObject = null;
};


const loop = async () => {
if (!model || !videoRef.current) return;
const preds = await model.detect(videoRef.current);
const filtered = preds.filter(p => p.score >= threshold);
setBoxes(filtered);
rafRef.current = requestAnimationFrame(loop);
};


const start = async () => {
setErr('');
await startCamera();
setRunning(true);
rafRef.current = requestAnimationFrame(loop);
};


const stop = () => {
cancelAnimationFrame(rafRef.current);
setRunning(false);
stopCamera();
setBoxes([]);
};


const snapshotBlob = async () => {
const video = videoRef.current; if (!video) return null;
const canvas = document.createElement('canvas');
canvas.width = video.videoWidth; canvas.height = video.videoHeight;
const ctx = canvas.getContext('2d');
ctx.drawImage(video, 0, 0);
return new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.92));
};


const save = async () => {
try {
const blob = await snapshotBlob();
const file = blob ? new File([blob], 'frame.jpg', { type: 'image/jpeg' }) : null;
const payload = { source:'camera', results: boxes.map(({bbox, class:cls, score})=>({bbox, class:cls, score})) };
await saveDetection(payload, file);
alert('Saved detection to backend');
} catch (e) { setErr('Failed to save detection'); }
};


return (
<Container className="py-4">
<Row className="mb-3"><Col>
<h3>SmartVision Detector (React + React‑Bootstrap + COCO‑SSD)</h3>
</Col></Row>


{err && <Alert variant="danger">{err}</Alert>}


<Row>
<Col md={8}>
<Card className="mb-3">
<Card.Body style={{ position:'relative' }}>
<video ref={videoRef} style={{ width:'100%', borderRadius:8 }} muted playsInline />
<BoxesOverlay boxes={boxes} videoEl={videoRef} />
</Card.Body>
</Card>
</Col>
<Col md={4}>
<Card className="mb-3"><Card.Body>
<div className="d-flex gap-2 mb-3">
{!running ? (
<Button onClick={start} disabled={!model}>
{!model ? (<><Spinner size="sm"/> Loading model</>) : 'Start Camera'}
</Button>
) : (
<Button variant="secondary" onClick={stop}>Stop</Button>
)}
<Button variant="success" onClick={save} disabled={!boxes.length}>Save Detection</Button>
</div>
<Form.Label>Confidence threshold: {Math.round(threshold*100)}%</Form.Label>
<Form.Range min={0.2} max={0.9} step={0.05} value={threshold} onChange={e=>setThreshold(parseFloat(e.target.value))} />
<div>Detections: <strong>{boxes.length}</strong></div>
</Card.Body></Card>
</Col>
</Row>
</Container>
);
}