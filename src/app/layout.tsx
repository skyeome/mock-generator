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
	metadataBase: new URL('https://ai-utils.work'),
	title: {
		default: 'AI Utils - AI-Powered Developer Tools',
		template: '%s | AI Utils',
	},
	description:
		'Free, fast, and privacy-first AI-powered developer utilities. Mock data generator, code formatter, JSON validator, and more. 100% free, runs in your browser.',
	keywords: [
		'AI tools',
		'developer utilities',
		'mock data generator',
		'test data',
		'JSON schema',
		'code formatter',
		'JSON validator',
		'API testing',
		'faker.js',
	],
	authors: [{ name: 'AI Utils' }],
	openGraph: {
		type: 'website',
		locale: 'en_US',
		siteName: 'AI Utils',
		title: 'AI Utils - AI-Powered Developer Tools',
		description:
			'Free, fast, and privacy-first AI-powered developer utilities. Mock data generator, code formatter, JSON validator, and more.',
	},
	twitter: {
		card: 'summary_large_image',
		title: 'AI Utils - AI-Powered Developer Tools',
		description:
			'Free, fast, and privacy-first AI-powered developer utilities. 100% free, runs in your browser.',
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
