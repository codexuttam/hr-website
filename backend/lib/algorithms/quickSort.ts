import { Algorithm, Frame } from "../types";

export const quickSort: Algorithm = {
  name: "Quick Sort",
  type: "sorting",
  description: "Divide and conquer algorithm. It picks an element as pivot and partitions the given array around the picked pivot.",
  pseudoCode: `quickSort(arr, low, high)
  if low < high
    pi = partition(arr, low, high)
    quickSort(arr, low, pi - 1)
    quickSort(arr, pi + 1, high)

partition(arr, low, high)
  pivot = arr[high]
  i = low - 1
  for j = low to high - 1
    if arr[j] < pivot
      i++
      swap arr[i] and arr[j]
  swap arr[i + 1] and arr[high]
  return i + 1`,
  run: (inputArray: number[]): Frame[] => {
    const frames: Frame[] = [];
    const array = [...inputArray];

    const partition = (arr: number[], low: number, high: number): number => {
      const pivot = arr[high];
      let i = low - 1;

      frames.push({
        array: [...arr],
        pointers: { low, high, pivotIdx: high },
        highlights: [high],
        action: "visit",
        description: `Chosen pivot ${pivot} at index ${high}`,
        codeLine: 7,
      });

      for (let j = low; j < high; j++) {
        frames.push({
          array: [...arr],
          pointers: { i, j, high },
          highlights: [j, high],
          action: "compare",
          description: `Comparing ${arr[j]} < pivot (${pivot})`,
          codeLine: 10,
        });

        if (arr[j] < pivot) {
          i++;
          [arr[i], arr[j]] = [arr[j], arr[i]];
          frames.push({
            array: [...arr],
            pointers: { i, j },
            highlights: [i, j],
            action: "swap",
            description: `Swapped ${arr[i]} and ${arr[j]}`,
            codeLine: 12,
          });
        }
      }

      [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
      frames.push({
        array: [...arr],
        pointers: { i: i + 1, high },
        highlights: [i + 1, high],
        action: "swap",
        description: `Placed pivot ${pivot} at correct position ${i + 1}`,
        codeLine: 13,
      });

      return i + 1;
    };

    const sort = (arr: number[], low: number, high: number) => {
      if (low < high) {
        const pi = partition(arr, low, high);
        sort(arr, low, pi - 1);
        sort(arr, pi + 1, high);
      }
    };

    sort(array, 0, array.length - 1);

    frames.push({
      array: [...array],
      pointers: {},
      highlights: [],
      action: "found",
      description: "Array is sorted!",
      codeLine: 0,
    });

    return frames;
  },
};
