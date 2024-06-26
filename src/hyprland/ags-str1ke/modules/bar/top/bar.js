import { Widget } from '../../utils/imports.js';
const { Box, CenterBox, Window } = Widget;
import BM from './modules.js';

function Left() {
	const left = Box({
		children: [
			BM.Launcher(),
			BM.Separator('|'),
			BM.Clock('button'),
			// BM.Workspaces(),
			// BM.ClientTitle(),
		],
	});
	return left;
}

function Center() {
	const center = Box({
		children: [
			// BM.Notification(),
			// BM.Media(),
		],
	});
	return center;
}

function Right() {
	const right = Box({
		hpack: 'end',
		children: [
			// BM.VolumeInfo(),
			// BM.NetworkInfo(),
			// BM.BatteryInfo(),
			BM.Notification(),
			// BM.Separator(),
			// BM.SystemInfo(),
			// BM.Separator(),
			// BM.SysTray(),
			// BM.Separator(),
			// BM.PowerMenu(),
		],
	});
	return right;
}

export default monitor => Window({
	name: `tbar${monitor}`, // name has to be unique
	monitor,
	anchor: ['top', 'left', 'right'],
	exclusivity: 'exclusive',
	child: CenterBox({
		className: 'bar',
		startWidget: Left(),
		centerWidget: Center(),
		endWidget: Right(),
	}),
});
