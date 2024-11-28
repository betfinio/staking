/** @type {import('tailwindcss').Config} */
module.exports = {
	presets: [require('@betfinio/components/tailwind-config')],
	important: '.staking',
	darkMode: ['class'],
	content: {
		relative: true,
		files: ['./src/**/*'],
	},
	theme: {
		extend: {
			backgroundImage: {
				'unstake-background': "url('./assets/unstake-background.png')",
			},
		},
		plugins: [require('tailwindcss-animate')],
	},
};
