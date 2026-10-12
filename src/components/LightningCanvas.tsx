/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef } from 'react';

interface Point {
  x: number;
  y: number;
}

interface BoltSegment {
  p1: Point;
  p2: Point;
  width: number;
  isBranch: boolean;
}

interface ActiveBolt {
  segments: BoltSegment[];
  life: number;
  maxLife: number;
  color: 'emerald' | 'cyan' | 'white';
}

interface Spark {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
}

interface LightningCanvasProps {
  mousePos: { x: number; y: number };
  aetherRef: React.RefObject<HTMLElement | null>;
  intensity: number;
}

export const LightningCanvas: React.FC<LightningCanvasProps> = ({
  mousePos,
  aetherRef,
  intensity,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mouseMovedRef = useRef<boolean>(false);
  const lastMousePosRef = useRef<{ x: number; y: number }>({ x: -1000, y: -1000 });
  const lastMouseMoveTimeRef = useRef<number>(0);

  // Keep mouse state synced in refs for the animation loop
  useEffect(() => {
    if (mousePos.x > 0 && mousePos.y > 0) {
      if (
        Math.abs(mousePos.x - lastMousePosRef.current.x) > 1 ||
        Math.abs(mousePos.y - lastMousePosRef.current.y) > 1
      ) {
        mouseMovedRef.current = true;
        lastMouseMoveTimeRef.current = performance.now();
        lastMousePosRef.current = { x: mousePos.x, y: mousePos.y };
      }
    }
  }, [mousePos]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    const activeBolts: ActiveBolt[] = [];
    const activeSparks: Spark[] = [];

    let lastIdleBoltTime = 0;
    let lastFollowBoltTime = 0;
    let lastTime = performance.now();

    // Helper to generate recursive displaced lightning points
    const generateBranch = (
      start: Point,
      end: Point,
      roughness: number,
      depth: number,
      maxDepth: number,
      segments: BoltSegment[],
      isBranch: boolean = false
    ) => {
      const dx = end.x - start.x;
      const dy = end.y - start.y;
      const dist = Math.hypot(dx, dy);

      if (depth >= maxDepth || dist < 12) {
        segments.push({
          p1: start,
          p2: end,
          width: isBranch ? 1.0 : Math.max(1.5, 2.8 - depth * 0.3),
          isBranch,
        });
        return;
      }

      // Midpoint with perpendicular offset
      const midX = (start.x + end.x) / 2;
      const midY = (start.y + end.y) / 2;

      // Normal vector
      const nx = -dy / dist;
      const ny = dx / dist;

      const offsetScale = dist * roughness * (Math.random() - 0.5);
      const displacedMid: Point = {
        x: midX + nx * offsetScale,
        y: midY + ny * offsetScale,
      };

      // Subdivide left and right halves
      generateBranch(start, displacedMid, roughness, depth + 1, maxDepth, segments, isBranch);
      generateBranch(displacedMid, end, roughness, depth + 1, maxDepth, segments, isBranch);

      // Random side fork / branch
      if (!isBranch && depth > 1 && depth < maxDepth - 1 && Math.random() < 0.32) {
        const branchAngle = (Math.random() - 0.5) * 1.1 + (Math.random() > 0.5 ? 0.6 : -0.6);
        const branchLen = dist * (0.35 + Math.random() * 0.35);
        const cos = Math.cos(branchAngle);
        const sin = Math.sin(branchAngle);
        const unitX = dx / dist;
        const unitY = dy / dist;

        const branchDirX = unitX * cos - unitY * sin;
        const branchDirY = unitX * sin + unitY * cos;

        const branchEnd: Point = {
          x: displacedMid.x + branchDirX * branchLen,
          y: displacedMid.y + branchDirY * branchLen,
        };

        generateBranch(displacedMid, branchEnd, roughness * 1.2, depth + 1, maxDepth, segments, true);
      }
    };

    const spawnBolt = (start: Point, end: Point, color: 'emerald' | 'cyan' | 'white' = 'emerald', maxLife = 120) => {
      const segments: BoltSegment[] = [];
      generateBranch(start, end, 0.28, 0, 5, segments);
      activeBolts.push({
        segments,
        life: maxLife,
        maxLife,
        color,
      });

      // Spawn a few sparks near the terminus
      const sparkCount = Math.floor(Math.random() * 4) + 2;
      for (let i = 0; i < sparkCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 2.5 + 0.8;
        activeSparks.push({
          x: end.x,
          y: end.y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 25,
          maxLife: 25,
          size: Math.random() * 1.8 + 1,
          color: color === 'emerald' ? '#34d399' : '#38bdf8',
        });
      }
    };

    // Main animation loop
    const render = (currentTime: number) => {
      animationFrameId = requestAnimationFrame(render);

      const delta = currentTime - lastTime;
      lastTime = currentTime;

      ctx.clearRect(0, 0, width, height);

      // If intensity is nearly 0 (scrolled far down), pause rendering
      if (intensity <= 0.04) {
        return;
      }

      const aetherEl = aetherRef.current;
      let aetherRect: DOMRect | null = null;
      if (aetherEl) {
        aetherRect = aetherEl.getBoundingClientRect();
      }

      // Check if title is visible
      const hasAether = aetherRect && aetherRect.bottom > 0 && aetherRect.top < height;

      if (hasAether && aetherRect) {
        const rect = aetherRect;

        // Key anchor points on and around AETHER letters
        const letterAnchors: Point[] = [
          { x: rect.left + rect.width * 0.1, y: rect.top + rect.height * 0.45 },   // A
          { x: rect.left + rect.width * 0.25, y: rect.top + rect.height * 0.42 },  // E
          { x: rect.left + rect.width * 0.42, y: rect.top + rect.height * 0.38 },  // T
          { x: rect.left + rect.width * 0.58, y: rect.top + rect.height * 0.45 },  // H
          { x: rect.left + rect.width * 0.74, y: rect.top + rect.height * 0.42 },  // E
          { x: rect.left + rect.width * 0.9, y: rect.top + rect.height * 0.48 },   // R
        ];

        // Atmospheric ionization nodes hovering above and below
        const atmosphericAnchors: Point[] = [
          { x: rect.left + rect.width * 0.18, y: rect.top - 20 - Math.random() * 30 },
          { x: rect.left + rect.width * 0.5, y: rect.top - 25 - Math.random() * 35 },
          { x: rect.left + rect.width * 0.82, y: rect.top - 20 - Math.random() * 30 },
          { x: rect.left + rect.width * 0.3, y: rect.bottom + 15 + Math.random() * 25 },
          { x: rect.left + rect.width * 0.7, y: rect.bottom + 15 + Math.random() * 25 },
        ];

        // 1. CONTINUOUS IDLE LIGHTNING EFFECT (even when mouse does not move)
        const idleInterval = 75 + Math.random() * 65; // ~75-140ms continuous electric cycle
        if (currentTime - lastIdleBoltTime > idleInterval) {
          lastIdleBoltTime = currentTime;

          const roll = Math.random();
          if (roll < 0.45) {
            // Arc between two different letters of AETHER
            const idx1 = Math.floor(Math.random() * letterAnchors.length);
            let idx2 = Math.floor(Math.random() * letterAnchors.length);
            if (idx2 === idx1) idx2 = (idx1 + 1) % letterAnchors.length;

            const p1 = letterAnchors[idx1];
            const p2 = letterAnchors[idx2];
            const color = Math.random() > 0.4 ? 'emerald' : 'cyan';
            spawnBolt(p1, p2, color, 100 + Math.random() * 50);
          } else if (roll < 0.8) {
            // Atmospheric discharge striking down into AETHER font
            const cloudNode = atmosphericAnchors[Math.floor(Math.random() * atmosphericAnchors.length)];
            const letterNode = letterAnchors[Math.floor(Math.random() * letterAnchors.length)];
            spawnBolt(cloudNode, letterNode, 'emerald', 120 + Math.random() * 60);
          } else {
            // Contour arc hugging the outer perimeter of AETHER font
            const isTop = Math.random() > 0.5;
            const x1 = rect.left + Math.random() * (rect.width * 0.4);
            const x2 = rect.left + rect.width * 0.5 + Math.random() * (rect.width * 0.5);
            const yOffset = isTop ? -10 - Math.random() * 20 : rect.height + 10 + Math.random() * 20;
            spawnBolt(
              { x: x1, y: rect.top + yOffset },
              { x: x2, y: rect.top + yOffset + (Math.random() - 0.5) * 20 },
              'cyan',
              90 + Math.random() * 50
            );
          }
        }

        // 2. CURSOR FOLLOWING LIGHTNING EFFECT
        // When cursor moves, lightning dynamically connects from AETHER and follows the cursor
        const mouseX = lastMousePosRef.current.x;
        const mouseY = lastMousePosRef.current.y;
        const isMouseOnScreen = mouseX > 0 && mouseX < width && mouseY > 0 && mouseY < height;

        if (isMouseOnScreen) {
          const timeSinceMouseMove = currentTime - lastMouseMoveTimeRef.current;
          const isActivelyMoving = timeSinceMouseMove < 650;

          // If moving, trigger rapid follow arcs; if static, still periodically arc to cursor
          const followInterval = isActivelyMoving ? 55 + Math.random() * 45 : 190 + Math.random() * 120;

          if (currentTime - lastFollowBoltTime > followInterval) {
            lastFollowBoltTime = currentTime;

            // Find closest letter anchor to cursor
            let closestAnchor = letterAnchors[0];
            let minDist = Infinity;
            for (const anchor of letterAnchors) {
              const d = Math.hypot(anchor.x - mouseX, anchor.y - mouseY);
              if (d < minDist) {
                minDist = d;
                closestAnchor = anchor;
              }
            }

            // Also consider atmospheric anchors if closer
            for (const anchor of atmosphericAnchors) {
              const d = Math.hypot(anchor.x - mouseX, anchor.y - mouseY);
              if (d < minDist) {
                minDist = d;
                closestAnchor = anchor;
              }
            }

            // Target with slight electric jitter at cursor
            const target: Point = {
              x: mouseX + (Math.random() - 0.5) * 16,
              y: mouseY + (Math.random() - 0.5) * 16,
            };

            const boltColor = Math.random() > 0.35 ? 'emerald' : 'cyan';
            spawnBolt(closestAnchor, target, boltColor, isActivelyMoving ? 75 : 120);

            // If user is actively moving, also spawn a secondary trailing corona arc
            if (isActivelyMoving && Math.random() < 0.45) {
              const secondaryLetter = letterAnchors[Math.floor(Math.random() * letterAnchors.length)];
              spawnBolt(secondaryLetter, target, 'white', 60);
            }
          }
        }
      }

      // 3. DRAW AND UPDATE ACTIVE LIGHTNING BOLTS
      for (let b = activeBolts.length - 1; b >= 0; b--) {
        const bolt = activeBolts[b];
        bolt.life -= delta;

        if (bolt.life <= 0) {
          activeBolts.splice(b, 1);
          continue;
        }

        const lifeRatio = Math.max(0, Math.min(1, bolt.life / bolt.maxLife));
        const alpha = lifeRatio * intensity;

        // Glow pass (Atmospheric Electric Bloom)
        ctx.save();
        ctx.globalAlpha = alpha * 0.5;
        ctx.lineWidth = 6;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.shadowBlur = 18;
        ctx.shadowColor = bolt.color === 'emerald' ? '#10b981' : bolt.color === 'cyan' ? '#38bdf8' : '#6ee7b7';
        ctx.strokeStyle = bolt.color === 'emerald' ? 'rgba(16, 185, 129, 0.45)' : 'rgba(56, 189, 248, 0.45)';

        ctx.beginPath();
        for (const seg of bolt.segments) {
          ctx.moveTo(seg.p1.x, seg.p1.y);
          ctx.lineTo(seg.p2.x, seg.p2.y);
        }
        ctx.stroke();
        ctx.restore();

        // Core electric arc pass (Sharp High-Voltage Core)
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.shadowBlur = 6;
        ctx.shadowColor = '#ffffff';

        for (const seg of bolt.segments) {
          ctx.lineWidth = seg.isBranch ? 1.0 : seg.width;
          ctx.strokeStyle = seg.isBranch
            ? (bolt.color === 'emerald' ? '#6ee7b7' : '#7dd3fc')
            : '#ffffff';

          ctx.beginPath();
          ctx.moveTo(seg.p1.x, seg.p1.y);
          ctx.lineTo(seg.p2.x, seg.p2.y);
          ctx.stroke();
        }
        ctx.restore();
      }

      // 4. DRAW AND UPDATE ELECTRICAL SPARK PARTICLES
      for (let s = activeSparks.length - 1; s >= 0; s--) {
        const spark = activeSparks[s];
        spark.life--;
        spark.x += spark.vx;
        spark.y += spark.vy;
        spark.vx *= 0.94;
        spark.vy *= 0.94;

        if (spark.life <= 0) {
          activeSparks.splice(s, 1);
          continue;
        }

        const sparkAlpha = (spark.life / spark.maxLife) * intensity;
        ctx.save();
        ctx.globalAlpha = sparkAlpha;
        ctx.fillStyle = spark.color;
        ctx.shadowBlur = 6;
        ctx.shadowColor = spark.color;
        ctx.beginPath();
        ctx.arc(spark.x, spark.y, spark.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [intensity, aetherRef]);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-[1] transition-opacity duration-300"
      style={{
        opacity: intensity,
      }}
    />
  );
};
