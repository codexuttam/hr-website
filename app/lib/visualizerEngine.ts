import { bubbleSort } from "./algorithms/bubbleSort";
import { selectionSort } from "./algorithms/selectionSort";
import { insertionSort } from "./algorithms/insertionSort";
import { mergeSort } from "./algorithms/mergeSort";
import { quickSort } from "./algorithms/quickSort";
import { linearSearch } from "./algorithms/linearSearch";
import { binarySearch } from "./algorithms/binarySearch";
import { Algorithm, AlgorithmType } from "./types";

export const ALGORITHMS: Record<AlgorithmType, Algorithm> = {
  bubble: bubbleSort,
  selection: selectionSort,
  insertion: insertionSort,
  merge: mergeSort,
  quick: quickSort,
  linear: linearSearch,
  binary: binarySearch,
};

export const generateRandomArray = (size: number, min: number = 5, max: number = 100): number[] => {
  return Array.from({ length: size }, () => Math.floor(Math.random() * (max - min + 1)) + min);
};
