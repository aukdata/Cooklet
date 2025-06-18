#!/usr/bin/env node

/**
 * ビルド情報生成スクリプト
 * ビルド時に実行され、ビルド日時とバージョン情報を生成
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// package.jsonからバージョンを取得
const packageJsonPath = path.join(__dirname, '..', 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

// ビルド情報オブジェクト
const buildInfo = {
  version: packageJson.version,
  buildDate: new Date().toISOString(),
  buildTimestamp: Date.now()
};

// public/build-info.jsonに出力
const outputPath = path.join(__dirname, '..', 'public', 'build-info.json');
fs.writeFileSync(outputPath, JSON.stringify(buildInfo, null, 2));

console.log('✅ ビルド情報を生成しました:', buildInfo);