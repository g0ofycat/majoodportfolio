class Plane {
  constructor() {
    this.uniforms = {
      time: { type: "f", value: 0 },
      opacity: { type: "f", value: 0 },
    };
    this.mesh = this.createMesh();
    this.time = 1;
  }
  createMesh() {
    return new THREE.Mesh(
      new THREE.PlaneGeometry(256, 256, 256, 256),
      new THREE.RawShaderMaterial({
        uniforms: this.uniforms,
        vertexShader: `
                    #define GLSLIFY 1
                    attribute vec3 position;
                    uniform mat4 projectionMatrix;
                    uniform mat4 modelViewMatrix;
                    uniform float time;
                    varying vec3 vPosition;
                    mat4 rotateMatrixX(float radian) {
                        return mat4(
                            1.0, 0.0, 0.0, 0.0,
                            0.0, cos(radian), -sin(radian), 0.0,
                            0.0, sin(radian), cos(radian), 0.0,
                            0.0, 0.0, 0.0, 1.0
                        );
                    }
                    vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
                    vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
                    vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
                    vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
                    vec3 fade(vec3 t) { return t*t*t*(t*(t*6.0-15.0)+10.0); }
                    float cnoise(vec3 P) {
                        vec3 Pi0 = floor(P);
                        vec3 Pi1 = Pi0 + vec3(1.0);
                        Pi0 = mod289(Pi0);
                        Pi1 = mod289(Pi1);
                        vec3 Pf0 = fract(P);
                        vec3 Pf1 = Pf0 - vec3(1.0);
                        vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);
                        vec4 iy = vec4(Pi0.yy, Pi1.yy);
                        vec4 iz0 = Pi0.zzzz;
                        vec4 iz1 = Pi1.zzzz;
                        vec4 ixy = permute(permute(ix) + iy);
                        vec4 ixy0 = permute(ixy + iz0);
                        vec4 ixy1 = permute(ixy + iz1);
                        vec4 gx0 = ixy0 * (1.0 / 7.0);
                        vec4 gy0 = fract(floor(gx0) * (1.0 / 7.0)) - 0.5;
                        gx0 = fract(gx0);
                        vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0);
                        vec4 sz0 = step(gz0, vec4(0.0));
                        gx0 -= sz0 * (step(0.0, gx0) - 0.5);
                        gy0 -= sz0 * (step(0.0, gy0) - 0.5);
                        vec4 gx1 = ixy1 * (1.0 / 7.0);
                        vec4 gy1 = fract(floor(gx1) * (1.0 / 7.0)) - 0.5;
                        gx1 = fract(gx1);
                        vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1);
                        vec4 sz1 = step(gz1, vec4(0.0));
                        gx1 -= sz1 * (step(0.0, gx1) - 0.5);
                        gy1 -= sz1 * (step(0.0, gy1) - 0.5);
                        vec3 g000 = vec3(gx0.x,gy0.x,gz0.x);
                        vec3 g100 = vec3(gx0.y,gy0.y,gz0.y);
                        vec3 g010 = vec3(gx0.z,gy0.z,gz0.z);
                        vec3 g110 = vec3(gx0.w,gy0.w,gz0.w);
                        vec3 g001 = vec3(gx1.x,gy1.x,gz1.x);
                        vec3 g101 = vec3(gx1.y,gy1.y,gz1.y);
                        vec3 g011 = vec3(gx1.z,gy1.z,gz1.z);
                        vec3 g111 = vec3(gx1.w,gy1.w,gz1.w);
                        vec4 norm0 = taylorInvSqrt(vec4(dot(g000, g000), dot(g010, g010), dot(g100, g100), dot(g110, g110)));
                        g000 *= norm0.x;
                        g010 *= norm0.y;
                        g100 *= norm0.z;
                        g110 *= norm0.w;
                        vec4 norm1 = taylorInvSqrt(vec4(dot(g001, g001), dot(g011, g011), dot(g101, g101), dot(g111, g111)));
                        g001 *= norm1.x;
                        g011 *= norm1.y;
                        g101 *= norm1.z;
                        g111 *= norm1.w;
                        float n000 = dot(g000, Pf0);
                        float n100 = dot(g100, vec3(Pf1.x, Pf0.yz));
                        float n010 = dot(g010, vec3(Pf0.x, Pf1.y, Pf0.z));
                        float n110 = dot(g110, vec3(Pf1.xy, Pf0.z));
                        float n001 = dot(g001, vec3(Pf0.xy, Pf1.z));
                        float n101 = dot(g101, vec3(Pf1.x, Pf0.y, Pf1.z));
                        float n011 = dot(g011, vec3(Pf0.x, Pf1.yz));
                        float n111 = dot(g111, Pf1);
                        vec3 fade_xyz = fade(Pf0);
                        vec4 n_z = mix(vec4(n000, n100, n010, n110), vec4(n001, n101, n011, n111), fade_xyz.z);
                        vec2 n_yz = mix(n_z.xy, n_z.zw, fade_xyz.y);
                        float n_xyz = mix(n_yz.x, n_yz.y, fade_xyz.x);
                        return 2.2 * n_xyz;
                    }
                    void main(void) {
                        vec3 updatePosition = (rotateMatrixX(radians(90.0)) * vec4(position, 1.0)).xyz;
                        float sin1 = sin(radians(updatePosition.x / 128.0 * 90.0));
                        vec3 noisePosition = updatePosition + vec3(0.0, 0.0, time * -30.0);
                        float noise1 = cnoise(noisePosition * 0.08);
                        float noise2 = cnoise(noisePosition * 0.06);
                        float noise3 = cnoise(noisePosition * 0.4);
                        vec3 lastPosition = updatePosition + vec3(0.0,
                            noise1 * sin1 * 8.0
                            + noise2 * sin1 * 8.0
                            + noise3 * (abs(sin1) * 2.0 + 0.5)
                            + pow(sin1, 2.0) * 40.0, 0.0);
                        vPosition = lastPosition;
                        gl_Position = projectionMatrix * modelViewMatrix * vec4(lastPosition, 1.0);
                    }
                `,
        fragmentShader: `
                    precision highp float;
                    #define GLSLIFY 1
                    varying vec3 vPosition;
                    uniform float opacity;
                    void main(void) {
                        float baseOpacity = (96.0 - length(vPosition)) / 256.0 * 0.15;
                        vec3 color = vec3(0.6);
                        gl_FragColor = vec4(color, baseOpacity * opacity);
                    }
                `,
        transparent: true,
        wireframe: true,
      })
    );
  }
  render(time) {
    this.uniforms.time.value += time * this.time;
  }
  setOpacity(value) {
    this.uniforms.opacity.value = value;
  }
}

