// waiting-approve/page.tsx (hoặc .tsx)

import WaitingApprove from '@/app/(client)/components/WaitingApprove';
import React, { Suspense } from 'react';

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <WaitingApprove />
    </Suspense>
  );
}