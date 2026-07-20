# 78達磨 / NANAHACHI DARUMA

高級感のあるシネマティックな78達磨ブランドサイトです。  
現在は販売開始前のため、Waitlist登録を中心に構成しています。

## Pages

- `index.html` — ホーム
- `collection.html` — 商品一覧
- `product.html` — 作品詳細
- `philosophy.html` — 思想
- `contact.html` — よくある質問・お問い合わせ
- `waitlist.html` — Waitlist専用画面

## Waitlist Flow

```text
waitlist.html
↓
/api/waitlist
↓
Google Apps Script
↓
Google Sheets
↓
登録確認メール送信
```

## Vercel Environment Variable

VercelのProject Settingsで以下を設定してください。

```text
GOOGLE_SCRIPT_URL
```

値はGoogle Apps ScriptのWebアプリURLです。  
ローカル確認用には `.env.local` を使いますが、GitHubには上げません。

## Google Sheets / Apps Script

Apps Scriptに貼るコードは以下です。

```text
google-sheets-waitlist.gs
```

詳しい設定手順は以下を参照してください。

```text
GOOGLE_SHEETS_WAITLIST.md
```
