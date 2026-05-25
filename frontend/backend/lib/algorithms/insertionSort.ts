import { Algorithm, Frame } from "@/lib/types";

export const insertionSort: Algorithm = {
  name: "Insertion Sort",
  type: "sorting",
  description: "Builds the final sorted array one item at a time. It is much less efficient on large lists than more advanced algorithms such as quicksort, heapsort, or merge sort.",
  pseudoCode: `for i from 1 to N
  key = A[i]
  j = i - 1
  while j >= 0 and A[j] > key
    A[j + 1] = A[j]
    j = j - 1
  A[j + 1] = key`,
  run: (inputArray: number[]): Frame[] => {
    const frames: Frame[] = [];
    const array = [...inputArray];
    const n = array.length;

    for (let i = 1; i < n; i++) {
      const key = array[i];
      let j = i - 1;

      frames.push({
        array: [...array],
        pointers: { i, j },
        highlights: [i],
        action: "visit",
        description: `Selected key ${key} at index ${i}`,
        codeLine: 2,
      });

      while (j >= 0 && array[j] > key) {
        frames.push({
          array: [...array],
          pointers: { i, j, jNext: j + 1 },
          highlights: [j, j + 1],
          action: "compare",
          description: `Comparing ${array[j]} > ${key}`,
          codeLine: 4,
        });

        array[j + 1] = array[j];
        
        frames.push({
          array: [...array],
          pointers: { i, j, jNext: j + 1 },
          highlights: [j + 1],
          action: "overwrite",
          description: `Moved ${array[j]} to index ${j + 1}`,
          codeLine: 5,
        });

        j = j - 1;
      }

      array[j + 1] = key;
      frames.push({
        array: [...array],
        pointers: { i, j: j + 1 },
        highlights: [j + 1],
        action: "insert",
        description: `Inserted key ${key} at index ${j + 1}`,
        codeLine: 7,
      });
    }

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
