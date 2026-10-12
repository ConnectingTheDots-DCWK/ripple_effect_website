---
title: Why the installers are unsigned
description: What code signing is, why Windows and macOS warn about an unsigned installer once, and why Windows 11's Smart App Control blocks it with no override.
---

None of the installers is signed by an authority your machine already trusts. That single fact explains every prompt you meet when you first run the app, and it is worth separating from what the prompts might seem to say.

## What signing is for

Signing ties an installer to a certificate that a platform already recognises. None of these installers carries one, so Windows and macOS each stop the app once, on first run, and say they do not know it.

The warning is about the missing certificate, not about anything the installer does.

## What each platform does

On Windows the prompt is SmartScreen. On macOS it is Gatekeeper, which reports an unidentified developer or an app it could not verify. Each stops once and then lets you decide. Linux checks nothing of the sort and asks nothing, so the Linux packages install without any question about signing.

A purchased certificate would remove the SmartScreen warning on Windows and, with notarisation, the Gatekeeper prompt on macOS. A signed Windows build is a known next step rather than a decision against signing. [How to install Ripple Effect](/how-to/install-the-app/) covers what each platform asks you to do.

## Why Smart App Control is different

SmartScreen asks a person, and a person can say yes. Smart App Control, a Windows 11 feature, does not ask. It runs only apps that Microsoft's reputation service already knows or that carry a trusted signature, and an unsigned installer is neither. When it is on, Setup is refused with the message "An Application Control policy has blocked this file" (error 4551). Unlike SmartScreen it has no *Run anyway* and no per-app exception, so the only way to install is to turn the feature off.

This catches people who have never heard of it, because of how it is switched on. It is only ever enabled on a clean install of Windows 11, and a reset counts. It starts in an Evaluation mode that blocks nothing while Windows decides whether the feature suits the machine, and then switches itself on, with a notification, or off. A PC upgraded from Windows 10, or one seen running developer tools during evaluation, has it off already, which is why most people never meet it.

:::caution
Turning Smart App Control off is a decision, not a toggle. Microsoft says that recent Windows updates allow it to be turned back on without reinstalling. On older builds, once it is off the only way back is a clean reset of Windows. Weigh that before switching it off for one app.
:::

Being refused outright, rather than warned, is the strongest argument for signing the Windows build. The steps to check and turn off Smart App Control are in [Installers and first launch](/reference/installers/).

## Related

- [How to install Ripple Effect](/how-to/install-the-app/)
- [Installers and first launch](/reference/installers/)
- [Updates, logs and Messages](/explanation/updates-logs-and-privacy/), because an update's installer raises the same prompts as the first one
