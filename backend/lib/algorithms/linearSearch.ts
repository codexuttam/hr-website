import { Algorithm, Frame } from "@/lib/types";

export const linearSearch: Algorithm = {
  name: "Linear Search",
  type: "searching",
  description: "Sequentially checks each element of the list until a match is found or the whole list has been searched.",
  pseudoCode: `for i from 0 to N-1
  if A[i] == target
    return i
return -1`,
  run: (inputArray: number[], target: number = 0): Frame[] => {
    const frames: Frame[] = [];
    const array = [...inputArray];
    const n = array.length;
    let found = false;

    for (let i = 0; i < n; i++) {
      frames.push({
        array: [...array],
        pointers: { i },
        highlights: [i],
        action: "compare",
        description: `Checking if ${array[i]} equals target ${target}`,
        codeLine: 2,
      });

      if (array[i] === target) {
        frames.push({
          array: [...array],
          pointers: { i },
          highlights: [i],
          action: "found",
          description: `Found target ${target} at index ${i}!`,
          codeLine: 3,
        });
        found = true;
        break;
      }
    }

    if (!found) {
      frames.push({
        array: [...array],
        pointers: {},
        highlights: [],
        action: "visit",
        description: `Target ${target} not found in the array.`,
        codeLine: 4,
      });
    }

    return frames;
  },
};
