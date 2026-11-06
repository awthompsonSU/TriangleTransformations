# Triangle Transformations — Codex-ready project

This package combines the current HTML/CSS/JavaScript game with the original Java program for Codex to reference.

## Use on Windows

1. Extract the entire `TriangleTransformations-Codex.zip` archive to a folder on your computer, such as Documents\TriangleTransformations-Codex.
2. Open the **ChatGPT desktop app**, switch to **Codex**, and choose/open the extracted project folder. Sign in with your ChatGPT account if prompted.
3. Begin a new Codex conversation in this folder. Paste the prompt in `START_HERE_PROMPT.txt`.
4. The working site lives in `website/`. To try it before changes, open `website/index.html` in a browser.
5. Ask Codex to run tests and preview the changes before you approve or deploy them.

You can also use Codex through a code editor extension or CLI. Codex Cloud may require setting up an environment and a GitHub repository; for these local files, the desktop app is the simplest route.

## Link from an HTML homepage

When the `website/` directory is alongside your homepage's HTML file, add:

```html
<a href="website/index.html">Play Triangle Transformations</a>
```

If you upload just the contents of `website/` to a folder named `TriangleTransformationsWeb`, adjust the link to that folder name instead.

## What does not happen automatically

- Opening this project in Codex does not automatically carry over this ChatGPT conversation. The included `AGENTS.md` and starter prompt explain the goals and design decisions.
- Scores are currently stored only in a local browser, not centrally.
- The email report only launches a configured email application; students must send the email themselves.

For classroom grading, ask Codex to design a secure optional submission backend rather than treating localStorage totals as authoritative grades.
