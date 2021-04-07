import {app, BrowserWindow, screen, shell} from 'electron';
import installExtension, {
	REACT_DEVELOPER_TOOLS
} from 'electron-devtools-installer';
import path from 'path';
import {hydrateGlobalData} from './hydrate-data';
import {initIpc} from './ipc';
import {initLocales} from './locales';
import {initMenuBar} from './menu-bar';

let mainWindow: BrowserWindow | null;

async function createWindow() {
	const screenSize = screen.getPrimaryDisplay().workAreaSize;

	// TODO: choose better window dimensions

	mainWindow = new BrowserWindow({
		height: screenSize.height * 1,
		width: screenSize.width * 1,
		show: false,
		webPreferences: {
			// See preload.ts for why context isolation is disabled.
			contextIsolation: false,
			enableRemoteModule: true,
			nodeIntegration: false,
			preload: path.resolve(__dirname, './preload.js')
		}
	});
	mainWindow.loadURL(
		// Path is relative to this file in the electron-build/ directory that's
		// created during `npm run build:electron-main`.
		app.isPackaged
			? `file://${path.resolve(__dirname, '../../../renderer/index.html')}`
			: 'http://localhost:3000'
	);

	if (!app.isPackaged) {
		try {
			await installExtension(REACT_DEVELOPER_TOOLS);
		} catch (e) {
			console.warn(`Could not install React dev tools`, e);
		}
	}

	mainWindow.once('ready-to-show', () => {
		mainWindow!.show();
		mainWindow!.webContents.openDevTools();
	});
	mainWindow.on('closed', () => (mainWindow = null));
	mainWindow.webContents.setWindowOpenHandler(({url}) => {
		// TODO: is this right?
		shell.openExternal(url);
		return {action: 'allow'};
	});
}

app.on('ready', async () => {
	initLocales();
	initIpc();
	initMenuBar();
	await hydrateGlobalData();
	createWindow();
});

app.on('window-all-closed', () => app.quit());
