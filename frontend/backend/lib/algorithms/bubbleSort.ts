import { Algorithm, Frame } from "@/lib/types";

export const bubbleSort: Algorithm = {
  name: "Bubble Sort",
  type: "sorting",
  description: "Repeatedly steps through the list, compares adjacent elements and swaps them if they are in the wrong order.",
  pseudoCode: `for i from 0 to N-1
  for j from 0 to N-i-1
    if A[j] > A[j+1]
      swap(A[j], A[j+1])`,
  code: {
    Javascript: `function bubbleSort(arr) {
  const n = arr.length;
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      if (arr[j] > arr[j + 1]) {
        // Swap
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
      }
    }
  }
  return arr;
}`,
    Python: `def bubble_sort(arr):
    n = len(arr)
    for i in range(n):
        for j in range(0, n - i - 1):
            if arr[j] > arr[j + 1]:
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
    return arr`,
    "C++": `void bubbleSort(int arr[], int n) {
    for (int i = 0; i < n - 1; i++) {
        for (int j = 0; j < n - i - 1; j++) {
            if (arr[j] > arr[j + 1]) {
                swap(arr[j], arr[j + 1]);
            }
        }
    }
}`
  },
  run: (inputArray: number[]): Frame[] => {
    const frames: Frame[] = [];
    const array = [...inputArray];
    const n = array.length;

    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n - i - 1; j++) {
        // Compare
        frames.push({
          array: [...array],
          pointers: { i, j, jNext: j + 1 },
          highlights: [j, j + 1],
          action: "compare",
          description: `Comparing ${array[j]} and ${array[j + 1]}`,
          codeLine: 3,
        });

        if (array[j] > array[j + 1]) {
          // Swap
          [array[j], array[j + 1]] = [array[j + 1], array[j]];
          frames.push({
            array: [...array],
            pointers: { i, j, jNext: j + 1 },
            highlights: [j, j + 1],
            action: "swap",
            description: `Swapping ${array[j]} and ${array[j + 1]}`,
            codeLine: 4,
          });
        }
      }
    }

    // Final sorted frame
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
