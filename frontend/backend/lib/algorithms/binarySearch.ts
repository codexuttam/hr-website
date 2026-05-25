import { Algorithm, Frame } from "@/lib/types";

export const binarySearch: Algorithm = {
  name: "Binary Search",
  type: "searching",
  description: "Search a sorted array by repeatedly dividing the search interval in half.",
  pseudoCode: `low = 0, high = N - 1
while low <= high
  mid = low + (high - low) / 2
  if A[mid] == target
    return mid
  if A[mid] < target
    low = mid + 1
  else
    high = mid - 1
return -1`,
  run: (inputArray: number[], target: number = 0): Frame[] => {
    const frames: Frame[] = [];
    // Binary search requires sorted array. We'll sort it for the visualization.
    const array = [...inputArray].sort((a, b) => a - b);
    
    frames.push({
      array: [...array],
      pointers: {},
      highlights: [],
      action: "visit",
      description: "Array must be sorted for Binary Search. Sorted the array.",
      codeLine: 0,
    });

    let low = 0;
    let high = array.length - 1;
    let found = false;

    while (low <= high) {
      const mid = Math.floor(low + (high - low) / 2);

      frames.push({
        array: [...array],
        pointers: { low, high, mid },
        highlights: [low, high, mid],
        action: "visit",
        description: `Searching in range [${low}, ${high}]. Mid index: ${mid}, Value: ${array[mid]}`,
        codeLine: 3,
      });

      if (array[mid] === target) {
        frames.push({
          array: [...array],
          pointers: { mid },
          highlights: [mid],
          action: "found",
          description: `Found target ${target} at index ${mid}!`,
          codeLine: 5,
        });
        found = true;
        break;
      }

      if (array[mid] < target) {
        frames.push({
          array: [...array],
          pointers: { low, high, mid },
          highlights: [mid],
          action: "compare",
          description: `${array[mid]} < ${target}, searching right half`,
          codeLine: 6,
        });
        low = mid + 1;
      } else {
        frames.push({
          array: [...array],
          pointers: { low, high, mid },
          highlights: [mid],
          action: "compare",
          description: `${array[mid]} > ${target}, searching left half`,
          codeLine: 8,
        });
        high = mid - 1;
      }
    }

    if (!found) {
      frames.push({
        array: [...array],
        pointers: {},
        highlights: [],
        action: "visit",
        description: `Target ${target} not found in the array.`,
        codeLine: 10,
      });
    }

    return frames;
  },
};
