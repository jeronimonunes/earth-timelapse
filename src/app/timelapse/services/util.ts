export const integerFixedLength = (int: number, width: number) => {
  let str = int.toFixed(0);
  while (str.length < width) {
    str = '0' + str;
  }
  return str;
};

export const timeString = (date: Date) =>
  integerFixedLength(date.getUTCFullYear(), 4) + '-' +
  integerFixedLength(date.getUTCMonth() + 1, 2) + '-' +
  integerFixedLength(date.getUTCDate(), 2);
