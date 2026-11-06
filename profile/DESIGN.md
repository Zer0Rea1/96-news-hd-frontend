# 96 News HD Pressroom

A trust-first credential service for a Pakistani newsroom. UI/UX Pro Max’s Minimalism & Swiss Style recommendation informs the admin workspace; design-taste informs the public identity and typography. Marketing layouts and motion do not suit the admin’s tasks.

- Brand: logo red #db2319, logo navy #151c55, white surfaces, pale gray #f5f6fa canvas. Green and amber exclusively communicate credential status.
- Type: self-hosted Manrope Variable. Compact labels in the directory; larger mobile public profile details.
- Shape: 6-7px buttons and inputs, 9-14px panels, circular staff avatars, rectangular reporter portraits.
- Layout: fixed desktop sidebar, full-width reporter directory; mobile navigation drawer and horizontally scrollable data table. Public profile designed for scanning a card on a phone.
- Motion: brief state feedback, reduced-motion support. No perpetual decoration.
- Design dials: DESIGN_VARIANCE 3, MOTION_INTENSITY 2, VISUAL_DENSITY 5.
- Real states: loading, empty, validation failures, authorization failures, draft, scheduled, active, expired, revoked, destructive confirmation.
- Public data: CNIC and address are opt-in. Never call a credential verified when its status or dates do not authorize it.
- No demonstration mode or seeded reporters ship in the app. Admin sign-in is required.
- The original 96 News HD logo is sourced from the sibling frontend and compressed to WebP.
- Public profiles alone offer English/Urdu switching, with RTL layout in Urdu. Reporter-entered values are preserved.
- QR export is a high-resolution black-and-white PNG with a quiet margin for the external card designer.
