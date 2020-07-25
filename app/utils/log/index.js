import { Client } from 'bugsnag-react-native';
import analytics from '@react-native-firebase/analytics';
import crashlytics from '@react-native-firebase/crashlytics';
import { isGooglePlayBuild } from '../../constants/environment';
import config from '../../../config';
import events from './events';

const bugsnag = new Client(config.BUGSNAG_API_KEY);

export { analytics };
export const loggerConfig = bugsnag.config;
export const { leaveBreadcrumb } = bugsnag;
export { events };

let metadata = {};

export const logServerVersion = (serverVersion) => {
	metadata = {
		serverVersion
	};
};

export const logEvent = (eventName, payload) => {
	if (isGooglePlayBuild) {
		analytics().logEvent(eventName, payload);
		leaveBreadcrumb(eventName, payload);
	}
};

export const setCurrentScreen = (currentScreen) => {
	if (isGooglePlayBuild) {
		analytics().setCurrentScreen(currentScreen);
		leaveBreadcrumb(currentScreen, { type: 'navigation' });
	}
};

export default (e) => {
	if (e instanceof Error && e.message !== 'Aborted' && !__DEV__) {
		bugsnag.notify(e, (report) => {
			report.metadata = {
				details: {
					...metadata
				}
			};
		});
		if (isGooglePlayBuild) {
			crashlytics().recordError(e);
		}
	} else {
		console.log(e);
	}
};
