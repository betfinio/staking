import {defineConfig} from '@rsbuild/core';
import {pluginReact} from '@rsbuild/plugin-react';
import {ModuleFederationPlugin} from "@module-federation/enhanced/rspack";
// @ts-ignore
import {TanStackRouterRspack} from '@tanstack/router-plugin/rspack'
// @ts-ignore
import {dependencies} from "./package.json";

export default defineConfig({
	plugins: [pluginReact()],
	tools: {
		rspack: (config, {appendPlugins, addRules}) => {
			appendPlugins([
				TanStackRouterRspack(),
				new ModuleFederationPlugin({
					name: 'betfinio_staking',
					remotes: {
						// betfinio_app: `betfinio_app@https://betfin-app${process.env.PUBLIC_ENVIRONMENT === 'development' ? '-dev' : ''}.web.app/mf-manifest.json`,
						betfinio_app: 'betfinio_app@http://localhost:5555/mf-manifest.json',
					},
					shared: {
						'react': {
							singleton: true,
							requiredVersion: dependencies['react']
						},
						'react-dom': {
							singleton: true,
							requiredVersion: dependencies['react-dom']
						},
						"@tanstack/react-router": {
							singleton: true,
							requiredVersion: dependencies['@tanstack/react-router']
						},
						"@tanstack/react-query": {
							singleton: true,
							requiredVersion: dependencies['@tanstack/react-query']
						},
						"lucide-react": {
							singleton: true,
							requiredVersion: dependencies['lucide-react']
						},
						"i18next": {
							singleton: true,
							requiredVersion: dependencies['i18next']
						},
						"react-i18next": {
							singleton: true,
							requiredVersion: dependencies['react-i18next']
						},
						"tailwindcss-animate": {
							singleton: true,
							requiredVersion: dependencies['tailwindcss-animate']
						},
						"tailwindcss": {
							singleton: true,
							requiredVersion: dependencies['tailwindcss']
						},
						"@supabase/supabase-js": {
							singleton: true,
							requiredVersion: dependencies['@supabase/supabase-js']
						},
						"wagmi": {
							singleton: true,
							requiredVersion: dependencies['wagmi']
						},
						"@web3modal/wagmi": {
							singleton: true,
							requiredVersion: dependencies['@web3modal/wagmi']
						}
					}
				}),
			]);
		},
	},
});
