export const setStringAsync = async (text: string) => {
  if (typeof navigator !== 'undefined' && navigator.clipboard) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (e) {
      console.warn('Clipboard fallback failed', e);
      return false;
    }
  }
  return false;
};

export const hasStringAsync = async () => true;
export const getStringAsync = async () => '';
