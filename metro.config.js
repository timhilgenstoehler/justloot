const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Collapse has no metro.config — Loot only needs to exclude the Next.js web app from native bundles.
const webDir = `${path.resolve(__dirname, 'web')}${path.sep}`;
const existingBlockList = config.resolver.blockList ?? [];
config.resolver.blockList = [...existingBlockList, new RegExp(`${webDir.replace(/[/\\]/g, '[/\\\\]')}.*`)];

module.exports = config;
