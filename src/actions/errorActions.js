export const PUSH_ERROR = '@error/PUSH_ERROR';
export const POP_ERROR = '@error/POP_ERROR';

export const pushError = ({ error }) => ({
  type: PUSH_ERROR,
  error,
});

export const popError = () => ({
  type: POP_ERROR,
});
