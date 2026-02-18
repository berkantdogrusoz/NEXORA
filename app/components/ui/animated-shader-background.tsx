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

        // Deep Space Sparkles Shader
        const fragmentShaderSource = `
      precision highp float;
      uniform vec2 resolution;
      uniform float time;

      // Random function
      float random(vec2 st) {
          return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
      }

      void main() {
        vec2 uv = gl_FragCoord.xy / resolution.xy;
        
        // Deep dark background with slight gradient
        vec3 color = mix(vec3(0.0, 0.0, 0.02), vec3(0.02, 0.0, 0.05), uv.y);
        
        // Stars/Sparkles
        float t = time * 0.5;
        for (float i = 0.0; i < 50.0; i++) {
            float x = random(vec2(i, 0.0));
            float y = random(vec2(0.0, i));
            vec2 pos = vec2(x, y);
            
            // Twinkle effect
            float size = 0.001 + 0.002 * random(vec2(i, i));
            float brightness = 0.5 + 0.5 * sin(t + i * 10.0);
            
            float dist = distance(uv, pos);
            if (dist < size) {
                color += vec3(1.0) * brightness * (1.0 - dist/size);
            }
        }
        
        // Subtle moving nebula/fog
        float fog = 0.0;
        fog += sin(uv.x * 2.0 + t * 0.1) * 0.02;
        fog += sin(uv.y * 3.0 - t * 0.2) * 0.02;
        color += vec3(0.1, 0.05, 0.2) * (fog + 0.05);

        gl_FragColor = vec4(color, 1.0);
      }
    `;

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

    return <canvas ref={canvasRef} className={`fixed inset-0 z-[-1] pointer-events-none ${className}`} />;
}
