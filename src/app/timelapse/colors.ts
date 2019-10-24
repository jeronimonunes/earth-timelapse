type Color = [number, number, number];

export interface ChartJsColor {
  backgroundColor?: string;
  borderColor?: string;
  pointBackgroundColor?: string;
  pointBorderColor?: string;
  pointHoverBackgroundColor?: string;
  pointHoverBorderColor?: string;
}

const defaultColors: [number, number, number][] = [
  [255, 99, 132],
  [54, 162, 235],
  [255, 206, 86],
  [231, 233, 237],
  [75, 192, 192],
  [151, 187, 205],
  [220, 220, 220],
  [247, 70, 74],
  [70, 191, 189],
  [253, 180, 92],
  [148, 159, 177],
  [77, 83, 96]
];

function rgba(color: Color, alpha: number) {
  return 'rgba(' + color.join(',') + ',' + alpha + ')';
}

function getRandomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function getRandomColor(): [number, number, number] {
  return [getRandomInt(0, 255), getRandomInt(0, 255), getRandomInt(0, 255)];
}

export function formatColor(colors: Color) {
  return {
    backgroundColor: rgba(colors, 0.4),
    borderColor: rgba(colors, 1),
    pointBackgroundColor: rgba(colors, 1),
    pointBorderColor: '#fff',
    pointHoverBackgroundColor: '#fff',
    pointHoverBorderColor: rgba(colors, 0.8)
  };
}

export function getColors(count: number): ChartJsColor[] {
  const results = new Array(count);
  let i = 0;
  for (; i < count && i < defaultColors.length; i++) {
    results[i] = formatColor(defaultColors[i]);
  }
  for (; i < count; i++) {
    results[i] = formatColor(getRandomColor());
  }
  return results;
}

export const blue = formatColor([5, 10, 30]);
export const red = formatColor([255, 99, 132]);
