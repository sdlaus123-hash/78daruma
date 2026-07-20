# 78達磨 Waitlist / Vercel + Google Sheets 接続手順

## 構成

```text
Waitlist画面
↓
Vercel /api/waitlist
↓
Google Apps Script
↓
Google Sheets
```

Google SheetsのURLやApps ScriptのURLを、GitHub上のフロントエンドコードへ直接書かない構成です。

## 1. Google Apps Scriptを作成

以下のGoogle Sheetsを開きます。

```text
https://docs.google.com/spreadsheets/d/1swxFCol1DJSc5a_gBboMRI-iBBAGd8IoeXxML8cTPQM/edit
```

上部メニューから `拡張機能 → Apps Script` を開きます。

## 2. Apps Scriptへ貼るコード

このプロジェクト内の `google-sheets-waitlist.gs` の内容を、Apps Scriptの `Code.gs` に貼り付けます。

`LAUNCH_URL` は、Vercel公開後の正式URLに変更してください。

```js
const LAUNCH_URL = "https://YOUR-VERCEL-DOMAIN.vercel.app/collection.html";
```

## 3. Webアプリとしてデプロイ

Apps Script右上の `デプロイ → 新しいデプロイ` を選びます。

- 種類: `ウェブアプリ`
- 実行ユーザー: `自分`
- アクセスできるユーザー: `全員`

デプロイ後に発行されるURLをコピーします。

## 4. GitHubに入れるコード

GitHubには以下を入れます。

- `waitlist.html`
- `assets/waitlist.js`
- `assets/waitlist-config.js`
- `api/waitlist.js`
- `vercel.json`
- その他サイト一式

`assets/waitlist-config.js` はこのままでOKです。

```js
window.NANAHACHI_WAITLIST_ENDPOINT = location.protocol === "file:" ? "" : "/api/waitlist";
```

## 5. Vercel環境変数

VercelのProject Settingsで、Environment Variablesに以下を追加します。

```text
GOOGLE_SCRIPT_URL
```

値には、Apps Scriptで発行されたWebアプリURLを入れます。

```text
https://script.google.com/macros/s/xxxxxxxxxxxxxxxx/exec
```

設定後、Vercelで再デプロイしてください。

ローカル確認用には `.env.local` に同じ値を入れています。`.env.local` は `.gitignore` で除外しているため、GitHubには上げません。

## 6. 登録直後に届くメール

件名:

```text
78達磨｜Waitlistへのご登録ありがとうございます
```

本文:

```text
78達磨のWaitlistにご登録いただきありがとうございます。

78達磨は、願いを空間に宿すための現代の達磨オブジェです。
販売開始の準備が整い次第、このメールアドレスへ優先してお知らせします。

静かに、その時をお待ちください。

78達磨
NANAHACHI DARUMA
```

## 7. 販売開始メール

販売開始日にApps Scriptの `sendLaunchNotice` 関数を手動実行します。

件名:

```text
78達磨｜販売開始のお知らせ
```

本文:

```text
78達磨 Collection 01 の販売を開始しました。

Waitlistにご登録いただいた方へ、先行してお知らせしています。
願いを、空間に宿す一体を。

朱、墨、胡粉。
三つの静かな意志を公開しています。

作品を見る
https://YOUR-VERCEL-DOMAIN.vercel.app/collection.html

78達磨
NANAHACHI DARUMA
```
