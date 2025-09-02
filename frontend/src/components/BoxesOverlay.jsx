import { useEffect, useRef } from 'react';


export default function BoxesOverlay({ boxes=[], videoEl }) {
const canvasRef = useRef(null);


useEffect(() => {
const canvas = canvasRef.current;
if (!canvas || !videoEl?.current) return;
const ctx = canvas.getContext('2d');


const draw = () => {
const vid = videoEl.current;
if (!vid) return;
// match canvas to video size
canvas.width = vid.videoWidth;
canvas.height = vid.videoHeight;
ctx.clearRect(0, 0, canvas.width, canvas.height);
ctx.lineWidth = 2;
ctx.font = '14px sans-serif';
boxes.forEach(b => {
const [x, y, w, h] = b.bbox; // coco-ssd returns [x,y,width,height]
ctx.strokeStyle = '#00FF00';
ctx.strokeRect(x, y, w, h);
const label = `${b.class} ${(b.score*100).toFixed(1)}%`;
const textWidth = ctx.measureText(label).width + 6;
ctx.fillStyle = 'rgba(0,0,0,0.6)';
ctx.fillRect(x, y-18, textWidth, 18);
ctx.fillStyle = '#fff';
ctx.fillText(label, x+3, y-5);
});
};


draw();
}, [boxes, videoEl]);


return (
<canvas ref={canvasRef} style={{ position:'absolute', left:0, top:0 }} />
);
}