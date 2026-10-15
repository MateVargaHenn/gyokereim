import { isPlatformBrowser } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  OnDestroy,
  PLATFORM_ID,
  ViewChild,
  inject,
} from '@angular/core';
import { Point } from '@shared/types/point';
import { RootPathDef } from '@shared/types/root-path-def';
import p5 from 'p5';

type DrawableRootPath = {
  points: Point[];
  sampledPoints: Point[];
  startWeight: number;
  endWeight: number;
  noiseOffset: number;
  startAt: number;
  endAt: number;
};

type StageBox = {
  x: number;
  y: number;
  width: number;
  height: number;
};

type DesignBounds = {
  left: number;
  right: number;
  top: number;
  bottom: number;
};

type RootLayout = {
  scale: number;
  originX: number;
  originY: number;
};

type RootTextDef = {
  showAt: number;
  text: string;
  x: number;
  y: number;
  angle: number;
  size: number;
};

@Component({
  selector: 'app-tree-root',
  imports: [],
  templateUrl: './tree-root.html',
  styleUrl: './tree-root.css',
})
export class TreeRoot implements AfterViewInit, OnDestroy {
@ViewChild('treeSection', { static: true })
  treeSection!: ElementRef<HTMLElement>;

  @ViewChild('treeRoot', { static: true })
  treeRoot!: ElementRef<HTMLDivElement>;

  private platformId = inject(PLATFORM_ID);

  private sketch?: p5;
  private scrollProgress = 0;
  private targetScrollProgress = 0;
  private renderedScrollProgress = 0;
  private animationFrameId?: number;

  private rebuildP5Paths?: () => void;
  private setP5Looping?: (enabled: boolean) => void;


  @HostListener('window:scroll')
  onWindowScroll(): void {
    this.updateScrollProgress();
  }

  @HostListener('window:resize')
  onWindowResize(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const host = this.treeRoot.nativeElement;

    this.sketch?.resizeCanvas(
      host.clientWidth || window.innerWidth,
      host.clientHeight || window.innerHeight
    );

    this.rebuildP5Paths?.();
    this.updateScrollProgress();
    this.sketch?.redraw();
  }

  private startSmoothRenderLoop(): void {
    if (this.animationFrameId) {
      return;
    }

    const animate = () => {
      const diff = this.targetScrollProgress - this.renderedScrollProgress;

      this.renderedScrollProgress += diff * 0.06;
      this.scrollProgress = this.renderedScrollProgress;

      this.sketch?.redraw();

      if (Math.abs(diff) > 0.001) {
        this.animationFrameId = requestAnimationFrame(animate);
        return;
      }

      this.renderedScrollProgress = this.targetScrollProgress;
      this.scrollProgress = this.targetScrollProgress;
      this.sketch?.redraw();

      this.animationFrameId = undefined;
    };

    this.animationFrameId = requestAnimationFrame(animate);
  }


  updateScrollProgress(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const section = this.treeSection.nativeElement;
    const sectionTop = section.offsetTop;
    const sectionHeight = section.offsetHeight;
    const viewportHeight = window.innerHeight;

    const animationStart = sectionTop;
    const animationEnd =
      sectionTop + sectionHeight - viewportHeight;

    const distance =
      animationEnd - animationStart;

    if (distance <= 0) {
      this.targetScrollProgress = 1;
      this.scrollProgress = 1;

      this.setP5Looping?.(false);
      this.startSmoothRenderLoop();

      return;
    }

    const progressed =
      (window.scrollY - animationStart) / distance;

    this.targetScrollProgress =
      Math.max(
        0,
        Math.min(1, progressed)
      );

    const scrollHintVisible =
      window.scrollY <
      sectionTop + viewportHeight * 0.35;

    this.setP5Looping?.(scrollHintVisible);

    this.startSmoothRenderLoop();
  }

  async ngAfterViewInit(): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const host = this.treeRoot?.nativeElement;

    if (!host) {
      console.error('treeRoot nem található a template-ben.');
      return;
    }

    const p5Module = await import('p5');
    const P5 = p5Module.default;

