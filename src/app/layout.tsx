import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	metadataBase: new URL('https://mockdatagenerator.com'),
	title: {
		default: 'Mock Data Generator - AI-Powered Test Data Generation',
		template: '%s | Mock Data Generator',
	},
	description:
		'Generate realistic mock data from JSON schemas. AI-powered semantic detection, export to JSON, CSV, SQL, TypeScript. 100% free, runs in your browser.',
	keywords: [
		'mock data',
		'test data generator',
		'JSON schema',
		'fake data',
		'API testing',
		'json to csv',
		'json to sql',
		'faker.js',
	],
	authors: [{ name: 'Mock Data Generator' }],
	openGraph: {
		type: 'website',
		locale: 'en_US',
		siteName: 'Mock Data Generator',
		title: 'Mock Data Generator - AI-Powered Test Data Generation',
		description:
			'Generate realistic mock data from JSON schemas. AI-powered semantic detection, export to JSON, CSV, SQL, TypeScript.',
		images: [
			{
				url: '/og-image.svg',
				width: 1200,
				height: 630,
				alt: 'Mock Data Generator',
			},
		],
	},
	twitter: {
		card: 'summary_large_image',
		title: 'Mock Data Generator - AI-Powered Test Data Generation',
		description:
			'Generate realistic mock data from JSON schemas. 100% free, runs in your browser.',
		images: ['/og-image.svg'],
	},
	robots: {
		index: true,
		follow: true,
	},
	icons: {
		icon: '/favicon.ico',
	},
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" suppressHydrationWarning>
			<head>
				<link rel="icon" href="/favicon.svg" type="image/svg+xml"></link>
				<meta name="google-adsense-account" content="ca-pub-8121775555791709" />
				<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8121775555791709"
					crossOrigin="anonymous"></script>
			</head>
			<body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
				<ThemeProvider>{children}</ThemeProvider>
			</body>
		</html>
	);
}
