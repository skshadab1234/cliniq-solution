'use client';

import { SignIn } from '@clerk/nextjs';

const ForcedSignInModal = () => {
  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm'>
      <div className='p-4'>
        <SignIn
          appearance={{
            elements: {
              card: 'shadow-2xl',
              footerAction: { display: 'none' },
              headerTitle: 'text-2xl font-bold',
              headerSubtitle: 'text-slate-500',
            },
          }}
        />
      </div>
    </div>
  );
};

export default ForcedSignInModal;