    const ROOT_SEED = 12345;
    const BACKGROUND_COLOR = {
      r: 239,
      g: 225,
      b: 204,
    };

    P5.disableFriendlyErrors = true;
    
    this.sketch = new P5((p: p5) => {
      let rootLayout: RootLayout | undefined;
      let rootPaths: DrawableRootPath[] = [];
      let activeRootTexts: RootTextDef[] = [];
      let isLooping = false;
      let logoImage: p5.Image | undefined;

      

      const DESKTOP_BOUNDS: DesignBounds = {
        left: -540,
        right: 690,
        top: -150,
        bottom: 650,
      };

      const MOBILE_BOUNDS: DesignBounds = {
        left: -150,
        right: 150,
        top: -40,
        bottom: 690,
      };

      const getScreenScale = (): number => {
        const scale = Math.min(
          p.width / 1440,
          p.height / 900
        );

        return Number.isFinite(scale) && scale > 0 ? scale : 1;
      };

      // Képernyőhöz kötött méretekhez: cím, scroll ikon, intro szöveg.
      const S = (value: number): number => value * getScreenScale();

      const FS = (value: number, min = 12, max = 28): number => {
        const size = S(value);
        return Math.max(min, Math.min(max, size));
      };

      // Gyökér-design koordinátákhoz: root path + root label.
      const TS = (value: number): number => {
        return value * (rootLayout?.scale ?? getScreenScale());
      };

      const TX = (x: number): number => {
        return (rootLayout?.originX ?? p.width * 0.5) + x * (rootLayout?.scale ?? getScreenScale());
      };

      const TY = (y: number): number => {
        return (rootLayout?.originY ?? p.height * 0.5) + y * (rootLayout?.scale ?? getScreenScale());
      };

      const isMobileLayout = (): boolean => p.width < 768;

      this.setP5Looping = (enabled: boolean) => {
        if (isLooping === enabled) {
          return;
        }

        isLooping = enabled;

        if (enabled) {
          p.loop();
        } else {
          p.noLoop();
        }
      };

      this.rebuildP5Paths = () => {
        buildRootPaths();
      };

      p.setup = () => {
  const canvas = p.createCanvas(
    host.clientWidth || window.innerWidth,
    host.clientHeight || window.innerHeight
  );

  canvas.addClass('tree-root-canvas');
  canvas.parent(host);

  p.loadImage(
    '/icon/icon.png',
    (img) => {
      logoImage = img;
      p.redraw();
    },
    (error) => {
      console.error('A kép betöltése sikertelen:', error);
    }
  );

  const canvasElement = canvas.elt as HTMLCanvasElement;

  canvasElement.style.pointerEvents = 'none';
  canvasElement.style.touchAction = 'pan-y';
  p.pixelDensity(
    Math.min(window.devicePixelRatio || 1, 2)
  );
  p.noiseSeed(ROOT_SEED);

  buildRootPaths();

  p.loop();

  queueMicrotask(() => {
    this.updateScrollProgress();
    p.redraw();
  });
};

p.draw = () => {
  p.resetMatrix();

  p.randomSeed(ROOT_SEED);
  p.noiseSeed(ROOT_SEED);

  p.background(BACKGROUND_COLOR.r, BACKGROUND_COLOR.g, BACKGROUND_COLOR.b);

  for (const path of rootPaths) {
    drawAnimatedPath(path, this.scrollProgress);
  }

  drawVisibleTexts(this.scrollProgress);
  drawScrollIcon(this.scrollProgress);
};

      function getStageBox(): StageBox {
        const bottomReserved = Math.max(88, p.height * 0.12);
        const topReserved = Math.max(28, p.height * 0.04);

        if (isMobileLayout()) {

          const y = Math.max(250, p.height * 0.27);

          return {
            x: 28,
            y,
            width: Math.max(1, p.width - 56),
            height: Math.max(1, p.height - y - bottomReserved),
          };
        }

        if (p.width < 1200) {
          return {
            x: p.width * 0.08,
            y: topReserved,
            width: p.width * 0.84,
            height: Math.max(1, p.height - topReserved - bottomReserved),
          };
        }

        // Desktopon bal oldalon hagyunk helyet a főcímnek.
        return {
          x: p.width * 0.24,
          y: topReserved,
          width: p.width * 0.70,
          height: Math.max(1, p.height - topReserved - bottomReserved),
        };
      }

      function calculateRootLayout(bounds: DesignBounds): RootLayout {
        const box = getStageBox();

        const designWidth = bounds.right - bounds.left;
        const designHeight = bounds.bottom - bounds.top;

        const scale = Math.min(
          box.width / designWidth,
          box.height / designHeight
        );

        const safeScale = Number.isFinite(scale) && scale > 0 ? scale : 1;

        const originX =
          box.x +
          (box.width - designWidth * safeScale) / 2 -
          bounds.left * safeScale;

        const originY =
          box.y +
          (box.height - designHeight * safeScale) / 2 -
          bounds.top * safeScale;

        return {
          scale: safeScale,
          originX,
          originY,
        };
      }

      function buildRootPaths(): void {
        const rootPathDefs = isMobileLayout()
          ? MOBILE_ROOT_PATH_DEFS
          : DESKTOP_ROOT_PATH_DEFS;

        activeRootTexts = isMobileLayout()
          ? MOBILE_ROOT_TEXTS
          : DESKTOP_ROOT_TEXTS;

        rootLayout = calculateRootLayout(
          isMobileLayout() ? MOBILE_BOUNDS : DESKTOP_BOUNDS
        );

        rootPaths = rootPathDefs.map((def) => {
          const scaledPoints = def.points.map((point) => ({
            x: TX(point.x),
            y: TY(point.y),
          }));

          return {
            points: scaledPoints,
            sampledPoints: sampleOrganicPath(scaledPoints, def.noiseOffset),
            startWeight: TS(def.startWeight),
            endWeight: TS(def.endWeight),
            noiseOffset: def.noiseOffset,
            startAt: def.startAt,
            endAt: def.endAt,
          };
        });
      }

      function drawVisibleTexts(progress: number): void {
        drawTitle();

        if (progress < 0.35) {
          drawIntroText();
          return;
        }

        for (const item of activeRootTexts) {
          if (progress < item.showAt) {
            continue;
          }

          const alpha = Math.min(1, Math.max(0, (progress - item.showAt) / 0.06));

          drawRootLabel(
            item.text,
            TX(item.x),
            TY(item.y),
            item.angle,
            item.size,
            alpha
          );
        }
      }

      function drawCenteredTextBox(
        text: string,
        centerX: number,
        centerY: number,
        boxWidth: number,
        boxHeight: number
      ): void {
        p.text(
          text,
          centerX - boxWidth / 2,
          centerY - boxHeight / 2,
          boxWidth,
          boxHeight
        );
      }

function drawTitle(): void {
  p.push();

  p.textFont('Georgia, "Times New Roman", serif');
  p.fill(70, 45, 25);
  p.noStroke();
  p.textAlign(p.CENTER, p.CENTER);
  p.textWrap(p.WORD);

  if (isMobileLayout()) {
    const titleCenterX = p.width * 0.5;
    const titleCenterY = 140;

    const titleWidth = Math.min(300, p.width - 48);
    const titleHeight = 130;

    p.textSize(20);
            if (logoImage) {
              p.image(
                logoImage,
                p.width / 2 - 50,
                0,
                100,
                100
              );
            }
    drawCenteredTextBox(
      'Kíváncsi, kik\nvoltak ön\nelőtt?',
      titleCenterX,
      titleCenterY,
      titleWidth,
      titleHeight
    );

    const subtitleCenterX = p.width * 0.5;
    const subtitleCenterY = 200;

    const subtitleWidth = Math.min(320, p.width - 56);
    const subtitleHeight = 54;

    p.textSize(12);

    drawCenteredTextBox(
      'Egy történet önről. A múltjáról,\naz emlékeiről.',
      subtitleCenterX,
      subtitleCenterY,
      subtitleWidth,
      subtitleHeight
    );

    p.pop();
    return;
  }

const titleCenterX = p.width * 0.15;

const titleWidth = Math.min(
  S(320),
  p.width * 0.28
);

const titleHeight = S(190);

// A logó mérete ne csak a szélességtől,
// hanem a rendelkezésre álló magasságtól is függjön.
const logoSize = Math.min(
  S(300),
  p.height * 0.32
);

const logoTop = S(10);

if (logoImage) {
  p.image(
    logoImage,
    titleCenterX - logoSize / 2,
    logoTop,
    logoSize,
    logoSize
  );
}

const titleTop =
  logoTop +
  logoSize +
  S(20);

const titleCenterY =
  titleTop +
  titleHeight / 2;

p.textSize(FS(38, 30, 44));

drawCenteredTextBox(
  'Kíváncsi, kik\nvoltak ön\nelőtt?',
  titleCenterX,
  titleCenterY,
  titleWidth,
  titleHeight
);

const subtitleHeight = S(60);

const subtitleCenterY =
  titleTop +
  titleHeight +
  S(10) +
  subtitleHeight / 2;

p.textSize(FS(15, 13, 17));

drawCenteredTextBox(
  'Egy történet önről. A múltjáról,\naz emlékeiről.',
  titleCenterX,
  subtitleCenterY,
  titleWidth,
  subtitleHeight
);

  p.pop();
}

function drawIntroText(): void {
  p.push();

  p.textFont('Georgia, "Times New Roman", serif');
  p.fill(70, 45, 25);
  p.noStroke();
  p.textAlign(p.CENTER, p.CENTER);
  p.textWrap(p.WORD);

  const boxWidth = isMobileLayout()
    ? Math.min(340, p.width - 48)
    : Math.min(S(380), p.width - 48);

  const boxHeight = isMobileLayout()
    ? 90
    : S(90);

  const centerX = p.width * 0.5;

  const centerY = isMobileLayout()
    ? p.height * 0.68
    : Math.min(p.height * 0.74, p.height - S(165));

  p.textSize(
    isMobileLayout()
      ? 17
      : FS(22, 16, 26)
  );

  drawCenteredTextBox(
    'Kezdje meg a felfedezést! Görgessen lejjebb!',
    centerX,
    centerY,
    boxWidth,
    boxHeight
  );

  p.pop();
}

      function drawRootLabel(
        text: string,
        x: number,
        y: number,
        angleDeg: number,
        size = 16,
        alpha = 1
      ): void {
        p.push();

        p.translate(x, y);
        p.rotate(p.radians(angleDeg));

        p.textFont('Georgia, "Times New Roman", serif');
        p.textSize(
                  isMobileLayout()
                  ? Math.max(12, Math.min(18, TS(size * 1.15)))
                  : Math.max(12, Math.min(23, TS(size)))
        );
        p.textAlign(p.CENTER, p.CENTER);

        const paddingX = TS(13);
        const paddingY = TS(7);

        const lines = text.split('\n');

        const textWidth = Math.max(
          ...lines.map(line => p.textWidth(line))
        );

        const lineHeight = p.textSize() * 1.2;

        const w = textWidth + paddingX * 2;
        const h = lineHeight * lines.length + paddingY * 2;

        p.noStroke();
        p.fill(
          BACKGROUND_COLOR.r,
          BACKGROUND_COLOR.g,
          BACKGROUND_COLOR.b,
          210 * alpha
        );
        p.rectMode(p.CENTER);
        p.rect(0, 0, w, h, TS(16));

        p.fill(70, 45, 25, 255 * alpha);
        p.noStroke();
        p.text(text, 0, 0);

        p.pop();
      }

      function drawScrollIcon(progress: number): void {
        if (progress > 0.35) {
          return;
        }

        p.push();

        const iconScale = Math.max(0.72, Math.min(1, getScreenScale()));
        const x = p.width * 0.5;
        const y = Math.min(p.height * 0.84, p.height - 118);
        const dotOffset = p.sin(p.frameCount * 0.08) * 10 * iconScale;

        p.translate(x, y);

        p.stroke(70, 45, 25);
        p.strokeWeight(3 * iconScale);
        p.noFill();

        p.rectMode(p.CENTER);
        p.rect(0, 0, 42 * iconScale, 70 * iconScale, 22 * iconScale);

        p.noStroke();
        p.fill(70, 45, 25);
        p.circle(0, -14 * iconScale + dotOffset, 8 * iconScale);

        p.pop();
      }

      function drawAnimatedPath(path: DrawableRootPath, globalProgress: number): void {
        if (globalProgress <= path.startAt) {
          return;
        }

        const range = path.endAt - path.startAt;

        const localProgress =
          range <= 0
            ? 1
            : Math.min(1, Math.max(0, (globalProgress - path.startAt) / range));

        drawPartialSampledRootPath(
          path.sampledPoints,
          path.startWeight,
          path.endWeight,
          path.noiseOffset,
          localProgress
        );
      }

      function drawPartialSampledRootPath(
        sampledPoints: Point[],
        startWeight: number,
        endWeight: number,
        noiseOffset: number,
        progress: number
      ): void {
        if (progress <= 0) {
          return;
        }

        const visibleCount = Math.floor(sampledPoints.length * progress);

        if (visibleCount < 3) {
          return;
        }

        const visiblePoints = sampledPoints.slice(0, visibleCount);

        drawRootBody(visiblePoints, startWeight * 1.55, endWeight * 1.08, noiseOffset);
        drawRootCore(visiblePoints, startWeight * 0.20, endWeight * 0.16, noiseOffset + 300);
        drawRootFibers(visiblePoints, noiseOffset + 700);

        // Ez szép, de drágább. Ritkítva hagyom bent.
        drawRootDust(visiblePoints, noiseOffset + 1000);
      }

      function drawRootBody(
        points: Point[],
        startWidth: number,
        endWidth: number,
        noiseOffset: number
      ): void {
        const leftSide: Point[] = [];
        const rightSide: Point[] = [];
        const widths: number[] = [];

        for (let i = 0; i < points.length; i++) {
          const prev = points[Math.max(0, i - 1)];
          const next = points[Math.min(points.length - 1, i + 1)];
          const current = points[i];

          const angle = Math.atan2(next.y - prev.y, next.x - prev.x);
          const normalX = -Math.sin(angle);
          const normalY = Math.cos(angle);

          const t = i / Math.max(1, points.length - 1);
          const width = p.lerp(startWidth, endWidth, Math.pow(t, 0.85));

          const widthNoise = p.map(
            p.noise(noiseOffset + i * 0.08),
            0,
            1,
            -width * 0.12,
            width * 0.12
          );

          const finalWidth = Math.max(0.8, width + widthNoise);
          widths.push(finalWidth);

          leftSide.push({
            x: current.x + normalX * finalWidth,
            y: current.y + normalY * finalWidth,
          });

          rightSide.push({
            x: current.x - normalX * finalWidth,
            y: current.y - normalY * finalWidth,
          });
        }

        p.noStroke();
        p.fill(88, 56, 33, 210);

        p.beginShape();
        for (const pt of leftSide) {
          p.vertex(pt.x, pt.y);
        }

        for (let i = rightSide.length - 1; i >= 0; i--) {
          p.vertex(rightSide[i].x, rightSide[i].y);
        }

        p.endShape(p.CLOSE);

        p.noFill();
        p.stroke(62, 38, 20, 170);
        p.strokeWeight(Math.max(0.7, TS(1.2)));

        p.beginShape();
        for (const pt of leftSide) {
          p.vertex(pt.x, pt.y);
        }
        p.endShape();

        p.beginShape();
        for (const pt of rightSide) {
          p.vertex(pt.x, pt.y);
        }
        p.endShape();

        drawRootCap(points[0], widths[0], 88, 56, 33, 210);
        drawRootCap(points[points.length - 1], widths[widths.length - 1], 88, 56, 33, 210);

        drawRootCapOutline(points[0], widths[0]);
        drawRootCapOutline(points[points.length - 1], widths[widths.length - 1]);
      }

      function drawRootCap(
        center: Point,
        radius: number,
        r: number,
        g: number,
        b: number,
        alpha: number
      ): void {
        p.noStroke();
        p.fill(r, g, b, alpha);
        p.circle(center.x, center.y, radius * 2);
      }

      function drawRootCapOutline(center: Point, radius: number): void {
        p.noFill();
        p.stroke(62, 38, 20, 170);
        p.strokeWeight(Math.max(0.6, TS(1)));
        p.circle(center.x, center.y, radius * 2);
      }

      function drawRootCore(
        points: Point[],
        startWeight: number,
        endWeight: number,
        noiseOffset: number
      ): void {
        p.noFill();
        p.stroke(50, 29, 15, 160);
        p.strokeCap(p.ROUND);

        for (let i = 1; i < points.length - 1; i++) {
          const a = points[i];
          const b = points[i + 1];

          const prev = points[i - 1];
          const next = points[Math.min(points.length - 1, i + 2)];

          const angle = Math.atan2(next.y - prev.y, next.x - prev.x);
          const normalX = -Math.sin(angle);
          const normalY = Math.cos(angle);

          const offset = p.map(
            p.noise(noiseOffset + i * 0.07),
            0,
            1,
            -TS(2.2),
            TS(2.2)
          );

          const ax = a.x + normalX * offset;
          const ay = a.y + normalY * offset;
          const bx = b.x + normalX * offset;
          const by = b.y + normalY * offset;

          const t = i / points.length;
          const w = p.lerp(startWeight, endWeight, t);

          p.strokeWeight(Math.max(0.6, w));
          p.line(ax, ay, bx, by);
        }
      }

      function drawRootFibers(points: Point[], noiseOffset: number): void {
        p.stroke(70, 45, 25, 120);
        p.strokeCap(p.ROUND);

        for (let i = 12; i < points.length - 12; i += 18) {
          const point = points[i];
          const next = points[i + 1];

          const angle = Math.atan2(next.y - point.y, next.x - point.x);
          const side = p.noise(noiseOffset + i) > 0.5 ? 1 : -1;

          const branchAngle = angle + side * p.map(
            p.noise(noiseOffset + i * 2),
            0,
            1,
            0.55,
            1.05
          );

          const len = TS(
            p.map(
              p.noise(noiseOffset + i * 3),
              0,
              1,
              9,
              25
            )
          );

          const endX = point.x + Math.cos(branchAngle) * len;
          const endY = point.y + Math.sin(branchAngle) * len;

          p.strokeWeight(Math.max(0.5, TS(1.1)));
          p.line(point.x, point.y, endX, endY);

          if (p.noise(noiseOffset + i * 4) > 0.68) {
            const end2X = endX + Math.cos(branchAngle + side * 0.45) * len * 0.35;
            const end2Y = endY + Math.sin(branchAngle + side * 0.45) * len * 0.35;

            p.strokeWeight(Math.max(0.4, TS(0.7)));
            p.line(endX, endY, end2X, end2Y);
          }
        }
      }

      function drawRootDust(points: Point[], noiseOffset: number): void {
        p.noStroke();
        p.fill(92, 60, 35, 55);

        for (let i = 0; i < points.length; i += 24) {
          const pt = points[i];
          const count = 1 + Math.floor(p.noise(noiseOffset + i) * 3);

          for (let j = 0; j < count; j++) {
            const ox = TS(p.map(p.noise(noiseOffset + i * 10 + j), 0, 1, -10, 10));
            const oy = TS(p.map(p.noise(noiseOffset + i * 20 + j), 0, 1, -10, 10));
            const size = TS(p.random(1, 2.1));

            p.circle(pt.x + ox, pt.y + oy, Math.max(0.6, size));
          }
        }
      }

      function sampleOrganicPath(points: Point[], noiseOffset: number): Point[] {
        const sampledPoints: Point[] = [];

        for (let i = 0; i < points.length - 1; i++) {
          const a = points[i];
          const b = points[i + 1];

          const distance = Math.hypot(b.x - a.x, b.y - a.y);
          const steps = Math.max(8, Math.min(28, Math.floor(distance / Math.max(6, TS(10)))));

          for (let j = 0; j < steps; j++) {
            const t = j / steps;

            const x = p.lerp(a.x, b.x, t);
            const y = p.lerp(a.y, b.y, t);

            const angle = Math.atan2(b.y - a.y, b.x - a.x);
            const normalX = -Math.sin(angle);
            const normalY = Math.cos(angle);

            const n = p.noise(noiseOffset + i * 0.55 + t * 1.35);
            const offset = TS(p.map(n, 0, 1, -4.5, 4.5));

            sampledPoints.push({
              x: x + normalX * offset,
              y: y + normalY * offset,
            });
          }
        }

        const last = points[points.length - 1];

        if (last) {
          sampledPoints.push(last);
        }

        return sampledPoints;
      }
    });
  }
  
  ngOnDestroy(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }

    this.sketch?.remove();
  }
}

