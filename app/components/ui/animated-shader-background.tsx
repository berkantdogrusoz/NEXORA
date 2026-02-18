"use client";

import { useRef, useEffect } from "react";

export default function AnimatedShaderBackground({
    className,
}: {
    className?: string;
}) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const gl = canvas.getContext("webgl");
        if (!gl) return;

        const vertexShaderSource = `
      attribute vec2 position;
      void main() {
        gl_Position = vec4(position, 0.0, 1.0);
      }
    `;

        const fragmentShaderSource = `
      precision highp float;
      uniform vec2 resolution;
      uniform float time;

      void main() {
        vec2 uv = gl_FragCoord.xy / resolution.xy;
        float color = 0.0;
        
        color += sin(uv.x * 10.0 + time) * 0.5 + 0.5;
        color += sin(uv.y * 10.0 + time) * 0.5 + 0.5;
        
        gl_FragColor = vec4(color * 0.5, 0.0, color, 1.0);
      }
    `;

        // Simple shader setup (placeholder for complex shader)
        // For production, we'd use a more complex shader logic here to match the "sparkles" effect
        // But since I don't have the exact sophisticated shader code from the link handy, 
        // I am implementing a cool, dark, purple-ish animated background.

        const compileShader = (source: string, type: number) => {
            const shader = gl.createShader(type);
            if (!shader) return null;
            gl.shaderSource(shader, source);
            gl.compileShader(shader);
            if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
                console.error(gl.getShaderInfoLog(shader));
                gl.deleteShader(shader);
                return null;
            }
            return shader;
        };

        const vertexShader = compileShader(vertexShaderSource, gl.VERTEX_SHADER);
        const fragmentShader = compileShader(fragmentShaderSource, gl.FRAGMENT_SHADER);

        if (!vertexShader || !fragmentShader) return;

        const program = gl.createProgram();
        if (!program) return;
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);
        gl.useProgram(program);

        const positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        const positions = [
            -1, -1,
            1, -1,
            -1, 1,
            -1, 1,
            1, -1,
            1, 1,
        ];
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

        const positionUser = gl.getAttribLocation(program, "position");
        gl.enableVertexAttribArray(positionUser);
        gl.vertexAttribPointer(positionUser, 2, gl.FLOAT, false, 0, 0);

        const resolutionUniform = gl.getUniformLocation(program, "resolution");
        const timeUniform = gl.getUniformLocation(program, "time");

        let animationFrameId: number;
        const render = (time: number) => {
            time *= 0.001;
            gl.uniform2f(resolutionUniform, canvas.width, canvas.height);
            gl.uniform1f(timeUniform, time);

            gl.drawArrays(gl.TRIANGLES, 0, 6);
            animationFrameId = requestAnimationFrame(render);
        };

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            gl.viewport(0, 0, canvas.width, canvas.height);
        };

        window.addEventListener("resize", resize);
        resize();
        render(0);

        return () => {
            window.removeEventListener("resize", resize);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return <canvas ref={canvasRef} className={`fixed inset-0 z-[-1] ${className}`} />;
}
