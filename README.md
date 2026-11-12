# GKD_scripts

My [GKD](https://github.com/gkd-kit/gkd) rules.

## Subscribe

In GKD: Subscriptions → + → paste

```
https://raw.githubusercontent.com/jiaton/GKD_scripts/main/subscription.json5
```

GKD checks for updates itself (or pull to refresh on the subscription page).

## Rules

| App | File | What it does |
| --- | --- | --- |
| WeChat | `rules/com.tencent.mm/open_link_in_browser_or_rednote.json5` | In a WeChat web page, open the link outside WeChat: xiaohongshu.com / xhslink.com pages in rednote, everything else in the browser |
| WeChat | `rules/com.tencent.mm/allow_jumping.json5` | Tap "Allow" when WeChat asks before jumping to another app |
| Samsung in-call | `rules/com.samsung.android.incallui/scs_call_box_press_9.json5` | When the caller is "SCS Call box", open the keypad and press 9 |
| Settings | `rules/com.android.settings/tesla_bluetooth_audio.json5` | On the Tesla Bluetooth device page, turn on Calls and Audio |

## Editing

Each file is one rule group (JSON5) for the app named by its folder; group keys must be unique within an app.
`npm run build` (Node 22+) checks every selector with GKD's own parser and regenerates `subscription.json5`,
bumping `version` only when the rules changed. A push to `main` runs the same build in CI and commits the
result, so editing a rule on github.com is enough.