const canvas = document.getElementById("canvas-webgl");
const renderer = new THREE.WebGLRenderer({
  antialias: false,
  canvas: canvas,
});
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  1,
  10000
);
const clock = new THREE.Clock();

const plane = new Plane();

const resizeWindow = () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
};

const on = () => {
  window.addEventListener("resize", resizeWindow);
};

const render = () => {
  plane.render(clock.getDelta());
  renderer.render(scene, camera);
};

const renderLoop = () => {
  render();
  requestAnimationFrame(renderLoop);
};

const init = () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x000000, 1.0);
  camera.position.set(0, 16, 128);
  camera.lookAt(new THREE.Vector3(0, 40, 0));

  scene.add(plane.mesh);

  on();
  resizeWindow();
  renderLoop();
};

init();

document.addEventListener("DOMContentLoaded", () => {
  const titleElement = document.querySelector(".title-text");
  const subtitleElement = document.querySelector(".subtitle-text");
  const titleCursor = document.querySelector(".title-cursor");
  const subtitleCursor = document.querySelector(".subtitle-cursor");
  const slideshow = document.querySelector(".slideshow-container");
  const aboutSection = document.querySelector(".about-me-section");
  const pricingSection = document.querySelector(".pricing-section");

  const titleText = "majood";
  const subtitleText = "Builder & Architect";
  const typingSpeed = 30;
  const pauseDuration = 400;
  const fadeInDuration = 1000;
  const fadeInDelay = 200;
  const initialScale = 0.9;

  let titleIndex = 0;
  let subtitleIndex = 0;

  titleCursor.style.color = "#ffffff";
  subtitleCursor.style.color = "#ffffff";

  function typeTitle() {
    if (titleIndex < titleText.length) {
      titleElement.textContent += titleText[titleIndex];
      titleIndex++;
      setTimeout(typeTitle, typingSpeed);
    } else {
      titleCursor.classList.add("hidden");
      subtitleCursor.classList.remove("hidden");
      subtitleCursor.style.color = "#333333";
      setTimeout(typeSubtitle, pauseDuration);
    }
  }

  function typeSubtitle() {
    if (subtitleIndex < subtitleText.length) {
      subtitleElement.textContent += subtitleText[subtitleIndex];
      subtitleIndex++;
      setTimeout(typeSubtitle, typingSpeed);
    } else {
      subtitleCursor.classList.add("hidden");
      setTimeout(startFadeIn, fadeInDelay);
    }
  }

  function easeOutQuad(t) {
    return t * (2 - t);
  }

  function startFadeIn() {
    const startTime = performance.now();

    function animateFadeIn(currentTime) {
      const elapsed = currentTime - startTime;
      const rawProgress = Math.min(elapsed / fadeInDuration, 1);

      const scaleProgress = easeOutQuad(rawProgress);
      const opacityProgress = rawProgress;

      const currentScale = initialScale + (1 - initialScale) * scaleProgress;

      if (slideshow) {
        slideshow.style.opacity = opacityProgress;
        slideshow.style.transform = `scale(${currentScale})`;
      }

      if (typeof plane !== "undefined" && plane.setOpacity) {
        plane.setOpacity(opacityProgress);
      }

      if (rawProgress < 1) {
        requestAnimationFrame(animateFadeIn);
      } else {
        if (slideshow) {
          slideshow.style.opacity = 1;
          slideshow.style.transform = "scale(1)";
          slideshow.style.pointerEvents = "auto";
        }
        if (typeof plane !== "undefined" && plane.setOpacity) {
          plane.setOpacity(1);
        }
      }
    }

    if (slideshow) {
      slideshow.style.transform = `scale(${initialScale})`;
      slideshow.style.opacity = "0";
    }
    requestAnimationFrame(animateFadeIn);
  }

  subtitleCursor.classList.add("hidden");
  if (slideshow) {
    slideshow.style.opacity = "0";
    slideshow.style.pointerEvents = "none";
    slideshow.style.transform = `scale(${initialScale})`;
  }

  typeTitle();

  if (aboutSection) {
    setTimeout(() => aboutSection.classList.add("visible"), 2000);
  }
  if (pricingSection) {
    setTimeout(() => pricingSection.classList.add("visible"), 2200);
  }
});

