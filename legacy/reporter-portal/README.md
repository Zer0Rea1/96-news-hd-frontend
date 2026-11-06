# Reporter portal source archive

The public website no longer serves login, reporter publishing, profile/membership, payment verification or administration screens. These sources are preserved as reference for the future separate admin application.

The original directory relationships and API client are retained under `src/`. `package.original.json` records the dependencies before removal. This archive is not a runnable admin application and is excluded from the website build, Tailwind scanning, lint and tests.

Build the new admin application separately with its own authentication, permissions, API contract and dependency manifest. Review the archived code before reuse; the earlier editor dependency/compatibility checks were unfinished when the editor was removed from the website scope. Backend administration and publishing endpoints have not been changed.
