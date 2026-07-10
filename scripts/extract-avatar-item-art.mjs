import { createRequire } from "node:module";
import { mkdir, readdir, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const sharp = require("../frontend/node_modules/sharp");

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDir, "..");
const repoRoot = path.resolve(projectRoot, "..");

// Expected source image:
//   ../.prompts/assets/avatar_inventory_grid.png
// In the current prompt batch the file may have an exported ChatGPT filename,
// so the resolver also accepts the newest PNG in that assets folder.
const sourceCandidates = [
  path.join(repoRoot, ".prompts", "assets", "avatar_inventory_grid.png"),
  path.join(projectRoot, ".prompts", "assets", "avatar_inventory_grid.png"),
];

const outputRoot = path.join(
  projectRoot,
  "frontend",
  "public",
  "images",
  "avatar",
  "items",
);

// Source grid: 6 rows x 5 columns. Column 1 is labels; columns 2-5 are item art.
const rows = [
  {
    folder: "head",
    files: ["basic-cap.png", "warm-beanie.png", "city-glasses.png", "explorer-hood.png"],
  },
  {
    folder: "top",
    files: ["basic-tshirt.png", "urban-hoodie.png", "light-jacket.png", "museum-coat.png"],
  },
  {
    folder: "bottom",
    files: ["casual-pants.png", "city-jeans.png", "summer-shorts.png", "explorer-trousers.png"],
  },
  {
    folder: "shoes",
    files: ["white-sneakers.png", "walking-shoes.png", "city-boots.png", "park-runners.png"],
  },
  {
    folder: "accessory",
    files: ["small-backpack.png", "camera-strap.png", "coffee-scarf.png", "map-pouch.png"],
  },
  {
    folder: "pet",
    files: ["street-cat.png", "small-dog.png", "city-pigeon.png", "extra-pet.png"],
  },
];

const outputSize = 512;
const itemMaxSize = 430;
const innerCellMargin = 16;

const sourceImage = await resolveSourceImage();
const source = await sharp(sourceImage).ensureAlpha().raw().toBuffer({
  resolveWithObject: true,
});
const { width, height, channels } = source.info;
const pixels = source.data;

const verticalLines = findGridLines("x", 6);
const horizontalLines = findGridLines("y", 7);

if (verticalLines.length !== 6 || horizontalLines.length !== 7) {
  throw new Error(
    `Expected 6 vertical and 7 horizontal grid lines, got ${verticalLines.length} and ${horizontalLines.length}.`,
  );
}

const writtenFiles = [];

for (let rowIndex = 0; rowIndex < rows.length; rowIndex += 1) {
  const row = rows[rowIndex];
  const outputDir = path.join(outputRoot, row.folder);

  await mkdir(outputDir, { recursive: true });

  for (let itemIndex = 0; itemIndex < row.files.length; itemIndex += 1) {
    const cellColumn = itemIndex + 1;
    const cell = {
      left: verticalLines[cellColumn] + innerCellMargin,
      top: horizontalLines[rowIndex] + innerCellMargin,
      right: verticalLines[cellColumn + 1] - innerCellMargin,
      bottom: horizontalLines[rowIndex + 1] - innerCellMargin,
    };
    const itemBuffer = extractTransparentItem(cell);
    const filePath = path.join(outputDir, row.files[itemIndex]);

    await normalizeAndWrite(itemBuffer, filePath);
    writtenFiles.push(path.relative(projectRoot, filePath).replaceAll("\\", "/"));
  }
}

console.log(
  JSON.stringify(
    {
      source: path.relative(projectRoot, sourceImage).replaceAll("\\", "/"),
      grid: {
        horizontalLines,
        verticalLines,
      },
      writtenFiles,
    },
    null,
    2,
  ),
);

async function resolveSourceImage() {
  for (const candidate of sourceCandidates) {
    try {
      await sharp(candidate).metadata();

      return candidate;
    } catch {
      // Try the next known source path.
    }
  }

  const promptAssetsDir = path.join(repoRoot, ".prompts", "assets");
  const entries = await readdir(promptAssetsDir, { withFileTypes: true });
  const pngFiles = entries
    .filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith(".png"))
    .map((entry) => path.join(promptAssetsDir, entry.name));

  if (pngFiles.length === 0) {
    throw new Error(`No PNG source image found in ${promptAssetsDir}.`);
  }

  const pngFilesByModifiedTime = await Promise.all(
    pngFiles.map(async (filePath) => ({
      filePath,
      modifiedTime: (await stat(filePath)).mtimeMs,
    })),
  );

  pngFilesByModifiedTime.sort((left, right) => left.modifiedTime - right.modifiedTime);

  return pngFilesByModifiedTime[pngFilesByModifiedTime.length - 1].filePath;
}

function findGridLines(axis, expectedCount) {
  const limit = axis === "x" ? width : height;
  const crossLimit = axis === "x" ? height : width;
  const threshold = Math.floor(crossLimit * 0.48);
  const darkCounts = [];

  for (let position = 0; position < limit; position += 1) {
    let count = 0;

    for (let cross = 0; cross < crossLimit; cross += 1) {
      const x = axis === "x" ? position : cross;
      const y = axis === "x" ? cross : position;
      const index = (y * width + x) * channels;
      const r = pixels[index];
      const g = pixels[index + 1];
      const b = pixels[index + 2];

      if (r < 80 && g < 90 && b < 100) {
        count += 1;
      }
    }

    darkCounts[position] = count;
  }

  const groups = [];
  let start = null;

  for (let position = 0; position < darkCounts.length; position += 1) {
    if (darkCounts[position] >= threshold) {
      start ??= position;
      continue;
    }

    if (start !== null) {
      groups.push([start, position - 1]);
      start = null;
    }
  }

  if (start !== null) {
    groups.push([start, darkCounts.length - 1]);
  }

  const lines = groups.map(([groupStart, groupEnd]) =>
    Math.round((groupStart + groupEnd) / 2),
  );

  if (lines.length === expectedCount) {
    return lines;
  }

  return evenlySpacedLines(limit, expectedCount);
}

