# Backup and recovery

Do **not** rely exclusively on a single GitHub account for recovery.

## Practical options

### 1. Mirror clone

```bash
git clone --mirror https://github.com/ksteffe/after-certainty.git after-certainty.mirror
```

Store the mirror on a second machine or storage provider you control.

### 2. Git bundle (all refs)

```bash
git bundle create after-certainty-$(date +%Y%m%d).bundle --all
```

Encrypt the bundle before copying to shared storage (for example `age` or `gpg`).

### 3. Encrypted local backup

Periodically archive a working tree plus `.git` into an encrypted archive kept
offline or on a separate provider.

### 4. Second storage for release assets

Download `latest` release assets (including `SHA256SUMS`) to object storage or
another git host you control. Verify checksums after restore:

```bash
sha256sum -c SHA256SUMS
```

## What this repository does not do

Workflows here do **not** upload backups to external providers. Backup remains an
operator responsibility.
