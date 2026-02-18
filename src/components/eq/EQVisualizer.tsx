import React, { useRef, useEffect } from 'react';

interface Band {
    freq: number;
    gain: number;
    q: number;
    type: string;
}

interface EQVisualizerProps {
    bands: Band[];
    width?: number;
    height?: number;
}

export const EQVisualizer: React.FC<EQVisualizerProps> = ({ bands, width = 600, height = 240 }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const getResponse = (freq: number) => {
        let response = 0;
        bands.forEach(band => {
            // Very simplified Bi-quad filter simulation for visualization
            const f0 = band.freq;
            const g = band.gain;
            const q = band.q;

            const phi = (2 * Math.PI * freq) / 44100;
            const gainLinear = Math.pow(10, g / 20);

            const dist = Math.abs(Math.log10(freq) - Math.log10(f0));
            const width = 1 / q;
            const effect = g * Math.exp(-(dist * dist) / (width * width * 0.1));
            response += effect;
        });
        return response;
    };

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.clearRect(0, 0, width, height);

        // Draw Grid
        ctx.strokeStyle = '#222';
        ctx.lineWidth = 1;
        [20, 100, 1000, 10000, 20000].forEach(f => {
            const x = (Math.log10(f) - Math.log10(20)) / (Math.log10(20000) - Math.log10(20)) * width;
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, height);
            ctx.stroke();
        });

        ctx.beginPath();
        ctx.moveTo(0, height / 2);
        ctx.lineTo(width, height / 2);
        ctx.stroke();

        // Draw Curve
        ctx.beginPath();
        ctx.strokeStyle = '#1DB954';
        ctx.lineWidth = 3;
        ctx.shadowBlur = 10;
        ctx.shadowColor = 'rgba(29, 185, 84, 0.5)';

        for (let x = 0; x < width; x++) {
            const logFreq = Math.log10(20) + (x / width) * (Math.log10(20000) - Math.log10(20));
            const freq = Math.pow(10, logFreq);
            const db = getResponse(freq);
            const y = height / 2 - (db * (height / 60)); // 60dB range

            if (x === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.stroke();

        // Draw Band Points
        ctx.shadowBlur = 0;
        bands.forEach((band, i) => {
            const x = (Math.log10(band.freq) - Math.log10(20)) / (Math.log10(20000) - Math.log10(20)) * width;
            const y = height / 2 - (band.gain * (height / 60));

            ctx.fillStyle = '#FFF';
            ctx.beginPath();
            ctx.arc(x, y, 4, 0, Math.PI * 2);
            ctx.fill();

            ctx.font = '10px JetBrains Mono';
            ctx.fillStyle = 'rgba(255,255,255,0.4)';
            ctx.fillText(`B${i + 1}`, x + 8, y - 8);
        });

    }, [bands, width, height]);

    return (
        <div className="bg-black/80 rounded-lg p-2 border border-white/5 overflow-hidden">
            <canvas ref={canvasRef} width={width} height={height} className="w-full h-full" />
        </div>
    );
};
