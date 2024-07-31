import {ModuleFederationPlugin} from '@module-federation/enhanced/rspack';
import {defineConfig} from '@rsbuild/core';
import {pluginReact} from '@rsbuild/plugin-react';
// @ts-ignore
import {TanStackRouterRspack} from '@tanstack/router-plugin/rspack';
// @ts-ignore
import {dependencies} from './package.json';

const getApp = () => {
	switch (process.env.PUBLIC_ENVIRONMENT) {
		case 'development':
			return 'betfinio_app@https://betfin-app-dev.web.app/mf-manifest.json';
		case 'production':
			return 'betfinio_app@https://betfin-app.web.app/mf-manifest.json';
		default:
			return 'betfinio_app@http://localhost:5555/mf-manifest.json';
	}
};

export default defineConfig({
	server: {
		port: 3000,
	},
	dev: {
		assetPrefix: 'http://localhost:3000',
	},
	html: {
		title: 'Betfin Staking',
	},
	output: {
		assetPrefix:
			process.env.PUBLIC_ENVIRONMENT === 'production'
				? 'https://staking.betfin.io'
				: 'https://betfin-staking-dev.web.app',
	},
	tools: {
		rspack: (config, {appendPlugins, addRules}) => {
			config.output!.uniqueName = 'betfinio_staking';
			appendPlugins([
				TanStackRouterRspack(),
				new ModuleFederationPlugin({
					name: 'betfinio_staking',
					remotes: {
						betfinio_app: getApp(),
					},
					exposes: {
						'./lib/api/conservative': './src/lib/api/conservative/index.ts',
						'./lib/api/dynamic': './src/lib/api/dynamic/index.ts',
						'./lib/query/conservative': './src/lib/query/conservative/index.ts',
						'./lib/query/dynamic': './src/lib/query/dynamic/index.ts',
						'./lib/types': './src/lib/types.ts',
					},
					shared: {
						react: {
							singleton: true,
							requiredVersion: dependencies['react'],
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
							requiredVersion: dependencies['i18next'],
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
							requiredVersion: dependencies['tailwindcss'],
						},
						'@supabase/supabase-js': {
							singleton: true,
							requiredVersion: dependencies['@supabase/supabase-js'],
						},
						wagmi: {
							singleton: true,
							requiredVersion: dependencies['wagmi'],
						},
					},
				}),
			]);
		},
	},
	plugins: [pluginReact()],
});
