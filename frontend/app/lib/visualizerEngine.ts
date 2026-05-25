import { bubbleSort } from "@/backend/lib/algorithms/bubbleSort";
import { selectionSort } from "@/backend/lib/algorithms/selectionSort";
import { insertionSort } from "@/backend/lib/algorithms/insertionSort";
import { mergeSort } from "@/backend/lib/algorithms/mergeSort";
import { quickSort } from "@/backend/lib/algorithms/quickSort";
import { linearSearch } from "@/backend/lib/algorithms/linearSearch";
import { binarySearch } from "@/backend/lib/algorithms/binarySearch";
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