const DESKTOP_ROOT_PATH_DEFS: RootPathDef[] = [
  {
    points: [
      { x: 0, y: -210 },
      { x: -8, y: -60 },
      { x: 4, y: 10 },
      { x: 0, y: 70 },
    ],
    startWeight: 18,
    endWeight: 9,
    noiseOffset: 1,
    startAt: 0.0,
    endAt: 0.14,
  },
  {
    points: [
      { x: 0, y: 70 },
      { x: -55, y: 78 },
      { x: -115, y: 82 },
      { x: -180, y: 88 },
      { x: -255, y: 96 },
    ],
    startWeight: 6,
    endWeight: 1.1,
    noiseOffset: 8,
    startAt: 0.14,
    endAt: 0.3,
  },
  {
    points: [
      { x: -125, y: 83 },
      { x: -170, y: 105 },
      { x: -230, y: 120 },
    ],
    startWeight: 1.4,
    endWeight: 0.7,
    noiseOffset: 12,
    startAt: 0.24,
    endAt: 0.34,
  },
  {
    points: [
      { x: 0, y: 70 },
      { x: 55, y: 78 },
      { x: 105, y: 95 },
      { x: 145, y: 118 },
      { x: 185, y: 125 },
      { x: 230, y: 112 },
      { x: 270, y: 95 },
    ],
    startWeight: 6.5,
    endWeight: 1,
    noiseOffset: 18,
    startAt: 0.22,
    endAt: 0.44,
  },
  {
    points: [
      { x: 0, y: 70 },
      { x: -45, y: 150 },
      { x: -85, y: 195 },
      { x: -135, y: 218 },
      { x: -175, y: 245 },
      { x: -220, y: 242 },
      { x: -270, y: 239 },
    ],
    startWeight: 5.8,
    endWeight: 1,
    noiseOffset: 21,
    startAt: 0.34,
    endAt: 0.52,
  },
  {
    points: [
      { x: 0, y: 70 },
      { x: -28, y: 188 },
      { x: -74, y: 235 },
      { x: -135, y: 263 },
      { x: -145, y: 303 },
      { x: -185, y: 366 },
      { x: -235, y: 373 },
      { x: -253, y: 398 },
      { x: -293, y: 418 },
      { x: -326, y: 458 },
      { x: -379, y: 463 },
      { x: -429, y: 421 },
      { x: -485, y: 366 },
    ],
    startWeight: 5.8,
    endWeight: 1.1,
    noiseOffset: 27,
    startAt: 0.50,
    endAt: 0.70,
  },
  {
    points: [
      { x: 0, y: 70 },
      { x: 38, y: 130 },
      { x: 90, y: 178 },
      { x: 155, y: 205 },
      { x: 225, y: 230 },
      { x: 285, y: 270 },
      { x: 335, y: 315 },
    ],
    startWeight: 7,
    endWeight: 2,
    noiseOffset: 34,
    startAt: 0.56,
    endAt: 0.74,
  },
  {
    points: [
      { x: 335, y: 315 },
      { x: 360, y: 356 },
      { x: 390, y: 405 },
      { x: 430, y: 455 },
      { x: 470, y: 500 },
    ],
    startWeight: 2,
    endWeight: 1,
    noiseOffset: 41,
    startAt: 0.74,
    endAt: 0.88,
  },
  {
    points: [
      { x: 470, y: 500 },
      { x: 505, y: 522 },
      { x: 545, y: 536 },
      { x: 585, y: 545 },
    ],
    startWeight: 1,
    endWeight: 0.45,
    noiseOffset: 49,
    startAt: 0.88,
    endAt: 0.98,
  },
];

