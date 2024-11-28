import { ModuleFederationPlugin } from '@module-federation/enhanced/rspack';
import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';
import { TanStackRouterRspack } from '@tanstack/router-plugin/rspack';
import { dependencies } from './package.json';

const getApp = () => {
	return `betfinio_app@${process.env.PUBLIC_APP_URL}/mf-manifest.json`;
};

function getOutput() {
	return process.env.PUBLIC_OUTPUT_URL;
}

export default defineConfig({
	server: {
		port: 3000,
	},
	dev: {
		assetPrefix: 'http://localhost:3000',
	},
	html: {
		title: 'Betfin Staking',
		favicon: './src/assets/favicon.svg',
	},
	output: {
		assetPrefix: getOutput(),
	},
	tools: {
		rspack: {
			ignoreWarnings: [/Critical dependency: the request of a dependency is an expression/],
			output: {
				uniqueName: 'betfinio_staking',
			},
			plugins: [
				TanStackRouterRspack(),
				new ModuleFederationPlugin({
					name: 'betfinio_staking',

					remotes: {
						betfinio_app: getApp(),
						betfinio_statistics: `betfinio_statistics@${process.env.PUBLIC_STATISTICS_URL}/mf-manifest.json`,
					},
					shared: {
						react: {
							singleton: true,
							requiredVersion: dependencies.react,
						},
						'react-dom': {
							singleton: true,
							requiredVersion: dependencies['react-dom'],
						},
						'@tanstack/react-router': {
							singleton: true,
							requiredVersion: dependencies['@tanstack/react-router'],
						},
						'@tanstack/react-query': {
							singleton: true,
							requiredVersion: dependencies['@tanstack/react-query'],
						},
						'@tanstack/react-table': {
							singleton: true,
							requiredVersion: dependencies['@tanstack/react-table'],
						},
						i18next: {
							singleton: true,
							requiredVersion: dependencies.i18next,
						},
						'react-i18next': {
							singleton: true,
							requiredVersion: dependencies['react-i18next'],
						},
						wagmi: {
							singleton: true,
							requiredVersion: dependencies.wagmi,
						},
						'i18next-browser-languagedetector': {
							singleton: true,
							requiredVersion: dependencies['i18next-browser-languagedetector'],
						},
					},
				}),
			],
		},
	},
	plugins: [pluginReact()],
});