let currentSlide = 0;
const slides = document.querySelectorAll(".slide");
const totalSlides = slides.length;
const descriptionContainer = document.querySelector(".slide-description");

function showSlide(index) {
  if (index >= totalSlides) {
    currentSlide = 0;
  } else if (index < 0) {
    currentSlide = totalSlides - 1;
  } else {
    currentSlide = index;
  }

  const slidesContainer = document.querySelector(".slides");
  slidesContainer.style.transform = `translateX(-${currentSlide * 100}%)`;

  const description =
    slides[currentSlide].getAttribute("data-description") ||
    "No description available";
  descriptionContainer.textContent = description;
  descriptionContainer.classList.add("active");
}

function changeSlide(direction) {
  showSlide(currentSlide + direction);
}

const prevButton = document.querySelector(".prev");
const nextButton = document.querySelector(".next");
if (prevButton && nextButton) {
  prevButton.addEventListener("click", () => changeSlide(-1));
  nextButton.addEventListener("click", () => changeSlide(1));
} else {
  console.error("Slideshow buttons not found");
}

showSlide(currentSlide);

document.addEventListener("DOMContentLoaded", () => {
  const logoContainer = document.getElementById("logo");
  const dropdown = document.getElementById("dropdown");

  logoContainer.addEventListener("click", (e) => {
    e.stopPropagation();
    dropdown.classList.toggle("active");
  });

  document.addEventListener("click", (e) => {
    if (
      !logoContainer.contains(e.target) &&
      dropdown.classList.contains("active")
    ) {
      dropdown.classList.remove("active");
    }
  });

  dropdown.addEventListener("click", (e) => {
    e.stopPropagation();
  });
});

