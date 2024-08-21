import { ModuleFederationPlugin } from '@module-federation/enhanced/rspack';
import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';
import { TanStackRouterRspack } from '@tanstack/router-plugin/rspack';
import { dependencies } from './package.json';

const getApp = () => {
	switch (process.env.PUBLIC_ENVIRONMENT) {
		case 'development':
			return 'betfinio_app@https://app.betfin.dev/mf-manifest.json';
		case 'production':
			return 'betfinio_app@https://app.betfin.io/mf-manifest.json';
		case 'production-ua':
			return 'betfinio_app@https://app.betfin.gg/mf-manifest.json';
		default:
			return 'betfinio_app@http://localhost:5555/mf-manifest.json';
	}
};

function getOutput() {
	switch (process.env.PUBLIC_ENVIRONMENT) {
		case 'development':
			return 'https://staking.betfin.dev/';
		case 'production':
			return 'https://staking.betfin.io';
		case 'production-ua':
			return 'https://staking.betfin.gg';
		default:
			return '/';
	}
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
			output: {
				uniqueName: 'betfinio_staking',
			},
			plugins: [
				TanStackRouterRspack(),
				new ModuleFederationPlugin({
					name: 'betfinio_staking',
					remotes: {
						betfinio_app: getApp(),
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
						'lucide-react': {
							singleton: true,
							requiredVersion: dependencies['lucide-react'],
						},
						i18next: {
							singleton: true,
							requiredVersion: dependencies.i18next,
						},
						'react-i18next': {
							singleton: true,
							requiredVersion: dependencies['react-i18next'],
						},
						'tailwindcss-animate': {
							singleton: true,
							requiredVersion: dependencies['tailwindcss-animate'],
						},
						tailwindcss: {
							singleton: true,
							requiredVersion: dependencies.tailwindcss,
						},
						'@supabase/supabase-js': {
							singleton: true,
							requiredVersion: dependencies['@supabase/supabase-js'],
						},
						wagmi: {
							singleton: true,
							requiredVersion: dependencies.wagmi,
						},
					},
				}),
			],
		},
	},
	plugins: [pluginReact()],
});