function evenlySpacedLines(limit, expectedCount) {
  return Array.from({ length: expectedCount }, (_, index) =>
    Math.round((index * (limit - 1)) / (expectedCount - 1)),
  );
}

function extractTransparentItem(cell) {
  const cellWidth = cell.right - cell.left;
  const cellHeight = cell.bottom - cell.top;
  const cellPixels = Buffer.alloc(cellWidth * cellHeight * 4);

  for (let y = 0; y < cellHeight; y += 1) {
    for (let x = 0; x < cellWidth; x += 1) {
      const sourceIndex = ((cell.top + y) * width + cell.left + x) * channels;
      const targetIndex = (y * cellWidth + x) * 4;

      cellPixels[targetIndex] = pixels[sourceIndex];
      cellPixels[targetIndex + 1] = pixels[sourceIndex + 1];
      cellPixels[targetIndex + 2] = pixels[sourceIndex + 2];
      cellPixels[targetIndex + 3] = 255;
    }
  }

  const transparent = floodFillBackground(cellPixels, cellWidth, cellHeight);
  const bounds = findOpaqueBounds(transparent, cellWidth, cellHeight);
  const crop = expandBounds(bounds, cellWidth, cellHeight, 10);
  const cropWidth = crop.right - crop.left + 1;
  const cropHeight = crop.bottom - crop.top + 1;
  const cropPixels = Buffer.alloc(cropWidth * cropHeight * 4);

  for (let y = 0; y < cropHeight; y += 1) {
    for (let x = 0; x < cropWidth; x += 1) {
      const sourceIndex = ((crop.top + y) * cellWidth + crop.left + x) * 4;
      const targetIndex = (y * cropWidth + x) * 4;

      transparent.copy(cropPixels, targetIndex, sourceIndex, sourceIndex + 4);
    }
  }

  return {
    data: cropPixels,
    height: cropHeight,
    width: cropWidth,
  };
}

function floodFillBackground(cellPixels, cellWidth, cellHeight) {
  const result = Buffer.from(cellPixels);
  const visited = new Uint8Array(cellWidth * cellHeight);
  const queue = [];

  for (let x = 0; x < cellWidth; x += 1) {
    queue.push([x, 0], [x, cellHeight - 1]);
  }

  for (let y = 0; y < cellHeight; y += 1) {
    queue.push([0, y], [cellWidth - 1, y]);
  }

  while (queue.length > 0) {
    const [x, y] = queue.pop();

    if (x < 0 || y < 0 || x >= cellWidth || y >= cellHeight) {
      continue;
    }

    const pixelIndex = y * cellWidth + x;

    if (visited[pixelIndex]) {
      continue;
    }

    visited[pixelIndex] = 1;

    const bufferIndex = pixelIndex * 4;

    if (!isBackgroundPixel(result, bufferIndex)) {
      continue;
    }

    result[bufferIndex + 3] = 0;
    queue.push([x - 1, y], [x + 1, y], [x, y - 1], [x, y + 1]);
  }

  return result;
}

function isBackgroundPixel(buffer, index) {
  const r = buffer[index];
  const g = buffer[index + 1];
  const b = buffer[index + 2];
  const lightEnough = r > 226 && g > 220 && b > 210;
  const lowSaturation = Math.max(r, g, b) - Math.min(r, g, b) < 38;

  return lightEnough && lowSaturation;
}

function findOpaqueBounds(buffer, itemWidth, itemHeight) {
  let left = itemWidth - 1;
  let right = 0;
  let top = itemHeight - 1;
  let bottom = 0;

  for (let y = 0; y < itemHeight; y += 1) {
    for (let x = 0; x < itemWidth; x += 1) {
      const alpha = buffer[(y * itemWidth + x) * 4 + 3];

      if (alpha === 0) {
        continue;
      }

      left = Math.min(left, x);
      right = Math.max(right, x);
      top = Math.min(top, y);
      bottom = Math.max(bottom, y);
    }
  }

  return { bottom, left, right, top };
}

function expandBounds(bounds, itemWidth, itemHeight, padding) {
  return {
    bottom: Math.min(itemHeight - 1, bounds.bottom + padding),
    left: Math.max(0, bounds.left - padding),
    right: Math.min(itemWidth - 1, bounds.right + padding),
    top: Math.max(0, bounds.top - padding),
  };
}

async function normalizeAndWrite(item, filePath) {
  const resized = await sharp(item.data, {
    raw: {
      channels: 4,
      height: item.height,
      width: item.width,
    },
  })
    .resize({
      fit: "inside",
      height: itemMaxSize,
      kernel: "lanczos3",
      width: itemMaxSize,
      withoutEnlargement: true,
    })
    .png()
    .toBuffer();

  await sharp({
    create: {
      background: { alpha: 0, b: 0, g: 0, r: 0 },
      channels: 4,
      height: outputSize,
      width: outputSize,
    },
  })
    .composite([{ gravity: "center", input: resized }])
    .png()
    .toFile(filePath);
}
