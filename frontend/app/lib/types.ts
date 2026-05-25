export type ActionType = "compare" | "swap" | "insert" | "visit" | "overwrite" | "found";

export interface Frame {
  array: number[];
  pointers: { [key: string]: number }; // e.g., { i: 0, j: 1, pivot: 5 }
  highlights: number[]; // indices to highlight
  action: ActionType;
  description: string;
  codeLine: number; // Line number in the pseudo-code to highlight
}

export interface Algorithm {
  name: string;
  type: "sorting" | "searching";
  description: string;
  pseudoCode: string;
  code?: { [key: string]: string };
  run: (array: number[], target?: number) => Frame[];
}

export type AlgorithmType = "bubble" | "selection" | "insertion" | "merge" | "quick" | "linear" | "binary";