document.addEventListener("DOMContentLoaded", () => {
  const extraImagesData = {
    "FeaturedWork1.jpg": [
      "Pictures/Work1Extra/1.jpg",
      "Pictures/Work1Extra/2.jpg",
      "Pictures/Work1Extra/3.jpg",
    ],
    "FeaturedWork2.jpg": [
      "Pictures/Work2Extra/1.jpg",
      "Pictures/Work2Extra/2.jpg",
      "Pictures/Work2Extra/3.jpg",
    ],
    "FeaturedWork3.jpg": [
      "Pictures/Work3Extra/1.jpg",
      "Pictures/Work3Extra/2.jpg",
    ],
    "FeaturedWork4.jpg": [
      "Pictures/Work4Extra/1.jpg",
      "Pictures/Work4Extra/2.jpg",
      "Pictures/Work4Extra/3.jpg",
    ],
    "FeaturedWork5.jpg": [
      "Pictures/Work5Extra/1.jpg",
      "Pictures/Work5Extra/2.jpg",
      "Pictures/Work5Extra/3.jpg",
      "Pictures/Work5Extra/4.jpg",
      "Pictures/Work5Extra/5.jpg",
    ],
  };

  const mainSlides = document.querySelectorAll(".slideshow .slide");
  const imageViewerOverlay = document.getElementById("image-viewer-overlay");
  const body = document.body;

  function openGridView(imagePaths) {
    imageViewerOverlay.innerHTML = "";

    const gridWrapper = document.createElement("div");
    gridWrapper.style.display = "flex";
    gridWrapper.style.justifyContent = "center";
    gridWrapper.style.alignItems = "center";
    gridWrapper.style.width = "100%";
    gridWrapper.style.height = "100%";
    gridWrapper.style.padding = "40px";
    gridWrapper.style.boxSizing = "border-box";
    gridWrapper.style.overflow = "auto";

    const gridContainer = document.createElement("div");
    gridContainer.style.display = "grid";
    gridContainer.style.gap = "20px";
    gridContainer.style.maxWidth = "85%";
    gridContainer.style.maxHeight = "80vh";
    gridContainer.style.width = "auto";

    const totalImages = imagePaths.length;
    let columns;

    if (totalImages <= 2) {
      columns = totalImages;
    } else if (totalImages <= 4) {
      columns = 2;
    } else {
      columns = 3;
    }

    gridContainer.style.gridTemplateColumns = `repeat(${columns}, minmax(15vw, 40vw))`;

    imagePaths.forEach((src, i) => {
      const img = document.createElement("img");
      img.src = src;
      img.alt = `Image ${i + 1} of ${imagePaths.length}`;

      img.classList.add("scattered-image");

      img.style.position = "relative";
      img.style.top = "auto";
      img.style.left = "auto";
      img.style.maxWidth = "100%";
      img.style.maxHeight = "400px";
      img.style.width = "auto";
      img.style.height = "auto";
      img.style.objectFit = "cover";

      img.style.setProperty("--final-scale", "1");
      img.style.setProperty("--final-rotation", "0deg");

      gridContainer.appendChild(img);

      const probe = new Image();
      probe.src = src;
      probe.onload = () => {
        setTimeout(() => img.classList.add("visible"), i * 100);
      };
      probe.onerror = () => console.error("Could not load", src);
    });

    gridWrapper.appendChild(gridContainer);
    imageViewerOverlay.appendChild(gridWrapper);

    imageViewerOverlay.style.display = "block";

    requestAnimationFrame(() => {
      imageViewerOverlay.classList.add("active");
      body.classList.add("viewer-active");
    });
  }

  function closeGridView() {
    imageViewerOverlay.classList.remove("active");
    body.classList.remove("viewer-active");

    const images = imageViewerOverlay.querySelectorAll(".scattered-image");
    images.forEach((img) => img.classList.remove("visible"));

    const transitionDuration = 400;
    const timeoutId = setTimeout(() => {
      imageViewerOverlay.style.display = "none";
      imageViewerOverlay.innerHTML = "";
    }, transitionDuration);

    imageViewerOverlay.addEventListener(
      "transitionend",
      function clear(event) {
        if (
          event.propertyName === "opacity" &&
          !imageViewerOverlay.classList.contains("active")
        ) {
          clearTimeout(timeoutId);
          imageViewerOverlay.style.display = "none";
          imageViewerOverlay.innerHTML = "";
          imageViewerOverlay.removeEventListener("transitionend", clear);
        }
      },
      { once: true }
    );
  }

  mainSlides.forEach((slide) => {
    slide.addEventListener("click", () => {
      const srcPath = slide.getAttribute("src") || slide.style.backgroundImage;
      let file;

      if (srcPath.includes("url(")) {
        file = srcPath.split("/").pop().replace(")", "").replace(/["']/g, "");
      } else {
        file = srcPath.split("/").pop();
      }

      const extra = extraImagesData[file];
      extra ? openGridView(extra) : console.warn("No extra images for", file);
    });
  });

  imageViewerOverlay.addEventListener("click", (e) => {
    if (imageViewerOverlay.contains(e.target)) {
      closeGridView();
    }
  });

  imageViewerOverlay.addEventListener("DOMNodeInserted", (event) => {
    if (event.target.style && event.target.style.display === "flex") {
      event.target.addEventListener("click", (e) => {
        if (e.target === event.target) {
          closeGridView();
          e.stopPropagation();
        }
      });
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && imageViewerOverlay.classList.contains("active"))
      closeGridView();
  });
});
