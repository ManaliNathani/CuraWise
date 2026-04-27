"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

export default function ThreeBackground() {
  const mountRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 18;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.domElement.style.pointerEvents = "none";
    mountRef.current.appendChild(renderer.domElement);

    const group = new THREE.Group();
    scene.add(group);

    const gradientMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color("#f472b6"),
      roughness: 0.35,
      metalness: 0.12,
      transparent: true,
      opacity: 0.3
    });

    const blueMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color("#ec4899"),
      roughness: 0.45,
      metalness: 0.18,
      transparent: true,
      opacity: 0.26
    });

    const shapes = [
      new THREE.Mesh(new THREE.IcosahedronGeometry(2.6, 1), gradientMaterial),
      new THREE.Mesh(new THREE.TorusKnotGeometry(1.6, 0.4, 120, 8), blueMaterial),
      new THREE.Mesh(new THREE.SphereGeometry(1.9, 32, 32), gradientMaterial)
    ];

    shapes[0].position.set(-6, 2, -2);
    shapes[1].position.set(5, -1, 1);
    shapes[2].position.set(-2, -4, 0);

    shapes.forEach((shape) => group.add(shape));

    const ambient = new THREE.AmbientLight(0xffffff, 0.7);
    const directional = new THREE.DirectionalLight(0xffffff, 0.8);
    directional.position.set(5, 6, 4);
    scene.add(ambient, directional);

    let frameId: number;

    const animate = () => {
      group.rotation.y += 0.002;
      group.rotation.x += 0.0015;
      shapes[0].rotation.x += 0.004;
      shapes[1].rotation.y -= 0.003;
      shapes[2].rotation.z += 0.002;
      renderer.render(scene, camera);
      frameId = requestAnimationFrame(animate);
    };

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener("resize", handleResize);
    animate();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(frameId);
      renderer.dispose();
      mountRef.current?.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={mountRef} className="ambient-3d" aria-hidden="true" />;
}
