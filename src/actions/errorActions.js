export const SET_ERROR = '@error/SET_ERROR';

export const setError = ({ error }) => ({
	type: SET_ERROR,
	error,
});
