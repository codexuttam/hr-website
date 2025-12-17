import { Algorithm, Frame } from "@/lib/types";

export const mergeSort: Algorithm = {
  name: "Merge Sort",
  type: "sorting",
  description: "Divide and conquer algorithm that divides the input array into two halves, calls itself for the two halves, and then merges the two sorted halves.",
  pseudoCode: `mergeSort(arr, l, r)
  if l < r
    m = l + (r - l) / 2
    mergeSort(arr, l, m)
    mergeSort(arr, m + 1, r)
    merge(arr, l, m, r)`,
  run: (inputArray: number[]): Frame[] => {
    const frames: Frame[] = [];
    const array = [...inputArray];

    const merge = (arr: number[], l: number, m: number, r: number) => {
      const n1 = m - l + 1;
      const n2 = r - m;

      const L = new Array(n1);
      const R = new Array(n2);

      for (let i = 0; i < n1; i++) L[i] = arr[l + i];
      for (let j = 0; j < n2; j++) R[j] = arr[m + 1 + j];

      let i = 0;
      let j = 0;
      let k = l;

      while (i < n1 && j < n2) {
        frames.push({
          array: [...arr],
          pointers: { l, r, m, k },
          highlights: [l + i, m + 1 + j],
          action: "compare",
          description: `Comparing L[${i}] (${L[i]}) and R[${j}] (${R[j]})`,
          codeLine: 6,
        });

        if (L[i] <= R[j]) {
          arr[k] = L[i];
          frames.push({
            array: [...arr],
            pointers: { k },
            highlights: [k],
            action: "overwrite",
            description: `Placed ${L[i]} at index ${k}`,
            codeLine: 6,
          });
          i++;
        } else {
          arr[k] = R[j];
          frames.push({
            array: [...arr],
            pointers: { k },
            highlights: [k],
            action: "overwrite",
            description: `Placed ${R[j]} at index ${k}`,
            codeLine: 6,
          });
          j++;
        }
        k++;
      }

      while (i < n1) {
        arr[k] = L[i];
        frames.push({
          array: [...arr],
          pointers: { k },
          highlights: [k],
          action: "overwrite",
            description: `Placed remaining ${L[i]} at index ${k}`,
          codeLine: 6,
        });
        i++;
        k++;
      }

      while (j < n2) {
        arr[k] = R[j];
        frames.push({
          array: [...arr],
          pointers: { k },
          highlights: [k],
          action: "overwrite",
            description: `Placed remaining ${R[j]} at index ${k}`,
          codeLine: 6,
        });
        j++;
        k++;
      }
    };

    const sort = (arr: number[], l: number, r: number) => {
      if (l >= r) return;
      
      const m = l + Math.floor((r - l) / 2);
      
      frames.push({
        array: [...arr],
        pointers: { l, r, m },
        highlights: [l, r],
        action: "visit",
        description: `Dividing array from index ${l} to ${r}`,
        codeLine: 2,
      });

      sort(arr, l, m);
      sort(arr, m + 1, r);
      merge(arr, l, m, r);
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
