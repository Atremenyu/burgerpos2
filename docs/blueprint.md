# **App Name**: OrderFlow

## Core Features:

- Visual Replica: Mimic the original application's UI exactly.
- Cashier UI: Implement a user-friendly cashier interface to manage orders, payments, and customer information, exactly copying the specified behaviour in the provided index.html file.
- Kitchen Display System (KDS): Real-time updates to Kitchen Display System (KDS) when a new order is placed and the order status changes.
- Inventory Management: Allow stock updates, additions of new supplies, deletion, modification, and export/import capabilities of current recipes. Implemented per original index.html.

## Style Guidelines:

- Primary color: Blue (#3B82F6) for buttons and active tabs.
- Background color: Light gray (#F3F4F6) for content areas in light mode, dark gray (#1F2937) in dark mode.
- Accent color: Green (#16A34A) for payment confirmation buttons and ready status indicators.
- Font: 'Inter', a grotesque-style sans-serif for both headlines and body text. Note: currently only Google Fonts are supported.
- Use simple and clear icons for navigation and actions.  Incorporate checkmark icon (✅) for order confirmation.
- Fixed top navigation bar. Main views fill the area below. Modals appear as centered overlays with rounded corners and shadows.
- Subtle transitions and animations to smooth visual state changes. Hover effects include scaling up buttons (scale-110). Pulse animation for orders needing immediate attention in the kitchen.