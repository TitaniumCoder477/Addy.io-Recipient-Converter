# Addy.io Recipient Converter

**Thunderbird Add-on** that automatically converts email recipients using your identity's **Reply-To** address (Addy.io / SimpleLogin / DuckDuckGo style forwarding).

## Features

- Transforms **To**, **CC**, and **BCC** recipients on send
- Uses the current profile's **Reply-To** address as the base
- Example:  
  **Reply-To**: `interested@mydomain.com`  
  **Recipient**: `jdoe@somedomain.com`  
  **Result**: `interested+jdoe=somedomain.com@mydomain.com`
- No transformation if no Reply-To is set
- Full debug logging to Browser Console

## Installation

Recommended: Obtain from addons.thunderbird.net

Alternative:
1. Download the latest release from [Releases](../../releases)
2. In Thunderbird: **Tools → Add-ons and Themes → Extensions → Gear icon → Install Add-on From File**
3. Select the `.xpi` file

**Or install from source (development):**
- Clone this repo
- Go to **Tools → Add-ons and Themes → Debug Add-ons**
- Click **Load Temporary Add-on** and select `manifest.json`

## Configuration

1. Go to **Account Settings**
2. Select the identity you want to use
3. Set a **Reply-To** address (e.g. `interested@mydomain.com`)
4. Compose an email and send — recipients will be automatically converted

## Development / Debugging

Open **Browser Console** (`Ctrl+Shift+J`) while using the add-on.  
You will see detailed logs prefixed with `[Addy.io Converter]`.

## Permissions

- `compose` – Modify messages before sending
- `accountsRead` / `identity` – Read identity Reply-To address

## License

[MIT License](LICENSE)

## Contributing

Pull requests welcome! Feel free to open issues for bugs or feature suggestions.

---

Made with ❤️ for the Thunderbird community.