const DESKTOP_ROOT_TEXTS: RootTextDef[] = [
  {
    showAt: 0.18,
    text: 'Családfakutatót keres?',
    x: -170,
    y: 52,
    angle: -2,
    size: 16,
  },
  {
    showAt: 0.32,
    text: 'Kíváncsi a gyökereire?',
    x: 285,
    y: 54,
    angle: -20,
    size: 16,
  },
  {
    showAt: 0.46,
    text: 'Szeretné megtalálni távoli rokonait?',
    x: -340,
    y: 214,
    angle: -12,
    size: 15,
  },
  {
    showAt: 0.62,
    text: 'Elakadt az anyakönyvekben?',
    x: -410,
    y: 328,
    angle: -9,
    size: 15,
  },
  {
    showAt: 0.76,
    text: 'Elveszett az adatokban?',
    x: 475,
    y: 250,
    angle: 10,
    size: 15,
  },
  {
    showAt: 0.92,
    text: 'Segítek!',
    x: 640,
    y: 525,
    angle: -3,
    size: 21,
  },
];

const MOBILE_ROOT_PATH_DEFS: RootPathDef[] = [
  {
    points: [
      { x: 0, y: 0 },
      { x: -4, y: 40 },
      { x: 6, y: 105 },
    ],
    startWeight: 14,
    endWeight: 7,
    noiseOffset: 1,
    startAt: 0.0,
    endAt: 0.15,
  },
  {
    points: [
      { x: 6, y: 105 },
      { x: -58, y: 165 },
      { x: -80, y: 220 },
    ],
    startWeight: 5,
    endWeight: 1,
    noiseOffset: 8,
    startAt: 0.15,
    endAt: 0.3,
  },
  {
    points: [
      { x: 6, y: 105 },
      { x: 55, y: 170 },
      { x: 80, y: 232 },
    ],
    startWeight: 5,
    endWeight: 1,
    noiseOffset: 18,
    startAt: 0.28,
    endAt: 0.42,
  },
  {
    points: [
      { x: 6, y: 105 },
      { x: -10, y: 230 },
      { x: -28, y: 330 },
      { x: -70, y: 430 },
    ],
    startWeight: 6,
    endWeight: 1.2,
    noiseOffset: 27,
    startAt: 0.42,
    endAt: 0.64,
  },
  {
    points: [
      { x: 6, y: 105 },
      { x: 22, y: 260 },
      { x: 48, y: 400 },
      { x: 82, y: 525 },
    ],
    startWeight: 6,
    endWeight: 1.2,
    noiseOffset: 34,
    startAt: 0.58,
    endAt: 0.8,
  },
  {
    points: [
      { x: 82, y: 525 },
      { x: 72, y: 585 },
      { x: 46, y: 635 },
      { x: 10, y: 670 },
    ],
    startWeight: 1.2,
    endWeight: 0.45,
    noiseOffset: 49,
    startAt: 0.8,
    endAt: 0.98,
  },
];

const MOBILE_ROOT_TEXTS: RootTextDef[] = [
  {
    showAt: 0.18,
    text: 'Családfakutatót\nkeres?',
    x: -95,
    y: 130,
    angle: -4,
    size: 15,
  },
  {
    showAt: 0.32,
    text: 'Kíváncsi a\ngyökereire?',
    x: 100,
    y: 140,
    angle: 4,
    size: 15,
  },
  {
    showAt: 0.46,
    text: 'Szeretné megtalálni\ntávoli rokonait?',
    x: -68,
    y: 300,
    angle: -4,
    size: 13,
  },
  {
    showAt: 0.62,
    text: 'Elakadt az\nanyakönyvekben?',
    x: -82,
    y: 395,
    angle: -4,
    size: 13,
  },
  {
    showAt: 0.76,
    text: 'Elveszett az\nadatokban?',
    x: 88,
    y: 430,
    angle: 4,
    size: 13,
  },
  {
    showAt: 0.92,
    text: 'Segítek!',
    x: 45,
    y: 620,
    angle: -2,
    size: 20,
  },
];