import { Algorithm, Frame } from "@/lib/types";

export const selectionSort: Algorithm = {
  name: "Selection Sort",
  type: "sorting",
  description: "Divides the input list into two parts: a sorted sublist of items which is built up from left to right at the front (left) of the list and a sublist of the remaining unsorted items.",
  pseudoCode: `for i from 0 to N-1
  min_idx = i
  for j from i+1 to N
    if A[j] < A[min_idx]
      min_idx = j
  swap(A[min_idx], A[i])`,
  code: {
    Javascript: `function selectionSort(arr) {
  const n = arr.length;
  for (let i = 0; i < n; i++) {
    let minIdx = i;
    for (let j = i + 1; j < n; j++) {
      if (arr[j] < arr[minIdx]) {
        minIdx = j;
      }
    }
    if (minIdx !== i) {
      [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];
    }
  }
  return arr;
}`,
    Python: `def selection_sort(arr):
    n = len(arr)
    for i in range(n):
        min_idx = i
        for j in range(i+1, n):
            if arr[j] < arr[min_idx]:
                min_idx = j
        arr[i], arr[min_idx] = arr[min_idx], arr[i]
    return arr`,
    "C++": `void selectionSort(int arr[], int n) {
    for (int i = 0; i < n - 1; i++) {
        int min_idx = i;
        for (int j = i + 1; j < n; j++) {
            if (arr[j] < arr[min_idx])
                min_idx = j;
        }
        swap(arr[min_idx], arr[i]);
    }
}`
  },
  run: (inputArray: number[]): Frame[] => {
    const frames: Frame[] = [];
    const array = [...inputArray];
    const n = array.length;

    for (let i = 0; i < n; i++) {
      let minIdx = i;
      
      frames.push({
        array: [...array],
        pointers: { i, minIdx },
        highlights: [i],
        action: "visit",
        description: `Current minimum is at index ${i} (value: ${array[i]})`,
        codeLine: 2,
      });

      for (let j = i + 1; j < n; j++) {
        frames.push({
          array: [...array],
          pointers: { i, minIdx, j },
          highlights: [minIdx, j],
          action: "compare",
          description: `Comparing ${array[j]} with current minimum ${array[minIdx]}`,
          codeLine: 4,
        });

        if (array[j] < array[minIdx]) {
          minIdx = j;
          frames.push({
            array: [...array],
            pointers: { i, minIdx, j },
            highlights: [minIdx],
            action: "visit",
            description: `New minimum found at index ${j} (value: ${array[j]})`,
            codeLine: 5,
          });
        }
      }

      if (minIdx !== i) {
        [array[i], array[minIdx]] = [array[minIdx], array[i]];
        frames.push({
          array: [...array],
          pointers: { i, minIdx },
          highlights: [i, minIdx],
          action: "swap",
          description: `Swapping ${array[i]} with ${array[minIdx]}`,
          codeLine: 6,
        });
      }
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
