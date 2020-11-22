import { Dispatch } from 'redux';
import { gql } from '@apollo/client';
import Cookies from 'js-cookie';
import { GDAction, GDLocale } from '~types/general';
import * as langUtils from '~utils/langUtils';
import { apolloClient } from '../../apolloClient';

export const LOCALE_FILE_LOADED = 'LOCALE_FILE_LOADED';
export const setLocaleFileLoaded = (locale: GDLocale): GDAction => ({
	type: LOCALE_FILE_LOADED,
	payload: {
		locale
	}
});

export const selectLocale = (locale: GDLocale) => (dispatch: Dispatch): any => {
	window.gd = {};
	window.gd.localeLoaded = (strings: any): void => {
		langUtils.setLocale(locale, strings);
		dispatch(setLocaleFileLoaded(locale));
	};
	const s = document.createElement('script');
	s.src = `./${locale}.js`;
	document.body.appendChild(s);
};

export const TOGGLE_INTRO_DIALOG = 'TOGGLE_INTRO_DIALOG';
export const toggleIntroDialog = (): GDAction => ({ type: TOGGLE_INTRO_DIALOG });

export const RESET_STORE = 'RESET_STORE';
export const resetStore = (): GDAction => ({ type: RESET_STORE });

export const TOGGLE_LOGIN_DIALOG = 'TOGGLE_LOGIN_DIALOG';
export const toggleLoginDialog = (): GDAction => ({ type: TOGGLE_LOGIN_DIALOG });

export const TOGGLE_SIGNUP_DIALOG = 'TOGGLE_SIGNUP_DIALOG';
export const toggleSignUpDialog = (): GDAction => ({ type: TOGGLE_SIGNUP_DIALOG });

export const AUTHENTICATED = 'AUTHENTICATED';

export const setAuthenticated = (authenticated = true) => ({ type: AUTHENTICATED, payload: { authenticated } });
export const login = (email: string, password: string): any => async (dispatch: Dispatch) => {
	const LOGIN_MUTATION = gql`
        mutation LoginMutation($email: String!, $password: String!) {
            login(email: $email, password: $password) {
                token
            }
        }
	`;

	const response = await apolloClient.mutate({
		mutation: LOGIN_MUTATION,
		variables: { email, password }
	});

	if (response) {
		Cookies.set('token', response.data.login.token);

		dispatch(setAuthenticated());
		dispatch(toggleLoginDialog());
	}
};

export const LOGOUT = 'LOGOUT';
export const logout = (): GDAction => {
	Cookies.remove('token');
	return { type: LOGOUT };
};


export const VERIFYING_TOKEN = 'VERIFYING_TOKEN';
export const verifyToken = () => async (dispatch: Dispatch) => {
	dispatch({ type: VERIFYING_TOKEN });

	const response = await apolloClient.query({
		query: gql`
			query VerifyToken {
				verifyToken {
					valid
				}
			}
		`
	});

	const isValid = response.data.verifyToken.valid;
	if (!isValid) {
		Cookies.remove('token');
	}

	dispatch(setAuthenticated(isValid));
};
