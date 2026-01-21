# Component Refactoring Guide

Use this guide when refactoring large page files into smaller, reusable components.

## Step 1: Analyze the Page

Identify distinct UI sections in your page file. Common patterns:
- **Header** - Page title, user greeting, navigation buttons
- **Empty State** - View when no data exists
- **Cards** - Self-contained data display blocks
- **Lists/Grids** - Repeated item displays
- **Action Buttons** - CTAs and quick actions
- **Banners/Alerts** - Notifications and warnings

## Step 2: Create Component Folder

```
components/
├── common/           # Reusable across ALL pages
│   ├── index.ts
│   └── [Component].tsx
│
└── [page-name]/      # Page-specific components
    ├── index.ts
    └── [Component].tsx
```

## Step 3: Component Template

```tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../constants/Colors';

interface ComponentNameProps {
  // Define your props here
}

export function ComponentName({ ...props }: ComponentNameProps) {
  return (
    <View style={styles.container}>
      {/* Component content */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    // Component styles
  },
});
```

## Step 4: Barrel Export

Create `index.ts` in each component folder:

```tsx
export { ComponentA } from './ComponentA';
export { ComponentB } from './ComponentB';
```

## Step 5: Refactor Page

Replace inline JSX with component imports:

```tsx
// Before: 800+ lines of inline JSX
// After: Clean composition
import { Header, ContentCard, ActionButtons } from '../../components/[page-name]';
import { EmptyState } from '../../components/common';

export default function PageScreen() {
  if (!data) return <EmptyState />;
  
  return (
    <ScrollView>
      <Header />
      <ContentCard data={data} />
      <ActionButtons />
    </ScrollView>
  );
}
```

## Common Components (Reusable)

| Component | Location | Use Case |
|-----------|----------|----------|
| `NoEventView` | `common/` | Empty states on any page |
| `Toast` + `useToast` | `common/` | Toast notifications (success/error/info/warning) |

## Existing Page Components

| Page | Folder | Components |
|------|--------|------------|
| Dashboard | `dashboard/` | `DashboardHeader`, `EventCard`, `StorageCard`, `MediaStatsGrid`, `QuickActions`, `OrderDetailsCard`, `PendingBanner`, `PendingPaymentView` |
| Gallery | `gallery/` | `GalleryHeader`, `MediaGrid`, `MediaGridItem`, `MediaDetailModal` |
| QR Code | `qrcode/` | `QRCodeHeader`, `QRCodeCard`, `QRCodeActions`, `QRCodeInfo` |
| Shop | `shop/` | `ShopHeader`, `CategoryTabs`, `ProductCard`, `ProductGrid`, `CartItem`, `CartModal`, `CustomizationModal` |
| Profile | `profile/` | `ProfileHeader`, `ProfileCard`, `ProfileMenu`, `EditProfileModal`, `OrdersModal` |

