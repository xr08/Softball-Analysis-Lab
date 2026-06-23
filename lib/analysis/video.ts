export type RelinkResult = {
  isMatch: boolean;
  message: string;
};

export function compareVideoFileNames(expected: string | null | undefined, actual: string): RelinkResult {
  if (!expected) {
    return { isMatch: true, message: "" };
  }
  
  const isMatch = actual.trim().toLowerCase() === expected.trim().toLowerCase();
  
  if (isMatch) {
    return { isMatch: true, message: `Video reconnected successfully.` };
  }
  
  return { 
    isMatch: false, 
    message: `Warning: Selected video "${actual}" differs from expected "${expected}".` 
  };
}
